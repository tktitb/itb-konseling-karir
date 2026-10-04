import React, { useState } from "react"
import { X, Calendar, Video, Building2, Send, AlertCircle, ShieldCheck } from "lucide-react"
import { APP_CONFIG, PSYCHOLOGISTS } from "../../constants/config"
import { formatDatetimeText } from "../../utils/timeUtils"

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

    if (!nama.trim()) {
      newErrors.nama = "Nama lengkap wajib diisi"
    }

    if (!phone.trim()) {
      newErrors.phone = "Nomor WhatsApp wajib diisi"
    } else if (!/^[0-9+]{9,16}$/.test(phone.replace(/[\s-]/g, ""))) {
      newErrors.phone = "Format nomor WhatsApp tidak valid (contoh: 08123456789)"
    }

    if (!email.trim()) {
      newErrors.email = "Email wajib diisi"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Format email tidak valid (contoh: nama@itb.ac.id)"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const messageLines = [
      "Halo, saya ingin mendaftar konseling karier. Berikut data saya:",
      `Nama Lengkap: ${nama.trim()}`,
      `Sesi Konseling: ${modeText}`,
      `Kategori Peserta: ${kategori}`,
      `Psikolog: ${currentPsychFull}`,
      `Hari & Waktu Konseling: ${datetimeText}`,
      `No. HP (WhatsApp): ${phone.trim()}`,
      `Email: ${email.trim()}`
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl my-8 cursor-default"
      >
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div>
              <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">
                Konfirmasi Booking
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Formulir Pendaftaran Konseling
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 mb-6 text-xs sm:text-sm text-slate-200">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Jadwal: </span>
                <span className="text-slate-200">{datetimeText}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              {slot.mode?.toLowerCase() === "online" ? (
                <Video className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              ) : (
                <Building2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold text-white">Sesi: </span>
                <span className="text-slate-200">{modeText}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Psikolog: </span>
                <span className="text-slate-200">{currentPsychFull}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-gold uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => {
                  setNama(e.target.value)
                  if (errors.nama) setErrors({ ...errors, nama: null })
                }}
                placeholder="Contoh: Andi Surya Putra"
                className="liquid-input w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900/80 border border-white/15 focus:border-brand-gold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Sesuai KTP atau kartu mahasiswa ITB.
              </span>
              {errors.nama && (
                <span className="text-xs text-rose-400 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.nama}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-gold uppercase tracking-wider mb-1.5">
                  Kategori Peserta
                </label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="liquid-input w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900/80 border border-white/15 focus:border-brand-gold"
                >
                  <option value="Mahasiswa ITB" className="bg-slate-900 text-white">Mahasiswa ITB</option>
                  <option value="Alumni ITB" className="bg-slate-900 text-white">Alumni ITB</option>
                  <option value="Mahasiswa Non-ITB" className="bg-slate-900 text-white">Mahasiswa Non-ITB</option>
                  <option value="Alumni Non-ITB" className="bg-slate-900 text-white">Alumni Non-ITB</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-gold uppercase tracking-wider mb-1.5">
                  Pilihan Psikolog
                </label>
                {availablePsychs.length > 1 ? (
                  <select
                    value={selectedPsych || slot.psychologist}
                    onChange={(e) => setSelectedPsych(e.target.value)}
                    className="liquid-input w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900/80 border border-white/15 focus:border-brand-gold"
                  >
                    {availablePsychs.map((psych) => (
                      <option key={psych} value={psych} className="bg-slate-900 text-white">
                        {getPsychFullName(psych)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    readOnly
                    value={currentPsychFull}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-slate-300 cursor-not-allowed font-medium"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-gold uppercase tracking-wider mb-1.5">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (errors.phone) setErrors({ ...errors, phone: null })
                  }}
                  placeholder="08xxxxxxxxxx"
                  className="liquid-input w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900/80 border border-white/15 focus:border-brand-gold"
                />
                {errors.phone && (
                  <span className="text-xs text-rose-400 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-gold uppercase tracking-wider mb-1.5">
                  Email Aktif
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors({ ...errors, email: null })
                  }}
                  placeholder="nama@domain.com"
                  className="liquid-input w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900/80 border border-white/15 focus:border-brand-gold"
                />
                {errors.email && (
                  <span className="text-xs text-rose-400 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-700/90 border border-white/20 hover:border-white/30 shadow-md active:scale-95 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="liquid-btn-gold w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-xl active:scale-98"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Booking via WhatsApp</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
