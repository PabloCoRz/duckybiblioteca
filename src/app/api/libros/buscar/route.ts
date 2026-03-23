// src/app/api/libros/buscar/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() ?? ""

  if (!q) return NextResponse.json([])

  const libros = await prisma.libro.findMany({
    where: {
      OR: [
        { titulo:      { contains: q, mode: "insensitive" } },
        { subtitulo:   { contains: q, mode: "insensitive" } },
        { isbn:        { contains: q, mode: "insensitive" } },
        { categoria:   { contains: q, mode: "insensitive" } },
        { editorial:   { contains: q, mode: "insensitive" } },
        { autores: { some: { autor: { nombre: { contains: q, mode: "insensitive" } } } } },
      ],
    },
    include: {
      autores: { include: { autor: true } },
      copias: true,
    },
    orderBy: { titulo: "asc" },
  })

  return NextResponse.json(libros)
}