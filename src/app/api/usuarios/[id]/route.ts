// src/app/api/usuarios/[id]/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Rol } from "@/generated/prisma/client"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)

    const user = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        genero: true,
        edad: true,
        matricula: true,
        numEmpleado: true,
        rol: true,
        activo: true,
        emailVerificado: true,
        createdAt: true,
        prestamos: { select: { id: true, estado: true } },
        multas:    { select: { id: true, estado: true, monto: true } },
      },
    })

    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    return NextResponse.json(user)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    const body = await req.json()

    // Validar unicidad de matrícula (si cambia)
    if (body.matricula) {
      const dup = await prisma.usuario.findFirst({ where: { matricula: body.matricula, NOT: { id } } })
      if (dup) return NextResponse.json({ error: "Esa matrícula ya está registrada" }, { status: 400 })
    }

    // Validar unicidad de número de empleado (si cambia)
    if (body.numEmpleado) {
      const dup = await prisma.usuario.findFirst({ where: { numEmpleado: body.numEmpleado, NOT: { id } } })
      if (dup) return NextResponse.json({ error: "Ese número de empleado ya está registrado" }, { status: 400 })
    }

    const updated = await prisma.usuario.update({
      where: { id },
      data: {
        ...(body.nombre      !== undefined && { nombre:      body.nombre }),
        ...(body.apellido    !== undefined && { apellido:    body.apellido }),
        ...(body.email       !== undefined && { email:       body.email }),
        ...(body.rol         !== undefined && { rol:         body.rol as Rol }),
        ...(body.activo      !== undefined && { activo:      body.activo }),
        ...(body.genero      !== undefined && { genero:      body.genero || null }),
        ...(body.edad        !== undefined && { edad:        body.edad ? Number(body.edad) : null }),
        ...(body.matricula   !== undefined && { matricula:   body.matricula || null }),
        ...(body.numEmpleado !== undefined && { numEmpleado: body.numEmpleado || null }),
      },
    })

    return NextResponse.json({ ok: true, updated })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)

    // Soft delete: marcar como inactivo
    await prisma.usuario.update({
      where: { id },
      data: { activo: false },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
