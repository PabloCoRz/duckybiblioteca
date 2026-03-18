"use client"
import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"

export default function ResetPasswordPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const form = new FormData(e.currentTarget)
    const password = form.get("password") as string
    const confirm = form.get("confirm") as string

    if (password !== confirm) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    const token = searchParams.get("token")
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "Error al restablecer")
      setLoading(false)
      return
    }

    router.push("/login")
  }

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center">
      <Image src="/background.png" alt="Ducky University" fill className="object-cover object-center" priority />
      <div className="absolute inset-0 bg-navy/60" />
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6">
        <Image src="/logo.png" alt="Logo" width={100} height={100} className="mb-6 rounded-2xl" />
        <h1 className="text-white text-2xl font-bold mb-6 text-center">Nueva contraseña</h1>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input name="password" type="password" placeholder="Nueva contraseña" required
            className="w-full px-4 py-3 rounded-lg bg-cream/90 text-navy placeholder-stone text-sm outline-none focus:ring-2 focus:ring-gold" />
          <input name="confirm" type="password" placeholder="Confirmar contraseña" required
            className="w-full px-4 py-3 rounded-lg bg-cream/90 text-navy placeholder-stone text-sm outline-none focus:ring-2 focus:ring-gold" />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-navy text-white font-semibold text-sm mt-1 hover:bg-navy/80 transition disabled:opacity-60">
            {loading ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </main>
  )
}