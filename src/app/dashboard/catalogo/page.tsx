// src/app/dashboard/prestamos/page.tsx
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import PrestamosClient from "./PrestamosClient"

export default async function PrestamosPage() {
  const session = await auth()
  const isAdmin = ["Administrador", "Bibliotecario"].includes(session?.user?.role ?? "")

  const where = isAdmin ? {} : { usuarioId: Number(session?.user?.id) }

  const prestamos = await prisma.prestamo.findMany({
    where,
    include: {
      usuario: { select: { id: true, nombre: true, apellido: true, email: true } },
      copia: {
        include: {
          libro: {
            include: { autores: { include: { autor: true } } }
          }
        }
      },
      multa: true,
    },
    orderBy: { fechaPrestamo: "desc" },
  })

  const serialized = prestamos.map((p) => ({
    ...p,
    fechaPrestamo: p.fechaPrestamo.toISOString(),
    fechaDevolucion: p.fechaDevolucion.toISOString(),
    fechaRealDev: p.fechaRealDev?.toISOString() ?? null,
    copia: {
      ...p.copia,
      createdAt: p.copia.createdAt.toISOString(),
      libro: {
        ...p.copia.libro,
        createdAt: p.copia.libro.createdAt.toISOString(),
      }
    },
    multa: p.multa ? { ...p.multa, fecha: p.multa.fecha.toISOString() } : null,
  }))

  return <PrestamosClient prestamos={serialized} isAdmin={isAdmin} />
}
