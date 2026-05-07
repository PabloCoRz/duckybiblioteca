// src/app/mis-prestamos/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import MisPrestamosClient from "./MisPrestamosClient"

export default async function MisPrestamosPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const prestamos = await prisma.prestamo.findMany({
    where: { usuarioId: Number(session.user.id) },
    include: {
      copia: {
        include: {
          libro: {
            include: { autores: { include: { autor: true } } },
          },
        },
      },
      multa: true,
    },
    orderBy: { fechaPrestamo: "desc" },
  })

  const serialized = prestamos.map((p) => ({
    ...p,
    fechaPrestamo:   p.fechaPrestamo.toISOString(),
    fechaDevolucion: p.fechaDevolucion.toISOString(),
    fechaRealDev:    p.fechaRealDev?.toISOString() ?? null,
    multa: p.multa
      ? { ...p.multa, fecha: p.multa.fecha.toISOString(), fechaPago: p.multa.fechaPago?.toISOString() ?? null }
      : null,
    copia: {
      ...p.copia,
      createdAt: p.copia.createdAt.toISOString(),
      libro: {
        ...p.copia.libro,
        createdAt: p.copia.libro.createdAt.toISOString(),
      },
    },
  }))

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <MisPrestamosClient prestamos={serialized} />
    </div>
  )
}
