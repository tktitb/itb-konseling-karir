import React, { useState, useEffect } from "react"
import { X, Calendar, Clock, User, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react"
import { submitRegistration, checkWhatsAppRegistered, getSesiMeta, ENABLE_TKT_WAITING_LIST } from "../../services/tktService"
import { validateFullName, validateWhatsApp, validateEmail, validateAngkatan, sanitizeWhatsAppInput } from "../../utils/validationUtils"

export default function TktBookingModal({ isOpen, onClose, selectedSlot, onSuccess }) {
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [waWarning, setWaWarning] = useState("")

  const [formData, setFormData] = useState({
    nama_lengkap: "",
    email: "",
    nomor_wa: "",
    status_mhs: "Mahasiswa Aktif ITB",
    asal_univ_select: "Institut Teknologi Bandung",
    asal_univ_lain: "",
    jurusan: "",
    angkatan: "",
    is_member_itbcc: "true",
    harapan_sesi: "Konsultasi Karier",
    detail_harapan: ""
  })

  useEffect(() => {
    if (isOpen) {
      setErrors({})
      setWaWarning("")
    }
  }, [isOpen])

  if (!isOpen || !selectedSlot) return null

  const isWaitingList = ENABLE_TKT_WAITING_LIST && Boolean(selectedSlot.isWaitingList)
  const sesiMeta = getSesiMeta(selectedSlot.sesi)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === "status_mhs") {
      if (value === "Mahasiswa Aktif ITB" || value === "Alumni ITB") {
        setFormData((prev) => ({
          ...prev,
          status_mhs: value,
          asal_univ_select: "Institut Teknologi Bandung",
          asal_univ_lain: ""
        }))
        setErrors((prev) => ({ ...prev, status_mhs: null, asal_univ_lain: null }))
        return
      }
      if (value === "Mahasiswa Non-ITB" || value === "Alumni Non-ITB") {
        setFormData((prev) => ({
          ...prev,
          status_mhs: value,
          asal_univ_select: "Perguruan Tinggi Lain"
        }))
        setErrors((prev) => ({ ...prev, status_mhs: null }))
        return
      }
    }
    const nextValue = name === "nomor_wa" ? sanitizeWhatsAppInput(value) : value
    setFormData((prev) => ({ ...prev, [name]: nextValue }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (name === "nomor_wa" && waWarning) {
      setWaWarning("")
    }
  }

  const handleWaBlur = async () => {
    const cleaned = sanitizeWhatsAppInput(formData.nomor_wa)
    if (!cleaned) return

    const phoneResult = validateWhatsApp(cleaned)
    if (!phoneResult.isValid) {
      setErrors((prev) => ({ ...prev, nomor_wa: phoneResult.error }))
      setWaWarning("")
      return
    }

    try {
      const check = await checkWhatsAppRegistered(cleaned)
      if (check.registered) {
        setWaWarning(
          ENABLE_TKT_WAITING_LIST
            ? "Nomor WhatsApp ini sudah terdaftar dalam jadwal/antrean konseling TKT."
            : "Nomor WhatsApp ini sudah terdaftar dalam jadwal konseling TKT."
        )
      } else {
        setWaWarning("")
      }
    } catch {
      setWaWarning("")
    }
  }

  const validateForm = () => {
    const newErrors = {}

    const nameResult = validateFullName(formData.nama_lengkap)
    if (!nameResult.isValid) {
      newErrors.nama_lengkap = nameResult.error
    }

    const phoneResult = validateWhatsApp(formData.nomor_wa)
    if (!phoneResult.isValid) {
      newErrors.nomor_wa = phoneResult.error
    }

    const emailResult = validateEmail(formData.email, true)
    if (!emailResult.isValid) {
      newErrors.email = emailResult.error
    }

    if (formData.asal_univ_select === "Perguruan Tinggi Lain") {
      const trimmedUniv = formData.asal_univ_lain.trim()
      const lowerUniv = trimmedUniv.toLowerCase()
      if (!trimmedUniv) {
        newErrors.asal_univ_lain = "Nama perguruan tinggi wajib diisi"
      } else if (
        (formData.status_mhs === "Mahasiswa Non-ITB" || formData.status_mhs === "Alumni Non-ITB") &&
        (lowerUniv === "itb" || lowerUniv === "institut teknologi bandung" || lowerUniv.includes("institut teknologi bandung"))
      ) {
        newErrors.asal_univ_lain = "Untuk status Non-ITB, silakan tuliskan nama perguruan tinggi selain ITB"
      }
    }

    if (!formData.jurusan.trim()) {
      newErrors.jurusan = "Program studi wajib diisi"
    }

    const angkatanResult = validateAngkatan(formData.angkatan, true)
    if (!angkatanResult.isValid) {
      newErrors.angkatan = angkatanResult.error
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    if (waWarning) {
      setErrors((prev) => ({
        ...prev,
        nomor_wa: "Nomor WhatsApp ini sudah terdaftar sebelumnya."
      }))
      return
    }

    setSubmitting(true)

    const payload = {
      nama_lengkap: formData.nama_lengkap.trim(),
      email: formData.email.trim().toLowerCase(),
      nomor_wa: formData.nomor_wa.trim(),
      status_mhs: formData.status_mhs,
      asal_univ:
        formData.asal_univ_select === "Perguruan Tinggi Lain"
          ? formData.asal_univ_lain.trim()
          : formData.asal_univ_select,
      jurusan: formData.jurusan.trim(),
      angkatan: formData.angkatan.trim(),
      is_member_itbcc: formData.is_member_itbcc === "true",
      jadwal_hari: selectedSlot.hari,
      jadwal_sesi: selectedSlot.sesi,
      psikolog_bertugas: selectedSlot.psikolog,
      psikolog_pilihan: selectedSlot.psikolog,
      harapan_sesi: formData.harapan_sesi,
      detail_harapan: formData.detail_harapan.trim()
    }

    try {
      const result = await submitRegistration(payload)
      if (result.success) {
        onSuccess({
          status: result.status,
          hari: result.hari || selectedSlot.hari,
          sesi: result.sesi || selectedSlot.sesi,
          psikolog: result.psikolog || selectedSlot.psikolog,
          nama: formData.nama_lengkap
        })
        onClose()
      } else {
        setErrors((prev) => ({
          ...prev,
          general: result.message || "Pendaftaran tidak dapat diproses."
        }))
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: err.message || "Terjadi kendala jaringan. Silakan coba kembali."
      }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl my-auto cursor-default"
      >
        <div className="liquid-neumorph-card rounded-3xl p-5 sm:p-7 md:p-8 border-t border-l border-white/25 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-brand-gold uppercase tracking-widest">
                {isWaitingList ? "Pendaftaran Waiting List" : "Konfirmasi Pendaftaran"}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                Konseling Karier TKT
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

          <div className="mb-6 p-4 rounded-2xl liquid-neumorph-inset border border-white/10 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span>Hari Kegiatan</span>
                </div>
                <p className="font-semibold text-white leading-snug">{selectedSlot.hari}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span>Jadwal Sesi</span>
                </div>
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-brand-gold/15 border border-brand-gold/30 text-brand-gold font-bold text-[11px] uppercase tracking-wider">
                    {sesiMeta.sesiLabel}
                  </span>
                  <span className="font-mono font-semibold text-white text-xs sm:text-sm">
                    {sesiMeta.compactTime} WIB
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  <User className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span>Psikolog</span>
                </div>
                <p className="font-semibold text-white leading-snug">{selectedSlot.psikolog}</p>
              </div>
            </div>

            {isWaitingList ? (
              <div className="pt-2.5 border-t border-white/10 flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Jadwal ini telah terisi. Anda mendaftar ke antrean <strong className="text-white">Waiting List</strong> dan akan dipanggil apabila peserta yang terjadwal tidak hadir saat acara berlangsung.
                </p>
              </div>
            ) : (
              <div className="pt-2.5 border-t border-white/10 flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Kuota sesi ini masih tersedia untuk pendaftaran utama.</span>
              </div>
            )}
          </div>

          {errors.general && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                Nama Lengkap <span className="text-amber-400 ml-0.5">*</span>
              </label>
              <input
                type="text"
                name="nama_lengkap"
                value={formData.nama_lengkap}
                onChange={handleInputChange}
                placeholder="Contoh: Budi Pratama"
                className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                  errors.nama_lengkap ? "border border-rose-500/60" : "border border-white/10"
                }`}
              />
              {errors.nama_lengkap && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.nama_lengkap}</span>
                </p>
              )}
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
                  name="nomor_wa"
                  value={formData.nomor_wa}
                  onChange={handleInputChange}
                  onBlur={handleWaBlur}
                  placeholder="Contoh: 081234567890"
                  className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                    errors.nomor_wa || waWarning ? "border border-rose-500/60" : "border border-white/10"
                  }`}
                />
                {errors.nomor_wa && (
                  <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.nomor_wa}</span>
                  </p>
                )}
                {waWarning && !errors.nomor_wa && (
                  <p className="mt-1.5 text-xs text-amber-400 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{waWarning}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                  Email <span className="text-amber-400 ml-0.5">*</span>
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="nama@email.com"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                  Status Peserta <span className="text-amber-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <select
                    name="status_mhs"
                    value={formData.status_mhs}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 pr-9 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Mahasiswa Aktif ITB" className="bg-[#0b1a27] text-slate-100">Mahasiswa Aktif ITB</option>
                    <option value="Alumni ITB" className="bg-[#0b1a27] text-slate-100">Alumni ITB</option>
                    <option value="Mahasiswa Non-ITB" className="bg-[#0b1a27] text-slate-100">Mahasiswa Non-ITB</option>
                    <option value="Alumni Non-ITB" className="bg-[#0b1a27] text-slate-100">Alumni Non-ITB</option>
                    <option value="Umum" className="bg-[#0b1a27] text-slate-100">Umum</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                  Asal Perguruan Tinggi <span className="text-amber-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <select
                    name="asal_univ_select"
                    value={formData.asal_univ_select}
                    onChange={handleInputChange}
                    disabled={formData.status_mhs !== "Umum"}
                    className={`w-full px-4 py-2.5 pr-9 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all appearance-none ${
                      formData.status_mhs !== "Umum" ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <option value="Institut Teknologi Bandung" className="bg-[#0b1a27] text-slate-100">Institut Teknologi Bandung</option>
                    <option value="Perguruan Tinggi Lain" className="bg-[#0b1a27] text-slate-100">Perguruan Tinggi Lain</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {formData.asal_univ_select === "Perguruan Tinggi Lain" && (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                  Nama Perguruan Tinggi <span className="text-amber-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  name="asal_univ_lain"
                  value={formData.asal_univ_lain}
                  onChange={handleInputChange}
                  placeholder="Tuliskan nama perguruan tinggi Anda"
                  className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                    errors.asal_univ_lain ? "border border-rose-500/60" : "border border-white/10"
                  }`}
                />
                {errors.asal_univ_lain && (
                  <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.asal_univ_lain}</span>
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                  Program Studi / Jurusan <span className="text-amber-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  name="jurusan"
                  value={formData.jurusan}
                  onChange={handleInputChange}
                  placeholder="Contoh: Teknik Informatika"
                  className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                    errors.jurusan ? "border border-rose-500/60" : "border border-white/10"
                  }`}
                />
                {errors.jurusan && (
                  <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.jurusan}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                  Tahun Angkatan <span className="text-amber-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  name="angkatan"
                  value={formData.angkatan}
                  onChange={handleInputChange}
                  placeholder="Contoh: 2022"
                  className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                    errors.angkatan ? "border border-rose-500/60" : "border border-white/10"
                  }`}
                />
                {errors.angkatan && (
                  <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.angkatan}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                  Status Member ITB Career Center <span className="text-amber-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <select
                    name="is_member_itbcc"
                    value={formData.is_member_itbcc}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 pr-9 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all appearance-none cursor-pointer"
                  >
                    <option value="true" className="bg-[#0b1a27] text-slate-100">Sudah Menjadi Member</option>
                    <option value="false" className="bg-[#0b1a27] text-slate-100">Belum Menjadi Member</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                  Topik Konsultasi <span className="text-amber-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <select
                    name="harapan_sesi"
                    value={formData.harapan_sesi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 pr-9 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Konsultasi Karier" className="bg-[#0b1a27] text-slate-100">Konsultasi Karier</option>
                    <option value="Review CV & Portofolio" className="bg-[#0b1a27] text-slate-100">Review CV & Portofolio</option>
                    <option value="Persiapan Wawancara Kerja" className="bg-[#0b1a27] text-slate-100">Persiapan Wawancara Kerja</option>
                    <option value="Perencanaan Studi Lanjut" className="bg-[#0b1a27] text-slate-100">Perencanaan Studi Lanjut</option>
                    <option value="Lainnya" className="bg-[#0b1a27] text-slate-100">Lainnya</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                name="detail_harapan"
                rows="2"
                value={formData.detail_harapan}
                onChange={handleInputChange}
                placeholder="Tuliskan poin spesifik yang ingin didiskusikan..."
                className="w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all resize-none"
              />
            </div>

            <div className="pt-5 border-t border-white/10 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl liquid-neumorph-inset text-xs sm:text-sm font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all active:scale-95 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting || Boolean(waWarning)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-[#dda853] to-[#c99440] hover:from-[#e5b360] hover:to-[#d49f4c] border-t border-white/40 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>
                  {submitting
                    ? "Memproses..."
                    : isWaitingList
                    ? "Daftar Waiting List"
                    : "Daftar Jadwal Ini"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
