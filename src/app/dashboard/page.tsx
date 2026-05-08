// src/app/dashboard/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()

  // ── Stats reales ──────────────────────────────────────────
  const [
    totalUsuarios,
    usuariosActivos,
    totalLibros,
    totalCopias,
    copiasDisponibles,
    prestamosActivos,
    prestamosPendientes,
    multasPendientes,
    multasPagadas,
    montoMultasPendientes,
    prestamosRecientes,
  ] = await Promise.all([
    prisma.usuario.count(),
    prisma.usuario.count({ where: { activo: true } }),
    prisma.libro.count(),
    prisma.copia.count(),
    prisma.copia.count({ where: { estado: "Disponible" } }),
    prisma.prestamo.count({ where: { estado: { in: ["Activo", "Renovado"] } } }),
    prisma.prestamo.count({ where: { estado: "Pendiente" } }),
    prisma.multa.count({ where: { estado: "Pendiente" } }),
    prisma.multa.count({ where: { estado: "Pagada" } }),
    prisma.multa.aggregate({ where: { estado: "Pendiente" }, _sum: { monto: true } }),
    prisma.prestamo.findMany({
      where: { estado: { in: ["Activo", "Renovado", "Pendiente"] } },
      include: {
        usuario: { select: { nombre: true, apellido: true } },
        copia:   { include: { libro: { select: { titulo: true } } } },
      },
      orderBy: { fechaPrestamo: "desc" },
      take: 6,
    }),
  ])

  const montoPendiente = montoMultasPendientes._sum.monto ?? 0

  return (
    <div className="space-y-5">

      {/* Fila 1 — stats principales */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Usuarios Activos"     value={usuariosActivos}   sub={`${totalUsuarios} registrados`} />
        <StatCard title="Libros en Catálogo"   value={totalLibros}       sub={`${totalCopias} copias totales`} />
        <StatCard title="Copias Disponibles"   value={copiasDisponibles} sub={`${totalCopias - copiasDisponibles} en préstamo / perdidas`} />
        <StatCard title="Préstamos Activos"    value={prestamosActivos}  sub={prestamosPendientes > 0 ? `${prestamosPendientes} pendientes de aprobación` : "Al día"} highlight={prestamosPendientes > 0} />
      </div>

      {/* Fila 2 */}
      <div className="grid grid-cols-3 gap-4">

        {/* Préstamos recientes */}
        <div className="col-span-2 bg-white rounded-lg p-5 border border-stone/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy">Préstamos Recientes</h3>
            <Link href="/dashboard/prestamos" className="text-xs text-gold hover:underline">Ver todos ›</Link>
          </div>
          {prestamosRecientes.length === 0 ? (
            <p className="text-xs text-stone py-6 text-center">No hay préstamos activos.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-stone border-b border-stone/20">
                  <th className="pb-2 font-medium">Usuario</th>
                  <th className="pb-2 font-medium">Libro</th>
                  <th className="pb-2 font-medium">Devolución</th>
                  <th className="pb-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {prestamosRecientes.map((p) => {
                  const vencido = p.estado !== "Pendiente" && new Date(p.fechaDevolucion) < new Date()
                  return (
                    <tr key={p.id} className="border-b border-stone/10">
                      <td className="py-1.5 pr-2 text-navy">{p.usuario.nombre} {p.usuario.apellido}</td>
                      <td className="py-1.5 pr-2 text-navy max-w-[140px] truncate">{p.copia.libro.titulo}</td>
                      <td className={`py-1.5 pr-2 ${vencido ? "text-red-500 font-medium" : "text-navy"}`}>
                        {new Date(p.fechaDevolucion).toLocaleDateString("es-MX")}
                        {vencido && " ⚠"}
                      </td>
                      <td className="py-1.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          p.estado === "Pendiente" ? "bg-amber-100 text-amber-700" :
                          p.estado === "Renovado"  ? "bg-purple-100 text-purple-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {p.estado}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Multas */}
        <div className="bg-white rounded-lg p-5 border border-stone/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-navy">Multas</h3>
            <Link href="/dashboard/multas" className="text-xs text-gold hover:underline">Ver todas ›</Link>
          </div>
          <div>
            <p className="text-xs text-stone">Multas Pendientes</p>
            <p className="text-3xl font-bold text-red-500">{multasPendientes}</p>
          </div>
          <div>
            <p className="text-xs text-stone">Monto Total Pendiente</p>
            <p className="text-2xl font-bold text-navy">
              ${montoPendiente.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-stone">Multas Pagadas</p>
            <p className="text-3xl font-bold text-green-600">{multasPagadas}</p>
          </div>
        </div>
      </div>

      {/* Fila 3 — acciones rápidas */}
      <div className="bg-white rounded-lg p-5 border border-stone/20">
        <h3 className="font-semibold text-navy mb-3">Acciones Rápidas</h3>
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: "Crear Usuario",             href: "/dashboard/usuarios/nuevo" },
            { label: "Gestión de Préstamos",      href: "/dashboard/prestamos" },
            { label: "Gestión de Multas",         href: "/dashboard/multas" },
            { label: "Gestión de Libros",         href: "/dashboard/libros" },
            { label: "Gestión de Usuarios",       href: "/dashboard/usuarios" },
          ].map((a) => (
            <Link key={a.label} href={a.href}
              className="flex items-center justify-between px-3 py-2 rounded border border-stone/20 text-xs text-navy hover:bg-cream transition">
              {a.label} <span>›</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}

function StatCard({ title, value, sub, highlight = false }: {
  title: string; value: number; sub: string; highlight?: boolean
}) {
  return (
    <div className={`bg-white rounded-lg p-5 border ${highlight ? "border-amber-300" : "border-stone/20"}`}>
      <p className="text-xs text-stone mb-1">{title}</p>
      <p className="text-4xl font-bold text-navy">{value.toLocaleString()}</p>
      <p className={`text-xs mt-2 ${highlight ? "text-amber-600 font-medium" : "text-stone"}`}>{sub}</p>
    </div>
  )
}