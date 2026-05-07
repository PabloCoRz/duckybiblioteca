"use client"
// src/app/mis-prestamos/MisPrestamosClient.tsx
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ─── Types ────────────────────────────────────────────────────
type Autor   = { autor: { id: number; nombre: string } }
type Libro   = {
  id: number; isbn: string; titulo: string; subtitulo: string | null
  edicion: string | null; portadaUrl: string | null
  autores: Autor[]
}
type Copia   = { id: number; codigoInterno: string; libro: Libro }
type Multa   = { id: number; monto: number; estado: string }

type Prestamo = {
  id: number
  estado: string            // Pendiente | Activo | Renovado | Devuelto | Perdido
  fechaPrestamo: string
  fechaDevolucion: string
  fechaRealDev: string | null
  renovaciones: number
  copia: Copia
  multa: Multa | null
}

type FiltroEstado = "Prestamos Activos" | "Pendientes" | "Historial"

// ─── Helpers ─────────────────────────────────────────────────
function autoresStr(libro: Libro) {
  return libro.autores.map((a) => a.autor.nombre).join(", ")
}

function diasRestantes(fechaDevolucion: string): number {
  const diff = new Date(fechaDevolucion).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function Portada({ url, className }: { url: string | null; className: string }) {
  if (!url)
    return (
      <div className={`${className} bg-navy/10 rounded flex items-center justify-center text-navy/20 text-xs`}>
        Sin portada
      </div>
    )
  return <img src={url} alt="portada" className={`${className} object-cover rounded`} />
}

// ─── Modal Renovar ────────────────────────────────────────────
function ModalRenovar({
  prestamo,
  onClose,
  onConfirm,
  loading,
}: {
  prestamo: Prestamo
  onClose: () => void
  onConfirm: (metodo: "email" | "whatsapp") => void
  loading: boolean
}) {
  const [metodo, setMetodo] = useState<"email" | "whatsapp">("email")
  const libro     = prestamo.copia.libro
  const copias    = 0  // availability shown from copia state
  const fechaOrig = new Date(prestamo.fechaDevolucion)
  const nuevaFecha= new Date(prestamo.fechaDevolucion)
  nuevaFecha.setDate(nuevaFecha.getDate() + 7)

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        style={{ background: "#f5f0e8" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5">
          <h2 className="text-2xl font-bold text-navy mb-5">Renovar Préstamo</h2>

          {/* Libro card */}
          <div className="bg-white rounded-xl p-4 flex gap-4 items-start mb-5">
            <Portada url={libro.portadaUrl} className="w-14 h-20 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-navy text-sm leading-tight">{libro.titulo}</p>
              {libro.edicion && (
                <p className="text-xs text-stone mt-0.5">{libro.titulo} {libro.edicion}</p>
              )}
              <p className="text-xs text-stone mt-0.5">Autores: {autoresStr(libro)}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-gold inline-block" />
                <span className="text-xs text-gold font-medium">En Préstamo</span>
                <span className="text-xs text-stone">· {copias} ejemplares</span>
              </div>
            </div>
          </div>

          {/* Detalles */}
          <div className="mb-4">
            <p className="font-semibold text-navy text-sm mb-3">Detalles de la Renovación</p>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-stone">Fecha Original de Devolución:</span>
              <span className="font-semibold text-red-500">{fmtDate(fechaOrig)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone">Nueva Fecha de Devolución:</span>
              <span className="font-semibold text-blue-600">{fmtDate(nuevaFecha)}</span>
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
            <div className="flex items-start gap-2">
              <span className="text-amber-500 text-base mt-0.5">⚠</span>
              <div>
                <p className="text-xs font-semibold text-amber-700 mb-1">Advertencia</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Solo se permite una renovación por préstamo. Esta acción extenderá la fecha de devolución 7
                  días adicionales. Un bibliotecario tiene que aceptar tu renovación, cheque su correo para la
                  confirmación de renovación.
                </p>
              </div>
            </div>
          </div>

          {/* Método de comprobante */}
          <div className="mb-6">
            <p className="text-sm text-navy mb-2">Escoge como quieres que te demos el comprobante</p>
            <select
              value={metodo}
              onChange={(e) => setMetodo(e.target.value as "email" | "whatsapp")}
              className="w-full px-4 py-2.5 rounded-lg border border-stone/30 text-sm text-navy bg-white outline-none focus:ring-1 focus:ring-gold"
            >
              <option value="email">Correo Electrónico</option>
              <option value="whatsapp">Whatsapp</option>
            </select>
            {metodo === "whatsapp" && (
              <p className="text-xs text-stone mt-1.5 ml-1">
                * El comprobante se enviará por correo electrónico (WhatsApp próximamente)
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="px-7 pb-7 flex flex-col gap-3">
          <button
            onClick={() => onConfirm(metodo)}
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm text-white transition disabled:opacity-50"
            style={{ background: "#ccb581" }}
          >
            {loading ? "Procesando..." : "Solicitar Renovación"}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg border border-stone/30 font-semibold text-sm text-navy hover:bg-stone/10 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Libro Perdido ──────────────────────────────────────
function ModalPerdido({
  prestamo,
  onClose,
  onConfirm,
  loading,
}: {
  prestamo: Prestamo
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  const libro = prestamo.copia.libro

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        style={{ background: "#f5f0e8" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-7 pt-7 pb-5">
          <h2 className="text-2xl font-bold text-navy mb-5">Marcar Libro Como Perdido</h2>

          {/* Libro card */}
          <div className="bg-white rounded-xl p-4 flex gap-4 items-start mb-5">
            <Portada url={libro.portadaUrl} className="w-14 h-20 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-navy text-sm leading-tight">{libro.titulo}</p>
              {libro.edicion && (
                <p className="text-xs text-stone mt-0.5">{libro.titulo} {libro.edicion}</p>
              )}
              <p className="text-xs text-stone mt-0.5">Autores: {autoresStr(libro)}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-gold inline-block" />
                <span className="text-xs text-gold font-medium">En Préstamo</span>
                <span className="text-xs text-stone">· 0 ejemplares</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="font-semibold text-navy text-sm mb-3">Detalles de la Renovación</p>
            <div className="flex justify-between text-sm">
              <span className="text-stone">Se le va a cobrar</span>
              <span className="font-bold text-red-500">$219</span>
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <span className="text-amber-500 text-base mt-0.5">⚠</span>
              <div>
                <p className="text-xs font-semibold text-amber-700 mb-1">Advertencia</p>
                <p className="text-xs text-amber-700">
                  Se te va a cobrar esto a tu cuenta y se va a marcar el libro como perdido
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-7 pb-7 flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm text-white transition disabled:opacity-50"
            style={{ background: "#ccb581" }}
          >
            {loading ? "Procesando..." : "Confirmar Libro Perdido"}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg border border-stone/30 font-semibold text-sm text-navy hover:bg-stone/10 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tarjeta de préstamo ──────────────────────────────────────
function PrestamoCard({
  prestamo,
  onRenovar,
  onPerdido,
}: {
  prestamo: Prestamo
  onRenovar: (p: Prestamo) => void
  onPerdido: (p: Prestamo) => void
}) {
  const libro   = prestamo.copia.libro
  const activo  = prestamo.estado === "Activo" || prestamo.estado === "Renovado"
  const dias    = diasRestantes(prestamo.fechaDevolucion)
  const vencido = activo && dias < 0
  const [showInfo, setShowInfo] = useState(false)

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })

  return (
    <div className="bg-white rounded-2xl border border-stone/20 overflow-hidden shadow-sm">
      <div className="p-6 flex gap-5">
        {/* Portada */}
        <Portada url={libro.portadaUrl} className="w-36 h-48 shrink-0" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold text-navy leading-tight mb-1">{libro.titulo}</h3>

          <p className="text-sm text-stone mb-1">
            Fecha de Solicitud:{" "}
            <span className="text-navy">{fmtDate(prestamo.fechaPrestamo)}</span>
          </p>

          <p className="text-sm mb-2">
            Fecha de{" "}
            <span className="text-red-500 font-medium">Devolución:</span>{" "}
            <span className="text-navy">
              {fmtDate(prestamo.fechaDevolucion)}
            </span>
          </p>

          {/* Aviso días */}
          {activo && !vencido && dias <= 5 && (
            <p className="text-sm text-red-500 font-medium mb-3">
              Tienes {dias} Día{dias !== 1 ? "s" : ""} Para Devolver el libro, o haz una renovación
            </p>
          )}
          {vencido && (
            <p className="text-sm text-red-600 font-bold mb-3">
              ⚠ ¡Préstamo vencido! Devuelve el libro a la brevedad
            </p>
          )}

          {/* Botones de acción */}
          {activo && (
            <div className="flex gap-3 items-center flex-wrap">
              {prestamo.renovaciones < 1 && (
                <button
                  onClick={() => onRenovar(prestamo)}
                  className="px-5 py-2 rounded-lg font-semibold text-sm text-white transition hover:opacity-80"
                  style={{ background: "#ccb581" }}
                >
                  Renovar Prestamo
                </button>
              )}
              <button
                onClick={() => onPerdido(prestamo)}
                className="text-sm text-red-500 font-medium hover:text-red-700 transition underline ml-auto"
              >
                Reportar Libro Como Perdido
              </button>
            </div>
          )}

          {/* Estado badges */}
          {prestamo.estado === "Pendiente" && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              Esperando aprobación del bibliotecario
            </div>
          )}
          {prestamo.estado === "Devuelto" && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
              ✓ Devuelto el {prestamo.fechaRealDev ? fmtDate(prestamo.fechaRealDev) : "—"}
            </div>
          )}
          {prestamo.estado === "Perdido" && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-medium px-3 py-1 rounded-full">
              ✗ Reportado como perdido
              {prestamo.multa && ` — Multa: $${prestamo.multa.monto}`}
            </div>
          )}
        </div>
      </div>

      {/* Ver información */}
      <div className="border-t border-stone/10 px-6 py-3">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="flex items-center gap-1 text-gold text-sm font-medium hover:text-gold/70 transition"
        >
          Ver información de Libro
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${showInfo ? "rotate-90" : ""}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {showInfo && (
          <div className="mt-3 text-sm space-y-1 text-stone">
            <p><span className="font-medium text-navy">ISBN:</span> {libro.isbn}</p>
            <p><span className="font-medium text-navy">Autores:</span> {autoresStr(libro)}</p>
            {libro.edicion && <p><span className="font-medium text-navy">Edición:</span> {libro.edicion}</p>}
            <p><span className="font-medium text-navy">Código de copia:</span> {prestamo.copia.codigoInterno}</p>
            <p><span className="font-medium text-navy">Renovaciones:</span> {prestamo.renovaciones}/1</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────
export default function MisPrestamosClient({ prestamos }: { prestamos: Prestamo[] }) {
  const [filtro,       setFiltro]       = useState<FiltroEstado>("Prestamos Activos")
  const [search,       setSearch]       = useState("")
  const [renovarModal, setRenovarModal] = useState<Prestamo | null>(null)
  const [perdidoModal, setPerdidoModal] = useState<Prestamo | null>(null)
  const [loading,      setLoading]      = useState(false)
  const [toast,        setToast]        = useState<{ msg: string; type: "ok" | "err" } | null>(null)
  const router = useRouter()

  const mostrar = prestamos.filter((p) => {
    const matchSearch = p.copia.libro.titulo.toLowerCase().includes(search.toLowerCase())
    let matchFiltro = false
    if (filtro === "Prestamos Activos") matchFiltro = p.estado === "Activo" || p.estado === "Renovado"
    if (filtro === "Pendientes")         matchFiltro = p.estado === "Pendiente"
    if (filtro === "Historial")          matchFiltro = p.estado === "Devuelto" || p.estado === "Perdido"
    return matchSearch && matchFiltro
  })

  const nActivos   = prestamos.filter((p) => p.estado === "Activo" || p.estado === "Renovado").length
  const nPendientes= prestamos.filter((p) => p.estado === "Pendiente").length

  async function handleRenovar(metodo: "email" | "whatsapp") {
    if (!renovarModal) return
    setLoading(true)
    try {
      const res = await fetch(`/api/prestamos/${renovarModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "renovar", metodoComprobante: metodo }),
      })
      const data = await res.json()
      if (!res.ok) {
        setToast({ msg: data.error ?? "Error al renovar", type: "err" })
      } else {
        setToast({ msg: "¡Renovación confirmada! Revisa tu correo.", type: "ok" })
        router.refresh()
      }
    } catch {
      setToast({ msg: "Error de red", type: "err" })
    }
    setLoading(false)
    setRenovarModal(null)
    setTimeout(() => setToast(null), 5000)
  }

  async function handlePerdido() {
    if (!perdidoModal) return
    setLoading(true)
    try {
      const res = await fetch(`/api/prestamos/${perdidoModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "perdido" }),
      })
      const data = await res.json()
      if (!res.ok) {
        setToast({ msg: data.error ?? "Error", type: "err" })
      } else {
        setToast({ msg: "Libro reportado como perdido", type: "ok" })
        router.refresh()
      }
    } catch {
      setToast({ msg: "Error de red", type: "err" })
    }
    setLoading(false)
    setPerdidoModal(null)
    setTimeout(() => setToast(null), 5000)
  }

  const FILTROS: FiltroEstado[] = ["Prestamos Activos", "Pendientes", "Historial"]

  return (
    <div className="flex-1 px-8 py-8 max-w-4xl mx-auto w-full">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium
          ${toast.type === "ok" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/home" className="text-sm text-navy hover:text-gold transition font-medium">
          &lt; Regresar A Inicio
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-navy mb-6 text-center">Mis Prestamos Activos</h1>

      {/* Search + filter bar */}
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white rounded-full px-5 py-2.5 border border-stone/20 flex-1 min-w-48">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar Prestamo"
            className="flex-1 outline-none text-sm text-navy bg-transparent"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-navy" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-navy font-medium">Filtrar por:</span>
          <div className="relative">
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as FiltroEstado)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg border-none bg-transparent text-gold font-semibold text-sm outline-none cursor-pointer"
            >
              {FILTROS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <svg className="absolute right-1 top-2.5 w-4 h-4 text-gold pointer-events-none"
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </div>

      <hr className="border-stone/30 mb-8" />

      {/* Badge counts */}
      {(nActivos > 0 || nPendientes > 0) && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {nActivos > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
              {nActivos} activo{nActivos !== 1 ? "s" : ""}
            </span>
          )}
          {nPendientes > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1 rounded-full">
              {nPendientes} pendiente{nPendientes !== 1 ? "s" : ""} de aprobación
            </span>
          )}
        </div>
      )}

      {/* Cards */}
      {mostrar.length === 0 ? (
        <div className="text-center py-16 text-stone">
          <p className="text-lg font-medium mb-1">No hay préstamos en esta sección</p>
          {filtro === "Prestamos Activos" && (
            <p className="text-sm">
              Ve al{" "}
              <Link href="/home" className="text-gold underline">catálogo</Link>{" "}
              para solicitar un libro.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {mostrar.map((p) => (
            <PrestamoCard
              key={p.id}
              prestamo={p}
              onRenovar={setRenovarModal}
              onPerdido={setPerdidoModal}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {renovarModal && (
        <ModalRenovar
          prestamo={renovarModal}
          onClose={() => setRenovarModal(null)}
          onConfirm={handleRenovar}
          loading={loading}
        />
      )}
      {perdidoModal && (
        <ModalPerdido
          prestamo={perdidoModal}
          onClose={() => setPerdidoModal(null)}
          onConfirm={handlePerdido}
          loading={loading}
        />
      )}
    </div>
  )
}
