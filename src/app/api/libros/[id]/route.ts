// src/app/api/libros/[id]/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    const body = await req.json()

    const {
      isbn, titulo, subtitulo, editorial, edicion,
      anioPub, numPaginas, categoria, idioma, descripcion, portadaUrl,
      autores,
      copias,       // array de copias existentes a actualizar: { id, estado, pasillo, estante }
      copiasNuevas, // array de copias a crear: { codigoInterno, estado, pasillo, estante }
    } = body

    // ── Actualizar autores ────────────────────────────────
    if (autores !== undefined) {
      await prisma.libroAutor.deleteMany({ where: { libroId: id } })
      const autoresData = (autores as string).split(";").map((a: string) => a.trim()).filter(Boolean)
      for (const nombre of autoresData) {
        const autor = await prisma.autor.upsert({
          where: { nombre },
          update: {},
          create: { nombre },
        })
        await prisma.libroAutor.create({ data: { libroId: id, autorId: autor.id } })
      }
    }

    // ── Actualizar copias existentes individualmente ──────
    if (Array.isArray(copias) && copias.length > 0) {
      for (const copia of copias as { id: number; estado?: string; pasillo?: string; estante?: string }[]) {
        await prisma.copia.update({
          where: { id: copia.id },
          data: {
            ...(copia.estado  !== undefined && { estado:  copia.estado  as any }),
            ...(copia.pasillo !== undefined && { pasillo: copia.pasillo }),
            ...(copia.estante !== undefined && { estante: copia.estante }),
          },
        })
      }
    }

    // ── Crear copias nuevas ───────────────────────────────
    if (Array.isArray(copiasNuevas) && copiasNuevas.length > 0) {
      for (const c of copiasNuevas as { codigoInterno: string; estado?: string; pasillo?: string; estante?: string }[]) {
        await prisma.copia.create({
          data: {
            libroId:       id,
            codigoInterno: c.codigoInterno,
            estado:        (c.estado ?? "Disponible") as any,
            pasillo:       c.pasillo ?? null,
            estante:       c.estante ?? null,
          },
        })
      }
    }

    // ── Actualizar datos del libro ────────────────────────
    const libro = await prisma.libro.update({
      where: { id },
      data: {
        ...(isbn   && { isbn }),
        ...(titulo && { titulo }),
        subtitulo:   subtitulo   ?? undefined,
        editorial:   editorial   ?? undefined,
        edicion:     edicion     ?? undefined,
        anioPub:     anioPub     ? Number(anioPub)    : undefined,
        numPaginas:  numPaginas  ? Number(numPaginas) : undefined,
        categoria:   categoria   ?? undefined,
        idioma:      idioma      ?? undefined,
        descripcion: descripcion ?? undefined,
        portadaUrl:  portadaUrl  ?? undefined,
      },
    })

    return NextResponse.json({ ok: true, libro })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)

    await prisma.libroAutor.deleteMany({ where: { libroId: id } })
    await prisma.copia.deleteMany({ where: { libroId: id } })
    await prisma.libro.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}