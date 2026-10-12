import React from "react"
import { Link } from "react-router-dom"
import { Calendar, Users } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl p-7 sm:p-12 liquid-neumorph-card mb-8">
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-15 mix-blend-luminosity"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      />

      <div className="relative z-10 space-y-5 max-w-3xl">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight leading-tight">
          Konseling Karier ITB Career Center
          <span className="block text-amber-300 text-xl sm:text-3xl md:text-4xl mt-1.5">
            100% Gratis
          </span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
          Kami mendampingi mahasiswa dan alumni ITB maupun non‑ITB untuk
          merencanakan, memilih, mempersiapkan karier, serta mendapatkan tips
          memasuki dunia kerja.
        </p>

        <div className="flex flex-wrap items-center gap-3.5 pt-2">
          <Link
            to="/reguler/jadwal"
            className="liquid-btn-gold px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Lihat Jadwal Konseling</span>
          </Link>
          <Link
            to="/reguler/tentang"
            className="liquid-btn-ghost px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-amber-300" />
            <span>Kenali Layanan & Psikolog</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
