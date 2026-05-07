// src/app/api/prestamos/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { sendPrestamoSolicitadoAdmin } from "@/lib/email"

// GET /api/prestamos — list loans
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const estado    = searchParams.get("estado")
  const usuarioId = searchParams.get("usuarioId")

  const isAdmin = ["Administrador", "Bibliotecario"].includes(session.user?.role ?? "")

  const where: Record<string, unknown> = {}
  if (estado) where.estado = estado
  if (!isAdmin) where.usuarioId = Number(session.user?.id)
  else if (usuarioId) where.usuarioId = Number(usuarioId)

  const prestamos = await prisma.prestamo.findMany({
    where,
    include: {
      usuario: { select: { id: true, nombre: true, apellido: true, email: true } },
      copia: {
        include: {
          libro: { include: { autores: { include: { autor: true } } } }
        }
      },
      multa: true,
    },
    orderBy: { fechaPrestamo: "desc" },
  })

  return NextResponse.json(prestamos)
}

// POST /api/prestamos — solicitar préstamo (queda como Pendiente hasta que admin apruebe)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { libroId, diasPrestamo = 14, usuarioIdTarget } = body

  const isAdmin  = ["Administrador", "Bibliotecario"].includes(session.user?.role ?? "")
  const usuarioId = isAdmin && usuarioIdTarget
    ? Number(usuarioIdTarget)
    : Number(session.user?.id)

  if (!libroId) return NextResponse.json({ error: "Falta libroId" }, { status: 400 })

  // Verificar que no tenga un préstamo activo/pendiente del mismo libro
  const existente = await prisma.prestamo.findFirst({
    where: {
      usuarioId,
      estado: { in: ["Pendiente", "Activo", "Renovado"] },
      copia: { libroId: Number(libroId) },
    },
  })
  if (existente) {
    return NextResponse.json(
      { error: "Ya tienes un préstamo activo o pendiente de este libro" },
      { status: 409 }
    )
  }

  // Buscar copia disponible — la reservamos en estado Prestada para que no se duplique
  const copia = await prisma.copia.findFirst({
    where: { libroId: Number(libroId), estado: "Disponible" },
  })
  if (!copia) return NextResponse.json({ error: "No hay copias disponibles" }, { status: 409 })

  const fechaDevolucion = new Date()
  fechaDevolucion.setDate(fechaDevolucion.getDate() + Number(diasPrestamo))

  // Crear préstamo en estado Pendiente + reservar copia
  const prestamo = await prisma.$transaction(async (tx) => {
    const p = await tx.prestamo.create({
      data: {
        usuarioId,
        copiaId: copia.id,
        fechaDevolucion,
        estado: "Pendiente",
      },
      include: {
        usuario: { select: { id: true, nombre: true, apellido: true, email: true } },
        copia: { include: { libro: { include: { autores: { include: { autor: true } } } } } },
      },
    })
    // Marcar copia como Prestada para que no quede disponible mientras está pendiente
    await tx.copia.update({ where: { id: copia.id }, data: { estado: "Prestada" } })
    return p
  })

  // Notificar a todos los admins/bibliotecarios por email
  try {
    const admins = await prisma.usuario.findMany({
      where: { rol: { in: ["Administrador", "Bibliotecario"] }, activo: true },
      select: { email: true },
    })

    const libro = prestamo.copia.libro
    const fechaStr = fechaDevolucion.toLocaleDateString("es-MX", {
      day: "2-digit", month: "long", year: "numeric",
    })

    await Promise.all(
      admins.map((admin) =>
        sendPrestamoSolicitadoAdmin({
          adminEmail:      admin.email,
          usuarioNombre:   `${prestamo.usuario.nombre} ${prestamo.usuario.apellido}`,
          usuarioEmail:    prestamo.usuario.email,
          libroTitulo:     libro.titulo,
          libroIsbn:       libro.isbn,
          fechaDevolucion: fechaStr,
          prestamoId:      prestamo.id,
        }).catch(console.error)
      )
    )
  } catch (err) {
    console.error("Error enviando email de notificación:", err)
  }

  return NextResponse.json(prestamo, { status: 201 })
}
