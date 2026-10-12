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
  RefreshCw
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

  const activeFeedbackList = useMemo(() => {
    if (!Array.isArray(availableDates) || availableDates.length === 0) {
      return feedbackList
    }
    const activeDateSet = new Set(
      availableDates.map((d) => String(d || "").trim()).filter(Boolean)
    )
    const activeWaSet = new Set(
      (participants || [])
        .map((p) => normalizeWhatsAppNumber(p.nomor_wa || ""))
        .filter(Boolean)
    )
    const activeEmailSet = new Set(
      (participants || [])
        .map((p) => String(p.email || "").trim().toLowerCase())
        .filter(Boolean)
    )

    return feedbackList.filter((fb) => {
      const linkedDate = String(fb.peserta_konseling?.jadwal_hari || "").trim()
      if (linkedDate) {
        return activeDateSet.has(linkedDate)
      }
      const fbWa = normalizeWhatsAppNumber(fb.nomor_wa_pengisi || "")
      if (fbWa && activeWaSet.has(fbWa)) {
        return true
      }
      const fbEmail = String(fb.email_pengisi || "").trim().toLowerCase()
      if (fbEmail && activeEmailSet.has(fbEmail)) {
        return true
      }
      return false
    })
  }, [feedbackList, availableDates, participants])

  const total = activeFeedbackList.length

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

  if (loading) {
    return (
      <div className="liquid-neumorph-card py-20 text-center border-t border-l border-white/20">
        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400 font-medium">
          Memuat data umpan balik dan evaluasi peserta...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="liquid-neumorph-card p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-l border-white/20">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareHeart className="w-5 h-5 text-brand-gold" />
            <h2 className="text-base font-semibold text-white tracking-tight">
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
          className="liquid-neumorph-inset px-3.5 py-1.5 rounded-xl text-slate-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Segarkan Feedback</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="liquid-neumorph-card p-5 relative overflow-hidden group border-t border-l border-white/20 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-brand-gold uppercase tracking-wider">
              Kepuasan Umum
            </span>
            <div className="liquid-neumorph-pill w-8 h-8 rounded-lg bg-amber-500/10 border-t border-amber-400/25 flex items-center justify-center text-brand-gold">
              <Star className="w-4 h-4 fill-amber-400/20 text-brand-gold" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-brand-gold tracking-tight">
              {avgKepuasan}
            </span>
            <span className="text-xs text-amber-400/60 font-mono">/ 5.0</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-medium">
            Dari total {total} responden terdaftar
          </p>
        </div>

        <div className="liquid-neumorph-card p-5 relative overflow-hidden group border-t border-l border-white/20 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider">
              Materi Sesi
            </span>
            <div className="liquid-neumorph-pill w-8 h-8 rounded-lg bg-sky-500/10 border-t border-sky-400/25 flex items-center justify-center text-sky-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-sky-300 tracking-tight">
              {avgMateri}
            </span>
            <span className="text-xs text-sky-400/60 font-mono">/ 5.0</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-medium">
            Relevansi dan kedalaman bahasan
          </p>
        </div>

        <div className="liquid-neumorph-card p-5 relative overflow-hidden group border-t border-l border-white/20 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
              Pemahaman Karier
            </span>
            <div className="liquid-neumorph-pill w-8 h-8 rounded-lg bg-emerald-500/10 border-t border-emerald-400/25 flex items-center justify-center text-emerald-400">
              <Lightbulb className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-emerald-300 tracking-tight">
              {avgPemahaman}
            </span>
            <span className="text-xs text-emerald-400/60 font-mono">/ 5.0</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-medium">
            Peningkatan kejelasan langkah peserta
          </p>
        </div>

        <div className="liquid-neumorph-card p-5 relative overflow-hidden group border-t border-l border-white/20 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-brand-gold uppercase tracking-wider">
              Kualitas Psikolog
            </span>
            <div className="liquid-neumorph-pill w-8 h-8 rounded-lg bg-amber-500/10 border-t border-amber-400/25 flex items-center justify-center text-brand-gold">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-brand-gold tracking-tight">
              {avgFasilitator}
            </span>
            <span className="text-xs text-amber-400/60 font-mono">/ 5.0</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-medium">
            Kompetensi dan empati konselor
          </p>
        </div>

        <div className="liquid-neumorph-card p-5 relative overflow-hidden group border-t border-l border-white/20 hover:-translate-y-0.5 transition-transform col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider">
              Motivasi Peserta
            </span>
            <div className="liquid-neumorph-pill w-8 h-8 rounded-lg bg-sky-500/10 border-t border-sky-400/25 flex items-center justify-center text-sky-400">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-sky-300 tracking-tight">
              {avgMotivasi}
            </span>
            <span className="text-xs text-sky-400/60 font-mono">/ 5.0</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-medium">
            Dorongan semangat pasca sesi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="liquid-neumorph-card p-6 border-t border-l border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-4 h-4 text-brand-gold" />
            <h3 className="text-sm font-semibold text-white">Sumber Informasi</h3>
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
                    <div className="liquid-neumorph-inset w-full h-2 rounded-full p-0.5 border border-white/5">
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

        <div className="liquid-neumorph-card p-6 border-t border-l border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <Hourglass className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-white">Opini Durasi Sesi</h3>
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
                  <div className="liquid-neumorph-inset w-full h-2 rounded-full p-0.5 border border-white/5">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="liquid-neumorph-card p-6 border-t border-l border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Rencana Mengikuti Lagi</h3>
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
                  <div className="liquid-neumorph-inset w-full h-2 rounded-full p-0.5 border border-white/5">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="liquid-neumorph-card rounded-2xl overflow-hidden border border-white/10">
        <div className="p-4 border-b border-white/10 bg-slate-900/60">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Ulasan Peserta, Aspek Diskusi Tambahan, & Saran</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-300 text-[11px] uppercase font-semibold tracking-wider select-none border-b border-white/10">
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
                activeFeedbackList.map((fb) => (
                  <tr key={fb.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-white">{fb.nama_pengisi}</div>
                      <div className="text-[10px] text-brand-gold mt-1 inline-block px-1.5 py-0.5 rounded liquid-neumorph-pill border-t border-brand-gold/30">
                        {fb.peserta_konseling?.jadwal_hari || "-"} |{" "}
                        {fb.peserta_konseling?.jadwal_sesi
                          ? formatSesiCompact(fb.peserta_konseling.jadwal_sesi)
                          : "-"}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Psikolog: {fb.peserta_konseling?.psikolog_bertugas || "-"}
                      </div>
                      {fb.info_sumber_lain && (
                        <div className="text-[11px] text-amber-300/90 mt-1">
                          Sumber Info Lain: {fb.info_sumber_lain}
                        </div>
                      )}
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
