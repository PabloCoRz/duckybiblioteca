import { prisma } from "@/lib/prisma"
import { generateToken } from "@/lib/tokens"
import { sendPasswordResetEmail } from "@/lib/email"
import { TipoToken } from "@/generated/prisma/client"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    const user = await prisma.usuario.findUnique({ where: { email } })

    // always return ok even if user doesn't exist
    // so you don't leak which emails are registered
    if (!user) return NextResponse.json({ ok: true })

    const token = await generateToken(email, TipoToken.ResetPassword, 1)
    await sendPasswordResetEmail(email, token)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}