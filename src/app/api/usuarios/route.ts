import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { Rol } from "@/generated/prisma/client"

export async function POST(req: Request) {
  try {
    const { nombre, apellido, email, genero, edad, rol, password } = await req.json()

    const existing = await prisma.usuario.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.usuario.create({
      data: {
        nombre, apellido, email, genero,
        edad: edad ? Number(edad) : null,
        rol: rol as Rol,
        passwordHash,
        activo: true,
        emailVerificado: true, // admin-created users skip email verification
      }
    })

    return NextResponse.json({ ok: true, id: user.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}