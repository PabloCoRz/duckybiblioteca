import { prisma } from "@/lib/prisma"
import { generateToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/email"
import { TipoToken } from "@/generated/prisma/client"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email, password, nombre, apellido } = await req.json()

    if (!email || !password || !nombre || !apellido) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }

    const existing = await prisma.usuario.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.usuario.create({
      data: {
        email,
        passwordHash,
        nombre,
        apellido,
        rol: "Estudiante", // default role, admin can change later
        activo: true,
        emailVerificado: false,
      }
    })

    const token = await generateToken(email, TipoToken.VerificacionEmail, 24)
    await sendVerificationEmail(email, token)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}