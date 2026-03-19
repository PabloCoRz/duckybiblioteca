import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import Image from "next/image"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#e8e0cc" }}>

      {/* Top navbar */}
      <header className="bg-navy text-white flex items-center justify-between px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <Image src="/simplelogo.png" alt="Ducky" width={48} height={48} className="rounded-lg" />
          <div>
            <div className="font-bold text-lg leading-tight">Ducky University</div>
            <div className="text-gold text-xs">University Established in 1900</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm">{session.user?.name ?? "Usuario"}</span>
          <div className="w-9 h-9 rounded-full bg-stone flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-cream" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <Sidebar role={session.user?.role} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>

      {/* Footer */}
      <footer className="text-center py-3 text-xs text-stone border-t border-stone/20">
        <Image src="/simplelogo.png" alt="Ducky" width={32} height={32} className="mx-auto mb-1" />
        © Ducky University · Todos los derechos reservados
      </footer>

    </div>
  )
}