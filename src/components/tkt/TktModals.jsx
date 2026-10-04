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
  FileText
} from "lucide-react"

export function TktDetailModal({ isOpen, onClose, participant }) {
  if (!isOpen || !participant) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_25px_60px_rgba(0,33,71,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-navy/10 border border-brand-navy/20 flex items-center justify-center text-brand-navy font-bold text-xl">
            {participant.nama_lengkap?.charAt(0) || "P"}
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-neutral-900 leading-tight">
              {participant.nama_lengkap}
            </h3>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-navy/10 text-brand-navy border border-brand-navy/20">
              {participant.status_peserta?.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-neutral-700 max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-neutral-200/50">
              <span className="text-neutral-500">Nomor WhatsApp:</span>
              <span className="font-semibold text-neutral-900">{participant.nomor_wa || "-"}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-neutral-200/50">
              <span className="text-neutral-500">Email:</span>
              <span className="font-semibold text-neutral-900">{participant.email || "-"}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-neutral-200/50">
              <span className="text-neutral-500">Asal Universitas:</span>
              <span className="font-semibold text-neutral-900">{participant.asal_univ || "-"}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-neutral-200/50">
              <span className="text-neutral-500">Status Mahasiswa:</span>
              <span className="font-semibold text-neutral-900">{participant.status_mhs || "-"}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-neutral-200/50">
              <span className="text-neutral-500">Jurusan & Angkatan:</span>
              <span className="font-semibold text-neutral-900">
                {participant.jurusan || "-"} ({participant.angkatan || "-"})
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-neutral-500">Member ITB CC:</span>
              <span className="font-semibold text-neutral-900">
                {participant.is_member_itbcc ? "Ya (Member Aktif)" : "Belum / Non-Member"}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-brand-gold/10 border border-brand-gold/25 space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-brand-gold/20">
              <span className="text-neutral-600">Hari & Tanggal:</span>
              <span className="font-bold text-neutral-900">{participant.jadwal_hari || "-"}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-brand-gold/20">
              <span className="text-neutral-600">Sesi Waktu:</span>
              <span className="font-bold text-brand-navy">{participant.jadwal_sesi || "-"}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-neutral-600">Psikolog Bertugas:</span>
              <span className="font-bold text-neutral-900">{participant.psikolog_bertugas || "Menunggu Antrean"}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80">
            <p className="font-bold text-neutral-800 mb-1">Fokus Konsultasi:</p>
            <p className="text-neutral-600 mb-2">{participant.harapan_sesi || "-"}</p>
            {participant.detail_harapan && (
              <>
                <p className="font-bold text-neutral-800 mb-1">Catatan Tambahan Peserta:</p>
                <p className="text-neutral-600 italic bg-white p-2.5 rounded-xl border border-neutral-200/60">
                  "{participant.detail_harapan}"
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs cursor-pointer transition-colors"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  )
}

export function TktWalkInModal({ isOpen, onClose, onSave, dates, psikologList }) {
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    nomor_wa: "",
    email: "",
    asal_univ: "Institut Teknologi Bandung",
    status_mhs: "Mahasiswa Aktif ITB",
    jurusan: "",
    angkatan: "",
    is_member_itbcc: true,
    jadwal_hari: dates && dates.length > 0 ? dates[0] : "",
    jadwal_sesi: "09.00-09.45",
    psikolog_bertugas: psikologList && psikologList.length > 0 ? psikologList[0] : "Psikolog 1",
    status_peserta: "CONFIRMED",
    harapan_sesi: "Konsultasi Karier"
  })

  useEffect(() => {
    if (dates && dates.length > 0 && !formData.jadwal_hari) {
      setFormData((prev) => ({ ...prev, jadwal_hari: dates[0] }))
    }
  }, [dates])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-xl rounded-3xl p-6 sm:p-8 bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_25px_60px_rgba(0,33,71,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-neutral-900 leading-tight">
              Tambah Peserta Walk-In / Manual
            </h3>
            <p className="text-xs text-neutral-500">
              Daftarkan peserta langsung di booth konseling Titian Karir Terpadu.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
              Nama Lengkap Peserta
            </label>
            <input
              type="text"
              required
              value={formData.nama_lengkap}
              onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
              placeholder="Nama lengkap sesuai identitas"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Nomor WhatsApp
              </label>
              <input
                type="text"
                required
                value={formData.nomor_wa}
                onChange={(e) => setFormData({ ...formData, nomor_wa: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
                placeholder="0812xxxxxxx"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
                placeholder="email@domain.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Asal Institusi / Universitas
              </label>
              <input
                type="text"
                value={formData.asal_univ}
                onChange={(e) => setFormData({ ...formData, asal_univ: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Program Studi / Jurusan
              </label>
              <input
                type="text"
                value={formData.jurusan}
                onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
                placeholder="Contoh: Teknik Informatika"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Hari Kegiatan
              </label>
              <select
                value={formData.jadwal_hari}
                onChange={(e) => setFormData({ ...formData, jadwal_hari: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy"
              >
                {dates && dates.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Sesi Konseling
              </label>
              <select
                value={formData.jadwal_sesi}
                onChange={(e) => setFormData({ ...formData, jadwal_sesi: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy"
              >
                {sesiList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Psikolog Bertugas
              </label>
              <select
                value={formData.psikolog_bertugas}
                onChange={(e) => setFormData({ ...formData, psikolog_bertugas: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy"
              >
                {psikologList && psikologList.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Status Masuk
              </label>
              <select
                value={formData.status_peserta}
                onChange={(e) => setFormData({ ...formData, status_peserta: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy font-semibold"
              >
                <option value="CONFIRMED">CONFIRMED (Langsung Siap)</option>
                <option value="HADIR">HADIR (Di Booth Sekarang)</option>
                <option value="DAPAT_SESI">DAPAT SESI</option>
                <option value="WAITING_LIST">WAITING LIST</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Fokus Sesi
              </label>
              <select
                value={formData.harapan_sesi}
                onChange={(e) => setFormData({ ...formData, harapan_sesi: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy"
              >
                <option value="Konsultasi Karier">Konsultasi Karier</option>
                <option value="Review CV / Portofolio">Review CV / Portofolio</option>
                <option value="Keduanya">Keduanya (Konseling & CV)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold text-xs shadow-md cursor-pointer"
            >
              Simpan & Daftarkan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function TktEditModal({ isOpen, onClose, onSave, participant, dates, psikologList }) {
  const [formData, setFormData] = useState(null)

  useEffect(() => {
    if (participant) {
      setFormData({ ...participant })
    }
  }, [participant])

  if (!isOpen || !formData) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData.id, formData)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-xl rounded-3xl p-6 sm:p-8 bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_25px_60px_rgba(0,33,71,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-brand-navy/10 border border-brand-navy/20 flex items-center justify-center text-brand-navy">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-neutral-900 leading-tight">
              Edit Data Peserta
            </h3>
            <p className="text-xs text-neutral-500">
              Modifikasi rincian jadwal, psikolog, status, atau kontak peserta.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={formData.nama_lengkap || ""}
              onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Nomor WhatsApp
              </label>
              <input
                type="text"
                required
                value={formData.nomor_wa || ""}
                onChange={(e) => setFormData({ ...formData, nomor_wa: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Hari Kegiatan
              </label>
              <select
                value={formData.jadwal_hari || ""}
                onChange={(e) => setFormData({ ...formData, jadwal_hari: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy"
              >
                {dates && dates.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Sesi Konseling
              </label>
              <select
                value={formData.jadwal_sesi || ""}
                onChange={(e) => setFormData({ ...formData, jadwal_sesi: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy"
              >
                {sesiList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Psikolog Bertugas
              </label>
              <select
                value={formData.psikolog_bertugas || ""}
                onChange={(e) => setFormData({ ...formData, psikolog_bertugas: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy"
              >
                {psikologList && psikologList.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
              Status Peserta
            </label>
            <select
              value={formData.status_peserta || "DAPAT_SESI"}
              onChange={(e) => setFormData({ ...formData, status_peserta: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy font-bold text-brand-navy"
            >
              <option value="DAPAT_SESI">DAPAT SESI (Belum Konfirmasi)</option>
              <option value="CONFIRMED">CONFIRMED (Terkonfirmasi)</option>
              <option value="HADIR">HADIR (Sesi Berjalan di Booth)</option>
              <option value="SELESAI_FULL">SELESAI FULL (Selesai & Feedback)</option>
              <option value="WAITING_LIST">WAITING LIST (Daftar Tunggu)</option>
              <option value="BATAL">BATAL / DITOLAK</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold text-xs shadow-md cursor-pointer"
            >
              Perbarui Data
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function TktDeleteConfirmModal({ isOpen, onClose, onConfirm, participant }) {
  if (!isOpen || !participant) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_25px_60px_rgba(0,33,71,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-neutral-900 mb-1">
          Hapus Data Peserta?
        </h3>
        <p className="text-xs sm:text-sm text-neutral-600 mb-6 leading-relaxed">
          Tindakan ini akan menghapus peserta{" "}
          <strong className="text-neutral-900">{participant.nama_lengkap}</strong> dari jadwal TKT
          secara permanen.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm(participant.id)}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-md cursor-pointer transition-colors"
          >
            Hapus Permanen
          </button>
        </div>
      </div>
    </div>
  )
}
