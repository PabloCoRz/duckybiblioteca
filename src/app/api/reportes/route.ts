// src/app/api/reportes/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// GET /api/reportes — listar reportes generados
export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const isAdmin = ["Administrador", "Bibliotecario"].includes(session.user?.role ?? "")
  if (!isAdmin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })

  const reportes = await prisma.reporte.findMany({
    include: {
      generadoPor: { select: { id: true, nombre: true, apellido: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(reportes)
}

// POST /api/reportes — generar / registrar un reporte
//
// Body:
//   tipo          string   "prestamos_mes" | "multas_pendientes" | "inventario" | …
//   parametros    object   filtros que se usaron (fecha inicio/fin, categoría, etc.)
//   resultadoUrl  string?  URL del archivo ya generado externamente (opcional)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const isAdmin = ["Administrador", "Bibliotecario"].includes(session.user?.role ?? "")
  if (!isAdmin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })

  const body = await req.json()
  const { tipo, parametros, resultadoUrl } = body

  if (!tipo) return NextResponse.json({ error: "El campo 'tipo' es requerido" }, { status: 400 })

  const reporte = await prisma.reporte.create({
    data: {
      generadoPorId: Number(session.user?.id),
      tipo,
      parametros:   parametros   ?? null,
      resultadoUrl: resultadoUrl ?? null,
    },
    include: {
      generadoPor: { select: { id: true, nombre: true, apellido: true } },
    },
  })

  return NextResponse.json(reporte, { status: 201 })
}
