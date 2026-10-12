import React, { useState, useEffect } from "react"
import {
  Settings,
  Save,
  CheckCircle2,
  Calendar,
  Users,
  ToggleLeft,
  ToggleRight,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Copy,
  Check,
  HelpCircle,
  Clock,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  QrCode,
  Download,
  ExternalLink
} from "lucide-react"
import WhatsAppIcon from "../common/WhatsAppIcon"
import TktQrCodeSvg from "../common/TktQrCodeSvg"
import { downloadHighResQrPng } from "../../utils/qrCodeGenerator"
import { ENABLE_TKT_WAITING_LIST, DEFAULT_WA_TEMPLATES } from "../../services/tktService"
import { changeAdminPassword, verifyAdminSession } from "../../services/authService"

export default function TktConfigTab({ config = {}, onSaveConfig, refreshing, onRefresh }) {
  const [kegiatanList, setKegiatanList] = useState([
    {
      id: "tkt-apr-2026",
      nama: "Titian Karir Terpadu ITB April 2026",
      tanggal: ["Jumat, 10 April 2026", "Sabtu, 11 April 2026"],
      is_active: true
    }
  ])
  const [newKegiatanNama, setNewKegiatanNama] = useState("")
  const [newKegiatanTanggal, setNewKegiatanTanggal] = useState("")
  const [isAddingKegiatan, setIsAddingKegiatan] = useState(false)
  const [newTanggalInput, setNewTanggalInput] = useState({})

  const [formData, setFormData] = useState({
    status_pendaftaran: "buka",
    wa_template_konfirmasi_sesi: DEFAULT_WA_TEMPLATES.wa_template_konfirmasi_sesi,
    wa_template_reminder: DEFAULT_WA_TEMPLATES.wa_template_reminder,
    wa_template_waiting_list: DEFAULT_WA_TEMPLATES.wa_template_waiting_list,
    wa_template_minta_feedback: DEFAULT_WA_TEMPLATES.wa_template_minta_feedback
  })

  const [activeDateIndex, setActiveDateIndex] = useState(0)
  const [psikologMap, setPsikologMap] = useState({
    0: ["Lina Tarlina, S.Psi., Psikolog", "Sito Asih Pratiwi, S.Psi., Psikolog", "Mariyuana S. Psi., M.M., Psikolog", "Karlina Firdausi, S.Psi., M.Psi., Psikolog", "Diana., S.Psi., M.T., Psikolog"],
    1: ["Yopi Rodiah, S. Psi., Psikolog", "Sito Asih Pratiwi, S.Psi., Psikolog", "Mariyuana S. Psi., M.M., Psikolog", "Karlina Firdausi, S.Psi., M.Psi., Psikolog", "Diana., S.Psi., M.T., Psikolog"]
  })
  const [newPsikologInput, setNewPsikologInput] = useState("")

  const [activeWaTab, setActiveWaTab] = useState("konfirmasi")
  const [copiedVariable, setCopiedVariable] = useState(null)
  const [copiedQrType, setCopiedQrType] = useState(null)

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [changingPwd, setChangingPwd] = useState(false)
  const [pwdError, setPwdError] = useState("")
  const [pwdSuccess, setPwdSuccess] = useState(false)

  const activeSession = verifyAdminSession().session
  const baseOrigin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://itb-konseling-karir.vercel.app"
  const publicBookingUrl = `${baseOrigin}/tkt`
  const publicFeedbackUrl = `${baseOrigin}/tkt/feedback`

  const handleCopyQrLink = (type, url) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
      setCopiedQrType(type)
      setTimeout(() => setCopiedQrType(null), 2000)
    }
  }

  useEffect(() => {
    if (config) {
      setFormData({
        status_pendaftaran: config.status_pendaftaran || "buka",
        wa_template_konfirmasi_sesi:
          config.wa_template_konfirmasi_sesi || DEFAULT_WA_TEMPLATES.wa_template_konfirmasi_sesi,
        wa_template_reminder:
          config.wa_template_reminder || DEFAULT_WA_TEMPLATES.wa_template_reminder,
        wa_template_waiting_list:
          config.wa_template_waiting_list || DEFAULT_WA_TEMPLATES.wa_template_waiting_list,
        wa_template_minta_feedback:
          config.wa_template_minta_feedback || DEFAULT_WA_TEMPLATES.wa_template_minta_feedback
      })

      if (config.kegiatan_list) {
        try {
          const parsed = JSON.parse(config.kegiatan_list)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setKegiatanList(parsed)
          }
        } catch {
          initializeFallbackKegiatan(config)
        }
      } else {
        initializeFallbackKegiatan(config)
      }

      const pMap = {}
      try {
        pMap[0] = JSON.parse(config.psikolog_list_1 || "[]")
      } catch {
        pMap[0] = ["Psikolog 1", "Psikolog 2", "Psikolog 3", "Psikolog 4", "Psikolog 5"]
      }

      try {
        pMap[1] = JSON.parse(config.psikolog_list_2 || "[]")
      } catch {
        pMap[1] = ["Psikolog 1", "Psikolog 2", "Psikolog 3", "Psikolog 4", "Psikolog 5"]
      }

      if (config.psikolog_lists) {
        try {
          const parsedLists = JSON.parse(config.psikolog_lists)
          if (typeof parsedLists === "object" && parsedLists !== null) {
            Object.assign(pMap, parsedLists)
          }
        } catch {}
      }

      setPsikologMap(pMap)
    }
  }, [config])

  const initializeFallbackKegiatan = (cfg) => {
    const dates = []
    if (cfg.tanggal_kegiatan_1) dates.push(cfg.tanggal_kegiatan_1)
    if (cfg.tanggal_kegiatan_2) dates.push(cfg.tanggal_kegiatan_2)
    if (dates.length === 0) {
      dates.push("Jumat, 10 April 2026", "Sabtu, 11 April 2026")
    }
    setKegiatanList([
      {
        id: "tkt-apr-2026",
        nama: "Titian Karir Terpadu ITB April 2026",
        tanggal: dates,
        is_active: true
      }
    ])
  }

  const activeKegiatan = kegiatanList.find((k) => k.is_active) || kegiatanList[0] || {
    id: "default",
    nama: "Titian Karir Terpadu ITB",
    tanggal: ["Jumat, 10 April 2026", "Sabtu, 11 April 2026"],
    is_active: true
  }

  const handleSetActiveKegiatan = (targetId) => {
    setKegiatanList((prev) =>
      prev.map((k) => ({
        ...k,
        is_active: k.id === targetId
      }))
    )
    setActiveDateIndex(0)
  }

  const handleAddKegiatan = (e) => {
    e.preventDefault()
    if (!newKegiatanNama.trim()) return

    const initialDates = newKegiatanTanggal.trim()
      ? [newKegiatanTanggal.trim()]
      : ["Jumat, 10 April 2026", "Sabtu, 11 April 2026"]

    const newEvent = {
      id: "kegiatan-" + Date.now(),
      nama: newKegiatanNama.trim(),
      tanggal: initialDates,
      is_active: false
    }

    setKegiatanList((prev) => [...prev, newEvent])
    setNewKegiatanNama("")
    setNewKegiatanTanggal("")
    setIsAddingKegiatan(false)
  }

  const handleDeleteKegiatan = (idToDelete) => {
    if (kegiatanList.length <= 1) return
    const target = kegiatanList.find((k) => k.id === idToDelete)
    if (target?.is_active) return
    setKegiatanList((prev) => prev.filter((k) => k.id !== idToDelete))
  }

  const handleAddTanggalToKegiatan = (kegiatanId) => {
    const val = newTanggalInput[kegiatanId]?.trim()
    if (!val) return

    setKegiatanList((prev) =>
      prev.map((k) => {
        if (k.id === kegiatanId) {
          if (k.tanggal.includes(val)) return k
          return { ...k, tanggal: [...k.tanggal, val] }
        }
        return k
      })
    )

    setNewTanggalInput((prev) => ({ ...prev, [kegiatanId]: "" }))
  }

  const handleRemoveTanggalFromKegiatan = (kegiatanId, tglIdx) => {
    setKegiatanList((prev) =>
      prev.map((k) => {
        if (k.id === kegiatanId) {
          if (k.tanggal.length <= 1) return k
          return {
            ...k,
            tanggal: k.tanggal.filter((_, i) => i !== tglIdx)
          }
        }
        return k
      })
    )
  }

  const handleToggleRegistration = () => {
    setFormData((prev) => ({
      ...prev,
      status_pendaftaran: prev.status_pendaftaran === "buka" ? "tutup" : "buka"
    }))
  }

  const currentPsikologList = psikologMap[activeDateIndex] || []

  const handleAddPsikolog = (e) => {
    e?.preventDefault()
    if (!newPsikologInput.trim()) return
    const updated = [...currentPsikologList, newPsikologInput.trim()]
    setPsikologMap((prev) => ({
      ...prev,
      [activeDateIndex]: updated
    }))
    setNewPsikologInput("")
  }

  const handleRemovePsikolog = (idx) => {
    const updated = currentPsikologList.filter((_, i) => i !== idx)
    setPsikologMap((prev) => ({
      ...prev,
      [activeDateIndex]: updated
    }))
  }

  const handleCopyVariable = (varCode) => {
    navigator.clipboard.writeText(varCode)
    setCopiedVariable(varCode)
    setTimeout(() => setCopiedVariable(null), 2000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveSuccess(false)

    try {
      const activeEvent = kegiatanList.find((k) => k.is_active) || kegiatanList[0]
      const activeDates = activeEvent?.tanggal || []

      const payload = {
        ...formData,
        kegiatan_list: JSON.stringify(kegiatanList),
        kegiatan_aktif_id: activeEvent?.id || "",
        kegiatan_aktif_nama: activeEvent?.nama || "",
        tanggal_kegiatan_1: activeDates[0] || "",
        tanggal_kegiatan_2: activeDates[1] || "",
        tanggal_kegiatan_list: JSON.stringify(activeDates),
        psikolog_list_1: JSON.stringify(psikologMap[0] || []),
        psikolog_list_2: JSON.stringify(psikologMap[1] || []),
        psikolog_lists: JSON.stringify(psikologMap)
      }

      await onSaveConfig(payload)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4500)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (changingPwd) return
    setPwdError("")
    setPwdSuccess(false)
    setChangingPwd(true)

    try {
      const result = await changeAdminPassword({
        currentPassword,
        newPassword,
        confirmPassword
      })

      if (!result.success) {
        setPwdError(result.error || "Gagal memperbarui kata sandi.")
        return
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowCurrentPwd(false)
      setShowNewPwd(false)
      setShowConfirmPwd(false)
      setPwdSuccess(true)
      if (typeof onRefresh === "function") {
        onRefresh()
      }
      setTimeout(() => setPwdSuccess(false), 5000)
    } catch {
      setPwdError("Terjadi kendala saat menyimpan kata sandi baru. Silakan coba lagi.")
    } finally {
      setChangingPwd(false)
    }
  }

  const isRegistrationOpen = formData.status_pendaftaran === "buka"

  const templateVariables = [
    { label: "Nama Peserta", code: "{{nama_lengkap}}" },
    { label: "Hari & Tanggal", code: "{{jadwal_hari}}" },
    { label: "Sesi Waktu", code: "{{jadwal_sesi}}" },
    { label: "Psikolog Bertugas", code: "{{psikolog_bertugas}}" },
    { label: "Tautan Konfirmasi", code: "{{konfirmasi_url}}" },
    { label: "Tautan Feedback", code: "{{feedback_url}}" }
  ]

  const getWaPreviewText = () => {
    let raw = ""
    if (activeWaTab === "konfirmasi") raw = formData.wa_template_konfirmasi_sesi
    if (activeWaTab === "reminder") raw = formData.wa_template_reminder
    if (activeWaTab === "waiting_list") raw = formData.wa_template_waiting_list
    if (activeWaTab === "feedback") raw = formData.wa_template_minta_feedback

    const sampleDate = activeKegiatan.tanggal[0] || "Jumat, 10 April 2026"
    const samplePsikolog = (psikologMap[0] && psikologMap[0][0]) || "Lina Tarlina, S.Psi., Psikolog"

    return raw
      .replace(/{{nama_lengkap}}/g, "Raden Mas Arya")
      .replace(/{{jadwal_hari}}/g, sampleDate)
      .replace(/{{jadwal_sesi}}/g, "Sesi 1 (09.00-09.45)")
      .replace(/{{psikolog_bertugas}}/g, samplePsikolog)
      .replace(/{{konfirmasi_url}}/g, "https://karir.itb.ac.id/tkt/konfirmasi/8f4b2c1a-9d3e")
      .replace(/{{feedback_url}}/g, "https://karir.itb.ac.id/tkt/feedback/8f4b2c1a-9d3e")
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="liquid-neumorph-pill w-9 h-9 rounded-xl bg-brand-gold/15 border-t border-brand-gold/30 flex items-center justify-center">
              <Settings className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                Pusat Pengaturan Operasional TKT
              </h2>
              <p className="text-xs text-slate-300">
                Kendali terpusat kegiatan, tanggal pelaksanaan aktif, gerbang registrasi, konselor, dan pesan otomatis.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="liquid-neumorph-inset px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white border border-white/10 flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
          title="Sinkronkan Ulang Data Konfigurasi"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Muat Ulang Data</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl liquid-neumorph-card bg-emerald-500/10 border-t border-emerald-500/40 text-emerald-200 text-xs sm:text-sm flex items-center gap-3 shadow-lg animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-semibold">Konfigurasi Berhasil Disimpan & Diterapkan!</p>
            <p className="text-[11px] text-emerald-300/90 mt-0.5">
              Seluruh perubahan tanggal kegiatan aktif, status registrasi, konselor, dan template pesan telah diperbarui secara live.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="liquid-neumorph-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden border-t border-l border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="liquid-neumorph-pill w-10 h-10 rounded-2xl bg-brand-gold/15 border-t border-brand-gold/30 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-brand-gold" />
              </div>
              <div>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-brand-gold block">
                  PRIORITAS UTAMA SISTEM
                </span>
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  1. Rangkaian Kegiatan & Tanggal Pelaksanaan Aktif
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Kegiatan yang bertanda aktif akan menjadi parameter tunggal yang tampil di formulir publik dan panel admin.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingKegiatan(!isAddingKegiatan)}
              className="liquid-neumorph-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-gold bg-brand-gold/15 hover:bg-brand-gold/25 border-t border-brand-gold/40 flex items-center gap-2 cursor-pointer self-start sm:self-auto active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingKegiatan ? "Tutup Form Kegiatan" : "Tambah Kegiatan Baru"}</span>
            </button>
          </div>

          <div className="rounded-2xl p-4 sm:p-5 liquid-neumorph-inset bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="liquid-neumorph-pill w-8 h-8 rounded-full bg-emerald-500/20 border-t border-emerald-500/40 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">
                    Kegiatan Sedang Aktif
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-white mt-0.5">
                  {activeKegiatan.nama}
                </h4>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeKegiatan.tanggal.map((tgl, idx) => (
                <div
                  key={idx}
                  className="liquid-neumorph-pill px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-gold flex items-center gap-1.5 border-t border-brand-gold/30"
                >
                  <Clock className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Hari ke-{idx + 1}: {tgl}</span>
                </div>
              ))}
            </div>
          </div>

          {isAddingKegiatan && (
            <div className="rounded-2xl p-5 liquid-neumorph-inset border border-brand-gold/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 text-brand-gold">
                <Sparkles className="w-4 h-4" />
                <h4 className="text-xs font-semibold uppercase tracking-wider">
                  Formulir Tambah Rangkaian Kegiatan TKT Baru
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nama Rangkaian Kegiatan <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    type="text"
                    value={newKegiatanNama}
                    onChange={(e) => setNewKegiatanNama(e.target.value)}
                    placeholder="Contoh: Titian Karir Terpadu ITB Oktober 2026"
                    className="liquid-neumorph-inset w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-100 bg-[rgba(8,18,28,0.65)] border border-white/10 focus:outline-none focus:border-brand-gold/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tanggal Perdana Kegiatan <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    type="text"
                    value={newKegiatanTanggal}
                    onChange={(e) => setNewKegiatanTanggal(e.target.value)}
                    placeholder="Contoh: Jumat, 23 Oktober 2026"
                    className="liquid-neumorph-inset w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-100 bg-[rgba(8,18,28,0.65)] border border-white/10 focus:outline-none focus:border-brand-gold/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingKegiatan(false)}
                  className="liquid-neumorph-inset px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white border border-white/10 cursor-pointer active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleAddKegiatan}
                  className="liquid-neumorph-btn px-5 py-2 rounded-xl text-xs font-semibold text-brand-gold bg-brand-gold/15 hover:bg-brand-gold/25 border-t border-brand-gold/40 cursor-pointer active:scale-95"
                >
                  Simpan Kegiatan Baru
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Daftar Seluruh Rangkaian Kegiatan Terdaftar ({kegiatanList.length} Kegiatan)
            </label>

            <div className="grid grid-cols-1 gap-4">
              {kegiatanList.map((kegiatan) => {
                const isActive = kegiatan.is_active
                return (
                  <div
                    key={kegiatan.id}
                    className={`rounded-2xl p-4 sm:p-5 transition-all ${
                      isActive
                        ? "liquid-neumorph-card border-t border-l border-brand-gold/40 shadow-xl"
                        : "liquid-neumorph-inset border border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm sm:text-base text-white">
                            {kegiatan.nama}
                          </span>
                          {isActive ? (
                            <span className="liquid-neumorph-pill px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border-t border-emerald-500/40">
                              Aktif Terpilih
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium text-slate-400 bg-white/5 border border-white/10">
                              Arsip / Cadangan
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          ID: <code className="text-slate-300">{kegiatan.id}</code> • Memiliki {kegiatan.tanggal.length} tanggal pelaksanaan
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-auto">
                        {!isActive ? (
                          <button
                            type="button"
                            onClick={() => handleSetActiveKegiatan(kegiatan.id)}
                            className="liquid-neumorph-btn px-4 py-2 rounded-xl text-brand-gold bg-brand-gold/15 hover:bg-brand-gold/25 border-t border-brand-gold/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                            title="Aktifkan kegiatan ini untuk tampil di seluruh sistem"
                          >
                            <ToggleLeft className="w-4 h-4" />
                            <span>Jadikan Kegiatan Aktif</span>
                          </button>
                        ) : (
                          <div className="liquid-neumorph-pill px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border-t border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
                            <ToggleRight className="w-4 h-4" />
                            <span>Sedang Berjalan Live</span>
                          </div>
                        )}

                        {!isActive && kegiatanList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteKegiatan(kegiatan.id)}
                            className="liquid-neumorph-pill p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-t border-rose-500/30 transition-all cursor-pointer"
                            title="Hapus rangkaian kegiatan ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-300">
                          Tanggal Kegiatan:
                        </span>
                        {kegiatan.tanggal.map((tgl, tIdx) => (
                          <div
                            key={tIdx}
                            className="liquid-neumorph-pill inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs text-slate-200 border-t border-white/15"
                          >
                            <span className="font-medium">{tgl}</span>
                            {kegiatan.tanggal.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTanggalFromKegiatan(kegiatan.id, tIdx)}
                                className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Hapus tanggal ini"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 max-w-md">
                        <input
                          type="text"
                          value={newTanggalInput[kegiatan.id] || ""}
                          onChange={(e) =>
                            setNewTanggalInput((prev) => ({
                              ...prev,
                              [kegiatan.id]: e.target.value
                            }))
                          }
                          placeholder="Tambah tanggal baru (mis: Minggu, 12 April 2026)..."
                          className="liquid-neumorph-inset flex-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-100 bg-[rgba(8,18,28,0.65)] border border-white/10 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddTanggalToKegiatan(kegiatan.id)}
                          className="liquid-neumorph-btn px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-gold bg-brand-gold/15 hover:bg-brand-gold/25 border-t border-brand-gold/40 flex items-center gap-1 cursor-pointer shrink-0 active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Hari</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="liquid-neumorph-card rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative border-t border-l border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="liquid-neumorph-pill w-10 h-10 rounded-2xl bg-brand-gold/15 border-t border-brand-gold/30 flex items-center justify-center shrink-0">
                {isRegistrationOpen ? (
                  <ToggleRight className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-rose-400" />
                )}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  2. Status Gerbang Pendaftaran Publik TKT
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Kendalikan keterbukaan formulir publik (/tkt). Saat ditutup, peserta tidak dapat mendaftar sesi baru.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleRegistration}
              className={`px-5 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer self-start sm:self-auto active:scale-95 ${
                isRegistrationOpen
                  ? "liquid-neumorph-btn bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-t border-emerald-500/40 shadow-lg"
                  : "liquid-neumorph-btn bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-t border-rose-500/40 shadow-lg"
              }`}
            >
              {isRegistrationOpen ? (
                <>
                  <ToggleRight className="w-5 h-5 text-emerald-400" />
                  <span>Pendaftaran DIBUKA (Aktif Menerima)</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-rose-400" />
                  <span>Pendaftaran DITUTUP (Gerbang Terkunci)</span>
                </>
              )}
            </button>
          </div>
        </section>

        <section className="liquid-neumorph-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative border-t border-l border-white/20">
          <div className="flex items-center gap-3 pb-5 border-b border-white/10">
            <div className="liquid-neumorph-pill w-10 h-10 rounded-2xl bg-brand-gold/15 border-t border-brand-gold/30 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white">
                3. Alokasi Psikolog Konselor Bertugas
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Kelola daftar nama psikolog yang bertugas sesuai hari pelaksanaan kegiatan aktif ({activeKegiatan.nama}).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 mr-2">
              Pilih Hari Kegiatan:
            </span>
            {activeKegiatan.tanggal.map((tgl, idx) => {
              const isSelected = activeDateIndex === idx
              const psiCount = (psikologMap[idx] || []).length
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveDateIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? "liquid-neumorph-pill bg-brand-gold text-slate-950 font-bold border-t border-brand-gold/40 shadow-sm"
                      : "liquid-neumorph-inset text-slate-300 hover:text-white border border-white/10"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Hari ke-{idx + 1} ({tgl})</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${isSelected ? "bg-slate-900 text-brand-gold" : "bg-white/10 text-slate-300"}`}>
                    {psiCount} Psikolog
                  </span>
                </button>
              )
            })}
          </div>

          <div className="p-5 rounded-2xl liquid-neumorph-inset border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white">
                  Daftar Psikolog: Hari ke-{activeDateIndex + 1} ({activeKegiatan.tanggal[activeDateIndex] || "Hari Terpilih"})
                </h4>
                <p className="text-[11px] text-slate-400">
                  Nama yang tercantum akan menjadi pilihan bilik konseling pada tanggal ini.
                </p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={newPsikologInput}
                  onChange={(e) => setNewPsikologInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddPsikolog()
                    }
                  }}
                  placeholder="Nama Psikolog baru beserta gelar..."
                  className="liquid-neumorph-inset flex-1 sm:w-72 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-100 bg-[rgba(8,18,28,0.65)] border border-white/10 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddPsikolog}
                  className="liquid-neumorph-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-gold bg-brand-gold/15 hover:bg-brand-gold/25 border-t border-brand-gold/40 flex items-center gap-1 cursor-pointer shrink-0 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
              {currentPsikologList.map((psi, idx) => (
                <div
                  key={idx}
                  className="liquid-neumorph-card flex items-center justify-between p-3 rounded-xl border border-white/15 text-xs text-white shadow-sm"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="liquid-neumorph-inset w-5 h-5 rounded-full text-brand-gold font-bold text-[10px] flex items-center justify-center shrink-0 border border-white/10">
                      {idx + 1}
                    </span>
                    <span className="font-semibold truncate">{psi}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePsikolog(idx)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                    title="Hapus psikolog ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {currentPsikologList.length === 0 && (
                <p className="text-xs text-slate-400 italic py-2 col-span-full">
                  Belum ada psikolog yang ditugaskan pada hari ini. Silakan tambahkan nama psikolog di atas.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="liquid-neumorph-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative border-t border-l border-white/20">
          <div className="flex items-center gap-3 pb-5 border-b border-white/10">
            <div className="liquid-neumorph-pill w-10 h-10 rounded-2xl bg-brand-gold/15 border-t border-brand-gold/30 flex items-center justify-center shrink-0">
              <WhatsAppIcon className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white">
                4. Template Pesan Otomatis WhatsApp & Live Preview
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Sesuaikan teks pesan otomatis yang dikirimkan ke peserta melalui WhatsApp dengan variabel dinamis.
              </p>
            </div>
          </div>

          <div className="liquid-neumorph-inset p-3.5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold">
              <HelpCircle className="w-3.5 h-3.5 text-brand-gold" />
              <span>Variabel Dinamis Tersedia (Klik chip untuk menyalin):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {templateVariables.map((v) => {
                const isCopied = copiedVariable === v.code
                return (
                  <button
                    key={v.code}
                    type="button"
                    onClick={() => handleCopyVariable(v.code)}
                    className={`liquid-neumorph-pill px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCopied
                        ? "bg-emerald-500/20 border-t border-emerald-500/50 text-emerald-300 font-semibold"
                        : "text-slate-200 border-t border-white/15"
                    }`}
                    title={`Salin ${v.code}`}
                  >
                    <span>{v.code}</span>
                    <span className="text-[10px] text-slate-400">({v.label})</span>
                    {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap border-b border-white/10 gap-2">
            <button
              type="button"
              onClick={() => setActiveWaTab("konfirmasi")}
              className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                activeWaTab === "konfirmasi"
                  ? "border-brand-gold text-brand-gold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Konfirmasi Sesi (Dapat Sesi)
            </button>
            <button
              type="button"
              onClick={() => setActiveWaTab("reminder")}
              className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                activeWaTab === "reminder"
                  ? "border-brand-gold text-brand-gold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Reminder Jadwal (Confirmed)
            </button>
            {ENABLE_TKT_WAITING_LIST && (
              <button
                type="button"
                onClick={() => setActiveWaTab("waiting_list")}
                className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                  activeWaTab === "waiting_list"
                    ? "border-brand-gold text-brand-gold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Notifikasi Waiting List
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveWaTab("feedback")}
              className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                activeWaTab === "feedback"
                  ? "border-brand-gold text-brand-gold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Permintaan Feedback Sesi
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase">
                Editor Teks Template:
              </label>

              {activeWaTab === "konfirmasi" && (
                <textarea
                  rows={10}
                  value={formData.wa_template_konfirmasi_sesi}
                  onChange={(e) =>
                    setFormData({ ...formData, wa_template_konfirmasi_sesi: e.target.value })
                  }
                  placeholder="Ketik template pesan konfirmasi sesi..."
                  className="liquid-neumorph-inset w-full p-4 rounded-2xl text-xs font-mono leading-relaxed text-slate-100 bg-[rgba(8,18,28,0.65)] border border-white/10 focus:outline-none"
                />
              )}

              {activeWaTab === "reminder" && (
                <textarea
                  rows={10}
                  value={formData.wa_template_reminder}
                  onChange={(e) =>
                    setFormData({ ...formData, wa_template_reminder: e.target.value })
                  }
                  placeholder="Ketik template pesan reminder jadwal..."
                  className="liquid-neumorph-inset w-full p-4 rounded-2xl text-xs font-mono leading-relaxed text-slate-100 bg-[rgba(8,18,28,0.65)] border border-white/10 focus:outline-none"
                />
              )}

              {ENABLE_TKT_WAITING_LIST && activeWaTab === "waiting_list" && (
                <textarea
                  rows={10}
                  value={formData.wa_template_waiting_list}
                  onChange={(e) =>
                    setFormData({ ...formData, wa_template_waiting_list: e.target.value })
                  }
                  placeholder="Ketik template pesan antrean waiting list..."
                  className="liquid-neumorph-inset w-full p-4 rounded-2xl text-xs font-mono leading-relaxed text-slate-100 bg-[rgba(8,18,28,0.65)] border border-white/10 focus:outline-none"
                />
              )}

              {activeWaTab === "feedback" && (
                <textarea
                  rows={10}
                  value={formData.wa_template_minta_feedback}
                  onChange={(e) =>
                    setFormData({ ...formData, wa_template_minta_feedback: e.target.value })
                  }
                  placeholder="Ketik template pesan permohonan feedback..."
                  className="liquid-neumorph-inset w-full p-4 rounded-2xl text-xs font-mono leading-relaxed text-slate-100 bg-[rgba(8,18,28,0.65)] border border-white/10 focus:outline-none"
                />
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase flex items-center justify-between">
                <span>WhatsApp Live Preview (Simulasi Peserta):</span>
                <span className="text-[10px] text-emerald-400 font-medium">Pratinjau Nyata</span>
              </label>

              <div className="liquid-neumorph-card rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-[#0b141a]">
                <div className="bg-[#1f2c34] px-4 py-2.5 flex items-center gap-3 border-b border-white/10">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white/95 p-0.5 shrink-0">
                    <img
                      src="/images/logo.jpg"
                      alt="ITB Career Center"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white leading-tight">
                      ITB Career Center
                    </h5>
                    <p className="text-[10px] text-emerald-400">Online • Terverifikasi</p>
                  </div>
                </div>

                <div className="p-4 min-h-[220px] max-h-[260px] overflow-y-auto space-y-2">
                  <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-none text-xs leading-relaxed shadow-md max-w-[92%] ml-auto whitespace-pre-wrap font-sans">
                    {getWaPreviewText()}
                    <div className="text-[9px] text-emerald-200 text-right mt-1.5 flex items-center justify-end gap-1">
                      <span>10.15</span>
                      <span className="text-sky-300">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="sticky bottom-4 z-30 p-4 rounded-2xl liquid-neumorph-card border-t border-l border-white/30 shadow-2xl flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-white">
              Simpan Konfigurasi Operasional
            </p>
            <p className="text-[11px] text-slate-300">
              Perubahan kegiatan aktif & jadwal akan langsung berdampak ke seluruh form publik dan panel admin.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="liquid-neumorph-btn px-8 py-3 rounded-xl text-xs sm:text-sm font-semibold text-brand-gold bg-brand-gold/15 hover:bg-brand-gold/25 border-t border-brand-gold/40 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 transition-all w-full sm:w-auto shadow-lg active:scale-95"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyimpan Pengaturan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-brand-gold" />
                <span>Simpan Seluruh Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </form>

      <section className="liquid-neumorph-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative border-t border-l border-white/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="liquid-neumorph-pill w-10 h-10 rounded-2xl bg-brand-gold/15 border-t border-brand-gold/30 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white">
                5. Pusat QR Code Publik & Evaluasi TKT (Siap Cetak Kualitas Tinggi)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Unduh QR Code resolusi tinggi berstandar ISO/IEC 18004 untuk dicetak pada meja registrasi booth maupun dipindai peserta.
              </p>
            </div>
          </div>

          <div className="liquid-neumorph-inset px-3.5 py-2 rounded-xl border border-amber-400/30 text-xs text-brand-gold font-semibold self-start sm:self-auto">
            Kualitas Cetak 300+ DPI • Vektor Tajam
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="liquid-neumorph-inset p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="p-3 rounded-2xl bg-white shadow-xl border-2 border-amber-400/50 shrink-0">
                <TktQrCodeSvg value={publicBookingUrl} size={156} quietZone={3} />
              </div>

              <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-[11px] font-bold text-sky-300">
                  QR Pendaftaran Peserta
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Form Pendaftaran Publik TKT
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gunakan QR Code ini di pintu masuk booth agar mahasiswa & alumni dapat langsung mendaftar dan memilih sesi konseling dari smartphone.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-brand-gold truncate" title={publicBookingUrl}>
                    {publicBookingUrl}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyQrLink("booking", publicBookingUrl)}
                      className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-white flex items-center gap-1 cursor-pointer transition-all"
                    >
                      {copiedQrType === "booking" ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                    <a
                      href={publicBookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all"
                      title="Buka Form Publik"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() =>
                  downloadHighResQrPng({
                    url: publicBookingUrl,
                    title: "Pendaftaran Konseling TKT",
                    subtitle: "Scan untuk Memilih Jadwal & Psikolog Konseling",
                    badgeText: activeKegiatan?.nama || "ITB CAREER CENTER",
                    filename: "Poster-QR-Form-Pendaftaran-TKT-ITB.png",
                    mode: "poster"
                  })
                }
                className="liquid-neumorph-btn px-4 py-2.5 rounded-xl text-xs font-semibold text-brand-gold bg-brand-gold/15 hover:bg-brand-gold/25 border-t border-brand-gold/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Poster Cetak (1600×2100)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadHighResQrPng({
                    url: publicBookingUrl,
                    filename: "QR-Murni-Form-Pendaftaran-TKT-ITB.png",
                    mode: "square"
                  })
                }
                className="liquid-neumorph-inset px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 border border-white/15 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <QrCode className="w-4 h-4 text-sky-300" />
                <span>Unduh QR Murni (HD PNG)</span>
              </button>
            </div>
          </div>

          <div className="liquid-neumorph-inset p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="p-3 rounded-2xl bg-white shadow-xl border-2 border-emerald-400/50 shrink-0">
                <TktQrCodeSvg value={publicFeedbackUrl} size={156} quietZone={3} />
              </div>

              <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[11px] font-bold text-emerald-300">
                  QR Evaluasi & Feedback
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Form Feedback Konseling TKT
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gunakan QR Code ini di meja psikolog atau pintu keluar booth agar peserta yang telah selesai sesi langsung mengisi evaluasi layanan.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-emerald-300 truncate" title={publicFeedbackUrl}>
                    {publicFeedbackUrl}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyQrLink("feedback", publicFeedbackUrl)}
                      className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-white flex items-center gap-1 cursor-pointer transition-all"
                    >
                      {copiedQrType === "feedback" ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                    <a
                      href={publicFeedbackUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all"
                      title="Buka Form Feedback"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() =>
                  downloadHighResQrPng({
                    url: publicFeedbackUrl,
                    title: "Evaluasi & Feedback TKT",
                    subtitle: "Scan Setelah Sesi Konseling Selesai",
                    badgeText: activeKegiatan?.nama || "ITB CAREER CENTER",
                    filename: "Poster-QR-Form-Feedback-TKT-ITB.png",
                    mode: "poster"
                  })
                }
                className="liquid-neumorph-btn px-4 py-2.5 rounded-xl text-xs font-semibold text-brand-gold bg-brand-gold/15 hover:bg-brand-gold/25 border-t border-brand-gold/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Poster Cetak (1600×2100)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadHighResQrPng({
                    url: publicFeedbackUrl,
                    filename: "QR-Murni-Form-Feedback-TKT-ITB.png",
                    mode: "square"
                  })
                }
                className="liquid-neumorph-inset px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 border border-white/15 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <QrCode className="w-4 h-4 text-emerald-300" />
                <span>Unduh QR Murni (HD PNG)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="liquid-neumorph-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative border-t border-l border-white/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="liquid-neumorph-pill w-10 h-10 rounded-2xl bg-brand-gold/15 border-t border-brand-gold/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white">
                6. Keamanan & Kredensial Akses Admin
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Kelola kata sandi akses Panel Admin TKT. Kata sandi dienkripsi dengan algoritma kriptografis SHA-256 dan disinkronkan ke server.
              </p>
            </div>
          </div>

          {activeSession && (
            <div className="liquid-neumorph-inset px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-2.5 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-white">{activeSession.displayName}</span>
                <span className="text-slate-400 ml-1.5">
                  ({activeSession.username} • {activeSession.extendedMode ? "Sesi 12 Jam" : "Sesi Standar"})
                </span>
              </div>
            </div>
          )}
        </div>

        {pwdSuccess && (
          <div className="p-4 rounded-2xl liquid-neumorph-inset bg-emerald-500/15 border border-emerald-500/35 text-emerald-200 text-xs sm:text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Kata Sandi Admin Berhasil Diperbarui</p>
              <p className="text-xs text-emerald-300/90 mt-0.5 leading-relaxed">
                Hash kriptografis kata sandi baru telah disimpan ke server dan langsung berlaku untuk seluruh proses login berikutnya.
              </p>
            </div>
          </div>
        )}

        {pwdError && (
          <div className="p-4 rounded-2xl liquid-neumorph-inset bg-rose-500/15 border border-rose-500/35 text-rose-200 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Gagal Memperbarui Kata Sandi</p>
              <p className="text-xs text-rose-300/90 mt-0.5 leading-relaxed">{pwdError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kata Sandi Saat Ini <span className="text-brand-gold">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-brand-gold" />
                </div>
                <input
                  type={showCurrentPwd ? "text" : "password"}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Kata sandi aktif saat ini"
                  className="liquid-neumorph-inset w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-100 bg-[rgba(8,18,28,0.65)] border border-white/10 focus:outline-none focus:border-brand-gold/50"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  aria-label={showCurrentPwd ? "Sembunyikan" : "Tampilkan"}
                >
                  {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kata Sandi Baru <span className="text-brand-gold">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-brand-gold" />
                </div>
                <input
                  type={showNewPwd ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 karakter (huruf & angka)"
                  className="liquid-neumorph-inset w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-100 bg-[rgba(8,18,28,0.65)] border border-white/10 focus:outline-none focus:border-brand-gold/50"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  aria-label={showNewPwd ? "Sembunyikan" : "Tampilkan"}
                >
                  {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Konfirmasi Kata Sandi Baru <span className="text-brand-gold">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-brand-gold" />
                </div>
                <input
                  type={showConfirmPwd ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="liquid-neumorph-inset w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-100 bg-[rgba(8,18,28,0.65)] border border-white/10 focus:outline-none focus:border-brand-gold/50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  aria-label={showConfirmPwd ? "Sembunyikan" : "Tampilkan"}
                >
                  {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
              <span
                className={
                  newPassword.length >= 8 ? "text-emerald-300 font-semibold" : "text-slate-400"
                }
              >
                • Minimal 8 karakter
              </span>
              <span
                className={
                  /[A-Za-z]/.test(newPassword) && /[0-9]/.test(newPassword)
                    ? "text-emerald-300 font-semibold"
                    : "text-slate-400"
                }
              >
                • Kombinasi huruf dan angka
              </span>
              {config?.admin_password_updated_at && (
                <span className="text-slate-400">
                  • Terakhir diperbarui:{" "}
                  {new Date(config.admin_password_updated_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={changingPwd}
              className="liquid-neumorph-btn px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-brand-gold bg-brand-gold/15 hover:bg-brand-gold/25 border-t border-brand-gold/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-all active:scale-95 shrink-0"
            >
              {changingPwd ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Kata Sandi...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-brand-gold" />
                  <span>Perbarui Kata Sandi Admin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
