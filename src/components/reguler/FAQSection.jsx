import React, { useState } from "react"
import { Plus, Minus } from "lucide-react"

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      q: "Apa yang perlu dipersiapkan sebelum konseling karier?",
      a: "Jika berencana melakukan CV Review, siapkan file CV terbaru. Untuk konsultasi karier umum, siapkan pertanyaan atau topik yang ingin dibahas agar sesi lebih fokus."
    },
    {
      q: "Berapa lama durasi setiap sesi konseling?",
      a: "Setiap sesi berlangsung selama 45 menit."
    },
    {
      q: "Apakah jadwal konseling dapat diubah (reschedule)?",
      a: "Ya, jadwal dapat diubah maksimal H‑2 sebelum sesi berlangsung."
    },
    {
      q: "Apakah layanan konseling karier ITB terbuka untuk umum?",
      a: "Ya, layanan ini terbuka untuk mahasiswa dan alumni ITB maupun mahasiswa dan alumni non‑ITB, dengan syarat sudah terdaftar sebagai member ITB Career Center melalui karir.itb.ac.id."
    },
    {
      q: "Apakah konseling dilakukan secara online atau tatap muka?",
      a: "Konseling dapat dilakukan secara online maupun tatap muka, sesuai dengan mode yang tertera pada jadwal."
    },
    {
      q: "Apakah ada biaya untuk mengikuti konseling karier?",
      a: "Layanan konseling karier ITB tidak dipungut biaya bagi member ITB Career Center."
    }
  ]

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <section className="liquid-glass-card rounded-3xl p-6 sm:p-9 mb-8 transition-all">
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          FAQ Konseling Karier
        </h3>
      </div>

      <div className="space-y-3.5">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <div
              key={index}
              className={`liquid-glass-subtle rounded-2xl overflow-hidden border transition-all duration-300 ${
                isOpen ? "border-brand-gold/60 shadow-lg shadow-black/20" : "border-white/10 hover:border-white/20"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white hover:text-brand-gold transition-colors"
              >
                <span className="leading-snug">{faq.q}</span>
                <span className="shrink-0 p-1.5 rounded-xl bg-white/10 text-brand-gold border border-white/10 transition-transform duration-200">
                  {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </span>
              </button>
              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-200 leading-relaxed border-t border-white/10 animate-in fade-in duration-200 font-normal">
                  {faq.a}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
