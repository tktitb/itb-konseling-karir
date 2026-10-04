import React, { useState, useEffect, useCallback } from "react"
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
  Sparkles
} from "lucide-react"
import { getSemuaFeedback } from "../../../services/tktService"

export default function TktFeedbackView() {
  const [feedbackList, setFeedbackList] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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

  const total = feedbackList.length

  const avgKepuasan =
    total > 0
      ? (
          feedbackList.reduce((acc, c) => acc + (Number(c.rating_kepuasan) || 0), 0) / total
        ).toFixed(1)
      : "0.0"

  const avgMateri =
    total > 0
      ? (
          feedbackList.reduce((acc, c) => acc + (Number(c.rating_materi) || 0), 0) / total
        ).toFixed(1)
      : "0.0"

  const avgPemahaman =
    total > 0
      ? (
          feedbackList.reduce(
            (acc, c) => acc + (Number(c.rating_pemahaman_karir) || 0),
            0
          ) / total
        ).toFixed(1)
      : "0.0"

  const avgFasilitator =
    total > 0
      ? (
          feedbackList.reduce(
            (acc, c) => acc + (Number(c.rating_fasilitator) || 0),
            0
          ) / total
        ).toFixed(1)
      : "0.0"

  const sumberMap = {}
  const durasiMap = { "Terlalu Pendek": 0, Cukup: 0, "Terlalu Lama": 0 }
  const rencanaMap = { Ya: 0, Mungkin: 0, Tidak: 0 }

  feedbackList.forEach((fb) => {
    const s = fb.info_sumber === "Yang lain" ? "Lainnya" : fb.info_sumber || "Lainnya"
    sumberMap[s] = (sumberMap[s] || 0) + 1

    if (durasiMap[fb.durasi_sesi] !== undefined) {
      durasiMap[fb.durasi_sesi] += 1
    }
    if (rencanaMap[fb.rencana_ikut_lagi] !== undefined) {
      rencanaMap[fb.rencana_ikut_lagi] += 1
    }
  })

  if (loading) {
    return (
      <div className="liquid-glass-card py-20 text-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400 font-medium">
          Memuat data umpan balik dan evaluasi peserta...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="liquid-glass-card p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareHeart className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Evaluasi & Feedback Peserta Konseling
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Rekapitulasi kepuasan peserta, penilaian psikolog, serta evaluasi kualitatif layanan.
          </p>
        </div>

        <button
          onClick={() => loadFeedbackData()}
          disabled={refreshing}
          className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Segarkan Feedback</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="liquid-glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              Kepuasan Umum
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400/20 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-300 tracking-tight">
              {avgKepuasan}
            </span>
            <span className="text-xs text-amber-400/60 font-mono">/ 5.0</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Dari total {total} responden terdaftar
          </p>
        </div>

        <div className="liquid-glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">
              Materi Sesi
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-sky-300 tracking-tight">
              {avgMateri}
            </span>
            <span className="text-xs text-sky-400/60 font-mono">/ 5.0</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Relevansi dan kedalaman bahasan
          </p>
        </div>

        <div className="liquid-glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
              Pemahaman Karier
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
              <Lightbulb className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-300 tracking-tight">
              {avgPemahaman}
            </span>
            <span className="text-xs text-emerald-400/60 font-mono">/ 5.0</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Peningkatan kejelasan langkah peserta
          </p>
        </div>

        <div className="liquid-glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              Kualitas Psikolog
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-300 tracking-tight">
              {avgFasilitator}
            </span>
            <span className="text-xs text-amber-400/60 font-mono">/ 5.0</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Kompetensi dan empati konselor
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="liquid-glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Sumber Informasi</h3>
          </div>
          <p className="text-xs text-slate-300 mb-5">
            Saluran yang paling efektif menjangkau peserta.
          </p>
          <div className="space-y-3">
            {Object.keys(sumberMap).length === 0 ? (
              <p className="text-xs text-slate-500 italic">Belum ada respon</p>
            ) : (
              Object.entries(sumberMap).map(([k, v]) => {
                const pct = total > 0 ? Math.round((v / total) * 100) : 0
                return (
                  <div key={k}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-200">{k}</span>
                      <span className="text-slate-400 font-mono">{v} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="liquid-glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Hourglass className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Opini Durasi Sesi</h3>
          </div>
          <p className="text-xs text-slate-300 mb-5">
            Kesesuaian alokasi waktu konseling 45 menit.
          </p>
          <div className="space-y-3">
            {Object.entries(durasiMap).map(([k, v]) => {
              const pct = total > 0 ? Math.round((v / total) * 100) : 0
              const color =
                k === "Cukup"
                  ? "bg-emerald-400"
                  : k === "Terlalu Pendek"
                  ? "bg-amber-400"
                  : "bg-rose-400"
              return (
                <div key={k}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-200">{k}</span>
                    <span className="text-slate-400 font-mono">{v} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="liquid-glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Rencana Mengikuti Lagi</h3>
          </div>
          <p className="text-xs text-slate-300 mb-5">
            Minat peserta mengikuti konseling lanjutan.
          </p>
          <div className="space-y-3">
            {Object.entries(rencanaMap).map(([k, v]) => {
              const pct = total > 0 ? Math.round((v / total) * 100) : 0
              const color =
                k === "Ya"
                  ? "bg-emerald-400"
                  : k === "Mungkin"
                  ? "bg-sky-400"
                  : "bg-slate-500"
              return (
                <div key={k}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-200">{k}</span>
                    <span className="text-slate-400 font-mono">{v} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="liquid-glass-card rounded-2xl overflow-hidden border border-white/10">
        <div className="p-4 border-b border-white/10 bg-slate-900/60">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Ulasan Peserta, Aspek Diskusi Tambahan, & Saran</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-300 text-[11px] uppercase font-bold tracking-wider select-none border-b border-white/10">
                <th className="py-3 px-4 w-1/4">Peserta & Sesi</th>
                <th className="py-3 px-4 w-1/3">Aspek Lain yang Ingin Dibahas</th>
                <th className="py-3 px-4 w-1/3">Saran & Masukan Konstruktif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {total === 0 ? (
                <tr>
                  <td colSpan={3} className="py-16 text-center text-slate-400">
                    <p className="font-semibold text-sm text-slate-300">
                      Belum ada ulasan feedback peserta yang tercatat.
                    </p>
                    <p className="text-xs mt-1">
                      Data akan muncul otomatis setelah peserta yang hadir mengisi form ulasan.
                    </p>
                  </td>
                </tr>
              ) : (
                feedbackList.map((fb) => (
                  <tr key={fb.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-white">{fb.nama_pengisi}</div>
                      <div className="text-[10px] text-amber-300 mt-1 inline-block px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-400/20">
                        {fb.peserta_konseling?.jadwal_hari || "-"} |{" "}
                        {fb.peserta_konseling?.jadwal_sesi || "-"}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Psikolog: {fb.peserta_konseling?.psikolog_bertugas || "-"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top text-slate-300 italic whitespace-normal">
                      &ldquo;{fb.aspek_lain || "Tidak ada aspek tambahan"}&rdquo;
                    </td>

                    <td className="py-3.5 px-4 align-top text-slate-300 italic whitespace-normal">
                      &ldquo;{fb.saran_feedback || "Tidak ada saran khusus"}&rdquo;
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
