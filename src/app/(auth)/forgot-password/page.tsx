"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    })

    setLoading(false)
    setSent(true)
  }

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center">
      <Image src="/background.png" alt="Ducky University" fill className="object-cover object-center" priority />
      <div className="absolute inset-0 bg-navy/60" />
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6 text-center">
        <Image src="/logo.png" alt="Logo" width={100} height={100} className="mb-6 rounded-2xl" />
        <h1 className="text-white text-2xl font-bold mb-3">Olvidé mi contraseña</h1>

        {!sent ? (
          <>
            <p className="text-cream/80 text-sm mb-6">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
              <input name="email" type="email" placeholder="Email" required
                className="w-full px-4 py-3 rounded-lg bg-cream/90 text-navy placeholder-stone text-sm outline-none focus:ring-2 focus:ring-gold" />
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg bg-navy text-white font-semibold text-sm hover:bg-navy/80 transition disabled:opacity-60">
                {loading ? "Enviando..." : "Enviar enlace"}
              </button>
            </form>
          </>
        ) : (
          <p className="text-cream/80 text-sm mb-6">
            Si ese email está registrado recibirás un enlace en tu bandeja de entrada.
          </p>
        )}

        <div className="w-full h-px bg-cream/20 my-5" />
        <Link href="/login"
          className="w-full py-3 rounded-lg border border-gold text-gold font-semibold text-sm text-center hover:bg-gold hover:text-navy transition">
          Volver al Login
        </Link>
      </div>
    </main>
  )
}