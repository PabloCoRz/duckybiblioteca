import bcrypt from "bcryptjs"
import { PrismaClient } from "./src/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

async function main() {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!
  })
  const prisma = new PrismaClient({ adapter })

  const hash = await bcrypt.hash("Password123", 10)

  await prisma.usuario.upsert({
    where: { email: "admin@ducky.edu" },
    update: {},
    create: {
      email: "admin@ducky.edu",
      passwordHash: hash,
      nombre: "Admin",
      apellido: "Ducky",
      rol: "Administrador",
    }
  })

  await prisma.usuario.upsert({
    where: { email: "estudiante@ducky.edu" },
    update: {},
    create: {
      email: "estudiante@ducky.edu",
      passwordHash: hash,
      nombre: "Juan",
      apellido: "Pérez",
      rol: "Estudiante",
    }
  })

  console.log("✅ Users seeded")
  await prisma.$disconnect()
}

main().catch(console.error)