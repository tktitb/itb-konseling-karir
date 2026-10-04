import React, { useState } from "react"
import {
  Calendar,
  Clock,
  User,
  MessageCircle,
  Eye,
  CheckCircle2,
  UserCheck,
  Sparkles,
  AlertCircle
} from "lucide-react"

export default function TktBoardView({
  participants = [],
  config = {},
  availableDates = [],
  onOpenDetail,
  getWaLink
}) {
  const [selectedDate, setSelectedDate] = useState(
    availableDates && availableDates.length > 0 ? availableDates[0] : ""
  )

  const sesiList = [
    "09.00-09.45",
    "09.50-10.35",
    "10.40-11.25",
    "11.30-12.15",
    "13.15-14.00",
    "14.05-14.50",
    "14.55-15.40"
  ]

  let psikologList = []
  const currentDate = selectedDate || (availableDates.length > 0 ? availableDates[0] : "")

  if (config && currentDate) {
    let key = ""
    if (currentDate === config.tanggal_kegiatan_1) {
      key = "psikolog_list_1"
    } else if (currentDate === config.tanggal_kegiatan_2) {
      key = "psikolog_list_2"
    }

    if (key && config[key]) {
      try {
        psikologList = JSON.parse(config[key])
      } catch {
        psikologList = ["Psikolog 1", "Psikolog 2", "Psikolog 3", "Psikolog 4", "Psikolog 5"]
      }
    } else {
      psikologList = ["Psikolog 1", "Psikolog 2", "Psikolog 3", "Psikolog 4", "Psikolog 5"]
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return {
          label: "Terkonfirmasi",
          className: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30"
        }
      case "HADIR":
        return {
          label: "Hadir di Lokasi",
          className: "bg-amber-500/15 text-amber-300 border-amber-400/30"
        }
      case "SELESAI_FULL":
        return {
          label: "Selesai",
          className: "bg-blue-500/15 text-blue-300 border-blue-400/30"
        }
      case "DAPAT_SESI":
        return {
          label: "Dapat Sesi",
          className: "bg-sky-500/15 text-sky-300 border-sky-400/30"
        }
      default:
        return {
          label: status,
          className: "bg-slate-700/40 text-slate-300 border-slate-600/40"
        }
    }
  }

  return (
    <div className="space-y-6">
      <div className="liquid-glass-card p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Papan Matriks Alokasi Sesi & Bilik Konseling
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Visualisasi persebaran peserta pada 5 bilik psikolog sepanjang 7 sesi waktu per hari.
          </p>
        </div>

        {availableDates.length > 0 && (
          <div className="flex items-center gap-1.5 p-1 bg-black/30 rounded-xl border border-white/10">
            {availableDates.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentDate === d
                    ? "bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {psikologList.map((psikologName, pIdx) => {
          return (
            <div key={psikologName} className="liquid-glass-card p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                    {pIdx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {psikologName}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Bilik Konseling #{pIdx + 1}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400">
                    Kapasitas: <span className="text-amber-300 font-mono font-bold">7 Sesi</span> / Hari
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                {sesiList.map((sesi) => {
                  const occupants = participants.filter(
                    (p) =>
                      p.jadwal_hari === currentDate &&
                      p.psikolog_bertugas === psikologName &&
                      p.jadwal_sesi === sesi &&
                      !["WAITING_LIST", "BATAL"].includes(p.status_peserta)
                  )

                  if (occupants.length > 0) {
                    return (
                      <div key={sesi} className="flex flex-col gap-2">
                        {occupants.map((occ) => {
                          const badge = getStatusBadge(occ.status_peserta)
                          const waTemplate =
                            occ.status_peserta === "HADIR"
                              ? "wa_template_minta_feedback"
                              : "wa_template_konfirmasi_sesi"
                          const waLink = getWaLink(waTemplate, occ)

                          return (
                            <div
                              key={occ.id}
                              className="p-3 rounded-xl bg-white/[0.05] border border-white/15 hover:border-amber-400/40 transition-all flex flex-col justify-between group relative shadow-md"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-2">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border ${badge.className}`}
                                  >
                                    {badge.label}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {sesi.split("-")[0]}
                                  </span>
                                </div>

                                <h4
                                  className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors"
                                  title={occ.nama_lengkap}
                                >
                                  {occ.nama_lengkap}
                                </h4>

                                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                  {occ.jurusan || occ.asal_univ || "-"}
                                </p>
                              </div>

                              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between gap-1">
                                <span className="text-[9px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                                  {occ.harapan_sesi}
                                </span>

                                <div className="flex items-center gap-1">
                                  {waLink && (
                                    <a
                                      href={waLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 rounded-md text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                      title="Kirim pesan WhatsApp"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => onOpenDetail(occ)}
                                    className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                    title="Lihat detail berkas peserta"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  }

                  return (
                    <div
                      key={sesi}
                      className="p-3 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col justify-between min-h-[96px] text-center"
                    >
                      <div className="text-[11px] font-mono text-slate-400 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{sesi}</span>
                      </div>
                      <div className="py-2">
                        <span className="text-[10px] font-medium text-slate-400">
                          Slot Kosong
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-500">Tersedia</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
