import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, ArrowRight } from "lucide-react";
import MembershipVerificationModal from "../components/portal/MembershipVerificationModal";

export default function PortalPage() {
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-10 left-1/4 w-80 h-80 rounded-full bg-brand-gold/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-brand-blue-persib/20 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2.5 mb-5 px-3.5 py-1.5 rounded-full liquid-glass-pill-container border border-white/15 shadow-lg">
            <img
              src="/images/logo.jpg"
              alt="Logo ITB Career Center"
              className="w-7 h-7 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-gold pr-1">
              ITB Career Center
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
            Layanan Konseling Karier
          </h1>
          <p className="mt-3.5 text-sm sm:text-base text-slate-200 max-w-lg mx-auto font-normal leading-relaxed">
            Pusat bimbingan dan perencanaan karier ITB Career Center. Silakan pilih jalur layanan konseling yang ingin Anda akses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <div className="liquid-glass-card rounded-3xl p-7 sm:p-9 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-gold/60 shadow-2xl group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-brand-gold/15 text-brand-gold border border-brand-gold/30 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                  <Calendar className="w-7 h-7" />
                </div>
                <span className="px-3.5 py-1 rounded-full text-[11px] font-bold bg-brand-gold/15 text-brand-gold border border-brand-gold/30">
                  Layanan Reguler
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2.5">
                Konseling Karier Reguler
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-8 font-normal">
                Layanan konseling karier dan CV review bersama psikolog profesional ITB Career Center, tersedia sepanjang tahun secara online maupun tatap muka.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsVerificationModalOpen(true)}
              className="liquid-btn-gold w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer"
            >
              <span>Masuk Layanan Reguler</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="liquid-glass-card rounded-3xl p-7 sm:p-9 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-400/50 shadow-2xl group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-400/30 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                  <Users className="w-7 h-7" />
                </div>
                <span className="px-3.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-300 border border-sky-400/30">
                  Titian Karir Terpadu
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2.5">
                Konseling Titian Karir (TKT)
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-8 font-normal">
                Layanan konseling karier dan konsultasi persiapan kerja yang diselenggarakan khusus pada periode program Titian Karir Terpadu (TKT) ITB.
              </p>
            </div>

            <Link
              to="/tkt"
              className="liquid-btn-ghost w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 hover:border-brand-gold/40 transition-all"
            >
              <span>Masuk Layanan TKT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <MembershipVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
      />
    </div>
  );
}
