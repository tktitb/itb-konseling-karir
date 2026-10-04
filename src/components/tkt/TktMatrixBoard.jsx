import React, { useState } from "react"
import {
  Calendar,
  Clock,
  User,
  MessageCircle,
  Eye,
  CheckCircle2,
  Sparkles,
  UserCheck,
  AlertCircle
} from "lucide-react"

export default function TktMatrixBoard({
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
  if (config && selectedDate) {
    let key = ""
    if (selectedDate === config.tanggal_kegiatan_1) {
      key = "psikolog_list_1"
    } else if (selectedDate === config.tanggal_kegiatan_2) {
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

  const currentDate = selectedDate || (availableDates.length > 0 ? availableDates[0] : "")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-gold" />
            <span>Matriks Alokasi Sesi & Psikolog</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Visualisasi pemetaan 7 sesi waktu untuk masing-masing bilik psikolog bertugas.
          </p>
        </div>

        {availableDates.length > 1 && (
          <div className="flex items-center gap-2 bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200/80">
            {availableDates.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentDate === d
                    ? "bg-brand-navy text-white shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
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
            <div
              key={psikologName}
              className="rounded-3xl p-5 sm:p-6 bg-white/75 backdrop-blur-xl border border-white/90 shadow-[0_10px_35px_rgba(0,33,71,0.06)] relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 border-b border-neutral-200/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold font-bold text-xs">
                    {pIdx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-brand-navy">
                      {psikologName}
                    </h3>
                    <span className="text-[11px] text-neutral-500">
                      Bilik Konseling #{pIdx + 1}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold text-neutral-500">
                    Kapasitas: 7 Slot / Hari
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
                          const waTemplate =
                            occ.status_peserta === "HADIR"
                              ? "wa_template_minta_feedback"
                              : "wa_template_konfirmasi_sesi"
                          const waLink = getWaLink(waTemplate, occ)

                          return (
                            <div
                              key={occ.id}
                              className="p-3 rounded-2xl bg-white border border-brand-navy/20 shadow-sm flex flex-col justify-between hover:border-brand-navy transition-all group relative"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-1.5">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                                      occ.status_peserta === "CONFIRMED"
                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                        : occ.status_peserta === "HADIR"
                                        ? "bg-brand-navy text-white"
                                        : occ.status_peserta === "SELESAI_FULL"
                                        ? "bg-purple-50 text-purple-800 border border-purple-200"
                                        : "bg-blue-50 text-blue-800 border border-blue-200"
                                    }`}
                                  >
                                    {occ.status_peserta?.replace("_", " ")}
                                  </span>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => onOpenDetail(occ)}
                                      className="p-1 rounded-md text-neutral-400 hover:text-brand-navy hover:bg-neutral-100 transition-colors"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </button>
                                    {waLink && (
                                      <a
                                        href={waLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                      >
                                        <MessageCircle className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-semibold mb-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{sesi}</span>
                                </div>

                                <p className="font-extrabold text-neutral-900 text-xs leading-snug line-clamp-2">
                                  {occ.nama_lengkap}
                                </p>
                              </div>

                              <div className="mt-2 pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500">
                                <span className="truncate max-w-[90px]">{occ.jurusan || occ.asal_univ}</span>
                                {occ.is_member_itbcc && (
                                  <span className="text-brand-gold font-bold">ITBCC</span>
                                )}
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
                      className="p-3 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 flex flex-col items-center justify-center text-center opacity-70 min-h-[90px]"
                    >
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-neutral-400 mb-1">
                        <Clock className="w-3 h-3" />
                        <span>{sesi}</span>
                      </div>
                      <span className="text-[11px] font-medium text-neutral-400">
                        Slot Tersedia
                      </span>
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
