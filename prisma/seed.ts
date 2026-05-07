// prisma/seed.ts
import { PrismaClient, Rol, EstadoCopia, EstadoPrestamo, EstadoMulta, TipoToken } from "../src/generated/prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Sembrando base de datos...")

  // ─── Usuarios ─────────────────────────────────────────────
  const adminHash = await bcrypt.hash("admin1234", 10)
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@ducky.edu" },
    update: {},
    create: {
      email: "admin@ducky.edu",
      passwordHash: adminHash,
      nombre: "Carlos",
      apellido: "Administrador",
      rol: Rol.Administrador,
      activo: true,
      emailVerificado: true,
    },
  })

  const bibHash = await bcrypt.hash("biblio1234", 10)
  const bibliotecario = await prisma.usuario.upsert({
    where: { email: "biblio@ducky.edu" },
    update: {},
    create: {
      email: "biblio@ducky.edu",
      passwordHash: bibHash,
      nombre: "Ana",
      apellido: "García",
      rol: Rol.Bibliotecario,
      activo: true,
      emailVerificado: true,
      numEmpleado: "EMP-001",
    },
  })

  const estudHash = await bcrypt.hash("estud1234", 10)
  const estudiante = await prisma.usuario.upsert({
    where: { email: "estudiante@ducky.edu" },
    update: {},
    create: {
      email: "estudiante@ducky.edu",
      passwordHash: estudHash,
      nombre: "Luis",
      apellido: "Martínez",
      rol: Rol.Estudiante,
      activo: true,
      emailVerificado: true,
      genero: "M",
      edad: 20,
      matricula: "MAT-2024-001",
    },
  })

  const maestroHash = await bcrypt.hash("maestro1234", 10)
  const maestro = await prisma.usuario.upsert({
    where: { email: "maestro@ducky.edu" },
    update: {},
    create: {
      email: "maestro@ducky.edu",
      passwordHash: maestroHash,
      nombre: "Patricia",
      apellido: "López",
      rol: Rol.Maestro,
      activo: true,
      emailVerificado: true,
      genero: "F",
      edad: 45,
      numEmpleado: "EMP-002",
    },
  })

  console.log("✅ Usuarios creados")

  // ─── Autores ───────────────────────────────────────────────
  const autores = await Promise.all([
    prisma.autor.upsert({ where: { nombre: "García Márquez, Gabriel" }, update: {}, create: { nombre: "García Márquez, Gabriel" } }),
    prisma.autor.upsert({ where: { nombre: "Knuth, Donald E." }, update: {}, create: { nombre: "Knuth, Donald E." } }),
    prisma.autor.upsert({ where: { nombre: "Sedgewick, Robert" }, update: {}, create: { nombre: "Sedgewick, Robert" } }),
    prisma.autor.upsert({ where: { nombre: "Cortázar, Julio" }, update: {}, create: { nombre: "Cortázar, Julio" } }),
    prisma.autor.upsert({ where: { nombre: "Martin, Robert C." }, update: {}, create: { nombre: "Martin, Robert C." } }),
  ])

  console.log("✅ Autores creados")

  // ─── Libros + Copias ───────────────────────────────────────
  const libro1 = await prisma.libro.upsert({
    where: { isbn: "978-0-307-47374-3" },
    update: {},
    create: {
      isbn: "978-0-307-47374-3",
      titulo: "Cien Años de Soledad",
      subtitulo: null,
      editorial: "Sudamericana",
      edicion: "1a Ed.",
      anioPub: 1967,
      numPaginas: 432,
      categoria: "Literatura",
      idioma: "Español",
      descripcion: "La saga de la familia Buendía a lo largo de siete generaciones en el mítico pueblo de Macondo.",
      autores: { create: [{ autorId: autores[0].id }] },
      copias: {
        create: [
          { codigoInterno: "978-0-307-47374-3-C1", pasillo: "A", estante: "3", estado: EstadoCopia.Disponible },
          { codigoInterno: "978-0-307-47374-3-C2", pasillo: "A", estante: "3", estado: EstadoCopia.Disponible },
        ],
      },
    },
  })

  const libro2 = await prisma.libro.upsert({
    where: { isbn: "978-0-201-89683-1" },
    update: {},
    create: {
      isbn: "978-0-201-89683-1",
      titulo: "The Art of Computer Programming",
      subtitulo: "Volume 1: Fundamental Algorithms",
      editorial: "Addison-Wesley",
      edicion: "3a Ed.",
      anioPub: 1997,
      numPaginas: 672,
      categoria: "Tecnología",
      idioma: "Inglés",
      descripcion: "La obra de referencia más completa sobre algoritmos y programación, por el legendario Donald Knuth.",
      autores: { create: [{ autorId: autores[1].id }] },
      copias: {
        create: [
          { codigoInterno: "978-0-201-89683-1-C1", pasillo: "B", estante: "1", estado: EstadoCopia.Disponible },
        ],
      },
    },
  })

  const libro3 = await prisma.libro.upsert({
    where: { isbn: "978-0-13-235088-4" },
    update: {},
    create: {
      isbn: "978-0-13-235088-4",
      titulo: "Clean Code",
      subtitulo: "A Handbook of Agile Software Craftsmanship",
      editorial: "Prentice Hall",
      edicion: "1a Ed.",
      anioPub: 2008,
      numPaginas: 464,
      categoria: "Tecnología",
      idioma: "Inglés",
      descripcion: "Principios, patrones y prácticas para escribir código limpio y mantenible.",
      autores: { create: [{ autorId: autores[4].id }] },
      copias: {
        create: [
          { codigoInterno: "978-0-13-235088-4-C1", pasillo: "B", estante: "2", estado: EstadoCopia.Disponible },
          { codigoInterno: "978-0-13-235088-4-C2", pasillo: "B", estante: "2", estado: EstadoCopia.Disponible },
        ],
      },
    },
  })

  console.log("✅ Libros y copias creados")

  // ─── Préstamo de ejemplo ───────────────────────────────────
  const copia1 = await prisma.copia.findFirst({ where: { libroId: libro1.id, estado: EstadoCopia.Disponible } })
  if (copia1) {
    const devolucion = new Date()
    devolucion.setDate(devolucion.getDate() + 14)

    const prestamo = await prisma.prestamo.create({
      data: {
        usuarioId: estudiante.id,
        copiaId: copia1.id,
        fechaDevolucion: devolucion,
        estado: EstadoPrestamo.Activo,
        renovaciones: 0,
      },
    })

    await prisma.copia.update({ where: { id: copia1.id }, data: { estado: EstadoCopia.Prestada } })
    console.log("✅ Préstamo de ejemplo creado")

    // ─── Multa de ejemplo (préstamo vencido simulado) ──────
    // Usamos una copia distinta para la multa de demo
    const copiaVencida = await prisma.copia.findFirst({ where: { libroId: libro2.id } })
    if (copiaVencida) {
      const fechaVencida = new Date()
      fechaVencida.setDate(fechaVencida.getDate() - 20) // ya venció
      const devVencida = new Date()
      devVencida.setDate(devVencida.getDate() - 5)

      const prestamoVencido = await prisma.prestamo.create({
        data: {
          usuarioId: estudiante.id,
          copiaId: copiaVencida.id,
          fechaPrestamo: fechaVencida,
          fechaDevolucion: devVencida,
          estado: EstadoPrestamo.Perdido,
          renovaciones: 0,
          fechaRealDev: new Date(),
        },
      })

      await prisma.copia.update({ where: { id: copiaVencida.id }, data: { estado: EstadoCopia.Perdida } })

      await prisma.multa.create({
        data: {
          prestamoId: prestamoVencido.id,
          usuarioId: estudiante.id,
          monto: 500,
          motivo: "Libro reportado como perdido",
          estado: EstadoMulta.Pendiente,
        },
      })

      console.log("✅ Multa de ejemplo creada")
    }
  }

  // ─── Reporte de ejemplo ────────────────────────────────────
  await prisma.reporte.create({
    data: {
      generadoPorId: admin.id,
      tipo: "prestamos_mes",
      parametros: { mes: new Date().getMonth() + 1, anio: new Date().getFullYear() },
      resultadoUrl: null,
    },
  })

  console.log("✅ Reporte de ejemplo creado")
  console.log("🌱 Semilla completada exitosamente")
  console.log("")
  console.log("Cuentas de prueba:")
  console.log("  admin@ducky.edu       / admin1234  (Administrador)")
  console.log("  biblio@ducky.edu      / biblio1234 (Bibliotecario)")
  console.log("  estudiante@ducky.edu  / estud1234  (Estudiante)")
  console.log("  maestro@ducky.edu     / maestro1234 (Maestro)")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
