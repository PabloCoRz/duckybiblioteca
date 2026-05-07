import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// GET /api/multas — list fines
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const isAdmin = ["Administrador", "Bibliotecario"].includes(session.user?.role ?? "")

  const multas = await prisma.multa.findMany({
    where: isAdmin ? undefined : { usuarioId: Number(session.user?.id) },
    include: {
      usuario: { select: { id: true, nombre: true, apellido: true, email: true } },
      prestamo: {
        include: {
          copia: { include: { libro: true } }
        }
      },
    },
    orderBy: { fecha: "desc" },
  })

  return NextResponse.json(multas)
}