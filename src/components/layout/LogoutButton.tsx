"use client"
// src/components/layout/LogoutButton.tsx
import { signOut } from "next-auth/react"

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm border border-white/40 px-4 py-1.5 rounded-full hover:bg-white/10 transition"
    >
      Cerrar sesión
    </button>
  )
}