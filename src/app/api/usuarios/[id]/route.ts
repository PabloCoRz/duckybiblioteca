import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Rol } from "@/generated/prisma/client"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    const body = await req.json()

    const updated = await prisma.usuario.update({
      where: { id },
      data: {
        ...(body.nombre && { nombre: body.nombre }),
        ...(body.apellido && { apellido: body.apellido }),
        ...(body.email && { email: body.email }),
        ...(body.rol && { rol: body.rol as Rol }),
        ...(body.activo !== undefined && { activo: body.activo }),
      }
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
    
    await prisma.usuario.update({
      where: { id },
      data: { activo: false }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}