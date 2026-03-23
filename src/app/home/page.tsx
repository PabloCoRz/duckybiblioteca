// src/app/home/page.tsx
import Navbar from "@/components/layout/Navbar"
import HomeClient from "./HomeClient"
import { prisma } from "@/lib/prisma"

function isValidUrl(url: string | null): boolean {
  if (!url) return false
  try { new URL(url); return true } catch { return false }
}

export default async function HomePage() {
  const destacados = await prisma.libro.findMany({
    take: 8,
    include: { autores: { include: { autor: true } }, copias: true },
    orderBy: { createdAt: "desc" },
  })

  const data = destacados.map(l => ({
    ...l,
    portadaUrl: isValidUrl(l.portadaUrl) ? l.portadaUrl : null,
    createdAt: l.createdAt.toISOString(),
    copias: l.copias.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })),
  }))

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <HomeClient destacados={data} />
    </div>
  )
}