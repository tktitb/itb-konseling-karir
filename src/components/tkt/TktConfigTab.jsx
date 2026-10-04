import React, { useState, useEffect } from "react"
import {
  Settings,
  Save,
  CheckCircle2,
  Calendar,
  Users,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Layers,
  Copy,
  Check,
  Send,
  HelpCircle,
  Clock,
  MapPin
} from "lucide-react"

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
    wa_template_konfirmasi_sesi: "",
    wa_template_waiting_list: "",
    wa_template_minta_feedback: ""
  })

  const [activeDateIndex, setActiveDateIndex] = useState(0)
  const [psikologMap, setPsikologMap] = useState({
    0: ["Lina Tarlina, S.Psi., Psikolog", "Sito Asih Pratiwi, S.Psi., Psikolog", "Mariyuana S. Psi., M.M., Psikolog", "Karlina Firdausi, S.Psi., M.Psi., Psikolog", "Diana., S.Psi., M.T., Psikolog"],
    1: ["Yopi Rodiah, S. Psi., Psikolog", "Sito Asih Pratiwi, S.Psi., Psikolog", "Mariyuana S. Psi., M.M., Psikolog", "Karlina Firdausi, S.Psi., M.Psi., Psikolog", "Diana., S.Psi., M.T., Psikolog"]
  })
  const [newPsikologInput, setNewPsikologInput] = useState("")

  const [activeWaTab, setActiveWaTab] = useState("konfirmasi")
  const [copiedVariable, setCopiedVariable] = useState(null)

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (config) {
      setFormData({
        status_pendaftaran: config.status_pendaftaran || "buka",
        wa_template_konfirmasi_sesi: config.wa_template_konfirmasi_sesi || "",
        wa_template_waiting_list: config.wa_template_waiting_list || "",
        wa_template_minta_feedback: config.wa_template_minta_feedback || ""
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

  const isRegistrationOpen = formData.status_pendaftaran === "buka"

  const templateVariables = [
    { label: "Nama Peserta", code: "{{nama_lengkap}}" },
    { label: "Hari & Tanggal", code: "{{jadwal_hari}}" },
    { label: "Sesi Waktu", code: "{{jadwal_sesi}}" },
    { label: "Psikolog Bertugas", code: "{{psikolog_bertugas}}" },
    { label: "Tautan Feedback", code: "{{feedback_url}}" }
  ]

  const getWaPreviewText = () => {
    let raw = ""
    if (activeWaTab === "konfirmasi") raw = formData.wa_template_konfirmasi_sesi
    if (activeWaTab === "waiting_list") raw = formData.wa_template_waiting_list
    if (activeWaTab === "feedback") raw = formData.wa_template_minta_feedback

    const sampleDate = activeKegiatan.tanggal[0] || "Jumat, 10 April 2026"
    const samplePsikolog = (psikologMap[0] && psikologMap[0][0]) || "Lina Tarlina, S.Psi., Psikolog"

    return raw
      .replace(/{{nama_lengkap}}/g, "Raden Mas Arya")
      .replace(/{{jadwal_hari}}/g, sampleDate)
      .replace(/{{jadwal_sesi}}/g, "09.00-09.45")
      .replace(/{{psikolog_bertugas}}/g, samplePsikolog)
      .replace(/{{feedback_url}}/g, "https://karir.itb.ac.id/tkt/feedback")
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center">
              <Settings className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
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
          className="liquid-btn-ghost px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
          title="Sinkronkan Ulang Data Konfigurasi"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Muat Ulang Data</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm flex items-center gap-3 shadow-lg shadow-emerald-950/40 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold">Konfigurasi Berhasil Disimpan & Diterapkan!</p>
            <p className="text-[11px] text-emerald-300/90 mt-0.5">
              Seluruh perubahan tanggal kegiatan aktif, status registrasi, konselor, dan template pesan telah diperbarui secara live.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="liquid-glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-brand-gold" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-brand-gold block">
                  PRIORITAS UTAMA SISTEM
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
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
              className="liquid-btn-gold px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingKegiatan ? "Tutup Form Kegiatan" : "Tambah Kegiatan Baru"}</span>
            </button>
          </div>

          <div className="rounded-2xl p-4 sm:p-5 bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                    Kegiatan Sedang Aktif
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h4 className="text-sm sm:text-base font-black text-white mt-0.5">
                  {activeKegiatan.nama}
                </h4>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeKegiatan.tanggal.map((tgl, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-xs font-bold text-amber-300 flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Hari ke-{idx + 1}: {tgl}</span>
                </div>
              ))}
            </div>
          </div>

          {isAddingKegiatan && (
            <div className="rounded-2xl p-5 liquid-glass-subtle border border-brand-gold/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 text-brand-gold">
                <Sparkles className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
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
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-input text-xs sm:text-sm focus:outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-input text-xs sm:text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingKegiatan(false)}
                  className="liquid-btn-ghost px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleAddKegiatan}
                  className="liquid-btn-gold px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Simpan Kegiatan Baru
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
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
                        ? "bg-slate-900/90 border-2 border-brand-gold/60 shadow-xl"
                        : "liquid-glass-subtle border border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm sm:text-base text-white">
                            {kegiatan.nama}
                          </span>
                          {isActive ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
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
                            className="px-4 py-2 rounded-xl bg-brand-gold/20 hover:bg-brand-gold/30 text-brand-gold border border-brand-gold/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                            title="Aktifkan kegiatan ini untuk tampil di seluruh sistem"
                          >
                            <ToggleLeft className="w-4 h-4" />
                            <span>Jadikan Kegiatan Aktif</span>
                          </button>
                        ) : (
                          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                            <ToggleRight className="w-4 h-4" />
                            <span>Sedang Berjalan Live</span>
                          </div>
                        )}

                        {!isActive && kegiatanList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteKegiatan(kegiatan.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-all cursor-pointer"
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
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200"
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
                          className="flex-1 px-3 py-1.5 rounded-xl liquid-input text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddTanggalToKegiatan(kegiatan.id)}
                          className="liquid-btn-ghost px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
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

        <section className="liquid-glass-card rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center shrink-0">
                {isRegistrationOpen ? (
                  <ToggleRight className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-rose-400" />
                )}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
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
              className={`px-5 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2.5 transition-all cursor-pointer self-start sm:self-auto active:scale-95 ${
                isRegistrationOpen
                  ? "bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/50 shadow-lg shadow-emerald-500/20"
                  : "bg-rose-500/25 hover:bg-rose-500/35 text-rose-300 border border-rose-500/50 shadow-lg shadow-rose-500/20"
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

        <section className="liquid-glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
          <div className="flex items-center gap-3 pb-5 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
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
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? "bg-brand-gold text-slate-950 shadow-md font-extrabold"
                      : "liquid-glass-subtle text-slate-300 hover:text-white border border-white/10"
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

          <div className="p-5 rounded-2xl liquid-glass-subtle border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
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
                  className="flex-1 sm:w-72 px-3.5 py-2 rounded-xl liquid-input text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddPsikolog}
                  className="liquid-btn-gold px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
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
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-white/15 text-xs text-white shadow-sm"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-5 h-5 rounded-full bg-brand-gold/20 text-brand-gold font-bold text-[10px] flex items-center justify-center shrink-0">
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

        <section className="liquid-glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
          <div className="flex items-center gap-3 pb-5 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                4. Template Pesan Otomatis WhatsApp & Live Preview
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Sesuaikan teks pesan otomatis yang dikirimkan ke peserta melalui WhatsApp dengan variabel dinamis.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-300 text-xs font-bold">
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
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCopied
                        ? "bg-emerald-500/25 border border-emerald-500/50 text-emerald-300 font-bold"
                        : "bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200"
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

          <div className="flex border-b border-white/10 gap-2">
            <button
              type="button"
              onClick={() => setActiveWaTab("konfirmasi")}
              className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeWaTab === "konfirmasi"
                  ? "border-brand-gold text-brand-gold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Konfirmasi Sesi (Dapat Sesi)
            </button>
            <button
              type="button"
              onClick={() => setActiveWaTab("waiting_list")}
              className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeWaTab === "waiting_list"
                  ? "border-brand-gold text-brand-gold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Notifikasi Waiting List
            </button>
            <button
              type="button"
              onClick={() => setActiveWaTab("feedback")}
              className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
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
              <label className="block text-xs font-bold text-slate-300 uppercase">
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
                  className="w-full p-4 rounded-2xl liquid-input text-xs font-mono leading-relaxed focus:outline-none"
                />
              )}

              {activeWaTab === "waiting_list" && (
                <textarea
                  rows={10}
                  value={formData.wa_template_waiting_list}
                  onChange={(e) =>
                    setFormData({ ...formData, wa_template_waiting_list: e.target.value })
                  }
                  placeholder="Ketik template pesan antrean waiting list..."
                  className="w-full p-4 rounded-2xl liquid-input text-xs font-mono leading-relaxed focus:outline-none"
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
                  className="w-full p-4 rounded-2xl liquid-input text-xs font-mono leading-relaxed focus:outline-none"
                />
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase flex items-center justify-between">
                <span>WhatsApp Live Preview (Simulasi Peserta):</span>
                <span className="text-[10px] text-emerald-400 font-medium">Pratinjau Nyata</span>
              </label>

              <div className="rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-[#0b141a]">
                <div className="bg-[#1f2c34] px-4 py-2.5 flex items-center gap-3 border-b border-white/10">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white/95 p-0.5 shrink-0">
                    <img
                      src="/images/logo.jpg"
                      alt="ITB Career Center"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white leading-tight">
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

        <div className="sticky bottom-4 z-30 p-4 rounded-2xl liquid-glass-navbar border border-white/30 shadow-2xl flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-white">
              Simpan Konfigurasi Operasional
            </p>
            <p className="text-[11px] text-slate-300">
              Perubahan kegiatan aktif & jadwal akan langsung berdampak ke seluruh form publik dan panel admin.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="liquid-btn-gold px-8 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 transition-all w-full sm:w-auto"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyimpan Pengaturan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-slate-950" />
                <span>Simpan Seluruh Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
