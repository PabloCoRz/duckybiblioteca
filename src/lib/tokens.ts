import { prisma } from "@/lib/prisma"
import { TipoToken } from "@/generated/prisma/client"
import crypto from "crypto"

export async function generateToken(email: string, tipo: TipoToken, expiresInHours: number) {
  // delete any existing token of the same type for this email
  await prisma.token.deleteMany({ where: { email, tipo } })

  const token = crypto.randomBytes(32).toString("hex")
  const expira = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)

  await prisma.token.create({
    data: { email, token, tipo, expira }
  })

  return token
}

export async function validateToken(token: string, tipo: TipoToken) {
  const record = await prisma.token.findUnique({ where: { token } })

  if (!record) return { valid: false, error: "Token inválido" }
  if (record.tipo !== tipo) return { valid: false, error: "Token inválido" }
  if (record.expira < new Date()) return { valid: false, error: "Token expirado" }

  return { valid: true, email: record.email, record }
}