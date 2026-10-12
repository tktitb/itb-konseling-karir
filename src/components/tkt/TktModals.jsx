import React, { useState, useEffect } from "react"
import {
  X,
  User,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Trash2,
  Edit3,
  FileText,
  UserPlus,
  ChevronDown,
  Loader2,
  Copy,
  Check
} from "lucide-react"
import WhatsAppIcon from "../common/WhatsAppIcon"
import { validateFullName, validateWhatsApp, validateEmail, validateAngkatan, sanitizeWhatsAppInput, formatWhatsAppDisplay } from "../../utils/validationUtils"
import {
  buildWhatsAppText,
  normalizeWhatsAppNumber,
  checkWhatsAppRegistered,
  SESI_TKT_META,
  formatSesiCompact,
  ENABLE_TKT_WAITING_LIST,
  getDefaultWaTemplateKey
} from "../../services/tktService"

export function TktDetailModal({ isOpen, onClose, participant, getWaLink, onEdit, onOpenWhatsApp }) {
  const [copiedPhone, setCopiedPhone] = useState(false)

  if (!isOpen || !participant) return null

  const handleCopyPhone = () => {
    if (!participant.nomor_wa) return
    navigator.clipboard.writeText(participant.nomor_wa)
    setCopiedPhone(true)
    setTimeout(() => setCopiedPhone(false), 2000)
  }

  const waTemplateKey = getDefaultWaTemplateKey(participant.status_peserta)

  const waUrl = getWaLink ? getWaLink(waTemplateKey, participant) : ""

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return {
          label: "Confirmed (Siap)",
          cls: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30"
        }
      case "HADIR":
        return {
          label: "Hadir di Booth",
          cls: "bg-amber-500/15 text-amber-300 border-amber-400/30"
        }
      case "SELESAI_FULL":
        return {
          label: "Selesai & Feedback",
          cls: "bg-blue-500/15 text-blue-300 border-blue-400/30"
        }
      case "DAPAT_SESI":
        return {
          label: "Dapat Sesi",
          cls: "bg-sky-500/15 text-sky-300 border-sky-400/30"
        }
      case "WAITING_LIST":
        return {
          label: "Waiting List",
          cls: "bg-orange-500/15 text-orange-300 border-orange-400/30"
        }
      case "BATAL":
        return {
          label: "Batal / Ditolak",
          cls: "bg-rose-500/15 text-rose-300 border-rose-400/30"
        }
      default:
        return {
          label: status || "Belum Ditentukan",
          cls: "bg-slate-700/40 text-slate-300 border-slate-600/40"
        }
    }
  }

  const statusBadge = getStatusBadge(participant.status_peserta)

  const formattedDate = participant.created_at
    ? new Date(participant.created_at).toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }) + " WIB"
    : "-"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050b14]/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl p-6 sm:p-8 liquid-neumorph-card border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl liquid-neumorph-inset text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl liquid-neumorph-inset border border-white/15 flex items-center justify-center text-brand-gold font-bold text-2xl shadow-inner shrink-0">
            {participant.nama_lengkap?.charAt(0)?.toUpperCase() || "P"}
          </div>
          <div className="pr-10">
            <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {participant.nama_lengkap}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${statusBadge.cls}`}
              >
                {statusBadge.label}
              </span>
              {participant.is_member_itbcc && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-gold" />
                  <span>Member ITB CC</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-200 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl liquid-neumorph-inset border border-white/10 space-y-2.5">
              <div className="text-[11px] font-bold text-brand-gold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Identitas & Kontak</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Nomor WhatsApp:</span>
                <div className="flex items-center gap-1.5 font-medium text-white">
                  <span>{participant.nomor_wa || "-"}</span>
                  {participant.nomor_wa && (
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      title="Salin Nomor WhatsApp"
                      className="p-1 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedPhone ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Email:</span>
                <span className="font-medium text-white truncate max-w-[200px]" title={participant.email}>
                  {participant.email || "-"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Universitas:</span>
                <span className="font-medium text-white truncate max-w-[200px]" title={participant.asal_univ}>
                  {participant.asal_univ || "-"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Status Mhs:</span>
                <span className="font-medium text-white">{participant.status_mhs || "-"}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Prodi / Angkatan:</span>
                <span className="font-medium text-white">
                  {participant.jurusan || "-"} {participant.angkatan ? `(${participant.angkatan})` : ""}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl liquid-neumorph-inset border border-white/10 space-y-2.5">
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Jadwal & Konselor</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Hari & Tanggal:</span>
                <span className="font-semibold text-white">{participant.jadwal_hari || "-"}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Sesi Waktu:</span>
                <span className="font-semibold text-brand-gold font-mono">
                  {participant.jadwal_sesi ? formatSesiCompact(participant.jadwal_sesi) : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Psikolog Bertugas:</span>
                <span className="font-semibold text-white truncate max-w-[180px]" title={participant.psikolog_bertugas}>
                  {participant.psikolog_bertugas || "Menunggu Antrean"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Status Member:</span>
                <span className={`font-semibold ${participant.is_member_itbcc ? "text-emerald-400" : "text-slate-400"}`}>
                  {participant.is_member_itbcc ? "Member Aktif ITB CC" : "Non-Member"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl liquid-neumorph-inset border border-white/10 space-y-2">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Fokus & Catatan Konsultasi</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-white/5">
              <span className="text-slate-400">Pilihan Fokus Sesi:</span>
              <span className="font-semibold text-white">{participant.harapan_sesi || "-"}</span>
            </div>
            {participant.detail_harapan && (
              <div className="pt-1.5">
                <span className="text-slate-400 block mb-1">Catatan Tambahan Peserta:</span>
                <p className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-slate-200 italic leading-relaxed">
                  "{participant.detail_harapan}"
                </p>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-2xl liquid-neumorph-inset border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Waktu Mendaftar: <strong className="text-slate-200">{formattedDate}</strong></span>
            <span>ID: <code className="text-brand-gold font-mono">{participant.id}</code></span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="liquid-neumorph-inset px-4 py-2.5 rounded-xl text-slate-300 hover:text-white font-semibold text-xs cursor-pointer transition-colors border border-white/10 active:scale-95"
          >
            Tutup Pratinjau
          </button>

          <div className="flex items-center gap-2.5">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(participant)}
                className="liquid-neumorph-btn px-4 py-2.5 rounded-xl text-amber-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 border border-amber-400/30 hover:border-amber-400/60 bg-amber-500/10 transition-all cursor-pointer active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Data</span>
              </button>
            )}

            {onOpenWhatsApp ? (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenWhatsApp(participant)
                }}
                className="liquid-neumorph-btn px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 bg-emerald-600/85 hover:bg-emerald-500 border border-emerald-400/40 shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Pilih Template & Kirim WA</span>
              </button>
            ) : waUrl ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="liquid-neumorph-btn px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 bg-emerald-600/85 hover:bg-emerald-500 border border-emerald-400/40 shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>
                  {participant.status_peserta === "HADIR" || participant.status_peserta === "SELESAI_FULL"
                    ? "Kirim Permintaan Feedback"
                    : participant.status_peserta === "CONFIRMED"
                    ? "Kirim Reminder Jadwal"
                    : participant.status_peserta === "WAITING_LIST"
                    ? "Kirim Info Waiting List"
                    : "Kirim Konfirmasi Sesi"}
                </span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

const STANDARD_HARAPAN_OPTIONS = [
  "Konsultasi Karier",
  "Review CV & Portofolio",
  "Persiapan Wawancara Kerja",
  "Perencanaan Studi Lanjut",
  "Lainnya"
]

export function TktWalkInModal({ isOpen, onClose, onSave, dates, psikologList }) {
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
    jadwal_hari: dates && dates.length > 0 ? dates[0] : "",
    jadwal_sesi: "09.00-09.45",
    psikolog_bertugas: psikologList && psikologList.length > 0 ? psikologList[0] : "Psikolog 1",
    status_peserta: "CONFIRMED",
    harapan_sesi: "Konsultasi Karier",
    detail_harapan: ""
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingConfirm, setPendingConfirm] = useState(null)

  useEffect(() => {
    if (dates && dates.length > 0 && !formData.jadwal_hari) {
      setFormData((prev) => ({ ...prev, jadwal_hari: dates[0] }))
    }
  }, [dates, formData.jadwal_hari])

  useEffect(() => {
    if (psikologList && psikologList.length > 0 && !formData.psikolog_bertugas) {
      setFormData((prev) => ({ ...prev, psikolog_bertugas: psikologList[0] }))
    }
  }, [psikologList, formData.psikolog_bertugas])

  useEffect(() => {
    if (isOpen) {
      setErrors({})
      setPendingConfirm(null)
    }
  }, [isOpen])

  if (!isOpen) return null

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
  }

  const handleWaBlur = async () => {
    const cleaned = sanitizeWhatsAppInput(formData.nomor_wa)
    if (!cleaned) return
    const phoneResult = validateWhatsApp(cleaned)
    if (!phoneResult.isValid) {
      setErrors((prev) => ({ ...prev, nomor_wa: phoneResult.error }))
      return
    }
    const waCheck = await checkWhatsAppRegistered(cleaned, dates)
    if (waCheck.registered) {
      setErrors((prev) => ({
        ...prev,
        nomor_wa: "Nomor WhatsApp ini sudah terdaftar pada jadwal konseling TKT aktif."
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    const newErrors = {}
    const nameResult = validateFullName(formData.nama_lengkap)
    if (!nameResult.isValid) {
      newErrors.nama_lengkap = nameResult.error
    }

    const phoneResult = validateWhatsApp(formData.nomor_wa)
    if (!phoneResult.isValid) {
      newErrors.nomor_wa = phoneResult.error
    }

    const emailResult = validateEmail(formData.email, false)
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const waCheck = await checkWhatsAppRegistered(phoneResult.cleanValue, dates)
      if (waCheck.registered) {
        setErrors((prev) => ({
          ...prev,
          nomor_wa: "Nomor WhatsApp ini sudah terdaftar pada jadwal konseling TKT aktif."
        }))
        return
      }
    } finally {
      setIsSubmitting(false)
    }

    const finalAsalUniv =
      formData.asal_univ_select === "Perguruan Tinggi Lain"
        ? formData.asal_univ_lain.trim()
        : formData.asal_univ_select

    setPendingConfirm({
      nama_lengkap: nameResult.cleanValue,
      email: (emailResult.cleanValue || "").trim().toLowerCase(),
      nomor_wa: phoneResult.cleanValue,
      status_mhs: formData.status_mhs,
      asal_univ: finalAsalUniv,
      jurusan: formData.jurusan.trim(),
      angkatan: formData.angkatan.trim(),
      is_member_itbcc: formData.is_member_itbcc === "true" || formData.is_member_itbcc === true,
      jadwal_hari: formData.jadwal_hari,
      jadwal_sesi: formData.jadwal_sesi,
      psikolog_bertugas: formData.psikolog_bertugas,
      psikolog_pilihan: formData.psikolog_bertugas,
      status_peserta: formData.status_peserta,
      harapan_sesi: formData.harapan_sesi,
      detail_harapan: (formData.detail_harapan || "").trim()
    })
  }

  const handleFinalSave = async () => {
    if (!pendingConfirm || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onSave(pendingConfirm)
      setPendingConfirm(null)
      setFormData({
        nama_lengkap: "",
        email: "",
        nomor_wa: "",
        status_mhs: "Mahasiswa Aktif ITB",
        asal_univ_select: "Institut Teknologi Bandung",
        asal_univ_lain: "",
        jurusan: "",
        angkatan: "",
        is_member_itbcc: "true",
        jadwal_hari: dates && dates.length > 0 ? dates[0] : "",
        jadwal_sesi: "09.00-09.45",
        psikolog_bertugas: psikologList && psikologList.length > 0 ? psikologList[0] : "Psikolog 1",
        status_peserta: "CONFIRMED",
        harapan_sesi: "Konsultasi Karier",
        detail_harapan: ""
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl my-auto rounded-3xl p-5 sm:p-7 md:p-8 liquid-neumorph-card border-t border-l border-white/25 shadow-2xl overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-brand-gold uppercase tracking-widest">
              Pendaftaran Walk-In / Manual
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              Tambah Peserta Konseling TKT
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl liquid-neumorph-inset text-slate-300 hover:text-white border border-white/10 hover:border-white/20 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left max-h-[70vh] overflow-y-auto pr-1">
          <div className="p-4 rounded-2xl liquid-neumorph-inset border border-white/10 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span>Hari Kegiatan</span>
                </label>
                <div className="relative">
                  <select
                    name="jadwal_hari"
                    value={formData.jadwal_hari}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-8 text-xs sm:text-sm font-medium rounded-xl liquid-neumorph-inset border border-white/10 text-white bg-[#091726]/85 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 appearance-none cursor-pointer transition-all"
                  >
                    {dates && dates.map((d) => (
                      <option key={d} value={d} className="bg-[#0b1a27] text-slate-100">
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span>Jadwal Sesi</span>
                </label>
                <div className="relative">
                  <select
                    name="jadwal_sesi"
                    value={formData.jadwal_sesi}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-8 text-xs sm:text-sm font-medium rounded-xl liquid-neumorph-inset border border-white/10 text-white bg-[#091726]/85 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 appearance-none cursor-pointer transition-all"
                  >
                    {SESI_TKT_META.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#0b1a27] text-slate-100">
                        {s.compactLabel}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  <User className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span>Psikolog</span>
                </label>
                <div className="relative">
                  <select
                    name="psikolog_bertugas"
                    value={formData.psikolog_bertugas}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-8 text-xs sm:text-sm font-medium rounded-xl liquid-neumorph-inset border border-white/10 text-white bg-[#091726]/85 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 appearance-none cursor-pointer transition-all truncate"
                  >
                    {psikologList && psikologList.map((p) => (
                      <option key={p} value={p} className="bg-[#0b1a27] text-slate-100">
                        {p}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Status Kehadiran / Pendaftaran Awal:</span>
              </span>
              <div className="relative sm:w-64">
                <select
                  name="status_peserta"
                  value={formData.status_peserta}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 pr-8 text-xs font-semibold rounded-xl liquid-neumorph-inset border border-white/10 text-emerald-300 bg-[#091726]/85 focus:outline-none focus:border-brand-gold/60 appearance-none cursor-pointer transition-all"
                >
                  <option value="CONFIRMED" className="bg-[#0b1a27] text-emerald-300">CONFIRMED (Langsung Siap)</option>
                  <option value="HADIR" className="bg-[#0b1a27] text-amber-300">HADIR (Di Booth Sekarang)</option>
                  <option value="DAPAT_SESI" className="bg-[#0b1a27] text-sky-300">DAPAT SESI</option>
                  {ENABLE_TKT_WAITING_LIST && (
                    <option value="WAITING_LIST" className="bg-[#0b1a27] text-amber-300">WAITING LIST</option>
                  )}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

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
              <p className="mt-1.5 text-xs text-rose-400 font-medium">
                {errors.nama_lengkap}
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
                  errors.nomor_wa ? "border border-rose-500/60" : "border border-white/10"
                }`}
              />
              {errors.nomor_wa && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium">
                  {errors.nomor_wa}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                Email
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
                <p className="mt-1.5 text-xs text-rose-400 font-medium">
                  {errors.email}
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
                placeholder="Tuliskan nama perguruan tinggi peserta"
                className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                  errors.asal_univ_lain ? "border border-rose-500/60" : "border border-white/10"
                }`}
              />
              {errors.asal_univ_lain && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium">
                  {errors.asal_univ_lain}
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
                <p className="mt-1.5 text-xs text-rose-400 font-medium">
                  {errors.jurusan}
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
                <p className="mt-1.5 text-xs text-rose-400 font-medium">
                  {errors.angkatan}
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
                  value={String(formData.is_member_itbcc)}
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
                  {STANDARD_HARAPAN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#0b1a27] text-slate-100">
                      {opt}
                    </option>
                  ))}
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
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl liquid-neumorph-inset text-xs sm:text-sm font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-[#dda853] to-[#c99440] hover:from-[#e5b360] hover:to-[#d49f4c] border-t border-white/40 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-slate-950" />
              <span>Simpan & Daftarkan</span>
            </button>
          </div>
        </form>

        {pendingConfirm && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-[#050b14]/90 backdrop-blur-md rounded-3xl animate-fadeIn">
            <div className="w-full max-w-md p-6 rounded-3xl liquid-neumorph-card border border-brand-gold/30 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-brand-gold shrink-0">
                  <AlertTriangle className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Konfirmasi Pendaftaran Walk-In</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Pastikan data pendaftaran peserta sudah sesuai.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl liquid-neumorph-inset border border-white/10 space-y-2 text-xs text-slate-200">
                <div className="flex justify-between py-0.5 border-b border-white/5">
                  <span className="text-slate-400">Nama:</span>
                  <span className="font-bold text-white">{pendingConfirm.nama_lengkap}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-white/5">
                  <span className="text-slate-400">WhatsApp:</span>
                  <span className="font-mono text-emerald-300">{pendingConfirm.nomor_wa}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-white/5">
                  <span className="text-slate-400">Status / Univ:</span>
                  <span className="font-semibold text-white text-right">{pendingConfirm.status_mhs} • {pendingConfirm.asal_univ}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-white/5">
                  <span className="text-slate-400">Jadwal & Sesi:</span>
                  <span className="font-semibold text-brand-gold font-mono">{pendingConfirm.jadwal_hari} • {formatSesiCompact(pendingConfirm.jadwal_sesi)}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-white/5">
                  <span className="text-slate-400">Psikolog:</span>
                  <span className="font-semibold text-white">{pendingConfirm.psikolog_bertugas}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Status Masuk:</span>
                  <span className="font-bold text-emerald-300">{pendingConfirm.status_peserta}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setPendingConfirm(null)}
                  disabled={isSubmitting}
                  className="liquid-neumorph-inset px-4 py-2.5 rounded-xl text-slate-300 hover:text-white font-semibold text-xs cursor-pointer transition-colors border border-white/10 active:scale-95 disabled:opacity-50"
                >
                  Periksa Kembali
                </button>
                <button
                  type="button"
                  onClick={handleFinalSave}
                  disabled={isSubmitting}
                  className="liquid-btn-gold px-5 py-2.5 rounded-xl text-[#07131e] font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#07131e]" />
                      <span>Mendaftarkan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#07131e]" />
                      <span>Ya, Daftarkan Peserta</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function TktEditModal({ isOpen, onClose, onSave, participant, dates, psikologList }) {
  const [formData, setFormData] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingConfirm, setPendingConfirm] = useState(null)

  useEffect(() => {
    if (participant) {
      const rawStatusMhs = participant.status_mhs || "Mahasiswa Aktif ITB"
      const rawAsalUniv = participant.asal_univ || "Institut Teknologi Bandung"
      const isItbStatus = rawStatusMhs === "Mahasiswa Aktif ITB" || rawStatusMhs === "Alumni ITB"
      const isNonItbStatus = rawStatusMhs === "Mahasiswa Non-ITB" || rawStatusMhs === "Alumni Non-ITB"
      const asalUnivSelect = isItbStatus
        ? "Institut Teknologi Bandung"
        : isNonItbStatus
        ? "Perguruan Tinggi Lain"
        : rawAsalUniv && rawAsalUniv !== "Institut Teknologi Bandung"
        ? "Perguruan Tinggi Lain"
        : "Institut Teknologi Bandung"
      const asalUnivLain =
        asalUnivSelect === "Perguruan Tinggi Lain" && rawAsalUniv !== "Institut Teknologi Bandung"
          ? rawAsalUniv
          : ""

      setFormData({
        id: participant.id,
        nama_lengkap: participant.nama_lengkap || "",
        email: participant.email || "",
        nomor_wa: formatWhatsAppDisplay(participant.nomor_wa || ""),
        status_mhs: rawStatusMhs,
        asal_univ_select: asalUnivSelect,
        asal_univ_lain: asalUnivLain,
        jurusan: participant.jurusan || "",
        angkatan: participant.angkatan ? String(participant.angkatan) : "",
        is_member_itbcc: participant.is_member_itbcc === false ? "false" : "true",
        jadwal_hari: participant.jadwal_hari || (dates && dates.length > 0 ? dates[0] : ""),
        jadwal_sesi: participant.jadwal_sesi || "09.00-09.45",
        psikolog_bertugas: participant.psikolog_bertugas || (psikologList && psikologList.length > 0 ? psikologList[0] : "Psikolog 1"),
        status_peserta: participant.status_peserta || "CONFIRMED",
        harapan_sesi: participant.harapan_sesi || "Konsultasi Karier",
        detail_harapan: participant.detail_harapan || ""
      })
      setErrors({})
      setPendingConfirm(null)
    }
  }, [participant, isOpen, dates, psikologList])

  if (!isOpen || !formData) return null

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === "nomor_wa") {
      const sanitizedWa = sanitizeWhatsAppInput(value)
      setFormData((prev) => ({ ...prev, nomor_wa: sanitizedWa }))
      if (errors.nomor_wa) {
        setErrors((prev) => ({ ...prev, nomor_wa: null }))
      }
      return
    }
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
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    const newErrors = {}
    const nameResult = validateFullName(formData.nama_lengkap)
    if (!nameResult.isValid) {
      newErrors.nama_lengkap = nameResult.error
    }

    const emailResult = validateEmail(formData.email, true)
    if (!emailResult.isValid) {
      newErrors.email = emailResult.error
    }

    const phoneResult = validateWhatsApp(formData.nomor_wa)
    if (!phoneResult.isValid) {
      newErrors.nomor_wa = phoneResult.error
    }

    if (formData.asal_univ_select === "Perguruan Tinggi Lain") {
      const trimmedUniv = (formData.asal_univ_lain || "").trim()
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

    if (!(formData.jurusan || "").trim()) {
      newErrors.jurusan = "Program studi wajib diisi"
    }

    const angkatanResult = validateAngkatan(String(formData.angkatan || ""), true)
    if (!angkatanResult.isValid) {
      newErrors.angkatan = angkatanResult.error
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const waDupCheck = await checkWhatsAppRegistered(phoneResult.cleanValue, dates, formData.id)
      if (waDupCheck.isRegistered) {
        setErrors({
          nomor_wa: "Nomor WhatsApp ini sudah terdaftar pada jadwal peserta lain di periode kegiatan ini."
        })
        return
      }
    } finally {
      setIsSubmitting(false)
    }

    const finalAsalUniv =
      formData.asal_univ_select === "Perguruan Tinggi Lain"
        ? formData.asal_univ_lain.trim()
        : formData.asal_univ_select

    setPendingConfirm({
      nama_lengkap: nameResult.cleanValue,
      email: formData.email.trim().toLowerCase(),
      nomor_wa: phoneResult.cleanValue,
      status_mhs: formData.status_mhs,
      asal_univ: finalAsalUniv,
      jurusan: formData.jurusan.trim(),
      angkatan: String(formData.angkatan).trim(),
      is_member_itbcc: formData.is_member_itbcc === "true" || formData.is_member_itbcc === true,
      jadwal_hari: formData.jadwal_hari,
      jadwal_sesi: formData.jadwal_sesi,
      psikolog_bertugas: formData.psikolog_bertugas,
      status_peserta: formData.status_peserta,
      harapan_sesi: formData.harapan_sesi,
      detail_harapan: (formData.detail_harapan || "").trim()
    })
  }

  const handleFinalUpdate = async () => {
    if (!pendingConfirm || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onSave(formData.id, pendingConfirm)
      setPendingConfirm(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const harapanOptions = STANDARD_HARAPAN_OPTIONS.includes(formData.harapan_sesi)
    ? STANDARD_HARAPAN_OPTIONS
    : [formData.harapan_sesi, ...STANDARD_HARAPAN_OPTIONS].filter(Boolean)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl my-auto rounded-3xl p-5 sm:p-7 md:p-8 liquid-neumorph-card border-t border-l border-white/25 shadow-2xl overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-brand-gold uppercase tracking-widest">
              Manajemen Data Peserta
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              Edit Data & Jadwal Peserta
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl liquid-neumorph-inset text-slate-300 hover:text-white border border-white/10 hover:border-white/20 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left max-h-[70vh] overflow-y-auto pr-1">
          <div className="p-4 rounded-2xl liquid-neumorph-inset border border-white/10 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span>Hari Kegiatan</span>
                </label>
                <div className="relative">
                  <select
                    name="jadwal_hari"
                    value={formData.jadwal_hari || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-8 text-xs sm:text-sm font-medium rounded-xl liquid-neumorph-inset border border-white/10 text-white bg-[#091726]/85 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 appearance-none cursor-pointer transition-all"
                  >
                    {dates && dates.map((d) => (
                      <option key={d} value={d} className="bg-[#0b1a27] text-slate-100">
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span>Jadwal Sesi</span>
                </label>
                <div className="relative">
                  <select
                    name="jadwal_sesi"
                    value={formData.jadwal_sesi || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-8 text-xs sm:text-sm font-medium rounded-xl liquid-neumorph-inset border border-white/10 text-white bg-[#091726]/85 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 appearance-none cursor-pointer transition-all"
                  >
                    {SESI_TKT_META.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#0b1a27] text-slate-100">
                        {s.compactLabel}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  <User className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span>Psikolog</span>
                </label>
                <div className="relative">
                  <select
                    name="psikolog_bertugas"
                    value={formData.psikolog_bertugas || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-8 text-xs sm:text-sm font-medium rounded-xl liquid-neumorph-inset border border-white/10 text-white bg-[#091726]/85 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 appearance-none cursor-pointer transition-all truncate"
                  >
                    {psikologList && psikologList.map((p) => (
                      <option key={p} value={p} className="bg-[#0b1a27] text-slate-100">
                        {p}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Status Kehadiran / Sesi Peserta:</span>
              </span>
              <div className="relative sm:w-64">
                <select
                  name="status_peserta"
                  value={formData.status_peserta || "CONFIRMED"}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 pr-8 text-xs font-semibold rounded-xl liquid-neumorph-inset border border-white/10 text-amber-300 bg-[#091726]/85 focus:outline-none focus:border-brand-gold/60 appearance-none cursor-pointer transition-all"
                >
                  <option value="DAPAT_SESI" className="bg-[#0b1a27] text-sky-300">DAPAT SESI</option>
                  <option value="CONFIRMED" className="bg-[#0b1a27] text-emerald-300">CONFIRMED (Terkonfirmasi)</option>
                  <option value="HADIR" className="bg-[#0b1a27] text-amber-300">HADIR (Di Booth)</option>
                  <option value="SELESAI_FULL" className="bg-[#0b1a27] text-blue-300">SELESAI FULL (Selesai & Feedback)</option>
                  {ENABLE_TKT_WAITING_LIST && (
                    <option value="WAITING_LIST" className="bg-[#0b1a27] text-orange-300">WAITING LIST</option>
                  )}
                  <option value="BATAL" className="bg-[#0b1a27] text-rose-300">BATAL / DITOLAK</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
              Nama Lengkap <span className="text-amber-400 ml-0.5">*</span>
            </label>
            <input
              type="text"
              name="nama_lengkap"
              value={formData.nama_lengkap || ""}
              onChange={handleInputChange}
              placeholder="Contoh: Budi Pratama"
              className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                errors.nama_lengkap ? "border border-rose-500/60" : "border border-white/10"
              }`}
            />
            {errors.nama_lengkap && (
              <p className="mt-1.5 text-xs text-rose-400 font-medium">
                {errors.nama_lengkap}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                Email <span className="text-amber-400 ml-0.5">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                placeholder="nama@email.com"
                className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                  errors.email ? "border border-rose-500/60" : "border border-white/10"
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

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
                value={formData.nomor_wa || ""}
                onChange={handleInputChange}
                placeholder="081234567890"
                className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                  errors.nomor_wa ? "border border-rose-500/60" : "border border-white/10"
                }`}
              />
              {errors.nomor_wa && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium">
                  {errors.nomor_wa}
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
                  value={formData.status_mhs || "Mahasiswa Aktif ITB"}
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
                  value={formData.asal_univ_select || "Institut Teknologi Bandung"}
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
                value={formData.asal_univ_lain || ""}
                onChange={handleInputChange}
                placeholder="Tuliskan nama perguruan tinggi peserta"
                className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                  errors.asal_univ_lain ? "border border-rose-500/60" : "border border-white/10"
                }`}
              />
              {errors.asal_univ_lain && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium">
                  {errors.asal_univ_lain}
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
                value={formData.jurusan || ""}
                onChange={handleInputChange}
                placeholder="Contoh: Teknik Informatika"
                className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                  errors.jurusan ? "border border-rose-500/60" : "border border-white/10"
                }`}
              />
              {errors.jurusan && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium">
                  {errors.jurusan}
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
                value={formData.angkatan || ""}
                onChange={handleInputChange}
                placeholder="Contoh: 2022"
                className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                  errors.angkatan ? "border border-rose-500/60" : "border border-white/10"
                }`}
              />
              {errors.angkatan && (
                <p className="mt-1.5 text-xs text-rose-400 font-medium">
                  {errors.angkatan}
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
                  value={String(formData.is_member_itbcc)}
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
                  value={formData.harapan_sesi || "Konsultasi Karier"}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 pr-9 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all appearance-none cursor-pointer"
                >
                  {harapanOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#0b1a27] text-slate-100">
                      {opt}
                    </option>
                  ))}
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
              value={formData.detail_harapan || ""}
              onChange={handleInputChange}
              placeholder="Tuliskan poin spesifik yang ingin didiskusikan..."
              className="w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all resize-none"
            />
          </div>

          <div className="pt-5 border-t border-white/10 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl liquid-neumorph-inset text-xs sm:text-sm font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-[#dda853] to-[#c99440] hover:from-[#e5b360] hover:to-[#d49f4c] border-t border-white/40 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-slate-950" />
              <span>Perbarui Data</span>
            </button>
          </div>
        </form>

        {pendingConfirm && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-[#050b14]/90 backdrop-blur-md rounded-3xl animate-fadeIn">
            <div className="w-full max-w-md p-6 rounded-3xl liquid-neumorph-card border border-brand-gold/30 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-brand-gold shrink-0">
                  <AlertTriangle className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Konfirmasi Perubahan Data</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Pastikan pembaruan data peserta sudah sesuai.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl liquid-neumorph-inset border border-white/10 space-y-2 text-xs text-slate-200">
                <div className="flex justify-between py-0.5 border-b border-white/5">
                  <span className="text-slate-400">Nama:</span>
                  <span className="font-bold text-white">{pendingConfirm.nama_lengkap}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-white/5">
                  <span className="text-slate-400">WhatsApp:</span>
                  <span className="font-mono text-emerald-300">{pendingConfirm.nomor_wa}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-white/5">
                  <span className="text-slate-400">Status / Univ:</span>
                  <span className="font-semibold text-white text-right">{pendingConfirm.status_mhs} • {pendingConfirm.asal_univ}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-white/5">
                  <span className="text-slate-400">Jadwal & Sesi:</span>
                  <span className="font-semibold text-brand-gold font-mono">{pendingConfirm.jadwal_hari} • {formatSesiCompact(pendingConfirm.jadwal_sesi)}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-white/5">
                  <span className="text-slate-400">Psikolog:</span>
                  <span className="font-semibold text-white">{pendingConfirm.psikolog_bertugas}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Status Peserta:</span>
                  <span className="font-bold text-amber-300">{pendingConfirm.status_peserta}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setPendingConfirm(null)}
                  disabled={isSubmitting}
                  className="liquid-neumorph-inset px-4 py-2.5 rounded-xl text-slate-300 hover:text-white font-semibold text-xs cursor-pointer transition-colors border border-white/10 active:scale-95 disabled:opacity-50"
                >
                  Periksa Kembali
                </button>
                <button
                  type="button"
                  onClick={handleFinalUpdate}
                  disabled={isSubmitting}
                  className="liquid-btn-gold px-5 py-2.5 rounded-xl text-[#07131e] font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#07131e]" />
                      <span>Memperbarui...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#07131e]" />
                      <span>Ya, Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function TktDeleteConfirmModal({ isOpen, onClose, onConfirm, participant }) {
  if (!isOpen || !participant) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050b14]/80 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 liquid-neumorph-card border border-rose-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-white mb-1.5">
          Hapus Data Peserta?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
          Tindakan ini akan menghapus peserta{" "}
          <strong className="text-white">{participant.nama_lengkap}</strong> dari jadwal TKT
          secara permanen.
        </p>

        <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="liquid-neumorph-inset px-4 py-2.5 rounded-xl text-slate-300 hover:text-white font-semibold text-xs cursor-pointer transition-colors border border-white/10 active:scale-95"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm(participant.id)}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg cursor-pointer transition-all border border-rose-400/40 active:scale-95"
          >
            Hapus Permanen
          </button>
        </div>
      </div>
    </div>
  )
}

export function TktWhatsAppModal({ isOpen, onClose, participant, config = {} }) {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState("wa_template_konfirmasi_sesi")
  const [customMessage, setCustomMessage] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const getRecommendedTemplateKey = (status) => {
    return getDefaultWaTemplateKey(status)
  }

  useEffect(() => {
    if (participant && isOpen) {
      const rec = getRecommendedTemplateKey(participant.status_peserta)
      setSelectedTemplateKey(rec)
      const text = buildWhatsAppText(participant, rec, config)
      setCustomMessage(text)
      setIsEditing(false)
      setIsCopied(false)
    }
  }, [participant, isOpen, config])

  if (!isOpen || !participant) return null

  const handleSelectTemplate = (key) => {
    setSelectedTemplateKey(key)
    const text = buildWhatsAppText(participant, key, config)
    setCustomMessage(text)
    setIsEditing(false)
  }

  const handleResetText = () => {
    const text = buildWhatsAppText(participant, selectedTemplateKey, config)
    setCustomMessage(text)
    setIsEditing(false)
  }

  const handleCopyMessage = () => {
    if (!customMessage) return
    navigator.clipboard.writeText(customMessage)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleSendWhatsApp = () => {
    const cleanWa = normalizeWhatsAppNumber(participant.nomor_wa || "")
    if (!cleanWa) return
    const url = `https://wa.me/${cleanWa}?text=${encodeURIComponent(customMessage)}`
    window.open(url, "_blank")
    onClose()
  }

  const allTemplateTabs = [
    {
      key: "wa_template_konfirmasi_sesi",
      label: "Konfirmasi Sesi",
      badge: "Sesi",
      isRecommended:
        participant.status_peserta !== "CONFIRMED" &&
        participant.status_peserta !== "WAITING_LIST" &&
        participant.status_peserta !== "HADIR" &&
        participant.status_peserta !== "SELESAI_FULL"
    },
    {
      key: "wa_template_reminder",
      label: "Reminder Jadwal",
      badge: "Reminder",
      isRecommended: participant.status_peserta === "CONFIRMED"
    },
    {
      key: "wa_template_waiting_list",
      label: "Waiting List",
      badge: "Antrean",
      isRecommended: participant.status_peserta === "WAITING_LIST"
    },
    {
      key: "wa_template_minta_feedback",
      label: "Minta Feedback",
      badge: "Feedback",
      isRecommended: participant.status_peserta === "HADIR" || participant.status_peserta === "SELESAI_FULL"
    }
  ]

  const templateTabs = allTemplateTabs.filter(
    (tab) => ENABLE_TKT_WAITING_LIST || tab.key !== "wa_template_waiting_list"
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050b14]/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl p-6 sm:p-7 liquid-neumorph-card border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl liquid-neumorph-inset text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner shrink-0">
            <WhatsAppIcon className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="pr-10">
            <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
              Pilih Template & Kirim WhatsApp
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Penerima: <strong className="text-white">{participant.nama_lengkap}</strong> • <span className="font-mono text-emerald-400">{participant.nomor_wa || "-"}</span>
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold text-brand-gold uppercase tracking-wider block">
              Pilihan Template Chat
            </label>
            <span className="text-[11px] text-slate-400">
              Status Peserta: <strong className="text-slate-200">{participant.status_peserta || "-"}</strong>
            </span>
          </div>

          <div
            className={`grid grid-cols-1 ${
              ENABLE_TKT_WAITING_LIST ? "sm:grid-cols-4" : "sm:grid-cols-3"
            } gap-2 p-1.5 rounded-2xl liquid-neumorph-inset border border-white/10`}
          >
            {templateTabs.map((tab) => {
              const isActive = selectedTemplateKey === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleSelectTemplate(tab.key)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    isActive
                      ? "bg-emerald-600/90 text-white shadow-md border border-emerald-400/50"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{tab.label}</span>
                    {tab.isRecommended && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? "bg-white/25 text-white" : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                      }`}>
                        Aktif
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Format Teks Pesan:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-[11px] font-semibold text-brand-gold hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditing ? "Tutup Editor" : "Sesuaikan Teks"}</span>
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleResetText}
                  className="text-[11px] font-semibold text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  Reset Default
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <textarea
              rows={8}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3.5 rounded-2xl liquid-neumorph-inset text-white text-xs font-mono leading-relaxed bg-[#07131e]/90 border border-brand-gold/40 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/40 transition-all resize-none"
            />
          ) : (
            <div className="p-4 rounded-2xl liquid-neumorph-inset border border-white/10 bg-[#07131e]/85 max-h-[240px] overflow-y-auto">
              <pre className="text-xs text-slate-100 font-sans whitespace-pre-wrap leading-relaxed select-text">
                {customMessage}
              </pre>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleCopyMessage}
            className="liquid-neumorph-inset px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer active:scale-95"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-bold">Tersalin ke Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Teks Pesan</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="liquid-neumorph-inset px-4 py-2.5 rounded-xl text-slate-300 hover:text-white font-semibold text-xs cursor-pointer transition-colors border border-white/10 active:scale-95"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all border border-emerald-400/40 active:scale-95"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Kirim ke WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
