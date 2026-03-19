import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function RootPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const adminRoles = ["Administrador", "Bibliotecario"]
  if (adminRoles.includes(session.user?.role ?? "")) {
    redirect("/dashboard")
  }

  redirect("/home")
}