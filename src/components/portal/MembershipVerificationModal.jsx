import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { X, ShieldCheck, CheckCircle2, HelpCircle, ExternalLink, Calendar, ArrowLeft, ArrowRight, Info } from "lucide-react"
import { APP_CONFIG } from "../../constants/config"

export default function MembershipVerificationModal({ isOpen, onClose }) {
  const [step, setStep] = useState("ask")
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleAlreadyMember = () => {
    setStep("ask")
    onClose()
    navigate("/reguler")
  }

  const handleNotMember = () => {
    setStep("info")
  }

  const handleRegisterNow = () => {
    window.open(APP_CONFIG.membershipRegistrationUrl, "_blank", "noopener,noreferrer")
  }

  const handleCheckRequirements = () => {
    window.open(APP_CONFIG.membershipInfoUrl, "_blank", "noopener,noreferrer")
  }

  const handleViewScheduleFirst = () => {
    setStep("ask")
    onClose()
    navigate("/reguler/jadwal")
  }

  const handleBackToAsk = () => {
    setStep("ask")
  }

  const handleCloseModal = () => {
    setStep("ask")
    onClose()
  }

  return (
    <div
      onClick={handleCloseModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg my-8 cursor-default"
      >
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/15 text-brand-gold border border-brand-gold/30 flex items-center justify-center shadow-md shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-brand-gold uppercase tracking-wider block">
                  {step === "ask" ? "Verifikasi Keanggotaan" : "Informasi Keanggotaan"}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                  {step === "ask" ? "Status Member ITB Career Center" : "Keanggotaan Diperlukan"}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCloseModal}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === "ask" ? (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                Layanan konseling karier diselenggarakan bagi member resmi ITB Career Center. Apakah Anda sudah memiliki akun membership aktif?
              </p>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleAlreadyMember}
                  className="liquid-btn-gold w-full p-4 rounded-2xl flex items-center justify-between text-left shadow-xl active:scale-98 transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-black/20 text-[#07131e] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-[#07131e]">
                        Sudah Memiliki Akun
                      </div>
                      <div className="text-[11px] text-[#07131e]/80 font-medium">
                        Saya sudah terdaftar sebagai member aktif
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#07131e] group-hover:translate-x-1 transition-transform shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={handleNotMember}
                  className="liquid-btn-ghost w-full p-4 rounded-2xl flex items-center justify-between text-left shadow-lg active:scale-98 transition-all group hover:border-brand-gold/40"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-white/10 text-brand-gold flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white">
                        Belum Memiliki Akun
                      </div>
                      <div className="text-[11px] text-slate-300 font-medium">
                        Saya belum mendaftar sebagai member
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 group-hover:text-white transition-all shrink-0" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="liquid-glass-subtle rounded-2xl p-4 border border-white/10 space-y-3 text-xs sm:text-sm text-slate-200">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Untuk mengikuti sesi konseling karier bersama psikolog, peserta wajib memiliki akun membership aktif di website resmi ITB Career Center.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleCheckRequirements}
                    className="inline-flex items-center gap-1.5 text-brand-gold hover:text-amber-300 font-semibold transition-colors"
                  >
                    <span>Cek Persyaratan Membership</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleRegisterNow}
                  className="liquid-btn-gold w-full py-3.5 px-5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl active:scale-98 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Daftar Member Sekarang</span>
                </button>

                <button
                  type="button"
                  onClick={handleViewScheduleFirst}
                  className="w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-bold text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-700/90 border border-white/20 hover:border-white/30 shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Calendar className="w-4 h-4 text-brand-gold" />
                  <span>Pilih Jadwal Dulu (Daftar Nanti)</span>
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleBackToAsk}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke pilihan awal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
