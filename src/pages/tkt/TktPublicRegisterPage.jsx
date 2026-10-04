import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Calendar,
  Clock,
  User,
  GraduationCap,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Send,
  Lock
} from "lucide-react"
import { getSystemConfig, submitRegistration } from "../../services/tktService"

export default function TktPublicRegisterPage() {
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [config, setConfig] = useState(null)
  const [availableDates, setAvailableDates] = useState([])
  const [availablePsikologs, setAvailablePsikologs] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [submissionResult, setSubmissionResult] = useState(null)

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
    jadwal_hari: "",
    jadwal_sesi: "09.00-09.45",
    psikolog_pilihan: "Siapa saja (Rekomendasi)",
    harapan_sesi: "Konsultasi Karier",
    detail_harapan: ""
  })

  useEffect(() => {
    let isMounted = true
    async function loadConfig() {
      try {
        const cfg = await getSystemConfig()
        if (isMounted && cfg) {
          setConfig(cfg)
          const dates = []
          if (cfg.tanggal_kegiatan_1) dates.push(cfg.tanggal_kegiatan_1)
          if (cfg.tanggal_kegiatan_2) dates.push(cfg.tanggal_kegiatan_2)
          setAvailableDates(dates)
          if (dates.length > 0) {
            setFormData((prev) => ({ ...prev, jadwal_hari: dates[0] }))
          }
        }
      } finally {
        if (isMounted) {
          setLoadingConfig(false)
        }
      }
    }
    loadConfig()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!config || !formData.jadwal_hari) return

    let listKey = null
    if (formData.jadwal_hari === config.tanggal_kegiatan_1) {
      listKey = "psikolog_list_1"
    } else if (formData.jadwal_hari === config.tanggal_kegiatan_2) {
      listKey = "psikolog_list_2"
    }

    let names = []
    if (listKey && config[listKey]) {
      try {
        names = JSON.parse(config[listKey])
      } catch {
        names = ["Psikolog 1", "Psikolog 2", "Psikolog 3", "Psikolog 4", "Psikolog 5"]
      }
    } else {
      names = ["Psikolog 1", "Psikolog 2", "Psikolog 3", "Psikolog 4", "Psikolog 5"]
    }

    setAvailablePsikologs(names)
    setFormData((prev) => ({
      ...prev,
      psikolog_pilihan: "Siapa saja (Rekomendasi)"
    }))
  }, [config, formData.jadwal_hari])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nama_lengkap.trim()) {
      newErrors.nama_lengkap = "Nama lengkap wajib diisi"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Alamat email wajib diisi"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Format email tidak valid (contoh: nama@domain.com)"
    }

    if (!formData.nomor_wa.trim()) {
      newErrors.nomor_wa = "Nomor WhatsApp wajib diisi"
    } else if (!/^[0-9+]{9,16}$/.test(formData.nomor_wa.replace(/[\s-]/g, ""))) {
      newErrors.nomor_wa = "Format nomor WhatsApp tidak valid (contoh: 08123456789)"
    }

    if (formData.asal_univ_select === "Perguruan Tinggi Lain" && !formData.asal_univ_lain.trim()) {
      newErrors.asal_univ_lain = "Nama perguruan tinggi wajib diisi"
    }

    if (!formData.jurusan.trim()) {
      newErrors.jurusan = "Program studi wajib diisi"
    }

    if (!formData.angkatan.trim()) {
      newErrors.angkatan = "Tahun angkatan wajib diisi"
    }

    if (!formData.jadwal_hari) {
      newErrors.jadwal_hari = "Pilih hari pelaksanaan"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      window.scrollTo({ top: 300, behavior: "smooth" })
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
      jadwal_hari: formData.jadwal_hari,
      jadwal_sesi: formData.jadwal_sesi,
      psikolog_pilihan: formData.psikolog_pilihan,
      harapan_sesi: formData.harapan_sesi,
      detail_harapan: formData.detail_harapan.trim()
    }

    try {
      const result = await submitRegistration(payload)
      if (result.success) {
        setSubmissionResult({
          status: result.status,
          hari: result.hari,
          sesi: result.sesi,
          nama: formData.nama_lengkap
        })
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        setErrors((prev) => ({
          ...prev,
          general: result.message || "Pendaftaran tidak dapat diproses. Silakan coba kembali."
        }))
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: err.message || "Terjadi kendala pada jaringan. Silakan coba kembali."
      }))
    } finally {
      setSubmitting(false)
    }
  }

  const sesiList = [
    "09.00-09.45",
    "09.50-10.35",
    "10.40-11.25",
    "11.30-12.15",
    "13.15-14.00",
    "14.05-14.50",
    "14.55-15.40"
  ]

  if (loadingConfig) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-brand-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-300">
            Menyiapkan formulir pendaftaran...
          </p>
        </div>
      </div>
    )
  }

  const isRegistrationClosed = !config || config.status_pendaftaran !== "buka"

  if (isRegistrationClosed) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg liquid-glass-card rounded-3xl p-8 sm:p-10 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pendaftaran Sedang Ditutup
          </h2>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Mohon maaf, pendaftaran sesi konseling karier Titian Karir Terpadu saat ini belum dibuka atau kuota telah terpenuhi.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              className="liquid-btn-ghost px-6 py-3 rounded-full text-xs sm:text-sm font-bold inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Utama</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (submissionResult) {
    const isWaitingList = submissionResult.status === "WAITING_LIST"

    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl liquid-glass-card rounded-3xl p-8 sm:p-10 animate-fadeIn text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isWaitingList
                ? "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
            }`}
          >
            {isWaitingList ? <Clock className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isWaitingList ? "Terdaftar di Antrean Waiting List" : "Pendaftaran Berhasil Diterima"}
          </h2>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Terima kasih, <strong className="text-white">{submissionResult.nama}</strong>.
            {isWaitingList
              ? " Kuota sesi utama pada waktu yang Anda pilih telah terisi penuh. Data Anda telah masuk ke dalam daftar antrean tunggu."
              : " Sesi konseling Anda telah terjadwal. Informasi konfirmasi akan dikirimkan melalui WhatsApp."}
          </p>

          <div className="mt-6 p-4 rounded-2xl liquid-glass-subtle text-left text-xs sm:text-sm space-y-2">
            <div className="flex justify-between py-1 border-b border-white/10">
              <span className="text-slate-400">Hari & Tanggal:</span>
              <span className="font-semibold text-white">{submissionResult.hari}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/10">
              <span className="text-slate-400">Sesi Waktu:</span>
              <span className="font-semibold text-brand-gold">{submissionResult.sesi} WIB</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Status Alokasi:</span>
              <span
                className={`font-bold ${
                  isWaitingList ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {isWaitingList ? "Waiting List" : "Terkonfirmasi (Dapat Sesi)"}
              </span>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              className="liquid-btn-gold px-8 py-3 rounded-full text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Utama</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-8">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white/95 p-0.5 shadow-xl border border-white/40 mx-auto mb-4 flex items-center justify-center">
          <img
            src="/images/logo.jpg"
            alt="ITB Career Center"
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              e.target.style.display = "none"
            }}
          />
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Pendaftaran Konseling Karier
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm font-semibold text-brand-gold tracking-wide">
          Titian Karir Terpadu — ITB Career Center
        </p>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          Silakan lengkapi formulir di bawah ini untuk memilih jadwal sesi dan psikolog konselor Anda.
        </p>
      </div>

      <div className="liquid-glass-card rounded-3xl p-6 sm:p-10 shadow-2xl relative">
          {errors.general && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <User className="w-4 h-4 text-brand-gold" />
              <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                1. Data Diri Peserta
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nama Lengkap <span className="text-brand-gold">*</span>
              </label>
              <input
                type="text"
                name="nama_lengkap"
                value={formData.nama_lengkap}
                onChange={handleInputChange}
                placeholder="Nama lengkap sesuai identitas"
                className={`w-full px-4 py-3 rounded-xl liquid-input text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold ${
                  errors.nama_lengkap ? "border-rose-400" : ""
                }`}
              />
              {errors.nama_lengkap && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.nama_lengkap}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Alamat Email <span className="text-brand-gold">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="alamat.email@domain.com"
                  className={`w-full px-4 py-3 rounded-xl liquid-input text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold ${
                    errors.email ? "border-rose-400" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nomor WhatsApp <span className="text-brand-gold">*</span>
                </label>
                <input
                  type="tel"
                  name="nomor_wa"
                  value={formData.nomor_wa}
                  onChange={handleInputChange}
                  placeholder="08123456789"
                  className={`w-full px-4 py-3 rounded-xl liquid-input text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold ${
                    errors.nomor_wa ? "border-rose-400" : ""
                  }`}
                />
                {errors.nomor_wa && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.nomor_wa}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <GraduationCap className="w-4 h-4 text-brand-gold" />
              <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                2. Latar Belakang Pendidikan
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Status Kemahasiswaan <span className="text-brand-gold">*</span>
                </label>
                <select
                  name="status_mhs"
                  value={formData.status_mhs}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl liquid-input text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
                >
                  <option value="Mahasiswa Aktif ITB" className="bg-slate-900 text-white">
                    Mahasiswa Aktif ITB
                  </option>
                  <option value="Alumni ITB" className="bg-slate-900 text-white">
                    Alumni ITB
                  </option>
                  <option value="Mahasiswa Perguruan Tinggi Lain" className="bg-slate-900 text-white">
                    Mahasiswa Perguruan Tinggi Lain
                  </option>
                  <option value="Alumni Perguruan Tinggi Lain" className="bg-slate-900 text-white">
                    Alumni Perguruan Tinggi Lain
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Asal Perguruan Tinggi <span className="text-brand-gold">*</span>
                </label>
                <select
                  name="asal_univ_select"
                  value={formData.asal_univ_select}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl liquid-input text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
                >
                  <option value="Institut Teknologi Bandung" className="bg-slate-900 text-white">
                    Institut Teknologi Bandung
                  </option>
                  <option value="Perguruan Tinggi Lain" className="bg-slate-900 text-white">
                    Perguruan Tinggi Lain
                  </option>
                </select>
              </div>
            </div>

            {formData.asal_univ_select === "Perguruan Tinggi Lain" && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Perguruan Tinggi Lain <span className="text-brand-gold">*</span>
                </label>
                <input
                  type="text"
                  name="asal_univ_lain"
                  value={formData.asal_univ_lain}
                  onChange={handleInputChange}
                  placeholder="Sebutkan nama universitas / institut"
                  className={`w-full px-4 py-3 rounded-xl liquid-input text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold ${
                    errors.asal_univ_lain ? "border-rose-400" : ""
                  }`}
                />
                {errors.asal_univ_lain && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.asal_univ_lain}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Program Studi / Jurusan <span className="text-brand-gold">*</span>
                </label>
                <input
                  type="text"
                  name="jurusan"
                  value={formData.jurusan}
                  onChange={handleInputChange}
                  placeholder="Contoh: Teknik Informatika"
                  className={`w-full px-4 py-3 rounded-xl liquid-input text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold ${
                    errors.jurusan ? "border-rose-400" : ""
                  }`}
                />
                {errors.jurusan && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.jurusan}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tahun Angkatan <span className="text-brand-gold">*</span>
                </label>
                <input
                  type="text"
                  name="angkatan"
                  value={formData.angkatan}
                  onChange={handleInputChange}
                  placeholder="Contoh: 2022"
                  className={`w-full px-4 py-3 rounded-xl liquid-input text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold ${
                    errors.angkatan ? "border-rose-400" : ""
                  }`}
                />
                {errors.angkatan && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.angkatan}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Status Keanggotaan ITB Career Center <span className="text-brand-gold">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    formData.is_member_itbcc === "true"
                      ? "bg-brand-gold/15 border-brand-gold/50 text-white"
                      : "liquid-glass-subtle border-white/10 text-slate-300 hover:border-white/25"
                  }`}
                >
                  <input
                    type="radio"
                    name="is_member_itbcc"
                    value="true"
                    checked={formData.is_member_itbcc === "true"}
                    onChange={handleInputChange}
                    className="text-brand-gold focus:ring-brand-gold"
                  />
                  <span className="text-xs font-medium">Sudah Menjadi Member Aktif</span>
                </label>

                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    formData.is_member_itbcc === "false"
                      ? "bg-brand-gold/15 border-brand-gold/50 text-white"
                      : "liquid-glass-subtle border-white/10 text-slate-300 hover:border-white/25"
                  }`}
                >
                  <input
                    type="radio"
                    name="is_member_itbcc"
                    value="false"
                    checked={formData.is_member_itbcc === "false"}
                    onChange={handleInputChange}
                    className="text-brand-gold focus:ring-brand-gold"
                  />
                  <span className="text-xs font-medium">Belum Menjadi Member</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Calendar className="w-4 h-4 text-brand-gold" />
              <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                3. Jadwal & Preferensi Konseling
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Hari & Tanggal Pelaksanaan <span className="text-brand-gold">*</span>
                </label>
                <select
                  name="jadwal_hari"
                  value={formData.jadwal_hari}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl liquid-input text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
                >
                  {availableDates.map((date) => (
                    <option key={date} value={date} className="bg-slate-900 text-white">
                      {date}
                    </option>
                  ))}
                </select>
                {errors.jadwal_hari && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.jadwal_hari}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Sesi Waktu Konseling <span className="text-brand-gold">*</span>
                </label>
                <select
                  name="jadwal_sesi"
                  value={formData.jadwal_sesi}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl liquid-input text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
                >
                  {sesiList.map((sesi) => (
                    <option key={sesi} value={sesi} className="bg-slate-900 text-white">
                      {sesi} WIB
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Preferensi Psikolog Konselor
              </label>
              <select
                name="psikolog_pilihan"
                value={formData.psikolog_pilihan}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl liquid-input text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
              >
                <option value="Siapa saja (Rekomendasi)" className="bg-slate-900 text-white">
                  Siapa saja (Rekomendasi Sistem)
                </option>
                {availablePsikologs.map((psi) => (
                  <option key={psi} value={psi} className="bg-slate-900 text-white">
                    {psi}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <MessageSquare className="w-4 h-4 text-brand-gold" />
              <h2 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                4. Fokus Konseling
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Topik yang Ingin Dikonsultasikan <span className="text-brand-gold">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {["Konsultasi Karier", "Review CV / Portofolio", "Keduanya"].map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      formData.harapan_sesi === opt
                        ? "bg-brand-gold/15 border-brand-gold/50 text-white"
                        : "liquid-glass-subtle border-white/10 text-slate-300 hover:border-white/25"
                    }`}
                  >
                    <input
                      type="radio"
                      name="harapan_sesi"
                      value={opt}
                      checked={formData.harapan_sesi === opt}
                      onChange={handleInputChange}
                      className="text-brand-gold focus:ring-brand-gold"
                    />
                    <span className="text-xs font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Catatan Tambahan atau Harapan Khusus (Opsional)
              </label>
              <textarea
                name="detail_harapan"
                rows={3}
                value={formData.detail_harapan}
                onChange={handleInputChange}
                placeholder="Tuliskan topik atau kendala spesifik yang ingin Anda diskusikan..."
                className="w-full px-4 py-3 rounded-xl liquid-input text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
            <Link
              to="/"
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Utama</span>
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full liquid-btn-gold text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-all"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Memproses Pendaftaran...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Pendaftaran Konseling</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
