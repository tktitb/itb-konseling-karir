import React, { useState, useEffect } from "react"
import { Tv, RefreshCw, Sparkles } from "lucide-react"
import {
  getSemuaPeserta,
  getSystemConfig,
  subscribePesertaRealtime,
  SESI_TKT_META,
  getActiveEventDates,
  getPsikologListForDate
} from "../../services/tktService"

export default function TktDisplayPage() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString("id-ID"))
  const [participants, setParticipants] = useState([])
  const [config, setConfig] = useState(null)
  const [selectedDay, setSelectedDay] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("id-ID"))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const loadData = async (isSilent = false) => {
    if (!isSilent) setRefreshing(true)
    try {
      const [pts, cfg] = await Promise.all([getSemuaPeserta(), getSystemConfig()])
      setParticipants(pts || [])
      if (cfg) {
        setConfig(cfg)
        const activeDays = getActiveEventDates(cfg)
        if (activeDays.length > 0 && (!selectedDay || !activeDays.includes(selectedDay))) {
          setSelectedDay(activeDays[0])
        }
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
    const unsub = subscribePesertaRealtime(() => {
      loadData(true)
    })
    return () => {
      if (unsub) unsub()
    }
  }, [])

  const availableDays = config ? getActiveEventDates(config) : []
  const currentDisplayDay =
    selectedDay && availableDays.includes(selectedDay)
      ? selectedDay
      : availableDays.length > 0
        ? availableDays[0]
        : ""
  const psikologList =
    config && currentDisplayDay ? getPsikologListForDate(config, currentDisplayDay) : []

  return (
    <div className="min-h-screen bg-[#071321] text-white flex flex-col justify-between selection:bg-brand-gold selection:text-brand-navy">
      <header className="px-6 lg:px-10 py-5 border-b border-white/10 bg-[#071321]/80 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="liquid-neumorph-card w-12 h-12 rounded-2xl border-t border-l border-white/20 flex items-center justify-center text-brand-gold">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                Status Antrean Konseling Titian Karir Terpadu
              </h1>
              <span className="liquid-neumorph-pill px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-gold/15 text-brand-gold border-t border-brand-gold/30 uppercase tracking-wider">
                Live TV Display
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Institut Teknologi Bandung Career Center — Silakan pantau nomor bilik & sesi Anda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {availableDays.length > 1 && (
            <div className="liquid-neumorph-inset flex items-center gap-1.5 p-1 rounded-xl border border-white/10">
              {availableDays.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    currentDisplayDay === d
                      ? "liquid-neumorph-pill bg-brand-gold/20 text-brand-gold border-t border-brand-gold/40 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-bold text-brand-gold font-mono tracking-tight tabular-nums">
              {currentTime}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1 font-semibold uppercase tracking-wider mt-0.5">
              <RefreshCw className={`w-3 h-3 text-emerald-400 ${refreshing ? "animate-spin" : ""}`} />
              <span>Real-Time Live Sinkron</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-300">
              Memuat data bilik konseling langsung dari server...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {psikologList.map((psikologName, pIdx) => {
                return (
                  <div
                    key={psikologName}
                    className="liquid-neumorph-card rounded-3xl p-5 border-t border-l border-white/20 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="liquid-neumorph-inset w-7 h-7 rounded-xl border border-white/10 text-brand-gold font-bold text-xs flex items-center justify-center">
                            #{pIdx + 1}
                          </span>
                          <h3 className="font-semibold text-sm text-white truncate max-w-[150px]">
                            {psikologName}
                          </h3>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Bilik {pIdx + 1}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {SESI_TKT_META.map((sesiMeta) => {
                          const sesi = sesiMeta.id
                          const occupants = participants.filter(
                            (p) =>
                              p.jadwal_hari === currentDisplayDay &&
                              p.psikolog_bertugas === psikologName &&
                              p.jadwal_sesi === sesi &&
                              !["WAITING_LIST", "BATAL"].includes(p.status_peserta)
                          )

                          if (occupants.length > 0) {
                            const occ = occupants[0]
                            const isRunning = occ.status_peserta === "HADIR"
                            const isDone = occ.status_peserta === "SELESAI_FULL"

                            return (
                              <div
                                key={sesi}
                                className={`p-2.5 rounded-xl border transition-all ${
                                  isRunning
                                    ? "liquid-neumorph-card bg-brand-navy/95 border-t-2 border-l border-brand-gold/80 text-white shadow-lg"
                                    : isDone
                                    ? "liquid-neumorph-inset bg-purple-950/30 border border-purple-800/30 opacity-70"
                                    : "liquid-neumorph-inset border-white/10"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1.5 text-[10px] mb-1.5">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="px-1.5 py-0.5 rounded-md bg-brand-gold/15 border border-brand-gold/30 text-brand-gold font-bold text-[10px] uppercase tracking-wider shrink-0">
                                      {sesiMeta.sesiLabel}
                                    </span>
                                    <span className="font-mono text-slate-200 font-semibold truncate">
                                      {sesiMeta.compactTime}
                                    </span>
                                  </div>
                                  <span
                                    className={`px-1.5 py-0.5 rounded font-semibold uppercase text-[9px] shrink-0 ${
                                      isRunning
                                        ? "liquid-neumorph-pill bg-brand-gold text-brand-navy"
                                        : isDone
                                        ? "bg-purple-500/20 text-purple-300"
                                        : "bg-emerald-500/20 text-emerald-300"
                                    }`}
                                  >
                                    {isRunning ? "SESI BERJALAN" : isDone ? "SELESAI" : "TERJADWAL"}
                                  </span>
                                </div>
                                <p className="font-semibold text-xs text-white truncate">
                                  {occ.nama_lengkap}
                                </p>
                              </div>
                            )
                          }

                          return (
                            <div
                              key={sesi}
                              className="liquid-neumorph-inset p-2.5 rounded-xl border border-white/5 bg-[rgba(8,18,28,0.40)] flex items-center justify-between gap-2 text-[11px] text-slate-500"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-slate-300 font-bold text-[10px] uppercase tracking-wider shrink-0">
                                  {sesiMeta.sesiLabel}
                                </span>
                                <span className="font-mono text-[10px] text-slate-400 truncate">
                                  {sesiMeta.compactTime}
                                </span>
                              </div>
                              <span className="text-[10px] shrink-0">Slot Lowong</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      <footer className="px-8 py-3.5 border-t border-white/10 bg-[#071321]/90 backdrop-blur-xl flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
          <span>Bagi peserta yang dipanggil harap segera mendekati meja registrasi booth konseling.</span>
        </div>
        <div>
          <span>Institut Teknologi Bandung &copy; 2026 ITB Career Center</span>
        </div>
      </footer>
    </div>
  )
}
