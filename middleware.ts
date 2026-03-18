import { auth } from "@/auth"
import { NextResponse } from "next/server"

const adminRoles = ["Administrador", "Bibliotecario"]
const userRoles = ["Estudiante", "Maestro", "Colaborador"]

export default auth((request) => {
  const { pathname } = request.nextUrl
  const role = request.auth?.user?.role

  // not logged in and trying to access a protected page
  if (!role && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // student trying to access admin area
  if (pathname.startsWith("/dashboard") && !adminRoles.includes(role ?? "")) {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  
})

export const config = {
  // which routes the middleware runs on — everything except static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}