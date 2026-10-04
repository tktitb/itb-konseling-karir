import React from "react"
import { MapPin, Instagram, Globe, Phone, Mail, Linkedin, Quote } from "lucide-react"

export default function FooterInfo() {
  return (
    <div className="liquid-glass-card rounded-3xl p-6 sm:p-9 mt-12 transition-all duration-300">
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Informasi & Kontak
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
            <div className="p-2 rounded-xl bg-brand-blue/20 border border-brand-blue/40 text-sky-400 shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <p className="leading-relaxed">
              Kantor ITB Career Center, GKU Timur, Lantai Dasar ITB Ganesha. Jln. Ganesha 10, Bandung 40132 Indonesia
            </p>
          </div>
          <div className="w-full h-56 rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-slate-900">
            <iframe
              title="Peta Lokasi ITB Career Center"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.002698998236!2d107.60966287475671!3d-6.890278793108773!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e650a65b5dc1%3A0xda56d0b353cae67c!2sITB%20Career%20Center!5e0!3m2!1sen!2sid!4v1768614758438!5m2!1sen!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
            <a
              href="https://www.instagram.com/itbcareercenterofficial/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-gold/50 flex items-center gap-3 transition-all duration-200 group hover:-translate-y-0.5"
            >
              <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 group-hover:scale-110 transition-transform">
                <Instagram className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-200 group-hover:text-white truncate">
                @itbcareercenterofficial
              </span>
            </a>

            <a
              href="https://karir.itb.ac.id"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-gold/50 flex items-center gap-3 transition-all duration-200 group hover:-translate-y-0.5"
            >
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-sky-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Globe className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-200 group-hover:text-white truncate">
                karir.itb.ac.id
              </span>
            </a>

            <a
              href="https://wa.me/6281111119463?text=Halo%20Admin%20ITB%20Career%20Center,%20saya%20ingin%20konsultasi%20terkait%20konseling%20karir..."
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-gold/50 flex items-center gap-3 transition-all duration-200 group hover:-translate-y-0.5"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-200 group-hover:text-white truncate">
                081111119463
              </span>
            </a>

            <a
              href="mailto:career@itb.ac.id"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-gold/50 flex items-center gap-3 transition-all duration-200 group hover:-translate-y-0.5"
            >
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-200 group-hover:text-white truncate">
                career@itb.ac.id
              </span>
            </a>

            <a
              href="https://www.linkedin.com/company/itb-career-center/"
              target="_blank"
              rel="noopener noreferrer"
              className="sm:col-span-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-gold/50 flex items-center gap-3 transition-all duration-200 group hover:-translate-y-0.5"
            >
              <div className="p-1.5 rounded-lg bg-sky-600/10 text-sky-400 border border-sky-600/20 group-hover:scale-110 transition-transform">
                <Linkedin className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-200 group-hover:text-white truncate">
                LinkedIn ITB Career Center
              </span>
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-black/30 border border-white/10 flex items-start gap-3 text-xs italic text-slate-300 leading-relaxed shadow-inner">
            <Quote className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
            <p>
              Tim ITB Career Center selalu siap mendampingi perjalanan karier Anda. Konsultasi, informasi, dan dukungan kami hadir untuk membantu Anda menemukan arah terbaik..
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
