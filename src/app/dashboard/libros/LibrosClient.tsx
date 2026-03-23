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

function autoresString(libro: Libro) {
  return libro.autores.map((a) => a.autor.nombre).join("; ")
}

function estadoBadge(copias: Copia[]) {
  const disponibles = copias.filter((c) => c.estado === "Disponible").length
  if (disponibles > 0)
    return <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Disponible</span>
  return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">No disponible</span>
}

function Portada({ url, className }: { url: string | null; className: string }) {
  if (!url)
    return <div className={`${className} bg-navy/10 rounded flex items-center justify-center text-navy/30 text-xs border border-stone/20`}>Sin portada</div>
  return <img src={url} alt="portada" className={`${className} object-cover rounded border border-stone/20`} />
}

function IconVer() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function IconEditar() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function IconEliminar() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

// ─── Campo de autores dinámico ───────────────────────────────
function AutoresField({ initial }: { initial: string[] }) {
  const [autores, setAutores] = useState<string[]>(initial.length > 0 ? initial : [""])

  function update(i: number, val: string) {
    setAutores(prev => prev.map((a, idx) => idx === i ? val : a))
  }

  function add() {
    setAutores(prev => [...prev, ""])
  }

  function remove(i: number) {
    setAutores(prev => prev.length === 1 ? [""] : prev.filter((_, idx) => idx !== i))
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
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-red-400 hover:text-red-600 transition shrink-0"
            title="Quitar autor"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1 text-xs text-gold hover:text-gold/70 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        Agregar otro autor
      </button>

      {/* Hidden input que manda el string al submit */}
      <input type="hidden" name="autores" value={autores.filter(a => a.trim()).join("; ")} />
    </div>
  )
}

// ─── Formulario compartido ───────────────────────────────────
function LibroForm({ initial, onSubmit, onCancel, submitLabel }: {
  initial?: Partial<Libro>
  onSubmit: (data: Record<string, string>) => void
  onCancel: () => void
  submitLabel: string
}) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data: Record<string, string> = {}
    fd.forEach((v, k) => { data[k] = v as string })
    onSubmit(data)
  }

  const firstCopia = initial?.copias?.[0]
  const autoresIniciales = initial?.autores?.map(a => a.autor.nombre) ?? []

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">

        {/* Columna izquierda */}
        <div className="space-y-5">
          <Section title="Identificación">
            <Field label="ISBN*"     name="isbn"      defaultValue={initial?.isbn}      required />
            <Field label="Título*"   name="titulo"    defaultValue={initial?.titulo}    required />
            <Field label="Subtítulo" name="subtitulo" defaultValue={initial?.subtitulo ?? ""} />
          </Section>

          <Section title="Autoría y Edición">
            {/* Autores dinámicos */}
            <AutoresField initial={autoresIniciales} />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Editorial*" name="editorial" defaultValue={initial?.editorial ?? ""} required />
              <Field label="Edición"    name="edicion"   defaultValue={initial?.edicion   ?? ""} placeholder="1a Ed." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Año de Publicación" name="anioPub"    defaultValue={initial?.anioPub?.toString()    ?? ""} type="number" />
              <Field label="Núm. de Páginas"    name="numPaginas" defaultValue={initial?.numPaginas?.toString() ?? ""} type="number" />
            </div>
          </Section>

          <Section title="Descripción">
            <textarea
              name="descripcion"
              defaultValue={initial?.descripcion ?? ""}
              rows={4}
              className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold resize-none"
            />
          </Section>
        </div>

        {/* Columna derecha */}
        <div className="space-y-5">
          <Section title="Portada">
            <Field
              label="URL de imagen (imgbb u otro)" name="portadaUrl"
              defaultValue={initial?.portadaUrl ?? ""}
              placeholder="https://i.ibb.co/..."
            />
            {initial?.portadaUrl && (
              <img src={initial.portadaUrl} alt="portada" className="mt-2 w-24 h-32 object-cover rounded border border-stone/20" />
            )}
          </Section>

          <Section title="Clasificación">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gold font-medium block mb-1">Categoría*</label>
                <select name="categoria" defaultValue={initial?.categoria ?? ""}
                  className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold" required>
                  <option value="">Selecciona</option>
                  {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gold font-medium block mb-1">Idioma*</label>
                <select name="idioma" defaultValue={initial?.idioma ?? "Español"}
                  className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold" required>
                  {IDIOMAS.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
            </div>
          </Section>

          <Section title="Inventario y Ubicación">
            <div className="grid grid-cols-2 gap-3">
              {!initial?.id && (
                <Field label="Núm. de Ejemplares*" name="numEjemplares" defaultValue="1" type="number" required />
              )}
              <div>
                <label className="text-xs text-gold font-medium block mb-1">Estado*</label>
                <select name="estado" defaultValue={firstCopia?.estado ?? "Disponible"}
                  className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold">
                  {ESTADOS.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pasillo / Sección" name="pasillo" defaultValue={firstCopia?.pasillo ?? ""} placeholder="Ej: A3" />
              <Field label="Estante"           name="estante" defaultValue={firstCopia?.estante ?? ""} placeholder="Estante 5" />
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
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

// ─── Componente principal ────────────────────────────────────
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
  const disponibles = libros.reduce((s, l) => s + l.copias.filter(c => c.estado === "Disponible").length, 0)
  const prestadas   = libros.reduce((s, l) => s + l.copias.filter(c => c.estado === "Prestada").length, 0)

  async function handleCreate(data: Record<string, string>) {
    await fetch("/api/libros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    setAdding(false)
    router.refresh()
  }

  async function handleEdit(data: Record<string, string>) {
    if (!edit) return
    await fetch(`/api/libros/${edit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
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
        <LibroForm submitLabel="Agregar Libro" onSubmit={handleCreate} onCancel={() => setAdding(false)} />
      </div>
    )
  }

  if (edit) {
    return (
      <div className="bg-white rounded-xl p-8 border border-stone/20">
        <h2 className="text-2xl font-bold text-navy mb-6">Actualizar Libro</h2>
        <LibroForm initial={edit} submitLabel="Actualizar Libro" onSubmit={handleEdit} onCancel={() => setEdit(null)} />
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Libros"              value={libros.length} note="" />
        <StatCard title="Total Copias"              value={totalCopias}   note="" />
        <StatCard title="Disponibles para préstamo" value={disponibles}   note="" />
        <StatCard title="En préstamo"               value={prestadas}     note="" />
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
                <th className="pb-2 font-medium">Estatus</th>
                <th className="pb-2 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((libro) => (
                <tr key={libro.id} className="border-b border-stone/10 hover:bg-cream/30">
                  <td className="py-2 pr-2">
                    <Portada url={libro.portadaUrl} className="w-28 h-40" />
                  </td>
                  <td className="py-2 pr-2">
                    <div className="font-medium text-navy">{libro.titulo}</div>
                    <div className="text-stone">ISBN: {libro.isbn}</div>
                  </td>
                  <td className="py-2 pr-2 text-navy">{autoresString(libro)}</td>
                  <td className="py-2 pr-2 text-navy">{libro.anioPub ?? "—"}</td>
                  <td className="py-2 pr-2 text-navy">{libro.idioma ?? "—"}</td>
                  <td className="py-2 pr-2">{estadoBadge(libro.copias)}</td>
                  <td className="py-2">
                    <div className="flex gap-2 items-center">
                      <button onClick={() => setView(libro)} title="Ver" className="text-navy hover:text-gold transition"><IconVer /></button>
                      <button onClick={() => setEdit(libro)} title="Editar" className="text-navy hover:text-gold transition"><IconEditar /></button>
                      <button onClick={() => setDel(libro)}  title="Eliminar" className="text-red-400 hover:text-red-600 transition"><IconEliminar /></button>
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
                <Info label="Copias"      value={view.copias.length.toString()} />
                <Info label="Disponibles" value={view.copias.filter(c => c.estado === "Disponible").length.toString()} />
                {view.copias[0]?.pasillo && <Info label="Pasillo" value={view.copias[0].pasillo} />}
                {view.copias[0]?.estante && <Info label="Estante" value={view.copias[0].estante} />}
              </div>
              {view.descripcion && (
                <div className="mt-3">
                  <p className="text-xs text-gold font-medium mb-1">Descripción</p>
                  <p className="text-xs text-stone leading-relaxed">{view.descripcion}</p>
                </div>
              )}
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
          <table className="w-full text-xs border border-stone/20 rounded mb-6">
            <thead className="bg-cream">
              <tr className="text-left text-stone">
                <th className="px-3 py-2">Libro</th>
                <th className="px-3 py-2">Identificadores</th>
                <th className="px-3 py-2">Autor(es)</th>
                <th className="px-3 py-2">Año</th>
                <th className="px-3 py-2">Idioma</th>
                <th className="px-3 py-2">Estatus</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2"><Portada url={del.portadaUrl} className="w-16 h-20" /></td>
                <td className="px-3 py-2">
                  <div className="font-medium text-navy">{del.titulo}</div>
                  <div className="text-stone">ISBN: {del.isbn}</div>
                </td>
                <td className="px-3 py-2 text-navy">{autoresString(del)}</td>
                <td className="px-3 py-2 text-navy">{del.anioPub ?? "—"}</td>
                <td className="px-3 py-2 text-navy">{del.idioma ?? "—"}</td>
                <td className="px-3 py-2">{estadoBadge(del.copias)}</td>
              </tr>
            </tbody>
          </table>
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

function StatCard({ title, value, note }: { title: string; value: number; note: string }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-stone/20">
      <p className="text-xs text-stone mb-1">{title}</p>
      <p className="text-3xl font-bold text-navy">{value.toLocaleString()}</p>
      {note && <p className="text-xs text-stone mt-1">{note}</p>}
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
      <input
        name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} required={required}
        className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold"
      />
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