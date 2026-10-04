import React, { useState, useEffect } from "react"
import { Tv, Clock, RefreshCw, Calendar, Sparkles, UserCheck } from "lucide-react"
import { getSemuaPeserta, getSystemConfig, subscribePesertaRealtime } from "../../services/tktService"

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
        if (!selectedDay && cfg.tanggal_kegiatan_1) {
          setSelectedDay(cfg.tanggal_kegiatan_1)
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
  if (config && selectedDay) {
    let key = selectedDay === config.tanggal_kegiatan_1 ? "psikolog_list_1" : "psikolog_list_2"
    if (config[key]) {
      try {
        psikologList = JSON.parse(config[key])
      } catch {
        psikologList = ["Psikolog 1", "Psikolog 2", "Psikolog 3", "Psikolog 4", "Psikolog 5"]
      }
    }
  }

  const availableDays = []
  if (config?.tanggal_kegiatan_1) availableDays.push(config.tanggal_kegiatan_1)
  if (config?.tanggal_kegiatan_2) availableDays.push(config.tanggal_kegiatan_2)

  return (
    <div className="min-h-screen bg-[#071321] text-white flex flex-col justify-between selection:bg-brand-gold selection:text-brand-navy">
      <header className="px-6 lg:px-10 py-5 border-b border-white/10 bg-[#071321]/80 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Status Antrean Konseling Titian Karir Terpadu
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-gold/20 text-brand-gold border border-brand-gold/30 uppercase tracking-wider">
                Live TV Display
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Institut Teknologi Bandung Career Center — Silakan pantau nomor bilik & sesi Anda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {availableDays.length > 1 && (
            <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
              {availableDays.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedDay === d ? "bg-brand-gold text-brand-navy" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-black text-brand-gold font-mono tracking-tight tabular-nums">
              {currentTime}
            </div>
            <div className="text-[10px] text-neutral-400 flex items-center justify-end gap-1 font-semibold uppercase tracking-wider mt-0.5">
              <RefreshCw className={`w-3 h-3 text-emerald-400 ${refreshing ? "animate-spin" : ""}`} />
              <span>Real-Time Live Sinkron</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-neutral-300">
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
                    className="rounded-3xl p-5 bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.4)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-brand-gold/20 text-brand-gold font-black text-xs flex items-center justify-center">
                            #{pIdx + 1}
                          </span>
                          <h3 className="font-extrabold text-sm text-white truncate max-w-[150px]">
                            {psikologName}
                          </h3>
                        </div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Bilik {pIdx + 1}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {sesiList.map((sesi) => {
                          const occupants = participants.filter(
                            (p) =>
                              p.jadwal_hari === selectedDay &&
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
                                    ? "bg-brand-navy/90 border-brand-gold/70 shadow-[0_0_20px_rgba(234,160,35,0.25)]"
                                    : isDone
                                    ? "bg-purple-950/40 border-purple-800/40 opacity-70"
                                    : "bg-white/[0.06] border-white/10"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px] mb-1">
                                  <span className="font-mono text-neutral-400">{sesi}</span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded font-extrabold uppercase text-[9px] ${
                                      isRunning
                                        ? "bg-brand-gold text-brand-navy animate-pulse"
                                        : isDone
                                        ? "bg-purple-500/20 text-purple-300"
                                        : "bg-emerald-500/20 text-emerald-300"
                                    }`}
                                  >
                                    {isRunning ? "SESI BERJALAN" : isDone ? "SELESAI" : "TERJADWAL"}
                                  </span>
                                </div>
                                <p className="font-bold text-xs text-white truncate">
                                  {occ.nama_lengkap}
                                </p>
                              </div>
                            )
                          }

                          return (
                            <div
                              key={sesi}
                              className="p-2.5 rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] text-neutral-500 opacity-60"
                            >
                              <span className="font-mono text-[10px]">{sesi}</span>
                              <span className="text-[10px]">Slot Lowong</span>
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

      <footer className="px-8 py-3.5 border-t border-white/10 bg-[#071321]/90 backdrop-blur-xl flex flex-wrap items-center justify-between text-xs text-neutral-400">
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
