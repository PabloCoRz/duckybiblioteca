// src/app/dashboard/multas/page.tsx
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import MultasClient from "./MultasClient"

export default async function MultasPage() {
  const session = await auth()
  const isAdmin = ["Administrador", "Bibliotecario"].includes(session?.user?.role ?? "")

  const multas = await prisma.multa.findMany({
    where: isAdmin ? undefined : { usuarioId: Number(session?.user?.id) },
    include: {
      usuario: { select: { id: true, nombre: true, apellido: true, email: true } },
      prestamo: {
        include: {
          copia: {
            include: {
              libro: { select: { id: true, titulo: true, isbn: true, portadaUrl: true } }
            }
          }
        }
      },
    },
    orderBy: { fecha: "desc" },
  })

  const serialized = multas.map((m) => ({
    ...m,
    fecha: m.fecha.toISOString(),
    prestamo: {
      ...m.prestamo,
      fechaPrestamo: m.prestamo.fechaPrestamo.toISOString(),
      fechaDevolucion: m.prestamo.fechaDevolucion.toISOString(),
      fechaRealDev: m.prestamo.fechaRealDev?.toISOString() ?? null,
      copia: {
        ...m.prestamo.copia,
        createdAt: m.prestamo.copia.createdAt.toISOString(),
      },
    },
  }))

  return <MultasClient multas={serialized} isAdmin={isAdmin} />
}
