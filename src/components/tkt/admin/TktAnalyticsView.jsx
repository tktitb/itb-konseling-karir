import React from "react"
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  GraduationCap,
  BarChart3,
  Target,
  FileText,
  Compass,
  Layers
} from "lucide-react"
import { ENABLE_TKT_WAITING_LIST } from "../../../services/tktService"

export default function TktAnalyticsView({ participants = [] }) {
  const total = participants.length
  const countConfirmed = participants.filter((p) =>
    ["CONFIRMED", "DAPAT_SESI"].includes(p.status_peserta)
  ).length
  const countHadir = participants.filter((p) =>
    ["HADIR", "SELESAI_FULL"].includes(p.status_peserta)
  ).length
  const countWaiting = participants.filter((p) => p.status_peserta === "WAITING_LIST").length
  const countBatal = participants.filter((p) => p.status_peserta === "BATAL").length

  const countITB = participants.filter((p) =>
    (p.asal_univ || "").toLowerCase().includes("institut teknologi bandung")
  ).length
  const countNonITB = total - countITB
  const pctITB = total > 0 ? Math.round((countITB / total) * 100) : 0
  const pctNonITB = total > 0 ? 100 - pctITB : 0

  const countCV = participants.filter((p) => p.harapan_sesi === "CV Review").length
  const countKarier = participants.filter((p) => p.harapan_sesi === "Konsultasi Karier").length
  const countKeduanya = participants.filter((p) => p.harapan_sesi === "Keduanya").length

  const pctCV = total > 0 ? Math.round((countCV / total) * 100) : 0
  const pctKarier = total > 0 ? Math.round((countKarier / total) * 100) : 0
  const pctKeduanya = total > 0 ? Math.round((countKeduanya / total) * 100) : 0

  const allStatusBreakdown = [
    { label: "Dapat Sesi", count: participants.filter((p) => p.status_peserta === "DAPAT_SESI").length, color: "bg-sky-400" },
    { label: "Terkonfirmasi", count: participants.filter((p) => p.status_peserta === "CONFIRMED").length, color: "bg-emerald-400" },
    { label: "Hadir di Lokasi", count: participants.filter((p) => p.status_peserta === "HADIR").length, color: "bg-amber-400" },
    { label: "Selesai Sesi", count: participants.filter((p) => p.status_peserta === "SELESAI_FULL").length, color: "bg-blue-400" },
    { label: "Waiting List", count: countWaiting, color: "bg-amber-500/80" },
    { label: "Batal", count: countBatal, color: "bg-rose-400" }
  ]

  const statusBreakdown = allStatusBreakdown.filter(
    (item) => ENABLE_TKT_WAITING_LIST || item.label !== "Waiting List"
  )

  return (
    <div className="space-y-6">
      <div
        className={`grid ${
          ENABLE_TKT_WAITING_LIST ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"
        } gap-4`}
      >
        <div className="liquid-neumorph-card p-5 relative overflow-hidden group border-t border-l border-white/20 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Total Pendaftar
            </span>
            <div className="liquid-neumorph-pill w-8 h-8 rounded-lg bg-sky-500/10 border-t border-sky-400/25 flex items-center justify-center text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-white tracking-tight">{total}</span>
            <span className="text-xs text-slate-400 font-medium">peserta</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-medium">
            Seluruh berkas pendaftaran tercatat
          </p>
        </div>

        <div className="liquid-neumorph-card p-5 relative overflow-hidden group border-t border-l border-white/20 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
              Terkonfirmasi
            </span>
            <div className="liquid-neumorph-pill w-8 h-8 rounded-lg bg-emerald-500/10 border-t border-emerald-400/25 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-emerald-300 tracking-tight">{countConfirmed}</span>
            <span className="text-xs text-emerald-400/70 font-medium">
              {total > 0 ? Math.round((countConfirmed / total) * 100) : 0}%
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-medium">
            Slot jadwal siap di bilik konseling
          </p>
        </div>

        <div className="liquid-neumorph-card p-5 relative overflow-hidden group border-t border-l border-white/20 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider">
              Hadir & Selesai
            </span>
            <div className="liquid-neumorph-pill w-8 h-8 rounded-lg bg-sky-500/10 border-t border-sky-400/25 flex items-center justify-center text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-sky-300 tracking-tight">{countHadir}</span>
            <span className="text-xs text-sky-400/70 font-medium">
              {total > 0 ? Math.round((countHadir / total) * 100) : 0}%
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-medium">
            Peserta di bilik atau telah tuntas
          </p>
        </div>

        {ENABLE_TKT_WAITING_LIST && (
          <div className="liquid-neumorph-card p-5 relative overflow-hidden group border-t border-l border-white/20 hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-brand-gold uppercase tracking-wider">
                Waiting List
              </span>
              <div className="liquid-neumorph-pill w-8 h-8 rounded-lg bg-amber-500/10 border-t border-amber-400/25 flex items-center justify-center text-brand-gold">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-brand-gold tracking-tight">{countWaiting}</span>
              <span className="text-xs text-amber-400/70 font-medium">
                {total > 0 ? Math.round((countWaiting / total) * 100) : 0}%
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400 font-medium">
              Antrean siap alokasi bila ada pembatalan
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="liquid-neumorph-card p-6 flex flex-col justify-between border-t border-l border-white/20">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-brand-gold" />
              <h2 className="text-base font-semibold text-white">Demografi Kampus</h2>
            </div>
            <p className="text-xs text-slate-300 mb-6">
              Perbandingan pendaftar asal Institut Teknologi Bandung dengan kampus mitra lainnya.
            </p>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-slate-200">Mahasiswa & Alumni ITB</span>
                  <span className="text-brand-gold">{countITB} ({pctITB}%)</span>
                </div>
                <div className="liquid-neumorph-inset w-full h-2.5 rounded-full p-0.5 border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                    style={{ width: `${pctITB}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-slate-200">Universitas Lainnya</span>
                  <span className="text-sky-300">{countNonITB} ({pctNonITB}%)</span>
                </div>
                <div className="liquid-neumorph-inset w-full h-2.5 rounded-full p-0.5 border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-300 transition-all duration-500"
                    style={{ width: `${pctNonITB}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Rasio ITB : Non-ITB</span>
            <span className="font-mono text-white font-semibold">
              {pctITB}% : {pctNonITB}%
            </span>
          </div>
        </div>

        <div className="liquid-neumorph-card p-6 lg:col-span-2 border-t border-l border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-semibold text-white">Distribusi Status Peserta</h2>
          </div>
          <p className="text-xs text-slate-300 mb-6">
            Rincian tahapan operasional dari seluruh berkas yang tercatat dalam sistem.
          </p>

          <div className="space-y-4">
            {statusBreakdown.map((item) => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
              return (
                <div key={item.label}>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-slate-200 font-medium">{item.label}</span>
                    <span className="font-mono text-slate-300">
                      {item.count} <span className="text-slate-500 text-[10px]">({pct}%)</span>
                    </span>
                  </div>
                  <div className="liquid-neumorph-inset w-full h-2 rounded-full p-0.5 border border-white/5">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="liquid-neumorph-card p-6 border-t border-l border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-brand-gold" />
          <h2 className="text-base font-semibold text-white">Harapan dan Kebutuhan Sesi</h2>
        </div>
        <p className="text-xs text-slate-300 mb-6">
          Kebutuhan utama yang dipilih peserta saat pendaftaran formulir konseling.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="liquid-neumorph-inset p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="liquid-neumorph-pill w-8 h-8 rounded-lg bg-amber-500/10 border-t border-amber-400/25 flex items-center justify-center text-brand-gold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">CV Review</h3>
                <p className="text-[11px] text-slate-400">Ulasan resume & portofolio</p>
              </div>
            </div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-300">{countCV} peserta</span>
              <span className="font-semibold text-brand-gold">{pctCV}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-amber-400" style={{ width: `${pctCV}%` }} />
            </div>
          </div>

          <div className="liquid-neumorph-inset p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="liquid-neumorph-pill w-8 h-8 rounded-lg bg-sky-500/10 border-t border-sky-400/25 flex items-center justify-center text-sky-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Konsultasi Karier</h3>
                <p className="text-[11px] text-slate-400">Arah minat & eksplorasi kerja</p>
              </div>
            </div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-300">{countKarier} peserta</span>
              <span className="font-semibold text-sky-300">{pctKarier}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-sky-400" style={{ width: `${pctKarier}%` }} />
            </div>
          </div>

          <div className="liquid-neumorph-inset p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="liquid-neumorph-pill w-8 h-8 rounded-lg bg-white/10 border-t border-white/25 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Keduanya</h3>
                <p className="text-[11px] text-slate-400">Review CV & konsultasi menyeluruh</p>
              </div>
            </div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-300">{countKeduanya} peserta</span>
              <span className="font-semibold text-white">{pctKeduanya}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-300" style={{ width: `${pctKeduanya}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
