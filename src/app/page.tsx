"use client"
// src/app/page.tsx
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const form = new FormData(e.currentTarget)

    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    })

    if (result?.error === "EmailNoVerificado") {
      setError("Por favor verifica tu correo antes de iniciar sesión")
      setLoading(false)
      return
    }

    if (result?.error) {
      setError("Email o contraseña incorrectos")
      setLoading(false)
      return
    }

    // Todos van a /home — el middleware maneja el resto
    router.push("/home")
  }

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center">
      <Image src="/background.png" alt="Ducky University" fill className="object-cover object-center" priority />
      <div className="absolute inset-0 bg-navy/60" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6">
        <Image src="/logo.png" alt="Ducky University Logo" width={100} height={100} className="mb-6 rounded-2xl" />

        <h1 className="text-white text-2xl font-bold mb-6 text-center">
          Welcome to Ducky University
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            name="email" type="email" placeholder="Email" required
            className="w-full px-4 py-3 rounded-lg bg-cream/90 text-navy placeholder-stone text-sm outline-none focus:ring-2 focus:ring-gold"
          />
          <input
            name="password" type="password" placeholder="Password" required
            className="w-full px-4 py-3 rounded-lg bg-cream/90 text-navy placeholder-stone text-sm outline-none focus:ring-2 focus:ring-gold"
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-navy text-white font-semibold text-sm mt-1 hover:bg-navy/80 transition disabled:opacity-60"
          >
            {loading ? "Cargando..." : "Log In"}
          </button>
        </form>

        <Link href="/forgot-password" className="text-cream/80 text-sm mt-4 hover:text-gold transition underline">
          Olvide mi contraseña
        </Link>

        <div className="w-full h-px bg-cream/20 my-5" />
        <p className="text-cream/80 text-sm mb-3">¿No tienes Cuenta?</p>

        <Link
          href="/signup"
          className="w-full py-3 rounded-lg border border-gold text-gold font-semibold text-sm text-center hover:bg-gold hover:text-navy transition"
        >
          Crear Cuenta
        </Link>
      </div>
    </main>
  )
}