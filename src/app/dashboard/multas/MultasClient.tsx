"use client"
// src/app/dashboard/multas/MultasClient.tsx
import { useState } from "react"
import { useRouter } from "next/navigation"

type Libro    = { id: number; titulo: string; isbn: string; portadaUrl: string | null }
type Copia    = { id: number; codigoInterno: string; libro: Libro }
type Prestamo = { id: number; copia: Copia; fechaPrestamo: string; fechaDevolucion: string }
type Usuario  = { id: number; nombre: string; apellido: string; email: string }

type Multa = {
  id: number
  monto: number
  motivo: string
  estado: string
  fecha: string
  refTesoreria: string | null
  fechaPago: string | null
  usuario: Usuario
  prestamo: Prestamo
}

export default function MultasClient({ multas, isAdmin }: { multas: Multa[]; isAdmin: boolean }) {
  const [estadoFilter, setEstadoFilter] = useState("Todos")
  const [search,       setSearch]       = useState("")
  const [loadingId,    setLoadingId]    = useState<number | null>(null)
  const [toast,        setToast]        = useState<{ msg: string; type: "ok" | "err" } | null>(null)
  // Modal de pago con referencia Tesorería
  const [pagoModal,    setPagoModal]    = useState<Multa | null>(null)
  const [refTesoreria, setRefTesoreria] = useState("")
  const router = useRouter()

  const pendientes  = multas.filter((m) => m.estado === "Pendiente").length
  const pagadas     = multas.filter((m) => m.estado === "Pagada").length
  const totalMonto  = multas.filter((m) => m.estado === "Pendiente").reduce((s, m) => s + m.monto, 0)

  const filtered = multas.filter((m) => {
    const matchEstado = estadoFilter === "Todos" || m.estado === estadoFilter
    const matchSearch = `${m.usuario.nombre} ${m.usuario.apellido} ${m.prestamo.copia.libro.titulo}`
      .toLowerCase().includes(search.toLowerCase())
    return matchEstado && matchSearch
  })

  function openPago(multa: Multa) {
    setRefTesoreria("")
    setPagoModal(multa)
  }

  async function confirmarPago() {
    if (!pagoModal) return
    setLoadingId(pagoModal.id)
    try {
      const res = await fetch(`/api/multas/${pagoModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refTesoreria: refTesoreria.trim() || null }),
      })
      if (res.ok) {
        setToast({ msg: "Multa marcada como pagada", type: "ok" })
        router.refresh()
      } else {
        setToast({ msg: "Error al actualizar", type: "err" })
      }
    } catch {
      setToast({ msg: "Error de red", type: "err" })
    }
    setLoadingId(null)
    setPagoModal(null)
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium
          ${toast.type === "ok" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-5 border border-stone/20">
          <p className="text-xs text-stone mb-1">Multas Pendientes</p>
          <p className="text-3xl font-bold text-red-600">{pendientes}</p>
        </div>
        <div className="bg-white rounded-lg p-5 border border-stone/20">
          <p className="text-xs text-stone mb-1">Multas Pagadas</p>
          <p className="text-3xl font-bold text-green-600">{pagadas}</p>
        </div>
        <div className="bg-white rounded-lg p-5 border border-stone/20">
          <p className="text-xs text-stone mb-1">Monto Pendiente Total</p>
          <p className="text-3xl font-bold text-navy">
            ${totalMonto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg p-5 border border-stone/20">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-semibold text-navy">
            {isAdmin ? "Gestión de Multas" : "Mis Multas"}
          </h3>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAdmin ? "Buscar por usuario o libro..." : "Buscar por libro..."}
              className="text-xs px-3 py-1.5 rounded border border-stone/30 outline-none focus:ring-1 focus:ring-gold bg-cream/50 w-48"
            />
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded border border-stone/30 outline-none focus:ring-1 focus:ring-gold bg-cream/50"
            >
              {["Todos", "Pendiente", "Pagada"].map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-stone border-b border-stone/20">
              <th className="pb-2 font-medium">Libro</th>
              {isAdmin && <th className="pb-2 font-medium">Usuario</th>}
              <th className="pb-2 font-medium">Motivo</th>
              <th className="pb-2 font-medium">Monto</th>
              <th className="pb-2 font-medium">Fecha</th>
              <th className="pb-2 font-medium">Estado</th>
              {isAdmin && <th className="pb-2 font-medium">Ref. Tesorería</th>}
              {isAdmin && <th className="pb-2 font-medium">Acción</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-stone/10 hover:bg-cream/30">
                <td className="py-2 pr-3">
                  <div className="font-medium text-navy leading-tight">{m.prestamo.copia.libro.titulo}</div>
                  <div className="text-stone">{m.prestamo.copia.libro.isbn}</div>
                </td>
                {isAdmin && (
                  <td className="py-2 pr-3">
                    <div className="font-medium text-navy">{m.usuario.nombre} {m.usuario.apellido}</div>
                    <div className="text-stone">{m.usuario.email}</div>
                  </td>
                )}
                <td className="py-2 pr-3 text-navy max-w-xs">{m.motivo}</td>
                <td className="py-2 pr-3">
                  <span className="font-medium text-red-600">
                    ${m.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="py-2 pr-3 text-navy">{new Date(m.fecha).toLocaleDateString("es-MX")}</td>
                <td className="py-2 pr-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium
                    ${m.estado === "Pagada" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {m.estado}
                  </span>
                </td>
                {isAdmin && (
                  <td className="py-2 pr-3 text-navy">
                    {m.estado === "Pagada" && m.refTesoreria
                      ? <span className="font-mono text-xs">{m.refTesoreria}</span>
                      : <span className="text-stone">—</span>
                    }
                  </td>
                )}
                {isAdmin && (
                  <td className="py-2">
                    {m.estado === "Pendiente" ? (
                      <button
                        onClick={() => openPago(m)}
                        disabled={loadingId === m.id}
                        className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 hover:bg-green-200 transition disabled:opacity-50"
                      >
                        {loadingId === m.id ? "..." : "Registrar Pago"}
                      </button>
                    ) : (
                      <span className="text-stone">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 8 : 5} className="py-8 text-center text-stone">
                  No hay multas para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal registrar pago con referencia Tesorería ── */}
      {pagoModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setPagoModal(null)}>
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-navy mb-2">Registrar Pago de Multa</h2>
            <p className="text-sm text-stone mb-5">
              Confirma el pago de la multa por{" "}
              <span className="font-semibold text-navy">
                ${pagoModal.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </span>{" "}
              para <span className="font-semibold text-navy">{pagoModal.usuario.nombre} {pagoModal.usuario.apellido}</span>.
            </p>

            <div className="mb-5">
              <label className="text-xs text-stone block mb-1">
                Referencia de Tesorería{" "}
                <span className="text-stone/60">(opcional — folio del recibo de pago)</span>
              </label>
              <input
                type="text"
                value={refTesoreria}
                onChange={(e) => setRefTesoreria(e.target.value)}
                placeholder="Ej: TES-2024-00123"
                className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setPagoModal(null)}
                className="px-4 py-2 rounded border border-gold text-gold text-sm hover:bg-gold hover:text-navy transition">
                Cancelar
              </button>
              <button onClick={confirmarPago} disabled={loadingId === pagoModal.id}
                className="px-4 py-2 rounded bg-navy text-white text-sm hover:bg-navy/80 transition disabled:opacity-50">
                {loadingId === pagoModal.id ? "Guardando..." : "Confirmar Pago"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
