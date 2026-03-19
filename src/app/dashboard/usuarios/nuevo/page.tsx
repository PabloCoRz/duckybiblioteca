"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NuevoUsuarioPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const form = new FormData(e.currentTarget)

    const password = form.get("password") as string
    const confirm = form.get("confirmar") as string

    if (password !== confirm) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.get("nombre"),
        apellido: form.get("apellido"),
        email: form.get("email"),
        genero: form.get("genero"),
        edad: form.get("edad") ? Number(form.get("edad")) : null,
        rol: form.get("rol"),
        password,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "Error al crear usuario")
      setLoading(false)
      return
    }

    router.push("/dashboard/usuarios")
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg p-8 border border-stone/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-navy">Creación de Usuario</h2>
          <Link href="/dashboard/usuarios"
            className="px-3 py-1.5 rounded border border-gold text-gold text-xs hover:bg-gold hover:text-navy transition">
            Volver
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre(s)*" name="nombre" required />
            <Field label="Apellido(s)*" name="apellido" required />
            <Field label="Correo Electrónico*" name="email" type="email" required />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-stone block mb-1">Género</label>
                <select name="genero"
                  className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold">
                  <option value="">-</option>
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </div>
              <Field label="Edad" name="edad" type="number" />
            </div>
            <div>
              <label className="text-xs text-stone block mb-1">Rol</label>
              <select name="rol"
                className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold">
                {["Estudiante", "Maestro", "Colaborador", "Bibliotecario", "Administrador"].map(r => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <Field label="Contraseña" name="password" type="password" required />
            <Field label="Confirmar Contraseña" name="confirmar" type="password" required />
          </div>

          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full mt-6 py-2.5 rounded bg-navy text-white text-sm font-semibold hover:bg-navy/80 transition disabled:opacity-60">
            {loading ? "Creando..." : "Confirmar Creación De Usuario"}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, name, type = "text", required = false }: {
  label: string; name: string; type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="text-xs text-stone block mb-1">{label}</label>
      <input name={name} type={type} required={required}
        className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold" />
    </div>
  )
}