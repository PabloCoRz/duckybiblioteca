import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import Image from "next/image"
import Navbar from "@/components/layout/Navbar"
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
      <Navbar/>
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