import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// GET /api/prestamos — list loans (admin: all, user: own)
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const estado = searchParams.get("estado")   // Activo | Devuelto | Perdido | Renovado
  const usuarioId = searchParams.get("usuarioId")

  const isAdmin = ["Administrador", "Bibliotecario"].includes(session.user?.role ?? "")

  const where: Record<string, unknown> = {}
  if (estado) where.estado = estado
  // Non-admin users only see their own loans
  if (!isAdmin) where.usuarioId = Number(session.user?.id)
  else if (usuarioId) where.usuarioId = Number(usuarioId)

  const prestamos = await prisma.prestamo.findMany({
    where,
    include: {
      usuario: { select: { id: true, nombre: true, apellido: true, email: true } },
      copia: {
        include: {
          libro: {
            include: { autores: { include: { autor: true } } }
          }
        }
      },
      multa: true,
    },
    orderBy: { fechaPrestamo: "desc" },
  })

  return NextResponse.json(prestamos)
}

// POST /api/prestamos — create a new loan
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { libroId, diasPrestamo = 14, usuarioIdTarget } = body

  // Admins can create loans for any user, otherwise for themselves
  const isAdmin = ["Administrador", "Bibliotecario"].includes(session.user?.role ?? "")
  const usuarioId = isAdmin && usuarioIdTarget
    ? Number(usuarioIdTarget)
    : Number(session.user?.id)

  if (!libroId) return NextResponse.json({ error: "Falta libroId" }, { status: 400 })

  // Find an available copy
  const copia = await prisma.copia.findFirst({
    where: { libroId: Number(libroId), estado: "Disponible" },
  })
  if (!copia) return NextResponse.json({ error: "No hay copias disponibles" }, { status: 409 })

  // Create loan + update copy status in a transaction
  const fechaDevolucion = new Date()
  fechaDevolucion.setDate(fechaDevolucion.getDate() + Number(diasPrestamo))

  const prestamo = await prisma.$transaction(async (tx) => {
    const p = await tx.prestamo.create({
      data: {
        usuarioId,
        copiaId: copia.id,
        fechaDevolucion,
        estado: "Activo",
      },
      include: {
        usuario: { select: { id: true, nombre: true, apellido: true, email: true } },
        copia: { include: { libro: { include: { autores: { include: { autor: true } } } } } },
      },
    })
    await tx.copia.update({ where: { id: copia.id }, data: { estado: "Prestada" } })
    return p
  })

  return NextResponse.json(prestamo, { status: 201 })
}