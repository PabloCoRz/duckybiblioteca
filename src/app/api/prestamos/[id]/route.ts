// src/app/api/prestamos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import {
  sendPrestamoAprobadoUsuario,
  sendRenovacionConfirmada,
} from "@/lib/email"

// Estados del flujo:
//   Préstamo nuevo:   POST → Pendiente (renovaciones=0)
//                     admin aprueba → Activo
//                     admin rechaza → Devuelto + copia libre
//
//   Renovación:       usuario pide renovar → Pendiente (renovaciones=-1 como señal)
//                     admin aprueba → Renovado, fecha +7 días, renovaciones=1, email al usuario
//                     admin rechaza → vuelve a Activo, renovaciones=0

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id }     = await params
  const body       = await req.json()
  const { accion } = body

  const prestamo = await prisma.prestamo.findUnique({
    where: { id: Number(id) },
    include: {
      copia: {
        include: {
          libro: { include: { autores: { include: { autor: true } } } },
        },
      },
      usuario: { select: { id: true, nombre: true, apellido: true, email: true } },
    },
  })
  if (!prestamo) return NextResponse.json({ error: "Préstamo no encontrado" }, { status: 404 })

  const isAdmin = ["Administrador", "Bibliotecario"].includes(session.user?.role ?? "")

  if (!isAdmin && prestamo.usuarioId !== Number(session.user?.id)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  const libro   = prestamo.copia.libro
  const autores = libro.autores.map((a) => a.autor.nombre).join(", ")

  // renovaciones === -1 → este Pendiente es una renovación esperando aprobación
  const esPendienteRenovacion = prestamo.estado === "Pendiente" && prestamo.renovaciones === -1

  // ── RENOVAR: usuario solicita → queda Pendiente ───────────
  if (accion === "renovar") {
    if (prestamo.estado !== "Activo" && prestamo.estado !== "Renovado") {
      return NextResponse.json({ error: "Solo se pueden renovar préstamos activos" }, { status: 400 })
    }
    if (prestamo.renovaciones >= 1) {
      return NextResponse.json({ error: "Solo se permite 1 renovación por préstamo" }, { status: 400 })
    }

    const updated = await prisma.prestamo.update({
      where: { id: Number(id) },
      data:  { estado: "Pendiente", renovaciones: -1 },
    })

    return NextResponse.json(updated)
  }

  // ── APROBAR (solo admin) ──────────────────────────────────
  if (accion === "aprobar") {
    if (!isAdmin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    if (prestamo.estado !== "Pendiente") {
      return NextResponse.json({ error: "El préstamo no está en estado Pendiente" }, { status: 400 })
    }

    if (esPendienteRenovacion) {
      // Aprobar renovación: aplicar +7 días
      const fechaAnterior = new Date(prestamo.fechaDevolucion)
      const nuevaFecha    = new Date(prestamo.fechaDevolucion)
      nuevaFecha.setDate(nuevaFecha.getDate() + 7)

      const updated = await prisma.prestamo.update({
        where: { id: Number(id) },
        data:  { estado: "Renovado", fechaDevolucion: nuevaFecha, renovaciones: 1 },
      })

      try {
        await sendRenovacionConfirmada({
          userEmail:     prestamo.usuario.email,
          usuarioNombre: `${prestamo.usuario.nombre} ${prestamo.usuario.apellido}`,
          libroTitulo:   libro.titulo,
          fechaAnterior: fechaAnterior.toLocaleDateString("es-MX", { day:"2-digit", month:"long", year:"numeric" }),
          nuevaFecha:    nuevaFecha.toLocaleDateString("es-MX", { day:"2-digit", month:"long", year:"numeric" }),
          renovaciones:  1,
          prestamoId:    prestamo.id,
        })
      } catch (err) { console.error("Email renovación:", err) }

      return NextResponse.json(updated)
    }

    // Aprobar préstamo nuevo normal
    const updated = await prisma.prestamo.update({
      where: { id: Number(id) },
      data:  { estado: "Activo" },
    })

    try {
      const fechaPrestamo   = prestamo.fechaPrestamo.toLocaleDateString("es-MX", { day:"2-digit", month:"long", year:"numeric" })
      const fechaDevolucion = prestamo.fechaDevolucion.toLocaleDateString("es-MX", { day:"2-digit", month:"long", year:"numeric" })
      await sendPrestamoAprobadoUsuario({
        userEmail:      prestamo.usuario.email,
        usuarioNombre:  `${prestamo.usuario.nombre} ${prestamo.usuario.apellido}`,
        libroTitulo:    libro.titulo,
        libroEdicion:   libro.edicion,
        autores,
        codigoInterno:  prestamo.copia.codigoInterno,
        fechaPrestamo,
        fechaDevolucion,
        prestamoId:     prestamo.id,
      })
    } catch (err) { console.error("Email aprobación:", err) }

    return NextResponse.json(updated)
  }

  // ── RECHAZAR (solo admin) ─────────────────────────────────
  if (accion === "rechazar") {
    if (!isAdmin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    if (prestamo.estado !== "Pendiente") {
      return NextResponse.json({ error: "El préstamo no está en estado Pendiente" }, { status: 400 })
    }

    if (esPendienteRenovacion) {
      // Rechazar renovación: volver a Activo sin cambiar fecha
      const updated = await prisma.prestamo.update({
        where: { id: Number(id) },
        data:  { estado: "Activo", renovaciones: 0 },
      })
      return NextResponse.json(updated)
    }

    // Rechazar préstamo nuevo: liberar copia
    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.prestamo.update({
        where: { id: Number(id) },
        data:  { estado: "Devuelto", fechaRealDev: new Date() },
      })
      await tx.copia.update({ where: { id: prestamo.copiaId }, data: { estado: "Disponible" } })
      return p
    })

    return NextResponse.json(updated)
  }

  // ── DEVOLVER ──────────────────────────────────────────────
  if (accion === "devolver") {
    if (!isAdmin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.prestamo.update({
        where: { id: Number(id) },
        data:  { estado: "Devuelto", fechaRealDev: new Date() },
      })
      await tx.copia.update({ where: { id: prestamo.copiaId }, data: { estado: "Disponible" } })
      return p
    })
    return NextResponse.json(updated)
  }

  // ── PERDIDO ───────────────────────────────────────────────
  if (accion === "perdido") {
    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.prestamo.update({
        where: { id: Number(id) },
        data:  { estado: "Perdido", fechaRealDev: new Date() },
      })
      await tx.copia.update({ where: { id: prestamo.copiaId }, data: { estado: "Perdida" } })
      await tx.multa.create({
        data: {
          prestamoId: Number(id),
          usuarioId:  prestamo.usuarioId,
          monto:      500,
          motivo:     "Libro reportado como perdido",
          estado:     "Pendiente",
        },
      })
      return p
    })
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: "Acción inválida" }, { status: 400 })
}

// GET /api/prestamos/[id]
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
