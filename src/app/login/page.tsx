"use client"
import { signIn, getSession } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    })

    if (result?.error) {
      setError("Email o contraseña incorrectos")
      return
    }

    const session = await getSession()

    const adminRoles = ["Administrador", "Bibliotecario"]
    if (adminRoles.includes(session?.user?.role ?? "")) {
      router.push("/dashboard")
    } else {
      router.push("/home")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      {error && <p>{error}</p>}
      <button type="submit">Iniciar Sesión</button>
    </form>
  )
}