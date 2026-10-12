import React, { useState } from "react"
import { X, Calendar, Video, Building2, Send, AlertCircle, ShieldCheck, ChevronDown } from "lucide-react"
import { APP_CONFIG, PSYCHOLOGISTS } from "../../constants/config"
import { formatDatetimeText } from "../../utils/timeUtils"
import { validateFullName, validateWhatsApp, validateEmail, sanitizeWhatsAppInput } from "../../utils/validationUtils"
import WhatsAppIcon from "../common/WhatsAppIcon"

export default function BookingModal({ slot, allSlots, onClose }) {
  const [nama, setNama] = useState("")
  const [kategori, setKategori] = useState("Mahasiswa ITB")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [selectedPsych, setSelectedPsych] = useState("")
  const [errors, setErrors] = useState({})

  if (!slot) return null

  const datetimeText = formatDatetimeText(slot.datetimeFmt)

  let modeText = slot.mode || "Online"
  if (slot.mode?.toLowerCase() === "online") {
    modeText = "Online (via Zoom Meeting)"
  } else if (slot.mode?.toLowerCase() === "offline") {
    modeText = "Offline (di Kantor ITB Career Center, GKU Timur, Lantai Dasar ITB Ganesha)"
  }

  const sameTimeSlots = allSlots.filter(
    (s) => s.datetimeFmt === slot.datetimeFmt && s.isAvailable
  )
  const availablePsychs = Array.from(new Set(sameTimeSlots.map((s) => s.psychologist)))

  const getPsychFullName = (shortName) => {
    const found = PSYCHOLOGISTS.find(
      (p) =>
        shortName.toLowerCase().includes(p.shortName.toLowerCase()) ||
        p.fullName.toLowerCase().includes(shortName.toLowerCase())
    )
    return found ? found.fullName : shortName
  }

  const currentPsychFull = selectedPsych
    ? getPsychFullName(selectedPsych)
    : getPsychFullName(slot.psychologist)

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    const nameResult = validateFullName(nama)
    if (!nameResult.isValid) {
      newErrors.nama = nameResult.error
    }

    const phoneResult = validateWhatsApp(phone)
    if (!phoneResult.isValid) {
      newErrors.phone = phoneResult.error
    }

    const emailResult = validateEmail(email, true)
    if (!emailResult.isValid) {
      newErrors.email = emailResult.error
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const messageLines = [
      "Halo, saya ingin mendaftar konseling karier. Berikut data saya:",
      `Nama Lengkap: ${nameResult.cleanValue}`,
      `Sesi Konseling: ${modeText}`,
      `Kategori Peserta: ${kategori}`,
      `Psikolog: ${currentPsychFull}`,
      `Hari & Waktu Konseling: ${datetimeText}`,
      `No. HP (WhatsApp): ${phoneResult.cleanValue}`,
      `Email: ${emailResult.cleanValue}`
    ]

    const whatsappUrl = `https://wa.me/${APP_CONFIG.whatsappHotline}?text=${encodeURIComponent(
      messageLines.join("\n")
    )}`

    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
    onClose()
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl my-auto cursor-default"
      >
        <div className="liquid-neumorph-card rounded-3xl p-5 sm:p-7 md:p-8 border-t border-l border-white/25 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-brand-gold uppercase tracking-widest">
                Konfirmasi Pendaftaran
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                Konseling Reguler ITB CC
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl liquid-neumorph-inset text-slate-300 hover:text-white border border-white/10 hover:border-white/20 flex items-center justify-center transition-all active:scale-95"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-6 p-4 rounded-2xl liquid-neumorph-inset border border-white/10 space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
              <Calendar className="w-4 h-4 text-brand-gold shrink-0" />
              <span className="font-semibold text-white">Jadwal:</span>
              <span className="text-slate-200">{datetimeText}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
              {slot.mode?.toLowerCase() === "online" ? (
                <Video className="w-4 h-4 text-sky-400 shrink-0" />
              ) : (
                <Building2 className="w-4 h-4 text-brand-gold shrink-0" />
              )}
              <span className="font-semibold text-white">Sesi:</span>
              <span className="text-slate-200">{modeText}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-white">Psikolog:</span>
              <span className="text-slate-200">{currentPsychFull}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                Nama Lengkap <span className="text-amber-400 ml-0.5">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => {
                  setNama(e.target.value)
                  if (errors.nama) setErrors({ ...errors, nama: null })
                }}
                placeholder="Contoh: Andi Surya Putra"
                className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                  errors.nama ? "border border-rose-500/60" : "border border-white/10"
                }`}
              />
              <span className="text-[11px] sm:text-xs text-slate-400 mt-1 block">
                Sesuai KTP atau kartu mahasiswa ITB.
              </span>
              {errors.nama && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.nama}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                  Kategori Peserta <span className="text-amber-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full px-4 py-2.5 pr-9 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Mahasiswa ITB" className="bg-[#0b1a27] text-slate-100">Mahasiswa ITB</option>
                    <option value="Alumni ITB" className="bg-[#0b1a27] text-slate-100">Alumni ITB</option>
                    <option value="Mahasiswa Non-ITB" className="bg-[#0b1a27] text-slate-100">Mahasiswa Non-ITB</option>
                    <option value="Alumni Non-ITB" className="bg-[#0b1a27] text-slate-100">Alumni Non-ITB</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                  Pilihan Psikolog <span className="text-amber-400 ml-0.5">*</span>
                </label>
                {availablePsychs.length > 1 ? (
                  <div className="relative">
                    <select
                      value={selectedPsych || slot.psychologist}
                      onChange={(e) => setSelectedPsych(e.target.value)}
                      className="w-full px-4 py-2.5 pr-9 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all appearance-none cursor-pointer"
                    >
                      {availablePsychs.map((psych) => (
                        <option key={psych} value={psych} className="bg-[#0b1a27] text-slate-100">
                          {getPsychFullName(psych)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                ) : (
                  <input
                    type="text"
                    readOnly
                    value={currentPsychFull}
                    className="w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium bg-[#091726]/50 border border-white/5 text-slate-300 cursor-not-allowed"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                  Nomor WhatsApp <span className="text-amber-400 ml-0.5">*</span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={14}
                  value={phone}
                  onChange={(e) => {
                    setPhone(sanitizeWhatsAppInput(e.target.value))
                    if (errors.phone) setErrors({ ...errors, phone: null })
                  }}
                  onBlur={() => {
                    if (phone) {
                      const check = validateWhatsApp(phone)
                      if (!check.isValid) {
                        setErrors((prev) => ({ ...prev, phone: check.error }))
                      }
                    }
                  }}
                  placeholder="Contoh: 081234567890"
                  className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                    errors.phone ? "border border-rose-500/60" : "border border-white/10"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                  Email Aktif <span className="text-amber-400 ml-0.5">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors({ ...errors, email: null })
                  }}
                  placeholder="nama@domain.com"
                  className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                    errors.email ? "border border-rose-500/60" : "border border-white/10"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="pt-5 border-t border-white/10 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl liquid-neumorph-inset text-xs sm:text-sm font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all active:scale-95"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-[#dda853] to-[#c99440] hover:from-[#e5b360] hover:to-[#d49f4c] border-t border-white/40 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <WhatsAppIcon className="w-4 h-4 text-slate-950" />
                <span>Kirim Booking via WhatsApp</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
