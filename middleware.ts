import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const adminRoles = ["Administrador", "Bibliotecario"]
const userRoles = ["Estudiante", "Maestro", "Colaborador"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  })

  const role = token?.role as string | undefined

  // not logged in
  if (!token && pathname !== "/login" && !pathname.startsWith("/api/auth")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // student trying to access admin area
  if (pathname.startsWith("/dashboard") && role && !adminRoles.includes(role)) {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  // admin trying to access student area
  if (pathname.startsWith("/home") && role && !userRoles.includes(role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|signup|verify|forgot|reset).*)"],
}