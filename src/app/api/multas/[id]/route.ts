// src/app/api/multas/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// PATCH /api/multas/[id] — marcar multa como pagada (con referencia opcional de Tesorería)
//
// Body: { refTesoreria?: string }
//   refTesoreria: folio / referencia que genera el sistema de Tesorería al recibir el pago.
//                 Si se envía vacío se guarda como null.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const isAdmin = ["Administrador", "Bibliotecario"].includes(session.user?.role ?? "")
  if (!isAdmin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })

  const { id } = await params

  let refTesoreria: string | null = null
  try {
    const body = await req.json()
    refTesoreria = body.refTesoreria?.trim() || null
  } catch {
    // body vacío también es válido
  }

  const multa = await prisma.multa.update({
    where: { id: Number(id) },
    data: {
      estado:      "Pagada",
      refTesoreria,
      fechaPago:   new Date(),
    },
  })

  return NextResponse.json(multa)
}

// GET /api/multas/[id] — detalle de una multa
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const multa = await prisma.multa.findUnique({
    where: { id: Number(id) },
    include: {
      usuario: { select: { id: true, nombre: true, apellido: true, email: true } },
      prestamo: {
        include: {
          copia: { include: { libro: true } },
        },
      },
    },
  })

  if (!multa) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const isAdmin = ["Administrador", "Bibliotecario"].includes(session.user?.role ?? "")
  if (!isAdmin && multa.usuarioId !== Number(session.user?.id)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
  }

  return NextResponse.json(multa)
}
