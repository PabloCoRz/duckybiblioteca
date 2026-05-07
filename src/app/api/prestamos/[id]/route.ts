import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// PATCH /api/prestamos/[id] — renew, return, or report lost
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { accion } = body  // "renovar" | "devolver" | "perdido"

  const prestamo = await prisma.prestamo.findUnique({
    where: { id: Number(id) },
    include: { copia: true },
  })
  if (!prestamo) return NextResponse.json({ error: "Préstamo no encontrado" }, { status: 404 })

  // Only admin/bibliotecario or the loan owner can operate on it
  const isAdmin = ["Administrador", "Bibliotecario"].includes(session.user?.role ?? "")
  if (!isAdmin && prestamo.usuarioId !== Number(session.user?.id)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  if (accion === "renovar") {
    // Max 2 renewals
    if (prestamo.renovaciones >= 2) {
      return NextResponse.json({ error: "Máximo de renovaciones alcanzado" }, { status: 400 })
    }
    const nuevaFecha = new Date(prestamo.fechaDevolucion)
    nuevaFecha.setDate(nuevaFecha.getDate() + 14)
    const updated = await prisma.prestamo.update({
      where: { id: Number(id) },
      data: { fechaDevolucion: nuevaFecha, renovaciones: { increment: 1 }, estado: "Renovado" },
    })
    return NextResponse.json(updated)
  }

  if (accion === "devolver") {
    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.prestamo.update({
        where: { id: Number(id) },
        data: { estado: "Devuelto", fechaRealDev: new Date() },
      })
      await tx.copia.update({ where: { id: prestamo.copiaId }, data: { estado: "Disponible" } })
      return p
    })
    return NextResponse.json(updated)
  }

  if (accion === "perdido") {
    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.prestamo.update({
        where: { id: Number(id) },
        data: { estado: "Perdido", fechaRealDev: new Date() },
      })
      await tx.copia.update({ where: { id: prestamo.copiaId }, data: { estado: "Perdida" } })
      // Auto-generate a fine
      await tx.multa.create({
        data: {
          prestamoId: Number(id),
          usuarioId: prestamo.usuarioId,
          monto: 500,
          motivo: "Libro reportado como perdido",
          estado: "Pendiente",
        },
      })
      return p
    })
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: "Acción inválida" }, { status: 400 })
}

// GET /api/prestamos/[id] — get a single loan
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const prestamo = await prisma.prestamo.findUnique({
    where: { id: Number(id) },
    include: {
      usuario: { select: { id: true, nombre: true, apellido: true, email: true } },
      copia: { include: { libro: { include: { autores: { include: { autor: true } } } } } },
      multa: true,
    },
  })
  if (!prestamo) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json(prestamo)
}