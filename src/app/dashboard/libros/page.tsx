// src/app/dashboard/libros/page.tsx
import { prisma } from "@/lib/prisma"
import LibrosClient from "./LibrosClient"

function isValidUrl(url: string | null): boolean {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export default async function LibrosPage() {
  const libros = await prisma.libro.findMany({
    include: {
      autores: { include: { autor: true } },
      copias: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const librosSerializados = libros.map((l) => ({
    ...l,
    portadaUrl: isValidUrl(l.portadaUrl) ? l.portadaUrl : null,
    createdAt: l.createdAt.toISOString(),
    copias: l.copias.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
  }))

  return <LibrosClient libros={librosSerializados} />
}