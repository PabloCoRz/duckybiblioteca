// src/app/api/usuarios/route.ts
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { Rol } from "@/generated/prisma/client"

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
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
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(usuarios)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const {
      nombre, apellido, email, genero, edad,
      matricula, numEmpleado,
      rol, password,
    } = await req.json()

    const existing = await prisma.usuario.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 400 })
    }

    // Validar unicidad de matrícula si se provee
    if (matricula) {
      const dup = await prisma.usuario.findUnique({ where: { matricula } })
      if (dup) return NextResponse.json({ error: "Esa matrícula ya está registrada" }, { status: 400 })
    }

    // Validar unicidad de número de empleado si se provee
    if (numEmpleado) {
      const dup = await prisma.usuario.findUnique({ where: { numEmpleado } })
      if (dup) return NextResponse.json({ error: "Ese número de empleado ya está registrado" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        email,
        genero:      genero      || null,
        edad:        edad        ? Number(edad)  : null,
        matricula:   matricula   || null,
        numEmpleado: numEmpleado || null,
        rol:         rol as Rol,
        passwordHash,
        activo:          true,
        emailVerificado: true, // admin-created users skip email verification
      },
    })

    return NextResponse.json({ ok: true, id: user.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
