"use client"
// src/app/dashboard/libros/LibrosClient.tsx
import { useState } from "react"
import { useRouter } from "next/navigation"

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

const CATEGORIAS = ["Ciencias", "Matemáticas", "Ingeniería", "Derecho", "Medicina", "Historia", "Literatura", "Economía", "Filosofía", "Arte", "Tecnología", "Otro"]
const IDIOMAS    = ["Español", "Inglés", "Francés", "Alemán", "Portugués", "Otro"]
const ESTADOS    = ["Disponible", "Prestada", "Perdida", "Dañada"]

const ESTADO_BADGE_COLOR: Record<string, string> = {
  Disponible: "bg-green-100 text-green-700",
  Prestada:   "bg-blue-100 text-blue-700",
  Perdida:    "bg-red-100 text-red-600",
  Dañada:     "bg-orange-100 text-orange-700",
}

function autoresString(libro: Libro) {
  return libro.autores.map((a) => a.autor.nombre).join("; ")
}

function estadoBadge(copias: Copia[]) {
  const disponibles = copias.filter((c) => c.estado === "Disponible").length
  if (disponibles > 0)
    return <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">{disponibles} disp.</span>
  return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">No disponible</span>
}

function Portada({ url, className }: { url: string | null; className: string }) {
  if (!url)
    return <div className={`${className} bg-navy/10 rounded flex items-center justify-center text-navy/30 text-xs border border-stone/20`}>Sin portada</div>
  return <img src={url} alt="portada" className={`${className} object-cover rounded border border-stone/20`} />
}

// ─── Copias editor (en formulario de edición) ─────────────────
function CopiasEditor({
  copias,
  onChange,
}: {
  copias: Copia[]
  onChange: (copias: Copia[]) => void
}) {
  function updateCopia(id: number, field: keyof Copia, value: string) {
    onChange(copias.map((c) => c.id === id ? { ...c, [field]: value } : c))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-gold font-semibold text-sm">Copias Físicas ({copias.length})</h3>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {copias.map((copia) => (
          <div key={copia.id} className="bg-cream/50 rounded-lg p-3 border border-stone/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-navy font-medium">{copia.codigoInterno}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${ESTADO_BADGE_COLOR[copia.estado] ?? "bg-stone/20 text-navy"}`}>
                {copia.estado}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-stone block mb-1">Estado</label>
                <select
                  value={copia.estado}
                  onChange={(e) => updateCopia(copia.id, "estado", e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-stone/30 text-xs text-navy bg-white outline-none focus:ring-1 focus:ring-gold"
                >
                  {ESTADOS.map((e) => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-stone block mb-1">Pasillo</label>
                <input
                  value={copia.pasillo ?? ""}
                  onChange={(e) => updateCopia(copia.id, "pasillo", e.target.value)}
                  placeholder="Ej: A3"
                  className="w-full px-2 py-1.5 rounded border border-stone/30 text-xs text-navy bg-white outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
              <div>
                <label className="text-xs text-stone block mb-1">Estante</label>
                <input
                  value={copia.estante ?? ""}
                  onChange={(e) => updateCopia(copia.id, "estante", e.target.value)}
                  placeholder="Ej: 5"
                  className="w-full px-2 py-1.5 rounded border border-stone/30 text-xs text-navy bg-white outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Campo de autores dinámico ───────────────────────────────
function AutoresField({ initial }: { initial: string[] }) {
  const [autores, setAutores] = useState<string[]>(initial.length > 0 ? initial : [""])

  function update(i: number, val: string) {
    setAutores((prev) => prev.map((a, idx) => (idx === i ? val : a)))
  }
  function add() { setAutores((prev) => [...prev, ""]) }
  function remove(i: number) {
    setAutores((prev) => (prev.length === 1 ? [""] : prev.filter((_, idx) => idx !== i)))
  }

  return (
    <div className="space-y-2">
      <label className="text-xs text-stone block mb-1">Autor(es)*</label>
      {autores.map((autor, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            value={autor}
            onChange={(e) => update(i, e.target.value)}
            placeholder="Apellido, Nombre"
            required={i === 0}
            className="flex-1 px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold"
          />
          <button type="button" onClick={() => remove(i)}
            className="text-red-400 hover:text-red-600 transition shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </button>
        </div>
      ))}
      <button type="button" onClick={add}
        className="flex items-center gap-1 text-xs text-gold hover:text-gold/70 transition">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        Agregar otro autor
      </button>
      <input type="hidden" name="autores" value={autores.filter((a) => a.trim()).join("; ")} />
    </div>
  )
}

// ─── Formulario crear libro ───────────────────────────────────
function LibroFormCrear({
  onSubmit, onCancel,
}: {
  onSubmit: (data: Record<string, string>) => void
  onCancel: () => void
}) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data: Record<string, string> = {}
    fd.forEach((v, k) => { data[k] = v as string })
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-5">
          <Section title="Identificación">
            <Field label="ISBN*"     name="isbn"      required />
            <Field label="Título*"   name="titulo"    required />
            <Field label="Subtítulo" name="subtitulo" />
          </Section>
          <Section title="Autoría y Edición">
            <AutoresField initial={[]} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Editorial*" name="editorial" required />
              <Field label="Edición"    name="edicion"   placeholder="1a Ed." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Año de Publicación" name="anioPub"    type="number" />
              <Field label="Núm. de Páginas"    name="numPaginas" type="number" />
            </div>
          </Section>
          <Section title="Descripción">
            <textarea name="descripcion" rows={4}
              className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold resize-none" />
          </Section>
        </div>
        <div className="space-y-5">
          <Section title="Portada">
            <Field label="URL de imagen" name="portadaUrl" placeholder="https://i.ibb.co/..." />
          </Section>
          <Section title="Clasificación">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gold font-medium block mb-1">Categoría*</label>
                <select name="categoria" required
                  className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold">
                  <option value="">Selecciona</option>
                  {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gold font-medium block mb-1">Idioma*</label>
                <select name="idioma" defaultValue="Español" required
                  className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold">
                  {IDIOMAS.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
            </div>
          </Section>
          <Section title="Inventario y Ubicación">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Núm. de Ejemplares*" name="numEjemplares" defaultValue="1" type="number" required />
              <div>
                <label className="text-xs text-gold font-medium block mb-1">Estado inicial</label>
                <select name="estado" defaultValue="Disponible"
                  className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold">
                  {ESTADOS.map((e) => <option key={e}>{e}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pasillo / Sección" name="pasillo" placeholder="Ej: A3" />
              <Field label="Estante"           name="estante" placeholder="Estante 5" />
            </div>
          </Section>
        </div>
      </div>
      <div className="flex justify-center gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-6 py-2 rounded border border-gold text-gold text-sm hover:bg-gold hover:text-navy transition">
          Cancelar
        </button>
        <button type="submit"
          className="px-6 py-2 rounded bg-navy text-white text-sm hover:bg-navy/80 transition">
          Agregar Libro
        </button>
      </div>
    </form>
  )
}

// ─── Formulario editar libro ──────────────────────────────────
function LibroFormEditar({
  initial, onSubmit, onCancel,
}: {
  initial: Libro
  onSubmit: (data: Record<string, string>, copias: Copia[]) => void
  onCancel: () => void
}) {
  const [copias, setCopias] = useState<Copia[]>(initial.copias)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data: Record<string, string> = {}
    fd.forEach((v, k) => { data[k] = v as string })
    onSubmit(data, copias)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-5">
          <Section title="Identificación">
            <Field label="ISBN*"     name="isbn"      defaultValue={initial.isbn}      required />
            <Field label="Título*"   name="titulo"    defaultValue={initial.titulo}    required />
            <Field label="Subtítulo" name="subtitulo" defaultValue={initial.subtitulo ?? ""} />
          </Section>
          <Section title="Autoría y Edición">
            <AutoresField initial={initial.autores.map((a) => a.autor.nombre)} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Editorial*" name="editorial" defaultValue={initial.editorial ?? ""} required />
              <Field label="Edición"    name="edicion"   defaultValue={initial.edicion   ?? ""} placeholder="1a Ed." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Año de Publicación" name="anioPub"    defaultValue={initial.anioPub?.toString()    ?? ""} type="number" />
              <Field label="Núm. de Páginas"    name="numPaginas" defaultValue={initial.numPaginas?.toString() ?? ""} type="number" />
            </div>
          </Section>
          <Section title="Descripción">
            <textarea name="descripcion" defaultValue={initial.descripcion ?? ""} rows={4}
              className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold resize-none" />
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Portada">
            <Field label="URL de imagen" name="portadaUrl" defaultValue={initial.portadaUrl ?? ""} placeholder="https://i.ibb.co/..." />
            {initial.portadaUrl && (
              <img src={initial.portadaUrl} alt="portada" className="mt-2 w-24 h-32 object-cover rounded border border-stone/20" />
            )}
          </Section>
          <Section title="Clasificación">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gold font-medium block mb-1">Categoría*</label>
                <select name="categoria" defaultValue={initial.categoria ?? ""} required
                  className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold">
                  <option value="">Selecciona</option>
                  {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gold font-medium block mb-1">Idioma*</label>
                <select name="idioma" defaultValue={initial.idioma ?? "Español"} required
                  className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold">
                  {IDIOMAS.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
            </div>
          </Section>

          {/* Copias individuales con estado propio */}
          <CopiasEditor copias={copias} onChange={setCopias} />
        </div>
      </div>

      <div className="flex justify-center gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-6 py-2 rounded border border-gold text-gold text-sm hover:bg-gold hover:text-navy transition">
          Cancelar
        </button>
        <button type="submit"
          className="px-6 py-2 rounded bg-navy text-white text-sm hover:bg-navy/80 transition">
          Actualizar Libro
        </button>
      </div>
    </form>
  )
}

// ─── Componente principal ─────────────────────────────────────
export default function LibrosClient({ libros }: { libros: Libro[] }) {
  const [search, setSearch] = useState("")
  const [view,   setView]   = useState<Libro | null>(null)
  const [edit,   setEdit]   = useState<Libro | null>(null)
  const [del,    setDel]    = useState<Libro | null>(null)
  const [adding, setAdding] = useState(false)
  const router = useRouter()

  const filtered    = libros.filter((l) =>
    `${l.titulo} ${l.isbn} ${autoresString(l)}`.toLowerCase().includes(search.toLowerCase())
  )
  const totalCopias = libros.reduce((s, l) => s + l.copias.length, 0)
  const disponibles = libros.reduce((s, l) => s + l.copias.filter((c) => c.estado === "Disponible").length, 0)
  const prestadas   = libros.reduce((s, l) => s + l.copias.filter((c) => c.estado === "Prestada").length, 0)

  async function handleCreate(data: Record<string, string>) {
    await fetch("/api/libros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    setAdding(false)
    router.refresh()
  }

  async function handleEdit(data: Record<string, string>, copias: Copia[]) {
    if (!edit) return
    await fetch(`/api/libros/${edit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, copias }),
    })
    setEdit(null)
    router.refresh()
  }

  async function handleDelete() {
    if (!del) return
    await fetch(`/api/libros/${del.id}`, { method: "DELETE" })
    setDel(null)
    router.refresh()
  }

  if (adding) {
    return (
      <div className="bg-white rounded-xl p-8 border border-stone/20">
        <h2 className="text-2xl font-bold text-navy mb-6">Agregar Libro</h2>
        <LibroFormCrear onSubmit={handleCreate} onCancel={() => setAdding(false)} />
      </div>
    )
  }

  if (edit) {
    return (
      <div className="bg-white rounded-xl p-8 border border-stone/20">
        <h2 className="text-2xl font-bold text-navy mb-6">Actualizar Libro</h2>
        <LibroFormEditar initial={edit} onSubmit={handleEdit} onCancel={() => setEdit(null)} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Libros"              value={libros.length} />
        <StatCard title="Total Copias"              value={totalCopias} />
        <StatCard title="Disponibles para préstamo" value={disponibles} />
        <StatCard title="En préstamo"               value={prestadas} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg p-5 border border-stone/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy">Libros</h3>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar Libro..."
              className="text-xs px-3 py-1.5 rounded border border-stone/30 outline-none focus:ring-1 focus:ring-gold bg-cream/50"
            />
          </div>

          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-stone border-b border-stone/20">
                <th className="pb-2 font-medium">Libro</th>
                <th className="pb-2 font-medium">Identificadores</th>
                <th className="pb-2 font-medium">Autor(es)</th>
                <th className="pb-2 font-medium">Año</th>
                <th className="pb-2 font-medium">Idioma</th>
                <th className="pb-2 font-medium">Copias</th>
                <th className="pb-2 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((libro) => (
                <tr key={libro.id} className="border-b border-stone/10 hover:bg-cream/30">
                  <td className="py-2 pr-2">
                    <Portada url={libro.portadaUrl} className="w-20 h-28" />
                  </td>
                  <td className="py-2 pr-2">
                    <div className="font-medium text-navy">{libro.titulo}</div>
                    <div className="text-stone">ISBN: {libro.isbn}</div>
                  </td>
                  <td className="py-2 pr-2 text-navy">{autoresString(libro)}</td>
                  <td className="py-2 pr-2 text-navy">{libro.anioPub ?? "—"}</td>
                  <td className="py-2 pr-2 text-navy">{libro.idioma ?? "—"}</td>
                  <td className="py-2 pr-2">
                    {estadoBadge(libro.copias)}
                    <div className="text-stone mt-0.5">{libro.copias.length} total</div>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2 items-center">
                      <button onClick={() => setView(libro)} title="Ver"
                        className="text-navy hover:text-gold transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button onClick={() => setEdit(libro)} title="Editar"
                        className="text-navy hover:text-gold transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button onClick={() => setDel(libro)} title="Eliminar"
                        className="text-red-400 hover:text-red-600 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-stone">No se encontraron libros</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg p-5 border border-stone/20 space-y-2">
            <h3 className="font-semibold text-navy mb-3">Acciones Rápidas</h3>
            <button onClick={() => setAdding(true)}
              className="w-full flex justify-between items-center px-3 py-2 rounded border border-stone/20 text-xs text-navy hover:bg-cream transition">
              Añadir Libro <span>›</span>
            </button>
            <button className="w-full flex justify-between items-center px-3 py-2 rounded border border-stone/20 text-xs text-navy hover:bg-cream transition">
              Exportar Catálogo <span>›</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Ver */}
      {view && (
        <Modal onClose={() => setView(null)}>
          <h2 className="text-xl font-bold text-navy mb-4">Detalle del Libro</h2>
          <div className="flex gap-5">
            <Portada url={view.portadaUrl} className="w-24 h-36 shrink-0" />
            <div className="space-y-1 text-sm flex-1 min-w-0">
              <p className="text-xl font-bold text-navy leading-tight">{view.titulo}</p>
              {view.subtitulo && <p className="text-stone text-xs">{view.subtitulo}</p>}
              <p className="text-xs text-stone mt-1">ISBN: {view.isbn}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs">
                <Info label="Autor(es)"   value={autoresString(view)} />
                <Info label="Editorial"   value={view.editorial} />
                <Info label="Edición"     value={view.edicion} />
                <Info label="Año"         value={view.anioPub?.toString()} />
                <Info label="Páginas"     value={view.numPaginas?.toString()} />
                <Info label="Categoría"   value={view.categoria} />
                <Info label="Idioma"      value={view.idioma} />
              </div>
              {view.descripcion && (
                <div className="mt-3">
                  <p className="text-xs text-gold font-medium mb-1">Descripción</p>
                  <p className="text-xs text-stone leading-relaxed">{view.descripcion}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabla de copias */}
          <div className="mt-5">
            <p className="text-xs font-semibold text-gold mb-2">Copias físicas ({view.copias.length})</p>
            <div className="space-y-1">
              {view.copias.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-xs bg-cream/50 rounded px-3 py-2">
                  <span className="font-mono text-navy">{c.codigoInterno}</span>
                  <span className="text-stone">{c.pasillo ? `Pasillo ${c.pasillo}` : ""}{c.estante ? `, ${c.estante}` : ""}</span>
                  <span className={`px-2 py-0.5 rounded font-medium ${ESTADO_BADGE_COLOR[c.estado] ?? "bg-stone/20 text-navy"}`}>
                    {c.estado}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={() => setView(null)}
              className="px-4 py-2 rounded border border-gold text-gold text-sm hover:bg-gold hover:text-navy transition">
              Cerrar
            </button>
          </div>
        </Modal>
      )}

      {/* Modal: Eliminar */}
      {del && (
        <Modal onClose={() => setDel(null)}>
          <h2 className="text-xl font-bold text-navy mb-2">Eliminar Libro</h2>
          <p className="text-sm text-stone mb-4">¿Estás seguro que deseas eliminar el siguiente Libro?</p>
          <div className="flex gap-4 bg-cream/50 rounded-lg p-4 mb-6">
            <Portada url={del.portadaUrl} className="w-16 h-20 shrink-0" />
            <div className="text-sm space-y-0.5">
              <p className="font-bold text-navy">{del.titulo}</p>
              <p className="text-stone">ISBN: {del.isbn}</p>
              <p className="text-stone">{autoresString(del)}</p>
              <p className="text-stone">{del.copias.length} cop{del.copias.length !== 1 ? "ias" : "ia"}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDel(null)}
              className="px-4 py-2 rounded border border-gold text-gold text-sm hover:bg-gold hover:text-navy transition">
              Regresar
            </button>
            <button onClick={handleDelete}
              className="px-4 py-2 rounded bg-navy text-white text-sm hover:bg-navy/80 transition">
              Eliminar Libro
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-stone/20">
      <p className="text-xs text-stone mb-1">{title}</p>
      <p className="text-3xl font-bold text-navy">{value.toLocaleString()}</p>
    </div>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-gold font-semibold text-sm">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, name, defaultValue, type = "text", placeholder, required }: {
  label: string; name: string; defaultValue?: string; type?: string; placeholder?: string; required?: boolean
}) {
  return (
    <div>
      <label className="text-xs text-stone block mb-1">{label}</label>
      <input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} required={required}
        className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold" />
    </div>
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
