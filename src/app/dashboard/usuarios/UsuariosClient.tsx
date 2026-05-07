"use client"
// src/app/dashboard/usuarios/UsuariosClient.tsx
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Usuario = {
  id: number
  email: string
  nombre: string
  apellido: string
  genero: string | null
  edad: number | null
  matricula: string | null
  numEmpleado: string | null
  rol: string
  activo: boolean
  createdAt: Date
}

const ROL_COLORS: Record<string, string> = {
  Administrador: "bg-navy text-white",
  Bibliotecario: "bg-navy text-white",
  Estudiante:    "bg-gold/80 text-navy",
  Maestro:       "bg-gold/80 text-navy",
  Colaborador:   "bg-stone/40 text-navy",
}

export default function UsuariosClient({ usuarios }: { usuarios: Usuario[] }) {
  const [search,    setSearch]    = useState("")
  const [rolFilter, setRolFilter] = useState("Todas Las Roles")
  const [editUser,  setEditUser]  = useState<Usuario | null>(null)
  const [deleteUser,setDeleteUser]= useState<Usuario | null>(null)
  const [editRol,   setEditRol]   = useState("")
  const router = useRouter()

  const filtered = usuarios.filter((u) => {
    const matchSearch = `${u.nombre} ${u.apellido} ${u.email} ${u.matricula ?? ""} ${u.numEmpleado ?? ""}`
      .toLowerCase().includes(search.toLowerCase())
    const matchRol = rolFilter === "Todas Las Roles" || u.rol === rolFilter
    return matchSearch && matchRol
  })

  function openEdit(user: Usuario) {
    setEditUser(user)
    setEditRol(user.rol)
  }

  async function handleToggleActivo(user: Usuario) {
    await fetch(`/api/usuarios/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !user.activo }),
    })
    router.refresh()
  }

  async function handleDelete() {
    if (!deleteUser) return
    await fetch(`/api/usuarios/${deleteUser.id}`, { method: "DELETE" })
    setDeleteUser(null)
    router.refresh()
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editUser) return
    const form = new FormData(e.currentTarget)
    await fetch(`/api/usuarios/${editUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre:      form.get("nombre"),
        apellido:    form.get("apellido"),
        email:       form.get("email"),
        rol:         form.get("rol"),
        genero:      form.get("genero") || null,
        edad:        form.get("edad") ? Number(form.get("edad")) : null,
        matricula:   form.get("matricula")   || null,
        numEmpleado: form.get("numEmpleado") || null,
      }),
    })
    setEditUser(null)
    router.refresh()
  }

  const esEstudiante = editRol === "Estudiante"
  const esEmpleado   = ["Maestro", "Colaborador", "Bibliotecario", "Administrador"].includes(editRol)

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Usuarios"  value={usuarios.length} note="" />
        <StatCard title="Usuarios Activos" value={usuarios.filter(u => u.activo).length} note="" />
        <StatCard title="Accesos Hoy"     value={0} note="Disponible próximamente" />
        <StatCard title="Alertas Seguridad" value={0} note="" />
      </div>

      {/* Table + sidebar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg p-5 border border-stone/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy">Tus Usuarios</h3>
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar usuario..."
                className="text-xs px-3 py-1.5 rounded border border-stone/30 outline-none focus:ring-1 focus:ring-gold bg-cream/50"
              />
              <select
                value={rolFilter}
                onChange={(e) => setRolFilter(e.target.value)}
                className="text-xs px-3 py-1.5 rounded border border-stone/30 outline-none focus:ring-1 focus:ring-gold bg-cream/50"
              >
                {["Todas Las Roles", "Administrador", "Bibliotecario", "Estudiante", "Maestro", "Colaborador"].map(r => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-stone border-b border-stone/20">
                <th className="pb-2 font-medium">Usuario</th>
                <th className="pb-2 font-medium">ID Institucional</th>
                <th className="pb-2 font-medium">Rol</th>
                <th className="pb-2 font-medium">Estado</th>
                <th className="pb-2 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-stone/10 hover:bg-cream/30">
                  <td className="py-2">
                    <div className="font-medium text-navy">{user.nombre} {user.apellido}</div>
                    <div className="text-stone">{user.email}</div>
                    {user.edad && <div className="text-stone">{user.edad} años · {user.genero ?? "—"}</div>}
                  </td>
                  <td className="py-2 text-navy">
                    {user.matricula   && <div><span className="text-stone">Mat:</span> {user.matricula}</div>}
                    {user.numEmpleado && <div><span className="text-stone">Emp:</span> {user.numEmpleado}</div>}
                    {!user.matricula && !user.numEmpleado && <span className="text-stone">—</span>}
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${ROL_COLORS[user.rol] ?? "bg-stone/20"}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${user.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {user.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(user)}
                        className="text-navy hover:text-gold transition" title="Editar">✏️</button>
                      <button onClick={() => setDeleteUser(user)}
                        className="text-red-400 hover:text-red-600 transition" title="Eliminar">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-5 border border-stone/20">
            <h3 className="font-semibold text-navy mb-3">Actividad Reciente</h3>
            <p className="text-xs text-stone">No hay actividad reciente aún.</p>
          </div>
          <div className="bg-white rounded-lg p-5 border border-stone/20 space-y-2">
            <h3 className="font-semibold text-navy mb-3">Acciones Rápidas</h3>
            <Link href="/dashboard/usuarios/nuevo"
              className="flex justify-between items-center px-3 py-2 rounded border border-stone/20 text-xs text-navy hover:bg-cream transition">
              Crear Usuario <span>›</span>
            </Link>
            <button className="w-full flex justify-between items-center px-3 py-2 rounded border border-stone/20 text-xs text-navy hover:bg-cream transition">
              Exportar Lista de Usuarios <span>›</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Edit modal ── */}
      {editUser && (
        <Modal onClose={() => setEditUser(null)}>
          <h2 className="text-xl font-bold text-navy mb-6">Editar Usuario</h2>
          <form onSubmit={handleEdit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombre(s)*"           name="nombre"   defaultValue={editUser.nombre} />
              <Field label="Apellido(s)*"         name="apellido" defaultValue={editUser.apellido} />
              <Field label="Correo Electrónico*"  name="email"    defaultValue={editUser.email} type="email" />

              {/* Género + Edad */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-stone block mb-1">Género</label>
                  <select name="genero" defaultValue={editUser.genero ?? ""}
                    className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold">
                    <option value="">-</option>
                    <option value="M">M</option>
                    <option value="F">F</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <Field label="Edad" name="edad" type="number" defaultValue={editUser.edad?.toString() ?? ""} />
              </div>

              {/* Rol */}
              <div className="col-span-2">
                <label className="text-xs text-stone block mb-1">Rol</label>
                <select name="rol" value={editRol} onChange={(e) => setEditRol(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold">
                  {["Administrador", "Bibliotecario", "Estudiante", "Maestro", "Colaborador"].map(r => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Identificadores institucionales */}
              {esEstudiante && (
                <div className="col-span-2">
                  <Field label="Matrícula" name="matricula"
                    defaultValue={editUser.matricula ?? ""}
                    placeholder="Ej: MAT-2024-001" />
                </div>
              )}
              {esEmpleado && (
                <div className="col-span-2">
                  <Field label="Número de Empleado" name="numEmpleado"
                    defaultValue={editUser.numEmpleado ?? ""}
                    placeholder="Ej: EMP-001" />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setEditUser(null)}
                className="px-4 py-2 rounded border border-gold text-gold text-sm hover:bg-gold hover:text-navy transition">
                Regresar
              </button>
              <button type="submit"
                className="px-4 py-2 rounded bg-navy text-white text-sm hover:bg-navy/80 transition">
                Confirmar Cambios
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Delete modal ── */}
      {deleteUser && (
        <Modal onClose={() => setDeleteUser(null)}>
          <h2 className="text-xl font-bold text-navy mb-2">Eliminar Usuario</h2>
          <p className="text-sm text-stone mb-4">
            ¿Estás seguro que deseas eliminar al siguiente Usuario? El usuario será marcado como inactivo.
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-xs border border-stone/20 rounded">
              <thead className="bg-cream">
                <tr className="text-left text-stone">
                  <th className="px-3 py-2 whitespace-nowrap">Usuario</th>
                  <th className="px-3 py-2 whitespace-nowrap">Rol</th>
                  <th className="px-3 py-2 whitespace-nowrap">ID Institucional</th>
                  <th className="px-3 py-2 whitespace-nowrap">Creación de cuenta</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2">
                    <div className="font-medium text-navy whitespace-nowrap">
                      {deleteUser.nombre} {deleteUser.apellido}
                    </div>
                    <div className="text-stone truncate max-w-[140px]">{deleteUser.email}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${ROL_COLORS[deleteUser.rol]}`}>
                      {deleteUser.rol}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-navy">
                    {deleteUser.matricula   && <div>Mat: {deleteUser.matricula}</div>}
                    {deleteUser.numEmpleado && <div>Emp: {deleteUser.numEmpleado}</div>}
                    {!deleteUser.matricula && !deleteUser.numEmpleado && "—"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Date(deleteUser.createdAt).toLocaleDateString("es-MX")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeleteUser(null)}
              className="px-4 py-2 rounded border border-gold text-gold text-sm hover:bg-gold hover:text-navy transition">
              Regresar
            </button>
            <button onClick={handleDelete}
              className="px-4 py-2 rounded bg-navy text-white text-sm hover:bg-navy/80 transition">
              Eliminar Usuario
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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, name, defaultValue, type = "text", placeholder }: {
  label: string; name: string; defaultValue?: string; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="text-xs text-stone block mb-1">{label}</label>
      <input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder}
        className="w-full px-3 py-2 rounded border border-stone/30 text-sm text-navy bg-cream/50 outline-none focus:ring-1 focus:ring-gold" />
    </div>
  )
}
