import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import MembershipVerificationModal from "../components/portal/MembershipVerificationModal";

export default function PortalPage() {
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  return (
    <div className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-5xl xl:max-w-6xl w-full mx-auto relative z-10">
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
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-gold pr-1">
              ITB Career Center
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight">
            Booking Konseling Karier
          </h1>
          <p className="mt-3.5 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Silakan pilih layanan yang ingin Anda akses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <div className="liquid-neumorph-card rounded-3xl p-8 sm:p-9 lg:p-10 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/30 group cursor-default shadow-[0_20px_45px_-12px_rgba(0,0,0,0.5)]">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3 tracking-tight">
                Konseling Reguler
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 font-normal">
                Sesi konseling 1-on-1 dan review CV bersama psikolog profesional
                ITB Career Center, tersedia sepanjang tahun secara online maupun
                tatap muka.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsVerificationModalOpen(true)}
              className="liquid-btn-gold w-full py-4 px-6 rounded-full text-sm font-semibold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <span>Booking Jadwal Reguler</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
            </button>
          </div>

          <div className="liquid-neumorph-card rounded-3xl p-8 sm:p-9 lg:p-10 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-400/30 group cursor-default shadow-[0_20px_45px_-12px_rgba(0,0,0,0.5)]">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3 tracking-tight">
                Titian Karir Terpadu (TKT)
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 font-normal">
                Layanan konseling persiapan karier yang diselenggarakan khusus
                pada periode event Titian Karir Terpadu ITB dengan sistem
                registrasi booth dan walk-in.
              </p>
            </div>

            <Link
              to="/tkt"
              className="liquid-btn-ghost w-full py-4 px-6 rounded-full text-sm font-semibold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <span>Booking Jadwal TKT</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
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
