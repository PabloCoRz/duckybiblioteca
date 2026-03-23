"use client"
// src/app/home/HomeClient.tsx
import { useState, useRef } from "react"
import Image from "next/image"

type Copia = {
  id: number
  codigoInterno: string
  pasillo: string | null
  estante: string | null
  estado: string
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
  return libro.autores.map(a => a.autor.nombre).join(", ")
}

function Portada({ url, className }: { url: string | null; className: string }) {
  if (!url) return <div className={`${className} bg-navy/10 rounded flex items-center justify-center text-navy/20 text-xs`}>Sin portada</div>
  return <img src={url} alt="portada" className={`${className} object-cover rounded`} />
}

// ─── Modal detalle ───────────────────────────────────────────
function LibroModal({ libro, onClose }: { libro: Libro; onClose: () => void }) {
  const disponibles = libro.copias.filter(c => c.estado === "Disponible").length

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex gap-6">
          <Portada url={libro.portadaUrl} className="w-32 h-44 shrink-0" />
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-bold text-navy">{libro.titulo}</h2>
            {libro.subtitulo && <p className="text-stone text-sm">{libro.subtitulo}</p>}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-3 text-sm">
              <Info label="ISBN"       value={libro.isbn} />
              <Info label="Autores"    value={autoresString(libro)} />
              <Info label="Editorial"  value={libro.editorial} />
              <Info label="Edición"    value={libro.edicion} />
              <Info label="Año"        value={libro.anioPub?.toString()} />
              <Info label="Páginas"    value={libro.numPaginas?.toString()} />
              <Info label="Categoría"  value={libro.categoria} />
              <Info label="Idioma"     value={libro.idioma} />
              <Info label="Ejemplares" value={`${disponibles} de ${libro.copias.length} disponibles`} />
            </div>

            {libro.copias.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gold mb-2">Copias físicas</p>
                <div className="space-y-1">
                  {libro.copias.map(c => (
                    <div key={c.id} className="flex items-center justify-between text-xs bg-cream/50 rounded px-3 py-1.5">
                      <span className="text-stone">{c.codigoInterno}</span>
                      {c.pasillo && <span className="text-navy">Pasillo {c.pasillo}{c.estante ? `, ${c.estante}` : ""}</span>}
                      <span className={`font-medium ${c.estado === "Disponible" ? "text-green-600" : "text-red-500"}`}>{c.estado}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {libro.descripcion && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gold mb-1">Descripción</p>
                <p className="text-xs text-stone leading-relaxed">{libro.descripcion}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-5 py-2 rounded border border-gold text-gold text-sm hover:bg-gold hover:text-navy transition">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Card de resultado (vista búsqueda) ──────────────────────
function ResultadoCard({ libro, onVerTodo }: { libro: Libro; onVerTodo: () => void }) {
  const disponibles = libro.copias.filter(c => c.estado === "Disponible").length
  const primera = libro.copias[0]

  return (
    <div className="bg-white rounded-xl border border-stone/20 overflow-hidden">
      <div className="flex gap-5 p-5">
        <Portada url={libro.portadaUrl} className="w-36 h-48 shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className="text-xl font-bold text-navy">{libro.titulo}</h3>
          {libro.subtitulo && <p className="text-sm text-stone">Subtitulo: {libro.subtitulo}</p>}
          <p className="text-sm text-stone">Autores: <span className="text-navy">{autoresString(libro) || "—"}</span></p>
          {libro.editorial && <p className="text-sm text-stone">Editorial: <span className="text-navy">{libro.editorial}</span></p>}
          {libro.edicion   && <p className="text-sm text-stone">Edición: <span className="text-navy">{libro.edicion}</span></p>}
          {primera && (
            <p className="text-sm text-stone">
              Ubicación Física:{" "}
              {primera.pasillo && <span className="text-navy">Pasillo {primera.pasillo}</span>}
              {primera.estante && <span className="text-navy">, Sección {primera.estante}</span>}
              {" "}(Estatus:{" "}
              <span className={disponibles > 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                {disponibles > 0 ? "Disponible" : "No Disponible"}
              </span>)
            </p>
          )}
          <p className="text-sm text-stone">Numero de Ejemplares: <span className="text-navy">{disponibles} de {libro.copias.length} disponibles</span></p>
        </div>
      </div>
      <div className="border-t border-stone/10 px-5 py-3 flex justify-end">
        <button onClick={onVerTodo} className="flex items-center gap-1 text-gold text-sm font-medium hover:text-gold/70 transition">
          Ver todo
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────
export default function HomeClient({ destacados }: { destacados: Libro[] }) {
  const [query,      setQuery]      = useState("")
  const [resultados, setResultados] = useState<Libro[] | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [modal,      setModal]      = useState<Libro | null>(null)
  const [buscado,    setBuscado]    = useState("")

  async function buscar() {
    if (!query.trim()) return
    setLoading(true)
    setBuscado(query.trim())
    const res  = await fetch(`/api/libros/buscar?q=${encodeURIComponent(query.trim())}`)
    const data = await res.json()
    setResultados(data)
    setLoading(false)
  }

  function limpiar() {
    setQuery("")
    setResultados(null)
    setBuscado("")
  }

  // ── VISTA A: Landing con hero + grid de portadas ──
  if (resultados === null) {
    return (
      <>
        {/* Hero */}
        <section className="relative flex flex-col items-center justify-center text-center text-white px-4 overflow-hidden" style={{ minHeight: 500 }}>
          <Image src="/background2.jpg" alt="Biblioteca" fill className="object-cover object-center" priority />
          <div className="absolute inset-0 bg-navy/65" />
          <div className="relative z-10 flex flex-col items-center gap-4 w-full max-w-xl py-12">
            <p className="text-gold text-sm">Busca de nuestra selección de libros físicos en nuestra Biblioteca</p>
            <h1 className="text-4xl font-bold">Busca un Libro en Nuestra Biblioteca</h1>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && buscar()}
              placeholder="Ingrese Libro para Buscar"
              className="w-full rounded-full px-6 py-3 text-navy placeholder-stone/70 bg-white/80 outline-none text-base"
            />
            <button onClick={buscar} className="bg-navy my-2 text-white px-10 py-2.5 rounded font-medium hover:bg-navy/80 transition">
              Buscar
            </button>
          </div>
          <div className="absolute bottom-4 right-6 z-10 opacity-80">
            <span className="font-black text-2xl tracking-widest text-white drop-shadow">DUCKY</span>
          </div>
        </section>

        {/* Grid de portadas */}
        <section className="px-8 mr-14 ml-14 py-10">
          <h2 className="text-2xl font-bold text-navy mb-6">Libros Destacados</h2>
          {destacados.length === 0 ? (
            <p className="text-stone text-sm">No hay libros en el catálogo aún.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {destacados.map(libro => (
                <button key={libro.id} onClick={() => setModal(libro)} className="text-left group">
                  <Portada url={libro.portadaUrl} className="w-full aspect-[2/3] group-hover:opacity-80 transition" />
                  <p className="text-sm font-semibold text-navy mt-2 leading-tight">{libro.titulo}</p>
                  <p className="text-xs text-stone mt-0.5">{autoresString(libro)}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        {modal && <LibroModal libro={modal} onClose={() => setModal(null)} />}
      </>
    )
  }

  // ── VISTA B: Resultados de búsqueda ──
  return (
    <>
      {/* Barra de búsqueda compacta */}
      <section className="px-8 py-6 border-b border-stone/20 bg-cream">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white rounded-full px-5 py-2.5 border border-stone/20 flex-1 max-w-sm">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && buscar()}
              className="flex-1 outline-none text-sm text-navy bg-transparent"
            />
            <button onClick={buscar} className="text-navy hover:text-gold transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>

          <button onClick={limpiar} className="text-sm text-stone hover:text-navy transition">
            ← Regresar
          </button>
        </div>
      </section>

      {/* Resultados */}
      <section className="px-8 py-6 flex-1">
        {loading ? (
          <p className="text-stone text-sm">Buscando...</p>
        ) : (
          <>
            <p className="text-lg font-bold text-navy mb-1">
              Mostrando 1-{resultados.length} de {resultados.length} Resultados Encontrados que coinciden con{" "}
              <span className="italic">"{buscado}"</span>
            </p>
            <hr className="border-stone/20 mb-6" />

            {resultados.length === 0 ? (
              <p className="text-stone text-sm">No se encontraron libros para "{buscado}".</p>
            ) : (
              <div className="space-y-4">
                {resultados.map(libro => (
                  <ResultadoCard key={libro.id} libro={libro} onVerTodo={() => setModal(libro)} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {modal && <LibroModal libro={modal} onClose={() => setModal(null)} />}
    </>
  )
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <span className="text-gold font-medium">{label}: </span>
      <span className="text-navy">{value || "—"}</span>
    </div>
  )
}