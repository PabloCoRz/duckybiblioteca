"use client"
// src/app/dashboard/prestamos/PrestamosClient.tsx
import { useState } from "react"
import { useRouter } from "next/navigation"

type Usuario = { id: number; nombre: string; apellido: string; email: string }
type Libro   = { id: number; titulo: string; isbn: string; portadaUrl: string | null; autores: { autor: { nombre: string } }[] }
type Copia   = { id: number; codigoInterno: string; pasillo: string | null; estante: string | null; estado: string; libro: Libro }
type Multa   = { id: number; monto: number; motivo: string; estado: string; fecha: string }

type Prestamo = {
  id: number
  estado: string
  fechaPrestamo: string
  fechaDevolucion: string
  fechaRealDev: string | null
  renovaciones: number   // -1 = pendiente de renovación
  usuario: Usuario
  copia: Copia
  multa: Multa | null
}

// renovaciones === -1 → este Pendiente es una solicitud de renovación
function esRenovacionPendiente(p: Prestamo) {
  return p.estado === "Pendiente" && p.renovaciones === -1
}

const ESTADO_LABEL: Record<string, string> = {
  Pendiente: "Pendiente",
  Activo:    "Activo",
  Renovado:  "Renovado",
  Devuelto:  "Devuelto",
  Perdido:   "Perdido",
}

const ESTADO_BADGE: Record<string, string> = {
  Pendiente: "bg-amber-100 text-amber-700",
  Activo:    "bg-blue-100 text-blue-700",
  Renovado:  "bg-purple-100 text-purple-700",
  Devuelto:  "bg-green-100 text-green-700",
  Perdido:   "bg-red-100 text-red-600",
}

function Portada({ url, className }: { url: string | null; className: string }) {
  if (!url) return <div className={`${className} bg-navy/10 rounded flex items-center justify-center text-navy/20 text-xs`}>Sin portada</div>
  return <img src={url} alt="portada" className={`${className} object-cover rounded`} />
}

function estaVencido(fechaDevolucion: string) {
  return new Date(fechaDevolucion) < new Date()
}

// ─── Modal confirmación ───────────────────────────────────────
function ModalAccion({
  prestamo, accion, onClose, onConfirm, loading,
}: {
  prestamo: Prestamo
  accion: "devolver" | "perdido" | "aprobar" | "rechazar"
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  const esRenov = esRenovacionPendiente(prestamo)

  const mensajes = {
    aprobar:  {
      titulo: esRenov ? "Aprobar Renovación" : "Aprobar Préstamo",
      desc:   esRenov
        ? "Se extenderá la fecha de devolución 7 días y se enviará email de confirmación al usuario."
        : "El usuario podrá retirar el libro. Se enviará email de confirmación.",
      btn:    esRenov ? "Aprobar Renovación" : "Aprobar Préstamo",
      color:  "bg-navy",
    },
    rechazar: {
      titulo: esRenov ? "Rechazar Renovación" : "Rechazar Solicitud",
      desc:   esRenov
        ? "El préstamo volverá a estar Activo con la fecha original."
        : "La solicitud será rechazada y la copia quedará disponible.",
      btn:    "Rechazar",
      color:  "bg-red-600",
    },
    devolver: { titulo: "Registrar Devolución",   desc: "¿Confirmas que se devolvió el libro?",                         btn: "Confirmar Devolución",  color: "bg-navy" },
    perdido:  { titulo: "Reportar Libro Perdido",  desc: "⚠️ Se generará una multa. ¿Confirmas que el libro fue perdido?", btn: "Reportar como Perdido", color: "bg-red-600" },
  }
  const m = mensajes[accion]

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-navy mb-2">{m.titulo}</h2>
        <p className="text-sm text-stone mb-5">{m.desc}</p>
        <div className="flex gap-4 bg-cream/50 rounded-lg p-4 mb-6">
          <Portada url={prestamo.copia.libro.portadaUrl} className="w-14 h-20 shrink-0" />
          <div className="text-sm space-y-0.5">
            <p className="font-bold text-navy">{prestamo.copia.libro.titulo}</p>
            <p className="text-stone">ISBN: {prestamo.copia.libro.isbn}</p>
            <p className="text-stone">Usuario: {prestamo.usuario.nombre} {prestamo.usuario.apellido}</p>
            <p className="text-stone text-xs">{prestamo.usuario.email}</p>
            <p className="text-stone">Copia: {prestamo.copia.codigoInterno}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose}
            className="px-4 py-2 rounded border border-gold text-gold text-sm hover:bg-gold hover:text-navy transition">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`px-4 py-2 rounded text-white text-sm transition disabled:opacity-50 ${m.color} hover:opacity-80`}>
            {loading ? "Procesando..." : m.btn}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────
export default function PrestamosClient({ prestamos, isAdmin }: { prestamos: Prestamo[]; isAdmin: boolean }) {
  const [search,        setSearch]       = useState("")
  const [estadoFilter,  setEstadoFilter] = useState("Todos")
  const [modal,         setModal]        = useState<{ prestamo: Prestamo; accion: "devolver"|"perdido"|"aprobar"|"rechazar" } | null>(null)
  const [loadingAction, setLoadingAction]= useState(false)
  const [toast,         setToast]        = useState<{ msg: string; type: "ok"|"err" } | null>(null)
  const router = useRouter()

  const pendientesNuevos  = prestamos.filter((p) => p.estado === "Pendiente" && p.renovaciones !== -1).length
  const pendientesRenov   = prestamos.filter((p) => p.estado === "Pendiente" && p.renovaciones === -1).length
  const activos           = prestamos.filter((p) => p.estado === "Activo" || p.estado === "Renovado").length
  const devueltos         = prestamos.filter((p) => p.estado === "Devuelto").length
  const perdidos          = prestamos.filter((p) => p.estado === "Perdido").length
  const vencidos          = prestamos.filter((p) => (p.estado==="Activo"||p.estado==="Renovado") && estaVencido(p.fechaDevolucion)).length

  const filtered = prestamos.filter((p) => {
    const libro = p.copia.libro
    const matchSearch = `${libro.titulo} ${libro.isbn} ${p.usuario.nombre} ${p.usuario.apellido} ${p.usuario.email}`
      .toLowerCase().includes(search.toLowerCase())
    const matchEstado = estadoFilter === "Todos" || p.estado === estadoFilter
    return matchSearch && matchEstado
  })

  async function ejecutarAccion() {
    if (!modal) return
    setLoadingAction(true)
    try {
      const res = await fetch(`/api/prestamos/${modal.prestamo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: modal.accion }),
      })
      if (!res.ok) {
        const err = await res.json()
        setToast({ msg: err.error ?? "Error al procesar", type: "err" })
      } else {
        const esRenov = esRenovacionPendiente(modal.prestamo)
        const msgs: Record<string, string> = {
          aprobar:  esRenov ? "Renovación aprobada — se notificó al usuario" : "Préstamo aprobado — se notificó al usuario",
          rechazar: esRenov ? "Renovación rechazada — préstamo sigue activo" : "Solicitud rechazada",
          devolver: "Devolución registrada",
          perdido:  "Libro reportado como perdido",
        }
        setToast({ msg: msgs[modal.accion], type: "ok" })
        router.refresh()
      }
    } catch {
      setToast({ msg: "Error de red", type: "err" })
    }
    setLoadingAction(false)
    setModal(null)
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
      <div className="grid grid-cols-6 gap-3">
        <StatCard title="Pend. Nuevos"  value={pendientesNuevos} color="text-amber-600" />
        <StatCard title="Pend. Renov."  value={pendientesRenov}  color="text-orange-500" />
        <StatCard title="Activos"       value={activos}          color="text-blue-600" />
        <StatCard title="Devueltos"     value={devueltos}        color="text-green-600" />
        <StatCard title="Perdidos"      value={perdidos}         color="text-red-600" />
        <StatCard title="Vencidos"      value={vencidos}         color="text-red-400" />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg p-5 border border-stone/20">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-semibold text-navy">Gestión de Préstamos</h3>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por libro o usuario..."
              className="text-xs px-3 py-1.5 rounded border border-stone/30 outline-none focus:ring-1 focus:ring-gold bg-cream/50 w-56"
            />
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded border border-stone/30 outline-none focus:ring-1 focus:ring-gold bg-cream/50"
            >
              {["Todos", "Pendiente", "Activo", "Renovado", "Devuelto", "Perdido"].map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </div>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-stone border-b border-stone/20">
              <th className="pb-2 font-medium">Libro</th>
              {isAdmin && <th className="pb-2 font-medium">Usuario</th>}
              <th className="pb-2 font-medium">Copia</th>
              <th className="pb-2 font-medium">Préstamo</th>
              <th className="pb-2 font-medium">Devolución</th>
              <th className="pb-2 font-medium">Estado</th>
              <th className="pb-2 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const libro    = p.copia.libro
              const vencido  = estaVencido(p.fechaDevolucion) && (p.estado==="Activo"||p.estado==="Renovado")
              const activo   = p.estado === "Activo" || p.estado === "Renovado"
              const esRenov  = esRenovacionPendiente(p)

              return (
                <tr key={p.id} className={`border-b border-stone/10 hover:bg-cream/30
                  ${vencido ? "bg-red-50" : ""}
                  ${p.estado === "Pendiente" ? "bg-amber-50/40" : ""}`}>

                  <td className="py-2 pr-3">
                    <div className="flex gap-2 items-center">
                      <Portada url={libro.portadaUrl} className="w-8 h-10 shrink-0" />
                      <div>
                        <div className="font-medium text-navy leading-tight">{libro.titulo}</div>
                        <div className="text-stone">{libro.isbn}</div>
                      </div>
                    </div>
                  </td>

                  {isAdmin && (
                    <td className="py-2 pr-3">
                      <div className="font-medium text-navy">{p.usuario.nombre} {p.usuario.apellido}</div>
                      <div className="text-stone">{p.usuario.email}</div>
                    </td>
                  )}

                  <td className="py-2 pr-3 text-navy">{p.copia.codigoInterno}</td>

                  <td className="py-2 pr-3 text-navy">
                    {new Date(p.fechaPrestamo).toLocaleDateString("es-MX")}
                  </td>

                  <td className="py-2 pr-3">
                    <span className={vencido ? "text-red-600 font-medium" : "text-navy"}>
                      {new Date(p.fechaDevolucion).toLocaleDateString("es-MX")}
                    </span>
                    {vencido && <div className="text-red-500">¡Vencido!</div>}
                  </td>

                  <td className="py-2 pr-3">
                    {p.estado === "Pendiente" ? (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${ESTADO_BADGE.Pendiente}`}>
                        {esRenov ? "Pend. Renovación" : "Pend. Solicitud"}
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${ESTADO_BADGE[p.estado] ?? "bg-stone/20 text-navy"}`}>
                        {ESTADO_LABEL[p.estado]}
                      </span>
                    )}
                  </td>

                  <td className="py-2">
                    <div className="flex gap-1 flex-wrap">
                      {/* Pendiente → Aprobar / Rechazar */}
                      {isAdmin && p.estado === "Pendiente" && (
                        <>
                          <button onClick={() => setModal({ prestamo: p, accion: "aprobar" })}
                            className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 hover:bg-green-200 transition font-medium">
                            Aprobar
                          </button>
                          <button onClick={() => setModal({ prestamo: p, accion: "rechazar" })}
                            className="px-2 py-1 rounded text-xs bg-red-100 text-red-600 hover:bg-red-200 transition font-medium">
                            Rechazar
                          </button>
                        </>
                      )}

                      {/* Activo / Renovado → Devolver / Perdido */}
                      {isAdmin && activo && (
                        <>
                          <button onClick={() => setModal({ prestamo: p, accion: "devolver" })}
                            className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 hover:bg-green-200 transition">
                            Devolver
                          </button>
                          <button onClick={() => setModal({ prestamo: p, accion: "perdido" })}
                            className="px-2 py-1 rounded text-xs bg-red-100 text-red-600 hover:bg-red-200 transition">
                            Perdido
                          </button>
                        </>
                      )}

                      {(p.estado === "Devuelto" || p.estado === "Perdido") && (
                        <span className="text-stone">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-stone">
                  No hay préstamos para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <ModalAccion
          prestamo={modal.prestamo}
          accion={modal.accion}
          onClose={() => setModal(null)}
          onConfirm={ejecutarAccion}
          loading={loadingAction}
        />
      )}
    </div>
  )
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-stone/20">
      <p className="text-xs text-stone mb-1">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
