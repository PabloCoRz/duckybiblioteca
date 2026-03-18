import Image from "next/image"
import Link from "next/link"

export default function VerifyEmailSentPage() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center">
      <Image src="/background.png" alt="Ducky University" fill className="object-cover object-center" priority />
      <div className="absolute inset-0 bg-navy/60" />
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6 text-center">
        <Image src="/logo.png" alt="Logo" width={100} height={100} className="mb-6 rounded-2xl" />
        <h1 className="text-white text-2xl font-bold mb-3">Revisa tu correo</h1>
        <p className="text-cream/80 text-sm mb-6">
          Te enviamos un enlace de verificación. Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
        </p>
        <Link href="/login"
          className="w-full py-3 rounded-lg border border-gold text-gold font-semibold text-sm text-center hover:bg-gold hover:text-navy transition">
          Volver al Login
        </Link>
      </div>
    </main>
  )
}