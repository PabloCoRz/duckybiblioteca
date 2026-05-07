// src/components/layout/Navbar.tsx
import { auth } from "@/auth"
import Image from "next/image"
import Link from "next/link"
import LogoutButton from "./LogoutButton"
import { redirect } from "next/navigation"

const ADMIN_ROLES = ["Administrador", "Bibliotecario"]

export default async function Navbar() {
  const session = await auth()
  const role        = session?.user?.role as string | undefined
  const isPrivileged= role && ADMIN_ROLES.includes(role)
  const isLoggedIn  = !!session?.user

  return (
    <header className="bg-navy text-white flex items-center justify-between px-6 py-3 shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <Image src="/simplelogo.png" alt="Ducky" width={48} height={48} className="rounded-lg" />
        <Link href="/home">
          <div>
            <div className="font-bold text-lg leading-tight">Ducky University</div>
            <div className="text-gold text-xs">Unversity Established in 1900</div>
          </div>
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">

          <Link
            href="/mis-prestamos"
            className="text-sm font-medium text-white hover:text-gold transition"
          >
            Mis Prestamos
          </Link>

        {/* Panel Admin — solo Administrador y Bibliotecario */}
        {isPrivileged && (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-gold text-navy text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-gold/80 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4 5v6c0 5.25 3.5 10.15 8 11.35C16.5 21.15 20 16.25 20 11V5l-8-3z" />
            </svg>
            Panel de Administración
          </Link>
        )}

        {session?.user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-tight">{session.user.name ?? "Usuario"}</p>
              {role && <p className="text-xs text-gold leading-tight">{role}</p>}
            </div>
            <div className="w-9 h-9 rounded-full bg-stone flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-cream" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <LogoutButton />
          </div>
        ) : (
          redirect("/login")
        )}

      </div>
    </header>
  )
}
