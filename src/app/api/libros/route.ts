// src/app/api/libros/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const libros = await prisma.libro.findMany({
      include: {
        autores: { include: { autor: true } },
        copias: true,
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(libros)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      isbn, titulo, subtitulo, editorial, edicion,
      anioPub, numPaginas, categoria, idioma, descripcion, portadaUrl,
      autores, // string: "Apellido, Nombre; Apellido, Nombre"
      numEjemplares, pasillo, estante,
    } = body

    // Crear o conectar autores
    const autoresData = autores
      ? (autores as string).split(";").map((a: string) => a.trim()).filter(Boolean)
      : []

    const libro = await prisma.libro.create({
      data: {
        isbn, titulo,
        subtitulo:   subtitulo   || null,
        editorial:   editorial   || null,
        edicion:     edicion     || null,
        anioPub:     anioPub     ? Number(anioPub)     : null,
        numPaginas:  numPaginas  ? Number(numPaginas)  : null,
        categoria:   categoria   || null,
        idioma:      idioma      || "Español",
        descripcion: descripcion || null,
        portadaUrl:  portadaUrl  || null,
        autores: {
          create: await Promise.all(
            autoresData.map(async (nombre: string) => {
              const autor = await prisma.autor.upsert({
                where: { nombre },
                update: {},
                create: { nombre },
              })
              return { autorId: autor.id }
            })
          ),
        },
        copias: {
          create: Array.from({ length: Number(numEjemplares) || 1 }, (_, i) => ({
            codigoInterno: `${isbn}-C${i + 1}`,
            pasillo: pasillo || null,
            estante: estante || null,
          })),
        },
      },
    })

    return NextResponse.json({ ok: true, id: libro.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}