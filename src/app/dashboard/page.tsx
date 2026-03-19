import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const session = await auth()
  const totalUsuarios = await prisma.usuario.count()
  const totalActivos = await prisma.usuario.count({ where: { activo: true } })

  return (
    <div className="space-y-6">

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Usuarios" value={totalUsuarios} note="+1.5% comparado al mes anterior" />
        <StatCard title="Total Libros en Biblioteca" value={0} note="Disponible en Sprint 1" />
        <StatCard title="Total Préstamos Activos" value={0} note="Disponible en Sprint 3" />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg p-5 border border-stone/20">
          <h3 className="font-semibold text-navy mb-4">Historial de Libros en Biblioteca</h3>
          <div className="h-40 flex items-center justify-center text-stone text-sm">
            Disponible en Sprint 1
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-stone/20 space-y-4">
          <div>
            <p className="text-xs text-stone">Total Multas Exitosas</p>
            <p className="text-3xl font-bold text-navy">0</p>
            <p className="text-xs text-stone">Disponible en Sprint 3</p>
          </div>
          <div>
            <p className="text-xs text-stone">Total Multas Pendientes</p>
            <p className="text-3xl font-bold text-navy">0</p>
          </div>
          <button className="w-full py-2 text-xs border border-stone/30 rounded hover:bg-cream transition text-navy">
            Ver más información
          </button>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-5 border border-stone/20">
          <h3 className="font-semibold text-navy mb-3">Actividad Reciente</h3>
          <p className="text-xs text-stone">No hay actividad reciente aún.</p>
        </div>

        <div className="bg-white rounded-lg p-5 border border-stone/20">
          <h3 className="font-semibold text-navy mb-3">Acciones Rápidas</h3>
          <div className="space-y-2">
            {[
              { label: "Crear Usuario", href: "/dashboard/usuarios/nuevo" },
              { label: "Exportar Catálogo de Libros", href: "#" },
              { label: "Exportar Lista de Usuarios", href: "#" },
              { label: "Exportar Multas", href: "#" },
              { label: "Exportar Préstamos Activos", href: "#" },
            ].map((action) => (
              <a key={action.label} href={action.href}
                className="flex items-center justify-between px-3 py-2 rounded border border-stone/20 text-xs text-navy hover:bg-cream transition">
                {action.label}
                <span>›</span>
              </a>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

function StatCard({ title, value, note }: { title: string; value: number; note: string }) {
  return (
    <div className="bg-white rounded-lg p-5 border border-stone/20">
      <p className="text-xs text-stone mb-1">{title}</p>
      <p className="text-4xl font-bold text-navy">{value.toLocaleString()}</p>
      <p className="text-xs text-stone mt-2">{note}</p>
    </div>
  )
}