// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const adminRoles = ["Administrador", "Bibliotecario"]
// Agregamos el arreglo con todos los roles permitidos en la plataforma
const validRoles = ["Administrador", "Bibliotecario", "Estudiante", "Maestro", "Colaborador"]

// Rutas que NO requieren sesión
const PUBLIC = ["/", "/login", "/signup", "/verify-email", "/verify-email-sent", "/forgot-password", "/reset-password"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET })
  const role = token?.role as string | undefined
  const isPublic = PUBLIC.some(p => pathname === p || pathname.startsWith(p + "/"))

  // 1. Sin sesión en ruta protegida (ej. /home) → redirigir a login (/)
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // 2. Con sesión intentando acceder a /home → Validar que tenga uno de los 5 roles
  if (token && pathname.startsWith("/home")) {
    if (!role || !validRoles.includes(role)) {
      // Si tiene token pero no tiene rol válido, no lo dejamos entrar.
      // Lo redirigimos a "/" (o podrías crear un "/acceso-denegado")
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // 3. Con sesión en el landing (login) → todos los que tienen rol válido van a /home
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  // 4. /dashboard → solo Administrador y Bibliotecario
  if (pathname.startsWith("/dashboard") && role && !adminRoles.includes(role)) {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}