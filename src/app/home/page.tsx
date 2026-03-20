// src/app/home/page.tsx
import Navbar from "@/components/layout/Navbar"
import Image from "next/image"

export default async function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#e8e0cc" }}>

      <Navbar />

      {/* Hero con buscador — igual que el landing */}
      <section className="relative flex flex-col items-center justify-center text-center text-white px-4 overflow-hidden" style={{ minHeight: 440 }}>
        <Image
          src="/background.png"
          alt="Biblioteca"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-navy/65" />

        <div className="relative z-10 flex flex-col items-center gap-5 w-full max-w-xl py-16">
          <p className="text-gold text-sm">
            Busca de nuestra selección de libros físicos en nuestra Biblioteca
          </p>
          <h1 className="text-4xl font-bold">
            Busca un Libro en Nuestra Biblioteca
          </h1>
          <input
            type="text"
            placeholder="Ingrese Libro para Buscar"
            className="w-full rounded-full px-6 py-3 text-navy placeholder-stone/70 bg-white/80 outline-none text-base"
          />
          <button className="bg-navy text-white px-10 py-2.5 rounded font-medium hover:bg-navy/80 transition">
            Buscar
          </button>
        </div>

        <div className="absolute bottom-4 right-6 z-10 opacity-80">
          <span className="font-black text-2xl tracking-widest text-white drop-shadow">DUCKY</span>
        </div>
      </section>

      {/* Libros Destacados */}
      <section className="px-8 py-10">
        <h2 className="text-2xl font-bold text-navy mb-6">Libros Destacados</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-navy rounded-lg aspect-[2/3] flex items-end justify-center pb-3 text-white text-xs font-bold tracking-widest"
            >
              <span>Libro {i + 1}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}