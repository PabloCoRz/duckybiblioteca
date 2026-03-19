"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Gestión De Usuarios", href: "/dashboard/usuarios" },
  { label: "Gestión De Libros", href: "/dashboard/libros" },
  { label: "Consultar Catálogo", href: "/dashboard/catalogo" },
  { label: "Gestión De Préstamos", href: "/dashboard/prestamos" },
  { label: "Gestión De Multas", href: "/dashboard/multas" },
]

export default function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname()

  return (
    <aside className="w-44 bg-cream shrink-0 flex flex-col justify-between py-4 border-r border-stone/20">
      <nav className="flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-xs px-3 py-2 rounded text-center transition font-medium
                ${isActive
                  ? "bg-navy text-white"
                  : "text-navy hover:bg-navy/10"
                }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-2">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full py-2 rounded text-xs font-medium bg-gold/80 text-navy hover:bg-gold transition"
        >
          Salir
        </button>
      </div>
    </aside>
  )
}