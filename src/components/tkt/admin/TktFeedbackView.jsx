import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  Star,
  BookOpen,
  Lightbulb,
  UserCheck,
  Megaphone,
  Hourglass,
  CalendarCheck,
  MessageSquareHeart,
  RefreshCw,
  Search,
  Download,
  Sparkles,
  X
} from "lucide-react"
import {
  getSemuaFeedback,
  formatSesiCompact,
  normalizeWhatsAppNumber
} from "../../../services/tktService"

export default function TktFeedbackView({ availableDates = [], participants = [] }) {
  const [feedbackList, setFeedbackList] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedDate, setSelectedDate] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  const loadFeedbackData = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true)
    try {
      const data = await getSemuaFeedback()
      setFeedbackList(data || [])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadFeedbackData(true)
  }, [loadFeedbackData])

  const participantLookupByWa = useMemo(() => {
    const map = new Map()
    ;(participants || []).forEach((p) => {
      const norm = normalizeWhatsAppNumber(p.nomor_wa || "")
      if (norm) map.set(norm, p)
    })
    return map
  }, [participants])

  const participantLookupByEmail = useMemo(() => {
    const map = new Map()
    ;(participants || []).forEach((p) => {
      const email = String(p.email || "").trim().toLowerCase()
      if (email) map.set(email, p)
    })
    return map
  }, [participants])

  const enrichedFeedbackList = useMemo(() => {
    return (feedbackList || []).map((fb) => {
      let linked = fb.peserta_konseling || null
      if (!linked || !linked.jadwal_hari) {
        const fbWa = normalizeWhatsAppNumber(fb.nomor_wa_pengisi || "")
        const fbEmail = String(fb.email_pengisi || "").trim().toLowerCase()
        if (fbWa && participantLookupByWa.has(fbWa)) {
          linked = participantLookupByWa.get(fbWa)
        } else if (fbEmail && participantLookupByEmail.has(fbEmail)) {
          linked = participantLookupByEmail.get(fbEmail)
        }
      }
      return {
        ...fb,
        resolvedPeserta: linked
      }
    })
  }, [feedbackList, participantLookupByWa, participantLookupByEmail])

  const activeFeedbackList = useMemo(() => {
    if (!Array.isArray(availableDates) || availableDates.length === 0) {
      return enrichedFeedbackList
    }
    const activeDateSet = new Set(
      availableDates.map((d) => String(d || "").trim()).filter(Boolean)
    )

    return enrichedFeedbackList.filter((fb) => {
      const linkedDate = String(fb.resolvedPeserta?.jadwal_hari || "").trim()
      if (linkedDate) {
        if (!activeDateSet.has(linkedDate)) return false
        if (selectedDate !== "ALL" && linkedDate !== selectedDate) return false
        return true
      }
      return selectedDate === "ALL" && Boolean(fb.resolvedPeserta)
    })
  }, [enrichedFeedbackList, availableDates, selectedDate])

  const searchedFeedbackList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return activeFeedbackList
    return activeFeedbackList.filter((fb) => {
      const nama = String(fb.nama_pengisi || "").toLowerCase()
      const psi = String(fb.resolvedPeserta?.psikolog_bertugas || "").toLowerCase()
      const hari = String(fb.resolvedPeserta?.jadwal_hari || "").toLowerCase()
      const aspek = String(fb.aspek_lain || "").toLowerCase()
      const saran = String(fb.saran_feedback || "").toLowerCase()
      const sumber = String(fb.info_sumber || "").toLowerCase()
      return (
        nama.includes(q) ||
        psi.includes(q) ||
        hari.includes(q) ||
        aspek.includes(q) ||
        saran.includes(q) ||
        sumber.includes(q)
      )
    })
  }, [activeFeedbackList, searchQuery])

  const total = activeFeedbackList.length

  const totalHadirOrSelesai = useMemo(() => {
    const base =
      selectedDate === "ALL"
        ? participants
        : participants.filter((p) => p.jadwal_hari === selectedDate)
    return base.filter((p) => ["HADIR", "SELESAI_FULL"].includes(p.status_peserta)).length
  }, [participants, selectedDate])

  const responseRatePct =
    totalHadirOrSelesai > 0
      ? Math.min(100, Math.round((total / totalHadirOrSelesai) * 100))
      : 0

  const avgKepuasan =
    total > 0
      ? (
          activeFeedbackList.reduce((acc, c) => acc + (Number(c.rating_kepuasan) || 0), 0) / total
        ).toFixed(1)
      : "0.0"

  const avgMateri =
    total > 0
      ? (
          activeFeedbackList.reduce((acc, c) => acc + (Number(c.rating_materi) || 0), 0) / total
        ).toFixed(1)
      : "0.0"

  const avgPemahaman =
    total > 0
      ? (
          activeFeedbackList.reduce(
            (acc, c) => acc + (Number(c.rating_pemahaman_karir) || 0),
            0
          ) / total
        ).toFixed(1)
      : "0.0"

  const avgFasilitator =
    total > 0
      ? (
          activeFeedbackList.reduce(
            (acc, c) => acc + (Number(c.rating_fasilitator) || 0),
            0
          ) / total
        ).toFixed(1)
      : "0.0"

  const avgMotivasi =
    total > 0
      ? (
          activeFeedbackList.reduce(
            (acc, c) => acc + (Number(c.rating_motivasi) || 0),
            0
          ) / total
        ).toFixed(1)
      : "0.0"

  const sumberMap = {}
  const durasiMap = { "Terlalu Pendek": 0, Cukup: 0, "Terlalu Lama": 0 }
  const rencanaMap = { Ya: 0, Mungkin: 0, Tidak: 0 }

  activeFeedbackList.forEach((fb) => {
    const s = fb.info_sumber === "Yang lain" ? "Lainnya" : fb.info_sumber || "Lainnya"
    sumberMap[s] = (sumberMap[s] || 0) + 1

    if (durasiMap[fb.durasi_sesi] !== undefined) {
      durasiMap[fb.durasi_sesi] += 1
    }
    if (rencanaMap[fb.rencana_ikut_lagi] !== undefined) {
      rencanaMap[fb.rencana_ikut_lagi] += 1
    }
  })

  const handleExportFeedbackCsv = () => {
    if (searchedFeedbackList.length === 0) return

    const headers = [
      "No",
      "Waktu Pengisian",
      "Nama Peserta",
      "Hari Konseling",
      "Sesi Konseling",
      "Psikolog Bertugas",
      "Sumber Informasi",
      "Sumber Informasi Lainnya",
      "Skor Kepuasan Umum (1-5)",
      "Skor Materi Sesi (1-5)",
      "Skor Pemahaman Karier (1-5)",
      "Skor Kualitas Psikolog (1-5)",
      "Skor Motivasi (1-5)",
      "Rata-rata Skor",
      "Opini Durasi Sesi",
      "Rencana Ikut Lagi",
      "Aspek Lain yang Ingin Dibahas",
      "Saran & Masukan"
    ]

    const escapeCsv = (val) => {
      const str = String(val ?? "").replace(/"/g, '""')
      return `"${str}"`
    }

    const rows = searchedFeedbackList.map((fb, idx) => {
      const scores = [
        Number(fb.rating_kepuasan) || 0,
        Number(fb.rating_materi) || 0,
        Number(fb.rating_pemahaman_karir) || 0,
        Number(fb.rating_fasilitator) || 0,
        Number(fb.rating_motivasi) || 0
      ]
      const avgRow = (scores.reduce((a, b) => a + b, 0) / 5).toFixed(1)
      const createdStr = fb.created_at
        ? new Date(fb.created_at).toLocaleString("id-ID")
        : "-"

      return [
        idx + 1,
        createdStr,
        fb.nama_pengisi || "-",
        fb.resolvedPeserta?.jadwal_hari || "-",
        fb.resolvedPeserta?.jadwal_sesi
          ? formatSesiCompact(fb.resolvedPeserta.jadwal_sesi)
          : "-",
        fb.resolvedPeserta?.psikolog_bertugas || "-",
        fb.info_sumber || "-",
        fb.info_sumber_lain || "-",
        scores[0],
        scores[1],
        scores[2],
        scores[3],
        scores[4],
        avgRow,
        fb.durasi_sesi || "-",
        fb.rencana_ikut_lagi || "-",
        fb.aspek_lain || "-",
        fb.saran_feedback || "-"
      ]
        .map(escapeCsv)
        .join(",")
    })

    const csvContent = "\uFEFF" + [headers.map(escapeCsv).join(","), ...rows].join("\r\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Rekap_Feedback_TKT_ITB_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="liquid-neumorph-card rounded-3xl py-20 text-center border-t border-l border-white/20 shadow-xl">
        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-300 font-medium">
          Memuat data umpan balik dan evaluasi peserta...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="liquid-neumorph-card p-4 sm:p-5 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-t border-l border-white/20 shadow-xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="liquid-neumorph-inset flex items-center gap-1.5 p-1 rounded-2xl border border-white/10 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedDate("ALL")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedDate === "ALL"
                  ? "bg-brand-gold text-[#07131e] font-bold shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Semua Hari
            </button>
            {availableDates.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDate(d)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedDate === d
                    ? "bg-brand-gold text-[#07131e] font-bold shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="px-3.5 py-2 rounded-2xl liquid-neumorph-inset border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2">
            <MessageSquareHeart className="w-3.5 h-3.5 text-brand-gold shrink-0" />
            <span>
              Total Responden: <strong className="text-brand-gold font-mono">{total}</strong>
              {totalHadirOrSelesai > 0 && (
                <span className="text-slate-300 ml-1">
                  ({responseRatePct}% dari {totalHadirOrSelesai} hadir)
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, psikolog, saran..."
              className="liquid-neumorph-inset w-full pl-9 pr-8 py-2 rounded-xl text-xs font-medium text-white placeholder-slate-400 border border-white/10 focus:outline-none focus:border-brand-gold/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleExportFeedbackCsv}
            disabled={searchedFeedbackList.length === 0}
            className="liquid-neumorph-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-gold bg-brand-gold/15 hover:bg-brand-gold/25 border-t border-brand-gold/40 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh CSV</span>
          </button>

          <button
            type="button"
            onClick={() => loadFeedbackData()}
            disabled={refreshing}
            className="liquid-neumorph-inset px-3.5 py-2 rounded-xl text-slate-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-brand-gold" : ""}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="liquid-neumorph-card p-5 rounded-3xl relative overflow-hidden group border-t border-l border-white/20 shadow-xl hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-brand-gold uppercase tracking-wider">
              Kepuasan Umum
            </span>
            <div className="liquid-neumorph-pill w-9 h-9 rounded-xl bg-amber-500/15 border-t border-amber-400/30 flex items-center justify-center text-brand-gold">
              <Star className="w-4 h-4 fill-amber-400/20 text-brand-gold" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-brand-gold tracking-tight font-mono">
              {avgKepuasan}
            </span>
            <span className="text-xs text-amber-300/70 font-mono">/ 5.0</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-300">
            Rata-rata dari {total} responden
          </p>
        </div>

        <div className="liquid-neumorph-card p-5 rounded-3xl relative overflow-hidden group border-t border-l border-white/20 shadow-xl hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider">
              Materi Sesi
            </span>
            <div className="liquid-neumorph-pill w-9 h-9 rounded-xl bg-sky-500/15 border-t border-sky-400/30 flex items-center justify-center text-sky-300">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-sky-300 tracking-tight font-mono">
              {avgMateri}
            </span>
            <span className="text-xs text-sky-300/70 font-mono">/ 5.0</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-300">
            Relevansi & kedalaman bahasan
          </p>
        </div>

        <div className="liquid-neumorph-card p-5 rounded-3xl relative overflow-hidden group border-t border-l border-white/20 shadow-xl hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
              Pemahaman Karier
            </span>
            <div className="liquid-neumorph-pill w-9 h-9 rounded-xl bg-emerald-500/15 border-t border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Lightbulb className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-300 tracking-tight font-mono">
              {avgPemahaman}
            </span>
            <span className="text-xs text-emerald-300/70 font-mono">/ 5.0</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-300">
            Kejelasan arah langkah peserta
          </p>
        </div>

        <div className="liquid-neumorph-card p-5 rounded-3xl relative overflow-hidden group border-t border-l border-white/20 shadow-xl hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-brand-gold uppercase tracking-wider">
              Kualitas Psikolog
            </span>
            <div className="liquid-neumorph-pill w-9 h-9 rounded-xl bg-amber-500/15 border-t border-amber-400/30 flex items-center justify-center text-brand-gold">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-brand-gold tracking-tight font-mono">
              {avgFasilitator}
            </span>
            <span className="text-xs text-amber-300/70 font-mono">/ 5.0</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-300">
            Kompetensi & empati psikolog
          </p>
        </div>

        <div className="liquid-neumorph-card p-5 rounded-3xl relative overflow-hidden group border-t border-l border-white/20 shadow-xl hover:-translate-y-0.5 transition-all sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider">
              Motivasi Peserta
            </span>
            <div className="liquid-neumorph-pill w-9 h-9 rounded-xl bg-sky-500/15 border-t border-sky-400/30 flex items-center justify-center text-sky-300">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-sky-300 tracking-tight font-mono">
              {avgMotivasi}
            </span>
            <span className="text-xs text-sky-300/70 font-mono">/ 5.0</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-300">
            Dorongan semangat pasca sesi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="liquid-neumorph-card p-6 rounded-3xl border-t border-l border-white/20 shadow-xl">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="liquid-neumorph-pill w-8 h-8 rounded-xl bg-amber-500/15 border-t border-amber-400/30 flex items-center justify-center text-brand-gold">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Sumber Informasi Kegiatan</h3>
              <p className="text-[11px] text-slate-300">Saluran informasi yang menjangkau peserta</p>
            </div>
          </div>

          <div className="space-y-3 mt-5">
            {Object.keys(sumberMap).length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                Belum ada data sumber informasi.
              </p>
            ) : (
              Object.entries(sumberMap).map(([k, v]) => {
                const pct = total > 0 ? Math.round((v / total) * 100) : 0
                return (
                  <div key={k} className="liquid-neumorph-inset p-3 rounded-2xl border border-white/10">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-100 font-semibold">{k}</span>
                      <span className="text-brand-gold font-mono font-bold">
                        {v} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900/90 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="liquid-neumorph-card p-6 rounded-3xl border-t border-l border-white/20 shadow-xl">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="liquid-neumorph-pill w-8 h-8 rounded-xl bg-sky-500/15 border-t border-sky-400/30 flex items-center justify-center text-sky-300">
              <Hourglass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Evaluasi Durasi Sesi</h3>
              <p className="text-[11px] text-slate-300">Kesesuaian alokasi waktu konseling 40 menit</p>
            </div>
          </div>

          <div className="space-y-3 mt-5">
            {Object.entries(durasiMap).map(([k, v]) => {
              const pct = total > 0 ? Math.round((v / total) * 100) : 0
              const color =
                k === "Cukup"
                  ? "bg-emerald-400"
                  : k === "Terlalu Pendek"
                    ? "bg-amber-400"
                    : "bg-rose-400"
              return (
                <div key={k} className="liquid-neumorph-inset p-3 rounded-2xl border border-white/10">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-100 font-semibold">{k}</span>
                    <span className="text-slate-200 font-mono font-bold">
                      {v} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900/90 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="liquid-neumorph-card p-6 rounded-3xl border-t border-l border-white/20 shadow-xl">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="liquid-neumorph-pill w-8 h-8 rounded-xl bg-emerald-500/15 border-t border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Minat Mengikuti Kembali</h3>
              <p className="text-[11px] text-slate-300">Antusiasme peserta untuk sesi konseling berikutnya</p>
            </div>
          </div>

          <div className="space-y-3 mt-5">
            {Object.entries(rencanaMap).map(([k, v]) => {
              const pct = total > 0 ? Math.round((v / total) * 100) : 0
              const color =
                k === "Ya"
                  ? "bg-emerald-400"
                  : k === "Mungkin"
                    ? "bg-sky-400"
                    : "bg-slate-400"
              return (
                <div key={k} className="liquid-neumorph-inset p-3 rounded-2xl border border-white/10">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-100 font-semibold">{k}</span>
                    <span className="text-slate-200 font-mono font-bold">
                      {v} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900/90 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="liquid-neumorph-card rounded-3xl overflow-hidden border-t border-l border-white/20 shadow-2xl">
        <div className="p-5 border-b border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <MessageSquareHeart className="w-4 h-4 text-brand-gold" />
              <span>Daftar Rincian Evaluasi, Skor Aspek, & Masukan Peserta</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Menampilkan {searchedFeedbackList.length} dari {total} ulasan terverifikasi
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#081626]/90 text-slate-200 text-[11px] uppercase font-bold tracking-wider select-none border-b border-white/15">
                <th className="py-3.5 px-4 w-56">Peserta & Jadwal Sesi</th>
                <th className="py-3.5 px-4 w-52">Skor Penilaian (1-5)</th>
                <th className="py-3.5 px-4 w-44">Preferensi Layanan</th>
                <th className="py-3.5 px-4">Aspek Diskusi Tambahan</th>
                <th className="py-3.5 px-4">Saran & Masukan Konstruktif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {searchedFeedbackList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-300">
                    <p className="font-bold text-sm text-white">
                      {searchQuery
                        ? "Tidak ditemukan ulasan yang cocok dengan kata kunci pencarian."
                        : "Belum ada ulasan feedback peserta yang tercatat."}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery
                        ? "Coba gunakan kata kunci nama peserta atau psikolog lainnya."
                        : "Data akan tampil otomatis setelah peserta mengisi formulir feedback konseling."}
                    </p>
                  </td>
                </tr>
              ) : (
                searchedFeedbackList.map((fb) => {
                  const sKepuasan = Number(fb.rating_kepuasan) || 0
                  const sMateri = Number(fb.rating_materi) || 0
                  const sPemahaman = Number(fb.rating_pemahaman_karir) || 0
                  const sPsikolog = Number(fb.rating_fasilitator) || 0
                  const sMotivasi = Number(fb.rating_motivasi) || 0
                  const avgRow = (
                    (sKepuasan + sMateri + sPemahaman + sPsikolog + sMotivasi) /
                    5
                  ).toFixed(1)

                  return (
                    <tr key={fb.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-white text-xs sm:text-sm">
                          {fb.nama_pengisi}
                        </div>
                        <div className="text-[11px] text-brand-gold font-semibold mt-1 inline-block px-2 py-0.5 rounded-lg liquid-neumorph-inset border border-amber-400/30">
                          {fb.resolvedPeserta?.jadwal_hari || "-"} •{" "}
                          {fb.resolvedPeserta?.jadwal_sesi
                            ? formatSesiCompact(fb.resolvedPeserta.jadwal_sesi)
                            : "-"}
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1.5 font-medium">
                          Psikolog:{" "}
                          <span className="text-white font-semibold">
                            {fb.resolvedPeserta?.psikolog_bertugas || "-"}
                          </span>
                        </div>
                        {fb.created_at && (
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            Diisi:{" "}
                            {new Date(fb.created_at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 align-top">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-400/35 text-brand-gold font-bold text-xs mb-2">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-brand-gold" />
                          <span className="font-mono">{avgRow} / 5.0</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-300">
                          <span>Kepuasan: <strong className="text-white font-mono">{sKepuasan}</strong></span>
                          <span>Materi: <strong className="text-white font-mono">{sMateri}</strong></span>
                          <span>Karier: <strong className="text-white font-mono">{sPemahaman}</strong></span>
                          <span>Psikolog: <strong className="text-white font-mono">{sPsikolog}</strong></span>
                          <span>Motivasi: <strong className="text-white font-mono">{sMotivasi}</strong></span>
                        </div>
                      </td>

                      <td className="py-4 px-4 align-top space-y-1.5 text-[11px]">
                        <div>
                          <span className="text-slate-400">Durasi: </span>
                          <span className="font-semibold text-white">{fb.durasi_sesi || "-"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Ikut Lagi: </span>
                          <span className="font-semibold text-emerald-300">
                            {fb.rencana_ikut_lagi || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Info: </span>
                          <span className="font-semibold text-sky-300">
                            {fb.info_sumber || "-"}
                          </span>
                        </div>
                        {fb.info_sumber_lain && (
                          <div className="text-[10px] text-amber-300">
                            ({fb.info_sumber_lain})
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 align-top text-slate-200 leading-relaxed whitespace-normal">
                        {fb.aspek_lain ? (
                          <span>&ldquo;{fb.aspek_lain}&rdquo;</span>
                        ) : (
                          <span className="text-slate-400 italic">Tidak ada aspek tambahan</span>
                        )}
                      </td>

                      <td className="py-4 px-4 align-top text-slate-200 leading-relaxed whitespace-normal">
                        {fb.saran_feedback ? (
                          <span>&ldquo;{fb.saran_feedback}&rdquo;</span>
                        ) : (
                          <span className="text-slate-400 italic">Tidak ada saran khusus</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
