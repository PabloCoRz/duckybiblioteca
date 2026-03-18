import { prisma } from "@/lib/prisma"
import { validateToken } from "@/lib/tokens"
import { TipoToken } from "@/generated/prisma/client"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    const result = await validateToken(token, TipoToken.VerificacionEmail)

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    await prisma.usuario.update({
      where: { email: result.email },
      data: { emailVerificado: true }
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