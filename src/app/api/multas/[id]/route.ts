import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// PATCH /api/multas/[id] — mark fine as paid
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const isAdmin = ["Administrador", "Bibliotecario"].includes(session.user?.role ?? "")
  if (!isAdmin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })

  const { id } = await params
  const multa = await prisma.multa.update({
    where: { id: Number(id) },
    data: { estado: "Pagada" },
  })

  return NextResponse.json(multa)
}