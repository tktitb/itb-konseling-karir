import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  User,
  GraduationCap,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Loader2,
  ShieldCheck
} from "lucide-react"
import {
  getPesertaById,
  confirmKehadiranPeserta,
  getSystemConfig,
  getActiveEventInfo,
  formatSesiFull
} from "../../services/tktService"

export default function TktConfirmAttendancePage() {
  const { id } = useParams()
  const [participant, setParticipant] = useState(null)
  const [activeEventName, setActiveEventName] = useState("Titian Karir Terpadu ITB")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [justConfirmed, setJustConfirmed] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let mounted = true
    async function loadData() {
      setLoading(true)
      setErrorMessage("")
      try {
        const [pesertaData, configData] = await Promise.all([
          getPesertaById(id),
          getSystemConfig()
        ])
        if (!mounted) return
        if (configData) {
          const info = getActiveEventInfo(configData)
          if (info && info.nama) {
            setActiveEventName(info.nama)
          }
        }
        setParticipant(pesertaData)
      } catch {
        if (mounted) {
          setParticipant(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    loadData()
    return () => {
      mounted = false
    }
  }, [id])

  const handleConfirm = async () => {
    if (!participant || submitting) return
    setSubmitting(true)
    setErrorMessage("")
    try {
      const res = await confirmKehadiranPeserta(participant.id)
      if (!res.success) {
        setErrorMessage(
          res.message || "Gagal mengonfirmasi kehadiran. Silakan coba beberapa saat lagi."
        )
        if (res.participant) {
          setParticipant(res.participant)
        }
        return
      }
      setParticipant(res.participant)
      if (!res.alreadyConfirmed) {
        setJustConfirmed(true)
      }
    } catch {
      setErrorMessage("Terjadi kendala jaringan saat menyimpan konfirmasi. Silakan coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="p-8 sm:p-12 rounded-3xl liquid-neumorph-card border-t border-l border-white/20 text-center shadow-2xl">
          <Loader2 className="w-10 h-10 text-brand-gold animate-spin mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Memuat Data Jadwal Konseling...
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Mohon tunggu sebentar, kami sedang memverifikasi tautan konfirmasi pribadi Anda.
          </p>
        </div>
      </div>
    )
  }

  if (!participant) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="p-8 sm:p-10 rounded-3xl liquid-neumorph-card border-t border-l border-white/20 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/35 flex items-center justify-center mx-auto mb-5 text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Tautan Konfirmasi Tidak Ditemukan
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Maaf, data pendaftaran untuk tautan ini tidak ditemukan atau tautan tidak lengkap. Pastikan
            Anda membuka tautan konfirmasi utuh sesuai pesan WhatsApp resmi dari Tim Konseling Karier
            ITB Career Center.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/tkt"
              className="liquid-btn-gold px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all inline-flex items-center gap-2 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ke Halaman Utama Konseling TKT</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isConfirmedOrDone =
    participant.status_peserta === "CONFIRMED" ||
    participant.status_peserta === "HADIR" ||
    participant.status_peserta === "SELESAI_FULL"

  const isCancelled = participant.status_peserta === "BATAL"

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          to="/tkt"
          className="liquid-neumorph-inset px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white border border-white/10 inline-flex items-center gap-2 transition-all active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-brand-gold" />
          <span>Halaman Jadwal TKT</span>
        </Link>

        <div className="liquid-neumorph-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-gold/10 border-t border-brand-gold/30 text-brand-gold text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Tautan Pribadi Peserta</span>
        </div>
      </div>

      <div className="rounded-3xl liquid-neumorph-card border-t border-l border-white/20 shadow-2xl overflow-hidden">
        <div className="px-6 sm:px-10 py-8 sm:py-9 border-b border-white/10 bg-[#081523]/60 text-center relative">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-white/95 shadow-lg border border-white/40 flex items-center justify-center p-0.5 mx-auto mb-4">
            <img
              src="/images/logo.jpg"
              alt="ITB Career Center"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.target.style.display = "none"
              }}
            />
          </div>

          {isConfirmedOrDone ? (
            <>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {justConfirmed
                    ? "Kehadiran Berhasil Dikonfirmasi"
                    : "Status: Sudah Terkonfirmasi"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                {justConfirmed
                  ? "Terima Kasih! Kehadiran Anda Terkonfirmasi"
                  : "Kehadiran Anda Sudah Terkonfirmasi"}
              </h1>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                {justConfirmed ? (
                  <>
                    Halo <strong className="text-white">{participant.nama_lengkap}</strong>, status
                    jadwal Anda pada kegiatan{" "}
                    <span className="text-brand-gold font-semibold">{activeEventName}</span> telah
                    otomatis tercatat sebagai{" "}
                    <strong className="text-emerald-300">Terkonfirmasi (Confirmed)</strong>.
                  </>
                ) : (
                  <>
                    Halo <strong className="text-white">{participant.nama_lengkap}</strong>, Anda
                    telah mengonfirmasi kehadiran sebelumnya. Jadwal sesi konseling Anda pada{" "}
                    <span className="text-brand-gold font-semibold">{activeEventName}</span> sudah
                    tercatat resmi di sistem kami.
                  </>
                )}
              </p>
            </>
          ) : isCancelled ? (
            <>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Status: Jadwal Dibatalkan</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Sesi Konseling Telah Dibatalkan
              </h1>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Halo <strong className="text-white">{participant.nama_lengkap}</strong>, jadwal sesi
                konseling di bawah ini tercatat berstatus <strong>Batal</strong>. Apabila Anda
                memerlukan bantuan penjadwalan ulang, silakan hubungi tim admin kami melalui
                WhatsApp.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-brand-gold text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Menunggu Konfirmasi Kehadiran</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Konfirmasi Kehadiran Konseling Karier
              </h1>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Halo <strong className="text-white">{participant.nama_lengkap}</strong>, Anda
                tercatat telah terdaftar pada layanan Konseling Karier{" "}
                <span className="text-brand-gold font-semibold">{activeEventName}</span>. Mohon
                periksa rincian jadwal Anda di bawah ini dan klik tombol konfirmasi untuk
                memastikan kehadiran Anda.
              </p>
            </>
          )}
        </div>

        <div className="p-6 sm:p-9 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/35 text-rose-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-rose-300">Konfirmasi Belum Berhasil</p>
                <p className="text-rose-200/90 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="liquid-neumorph-inset p-5 sm:p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl liquid-neumorph-pill bg-brand-gold/15 border-t border-brand-gold/30 flex items-center justify-center text-brand-gold shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-white">
                    Rincian Pendaftaran & Jadwal Sesi
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    Bukti resmi pendaftaran Konseling Karier ITB Career Center
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                  isConfirmedOrDone
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/35"
                    : isCancelled
                    ? "bg-rose-500/15 text-rose-300 border-rose-500/35"
                    : "bg-amber-500/15 text-brand-gold border-amber-500/35"
                }`}
              >
                {participant.status_peserta === "CONFIRMED"
                  ? "TERKONFIRMASI"
                  : participant.status_peserta === "HADIR" ||
                    participant.status_peserta === "SELESAI_FULL"
                  ? "HADIR"
                  : participant.status_peserta === "BATAL"
                  ? "DIBATALKAN"
                  : "TERDAFTAR"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-3.5 rounded-xl bg-[#091726]/70 border border-white/8 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <User className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Nama Lengkap Peserta</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white">
                  {participant.nama_lengkap || "-"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#091726]/70 border border-white/8 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Institusi & Program Studi</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white">
                  {participant.asal_univ || "-"}
                </p>
                <p className="text-[11px] text-slate-300">
                  {participant.jurusan || "-"}
                  {participant.angkatan ? ` • Angkatan ${participant.angkatan}` : ""}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#091726]/70 border border-white/8 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Tanggal Kegiatan</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white">
                  {participant.jadwal_hari || "-"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#091726]/70 border border-white/8 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Waktu Sesi Konseling</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-brand-gold">
                  {participant.jadwal_sesi ? formatSesiFull(participant.jadwal_sesi) : "-"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#091726]/70 border border-white/8 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Psikolog Bertugas</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white">
                  {participant.psikolog_bertugas || "Psikolog Bertugas"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#091726]/70 border border-white/8 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Lokasi Konseling</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white">Aula Timur ITB</p>
              </div>
            </div>

            {participant.topik_konsultasi && (
              <div className="p-3.5 rounded-xl bg-[#091726]/70 border border-white/8 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Topik Konsultasi Pilihan</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
                  {participant.topik_konsultasi}
                </p>
              </div>
            )}
          </div>

          {!isCancelled && (
            <div className="p-4 sm:p-5 rounded-2xl bg-brand-gold/10 border border-brand-gold/25 text-xs sm:text-sm text-slate-200 space-y-1.5 leading-relaxed">
              <p className="font-semibold text-brand-gold">Informasi Kehadiran di Lokasi:</p>
              <p className="text-slate-300">
                Mohon hadir <strong>10–15 menit sebelum sesi dimulai</strong> di{" "}
                <strong>Aula Timur ITB</strong> untuk melakukan registrasi ulang. Bagi peserta yang
                ingin membawa CV (soft file maupun hardcopy) sangat diperbolehkan.
              </p>
            </div>
          )}

          {!isConfirmedOrDone && !isCancelled ? (
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full liquid-btn-gold py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses Konfirmasi Kehadiran...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Kehadiran Saya Sekarang</span>
                  </>
                )}
              </button>
              <p className="text-[11px] sm:text-xs text-center text-slate-400">
                Dengan menekan tombol di atas, status kehadiran Anda akan langsung tercatat sebagai{" "}
                <strong className="text-slate-200">Confirmed</strong> pada sistem Konseling Karier
                ITB.
              </p>
            </div>
          ) : (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/tkt"
                className="w-full sm:w-auto liquid-btn-gold px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all inline-flex items-center justify-center gap-2 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Lihat Halaman Jadwal Konseling TKT</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
