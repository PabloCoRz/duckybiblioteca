"use client"
// src/app/dashboard/catalogo/CatalogoClient.tsx
import { useState } from "react"
import { useRouter } from "next/navigation"

type Copia = {
  id: number
  codigoInterno: string
  pasillo: string | null
  estante: string | null
  estado: string
  createdAt: string
}

type Libro = {
  id: number
  isbn: string
  titulo: string
  subtitulo: string | null
  editorial: string | null
  edicion: string | null
  anioPub: number | null
  numPaginas: number | null
  categoria: string | null
  idioma: string | null
  descripcion: string | null
  portadaUrl: string | null
  createdAt: string
  autores: { autor: { id: number; nombre: string } }[]
  copias: Copia[]
}

function autoresString(libro: Libro) {
  return libro.autores.map((a) => a.autor.nombre).join(", ")
}

function Portada({ url, className }: { url: string | null; className: string }) {
  if (!url)
    return (
      <div className={`${className} bg-navy/10 rounded flex items-center justify-center text-navy/20 text-xs border border-stone/20`}>
        Sin portada
      </div>
    )
  return <img src={url} alt="portada" className={`${className} object-cover rounded border border-stone/20`} />
}

// ─── Modal Solicitar Préstamo ─────────────────────────────────
function ModalPrestamo({
  libro,
  onClose,
  onConfirm,
  loading,
}: {
  libro: Libro
  onClose: () => void
  onConfirm: (diasPrestamo: number) => void
  loading: boolean
}) {
  const [dias, setDias] = useState(14)
  const disponibles = libro.copias.filter((c) => c.estado === "Disponible").length
  const primera = libro.copias.find((c) => c.estado === "Disponible")

  const devolucion = new Date()
  devolucion.setDate(devolucion.getDate() + dias)

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl p-8 w-full max-w-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-navy mb-1">Solicitar Préstamo</h2>
        <p className="text-sm text-stone mb-5">Confirma los detalles de tu solicitud</p>

        <div className="flex gap-4 mb-6">
          <Portada url={libro.portadaUrl} className="w-20 h-28 shrink-0" />
          <div className="flex-1 space-y-1 text-sm">
            <p className="font-bold text-navy text-base">{libro.titulo}</p>
            {libro.subtitulo && <p className="text-stone text-xs">{libro.subtitulo}</p>}
            <p className="text-stone">Autores: <span className="text-navy">{autoresString(libro) || "—"}</span></p>
            {libro.editorial && <p className="text-stone">Editorial: <span className="text-navy">{libro.editorial}</span></p>}
            {primera && (
              <p className="text-stone">
                Ubicación:{" "}
                <span className="text-navy">
                  {primera.pasillo ? `Pasillo ${primera.pasillo}` : ""}
                  {primera.estante ? `, ${primera.estante}` : ""}
                </span>
              </p>
            )}
            <p className="text-stone">
              Disponibles:{" "}
              <span className={disponibles > 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                {disponibles} de {libro.copias.length}
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-4 bg-cream/50 rounded-lg p-4 mb-6">
          <div>
            <label className="text-xs text-stone block mb-1">Duración del préstamo</label>
            <select
              value={dias}
              onChange={(e) => setDias(Number(e.target.value))}
              className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-white outline-none focus:ring-1 focus:ring-gold"
            >
              <option value={7}>7 días</option>
              <option value={14}>14 días (estándar)</option>
              <option value={21}>21 días</option>
            </select>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone">Fecha de préstamo:</span>
            <span className="text-navy font-medium">{new Date().toLocaleDateString("es-MX")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone">Fecha de devolución:</span>
            <span className="text-navy font-medium">{devolucion.toLocaleDateString("es-MX")}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gold text-gold text-sm hover:bg-gold hover:text-navy transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(dias)}
            disabled={loading || disponibles === 0}
            className="px-4 py-2 rounded bg-navy text-white text-sm hover:bg-navy/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Procesando..." : "Confirmar Préstamo"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Card de resultado ────────────────────────────────────────
function LibroCard({
  libro,
  onSolicitar,
}: {
  libro: Libro
  onSolicitar: (libro: Libro) => void
}) {
  const disponibles = libro.copias.filter((c) => c.estado === "Disponible").length
  const primera = libro.copias[0]

  return (
    <div className="bg-white rounded-xl border border-stone/20 overflow-hidden shadow-sm">
      <div className="flex gap-5 p-5">
        <Portada url={libro.portadaUrl} className="w-36 h-48 shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className="text-xl font-bold text-navy">{libro.titulo}</h3>
          {libro.subtitulo && <p className="text-sm text-stone">Subtítulo: {libro.subtitulo}</p>}
          <p className="text-sm text-stone">
            Autores: <span className="text-navy">{autoresString(libro) || "—"}</span>
          </p>
          {libro.editorial && (
            <p className="text-sm text-stone">
              Editorial: <span className="text-navy">{libro.editorial}</span>
            </p>
          )}
          {libro.edicion && (
            <p className="text-sm text-stone">
              Edición: <span className="text-navy">{libro.edicion}</span>
            </p>
          )}
          {primera && (
            <p className="text-sm text-stone">
              Ubicación Física:{" "}
              {primera.pasillo && <span className="text-navy">Pasillo {primera.pasillo}</span>}
              {primera.estante && <span className="text-navy">, Sección {primera.estante}</span>}{" "}
              (Estatus:{" "}
              <span className={disponibles > 0 ? "text-green-600 font-medium" : "font-medium text-navy"}>
                {disponibles > 0 ? "Disponible" : "No Disponible"}
              </span>
              )
            </p>
          )}
          <p className="text-sm text-stone">
            Número de Ejemplares:{" "}
            <span className="text-navy font-medium">{libro.copias.length}</span>
          </p>

          {disponibles > 0 && (
            <div className="pt-3">
              <button
                onClick={() => onSolicitar(libro)}
                className="px-5 py-2 rounded bg-gold text-white text-sm font-medium hover:bg-gold/80 transition shadow-sm"
              >
                Solicitar Préstamo
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-stone/10 px-5 py-2.5 flex justify-end">
        <span className="text-xs text-stone">
          {disponibles} de {libro.copias.length} copias disponibles
        </span>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────
export default function CatalogoClient({ libros }: { libros: Libro[]; userId: string }) {
  const [search, setSearch] = useState("")
  const [categoria, setCategoria] = useState("Todas")
  const [modalLibro, setModalLibro] = useState<Libro | null>(null)
  const [loadingPrestamo, setLoadingPrestamo] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null)
  const router = useRouter()

  const categorias = ["Todas", ...Array.from(new Set(libros.map((l) => l.categoria).filter(Boolean)))] as string[]

  const filtered = libros.filter((l) => {
    const matchSearch = `${l.titulo} ${l.isbn} ${autoresString(l)}`
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchCat = categoria === "Todas" || l.categoria === categoria
    return matchSearch && matchCat
  })

  async function handleSolicitar(dias: number) {
    if (!modalLibro) return
    setLoadingPrestamo(true)
    try {
      const res = await fetch("/api/prestamos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ libroId: modalLibro.id, diasPrestamo: dias }),
      })
      if (!res.ok) {
        const err = await res.json()
        setToast({ msg: err.error ?? "Error al solicitar préstamo", type: "err" })
      } else {
        setToast({ msg: "¡Préstamo registrado correctamente!", type: "ok" })
        router.refresh()
      }
    } catch {
      setToast({ msg: "Error de red", type: "err" })
    }
    setLoadingPrestamo(false)
    setModalLibro(null)
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition
            ${toast.type === "ok" ? "bg-green-600" : "bg-red-600"}`}
        >
          {toast.msg}
        </div>
      )}

      {/* Encabezado + filtros */}
      <div className="bg-white rounded-lg p-5 border border-stone/20">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-navy">Consultar Catálogo</h2>
            <p className="text-xs text-stone mt-0.5">{libros.length} libros disponibles en la biblioteca</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, ISBN, autor..."
              className="text-xs px-3 py-2 rounded border border-stone/30 outline-none focus:ring-1 focus:ring-gold bg-cream/50 w-56"
            />
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="text-xs px-3 py-2 rounded border border-stone/30 outline-none focus:ring-1 focus:ring-gold bg-cream/50"
            >
              {categorias.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {search || categoria !== "Todas" ? (
        <p className="text-sm text-navy font-medium">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}{" "}
          {search && <>para <span className="italic">"{search}"</span></>}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg p-10 text-center border border-stone/20">
          <p className="text-stone text-sm">No se encontraron libros.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((libro) => (
            <LibroCard key={libro.id} libro={libro} onSolicitar={setModalLibro} />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalLibro && (
        <ModalPrestamo
          libro={modalLibro}
          onClose={() => setModalLibro(null)}
          onConfirm={handleSolicitar}
          loading={loadingPrestamo}
        />
      )}
    </div>
  )
}
