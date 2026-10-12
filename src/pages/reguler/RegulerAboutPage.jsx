import React from "react"
import { ShieldCheck } from "lucide-react"
import PsychologistCard from "../../components/reguler/PsychologistCard"
import FooterInfo from "../../components/common/FooterInfo"

export default function RegulerAboutPage() {
  return (
    <div className="max-w-container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      <section className="relative overflow-hidden rounded-3xl p-7 sm:p-12 liquid-neumorph-card">
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-15 mix-blend-luminosity"
          style={{ backgroundImage: "url('/images/hero.jpg')" }}
        />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <h2 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight leading-snug">
            Tentang Layanan Konseling Karier
            <span className="block text-amber-300 text-xl sm:text-3xl mt-1.5">
              100% Gratis
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            ITB Career Center memberikan layanan Konseling Karier bagi mahasiswa
            dan alumni ITB maupun non‑ITB. Lewat Konseling Karier, teman karier
            akan dibantu merencanakan, memilih, mempersiapkan karier, serta
            mendapatkan tips untuk memasuki dunia kerja.
          </p>
        </div>
      </section>

      <section className="liquid-neumorph-card rounded-3xl p-6 sm:p-9 transition-all">
        <div className="mb-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Cerita di Balik Layanan
          </h3>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          <p>
            Sejak awal berdirinya, ITB Career Center hadir untuk mendampingi
            mahasiswa dan alumni yang tengah mencari arah karier. Kami memahami
            bahwa proses menentukan langkah karier sering kali tidak mudah dan
            membutuhkan ruang untuk berdiskusi.
          </p>
          <p>
            Melalui konseling karier, kami menyediakan ruang yang aman dan
            suportif untuk mengeksplorasi potensi diri serta menyusun langkah
            karier yang realistis dan dapat dijalankan. Dengan pendekatan yang
            humanis dan terukur, kami membantu peserta mengubah kebingungan
            menjadi arah yang lebih jelas dan penuh keyakinan.
          </p>
        </div>
      </section>

      <section className="liquid-neumorph-card rounded-3xl p-6 sm:p-9 transition-all">
        <div className="mb-3">
          <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Kompetensi Psikolog Kami
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
          Di balik setiap sesi konseling, terdapat standar profesional yang
          senantiasa kami junjung tinggi. Psikolog ITB Career Center tidak hanya
          empatik dan profesional, tetapi juga memiliki karakter yang menjadikan
          pengalaman konseling terasa aman, nyaman, dan bermakna bagi setiap
          peserta.
        </p>

        <div className="space-y-4">
          <div className="liquid-glass-subtle rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
              <strong className="text-sm sm:text-base font-semibold text-white">
                Empatik
              </strong>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pl-6">
              Kami berupaya memahami perasaan, nilai, serta kebingungan yang
              dialami peserta tanpa menghakimi. Empati menjadi dasar terciptanya
              hubungan konseling yang hangat dan suportif.
            </p>
          </div>

          <div className="liquid-glass-subtle rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
              <strong className="text-sm sm:text-base font-semibold text-white">
                Profesional
              </strong>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pl-6">
              Psikolog kami menjunjung tinggi etika profesi, menjaga
              kerahasiaan, serta bekerja sesuai dengan prinsip keilmuan
              psikologi sehingga peserta merasa aman dan dihargai.
            </p>
          </div>

          <div className="liquid-glass-subtle rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
              <strong className="text-sm sm:text-base font-semibold text-white">
                Objektif dan Netral
              </strong>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pl-6">
              Kami tidak memaksakan pandangan pribadi. Setiap keputusan tetap
              berada di tangan peserta, sementara psikolog berperan sebagai
              pendamping dalam proses eksplorasi dan refleksi.
            </p>
          </div>

          <div className="liquid-glass-subtle rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
              <strong className="text-sm sm:text-base font-semibold text-white">
                Komunikatif dan Asesif
              </strong>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pl-6">
              Melalui proses konseling dan dialog terbuka, psikolog membantu
              peserta mengeksplorasi situasi yang dihadapi serta memberikan
              umpan balik dengan bahasa yang jelas, mudah dipahami, dan
              membangun.
            </p>
          </div>

          <div className="liquid-glass-subtle rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
              <strong className="text-sm sm:text-base font-semibold text-white">
                Berorientasi pada Pengembangan Klien
              </strong>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pl-6">
              Fokus konseling tidak hanya pada penyelesaian masalah sesaat,
              tetapi juga membantu peserta memahami potensi diri dan
              mengembangkan kemampuan pengambilan keputusan karier secara
              berkelanjutan.
            </p>
          </div>
        </div>
      </section>

      <PsychologistCard />
      <FooterInfo />
    </div>
  )
}
