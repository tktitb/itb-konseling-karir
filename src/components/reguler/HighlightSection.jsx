import React from "react"
import { Compass, Briefcase } from "lucide-react"

export default function HighlightSection() {
  return (
    <section className="liquid-glass-card rounded-3xl p-6 sm:p-9 mb-8 transition-all">
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Kenapa Konseling di ITB Career Center?
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="liquid-glass-subtle rounded-2xl p-6 sm:p-7 border border-white/10 hover:border-brand-gold/40 transition-all duration-300 hover:-translate-y-1.5 group">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center mb-4 text-sky-400 group-hover:scale-110 transition-transform">
            <Compass className="w-6 h-6" />
          </div>
          <h4 className="text-base sm:text-lg font-bold text-white mb-2.5">
            Pendampingan Karier Sejak Dini
          </h4>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            Membantu mahasiswa dan alumni memahami arah karier, menyusun langkah awal, serta mendukung proses pengambilan keputusan karier.
          </p>
        </div>

        <div className="liquid-glass-subtle rounded-2xl p-6 sm:p-7 border border-white/10 hover:border-brand-gold/40 transition-all duration-300 hover:-translate-y-1.5 group">
          <div className="w-12 h-12 rounded-2xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center mb-4 text-amber-300 group-hover:scale-110 transition-transform">
            <Briefcase className="w-6 h-6" />
          </div>
          <h4 className="text-base sm:text-lg font-bold text-white mb-2.5">
            Dukungan Kesiapan Kerja
          </h4>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            Peserta dapat memanfaatkan layanan review CV, pendampingan persiapan wawancara, serta pembahasan rencana dan tantangan karier masa depan secara terarah.
          </p>
        </div>
      </div>
    </section>
  )
}
