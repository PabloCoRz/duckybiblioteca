"use client"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      setStatus("error")
      setMessage("Token no encontrado")
      return
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setStatus("success")
          setTimeout(() => router.push("/login"), 3000)
        } else {
          setStatus("error")
          setMessage(data.error ?? "Error al verificar")
        }
      })
  }, [searchParams, router])

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center">
      <Image src="/background.png" alt="Ducky University" fill className="object-cover object-center" priority />
      <div className="absolute inset-0 bg-navy/60" />
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6 text-center">
        <Image src="/logo.png" alt="Logo" width={100} height={100} className="mb-6 rounded-2xl" />
        {status === "loading" && <p className="text-cream/80">Verificando tu correo...</p>}
        {status === "success" && (
          <>
            <h1 className="text-white text-2xl font-bold mb-3">¡Email verificado!</h1>
            <p className="text-cream/80 text-sm">Tu cuenta está activa. Redirigiendo al login...</p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-white text-2xl font-bold mb-3">Enlace inválido</h1>
            <p className="text-red-400 text-sm">{message}</p>
          </>
        )}
      </div>
    </main>
  )
}