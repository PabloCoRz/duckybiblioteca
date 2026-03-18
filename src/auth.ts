import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // TODO: replace this with a real DB lookup once Prisma is set up
        // For now you can hardcode a test user to verify everything works
        const testUser = {
          id: "1",
          email: "admin@ducky.edu",
          password: await bcrypt.hash("password123", 10),
          role: "Administrador",
          nombre: "Admin"
        }

        if (credentials.email !== testUser.email) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          testUser.password
        )

        if (!passwordMatch) return null

        return {
          id: testUser.id,
          email: testUser.email,
          role: testUser.role,
          name: testUser.nombre,
        }
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      // runs when token is first created (on login)
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      // runs every time session is read anywhere in the app
      session.user.role = token.role as string
      session.user.id = token.id as string
      return session
    },
    
  },
  pages: {
    signIn: "/login", // your custom login page
  }
})