// src/app/api/reportes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// GET /api/reportes/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const isAdmin = ["Administrador", "Bibliotecario"].includes(session.user?.role ?? "")
  if (!isAdmin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })

  const { id } = await params
  const reporte = await prisma.reporte.findUnique({
    where: { id: Number(id) },
    include: { generadoPor: { select: { id: true, nombre: true, apellido: true } } },
  })

  if (!reporte) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json(reporte)
}

// PATCH /api/reportes/[id] — actualizar resultadoUrl una vez generado el archivo
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const isAdmin = ["Administrador", "Bibliotecario"].includes(session.user?.role ?? "")
  if (!isAdmin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })

  const { id } = await params
  const { resultadoUrl } = await req.json()

  const reporte = await prisma.reporte.update({
    where: { id: Number(id) },
    data: { ...(resultadoUrl !== undefined && { resultadoUrl }) },
  })

  return NextResponse.json(reporte)
}

// DELETE /api/reportes/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const isAdmin = ["Administrador", "Bibliotecario"].includes(session.user?.role ?? "")
  if (!isAdmin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })

  const { id } = await params
  await prisma.reporte.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
