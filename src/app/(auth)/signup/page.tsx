"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export default function SignupPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const form = new FormData(e.currentTarget)

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        nombre: form.get("nombre"),
        apellido: form.get("apellido"),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? "Algo salió mal")
      setLoading(false)
      return
    }

    router.push("/verify-email-sent")
  }

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center">
      <Image src="/background.png" alt="Ducky University" fill className="object-cover object-center" priority />
      <div className="absolute inset-0 bg-navy/60" />
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6 py-8">
        <Image src="/logo.png" alt="Ducky University Logo" width={100} height={100} className="mb-6 rounded-2xl" />
        <h1 className="text-white text-2xl font-bold mb-6 text-center">Crear Cuenta</h1>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input name="nombre" type="text" placeholder="Nombre" required
            className="w-full px-4 py-3 rounded-lg bg-cream/90 text-navy placeholder-stone text-sm outline-none focus:ring-2 focus:ring-gold" />
          <input name="apellido" type="text" placeholder="Apellido" required
            className="w-full px-4 py-3 rounded-lg bg-cream/90 text-navy placeholder-stone text-sm outline-none focus:ring-2 focus:ring-gold" />
          <input name="email" type="email" placeholder="Email" required
            className="w-full px-4 py-3 rounded-lg bg-cream/90 text-navy placeholder-stone text-sm outline-none focus:ring-2 focus:ring-gold" />
          <input name="password" type="password" placeholder="Password" required
            className="w-full px-4 py-3 rounded-lg bg-cream/90 text-navy placeholder-stone text-sm outline-none focus:ring-2 focus:ring-gold" />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-navy text-white font-semibold text-sm mt-1 hover:bg-navy/80 transition disabled:opacity-60">
            {loading ? "Cargando..." : "Crear Cuenta"}
          </button>
        </form>
        <div className="w-full h-px bg-cream/20 my-5" />
        <p className="text-cream/80 text-sm mb-3">¿Ya tienes cuenta?</p>
        <Link href="/login"
          className="w-full py-3 rounded-lg border border-gold text-gold font-semibold text-sm text-center hover:bg-gold hover:text-navy transition">
          Hacer Log In
        </Link>
      </div>
    </main>
  )
}