import { prisma } from "@/lib/prisma"
import { validateToken } from "@/lib/tokens"
import { TipoToken } from "@/generated/prisma/client"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()
    const result = await validateToken(token, TipoToken.ResetPassword)

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.usuario.update({
      where: { email: result.email },
      data: { passwordHash }
    })

    await prisma.token.delete({ where: { token } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}