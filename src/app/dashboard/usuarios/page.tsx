import { prisma } from "@/lib/prisma"
import UsuariosClient from "./UsuariosClient"

export default async function UsuariosPage() {
  const usuarios = await prisma.usuario.findMany({
    orderBy: { createdAt: "desc" }
  })

  return <UsuariosClient usuarios={usuarios} />
}