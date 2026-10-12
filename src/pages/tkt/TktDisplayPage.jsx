import React, { useState, useEffect } from "react"
import {
  Tv,
  RefreshCw,
  Sparkles,
  QrCode,
  ShieldCheck,
  Maximize2,
  X
} from "lucide-react"
import TktQrCodeSvg from "../../components/common/TktQrCodeSvg"
import { maskParticipantName } from "../../utils/qrCodeGenerator"
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
  const [zoomedQr, setZoomedQr] = useState(null)

  const baseOrigin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://itb-konseling-karir.vercel.app"
  const publicBookingUrl = `${baseOrigin}/tkt`
  const publicFeedbackUrl = `${baseOrigin}/tkt/feedback`

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
    <div className="min-h-screen text-white flex flex-col justify-between relative selection:bg-brand-gold selection:text-brand-navy">
      <header className="px-4 sm:px-6 lg:px-10 py-4 border-b border-white/15 bg-[#081a30]/85 backdrop-blur-2xl flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-white/95 shadow-lg border border-white/40 flex items-center justify-center p-0.5 shrink-0">
            <img
              src="/images/logo.jpg"
              alt="ITB Career Center"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.target.style.display = "none"
              }}
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-white">
                Status Jadwal & Antrean Konseling TKT
              </h1>
              <span className="liquid-neumorph-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-gold/20 text-brand-gold border-t border-brand-gold/40 uppercase tracking-wider flex items-center gap-1">
                <Tv className="w-3 h-3" />
                <span>Live Display</span>
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5 flex flex-wrap items-center gap-2">
              <span>ITB Career Center — Silakan pantau jadwal psikolog & sesi konseling Anda</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-semibold text-emerald-300">
                <ShieldCheck className="w-3 h-3" />
                <span>Nama Disamarkan demi Privasi</span>
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {availableDays.length > 0 && (
            <div className="liquid-neumorph-inset flex items-center gap-1.5 p-1 rounded-2xl border border-white/15">
              {availableDays.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDay(d)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentDisplayDay === d
                      ? "bg-brand-gold text-[#07131e] font-bold shadow-md"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          <div className="text-right">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-gold font-mono tracking-tight tabular-nums">
              {currentTime}
            </div>
            <div className="text-[10px] text-slate-300 flex items-center justify-end gap-1 font-semibold uppercase tracking-wider mt-0.5">
              <RefreshCw
                className={`w-3 h-3 text-emerald-400 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>Sinkronisasi Real-Time</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-44 overflow-y-auto">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-200">
              Memuat jadwal sesi konseling langsung dari server...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {psikologList.map((psikologName, pIdx) => {
                const dayOccupants = participants.filter(
                  (p) =>
                    p.jadwal_hari === currentDisplayDay &&
                    p.psikolog_bertugas === psikologName &&
                    !["WAITING_LIST", "BATAL"].includes(p.status_peserta)
                )
                const filledCount = new Set(dayOccupants.map((p) => p.jadwal_sesi)).size

                return (
                  <div
                    key={psikologName}
                    className="liquid-neumorph-card rounded-3xl p-4 sm:p-5 border-t border-l border-white/20 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/15">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="liquid-neumorph-inset w-8 h-8 rounded-xl border border-white/15 text-brand-gold font-bold text-xs flex items-center justify-center shrink-0">
                            {pIdx + 1}
                          </span>
                          <div className="min-w-0">
                            <h3
                              className="font-bold text-xs sm:text-sm text-white truncate"
                              title={psikologName}
                            >
                              {psikologName}
                            </h3>
                            <p className="text-[10px] text-slate-300 font-medium">
                              Psikolog Konselor #{pIdx + 1}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full liquid-neumorph-inset border border-white/10 text-[10px] font-mono font-bold text-brand-gold shrink-0">
                          {filledCount}/7
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
                            const maskedName = maskParticipantName(occ.nama_lengkap)

                            return (
                              <div
                                key={sesi}
                                className={`p-2.5 rounded-2xl border transition-all ${
                                  isRunning
                                    ? "liquid-neumorph-card bg-amber-500/15 border-t-2 border-l border-brand-gold/80 text-white shadow-lg"
                                    : isDone
                                      ? "liquid-neumorph-inset bg-sky-950/40 border border-sky-400/25 opacity-80"
                                      : "liquid-neumorph-inset border-white/15"
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
                                    className={`px-1.5 py-0.5 rounded-md font-bold uppercase text-[9px] shrink-0 ${
                                      isRunning
                                        ? "bg-brand-gold text-[#07131e]"
                                        : isDone
                                          ? "bg-sky-500/20 text-sky-300 border border-sky-400/30"
                                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                                    }`}
                                  >
                                    {isRunning
                                      ? "SEDANG BERJALAN"
                                      : isDone
                                        ? "SELESAI"
                                        : "TERJADWAL"}
                                  </span>
                                </div>
                                <p className="font-bold text-xs sm:text-sm text-white truncate tracking-wide">
                                  {maskedName}
                                </p>
                              </div>
                            )
                          }

                          return (
                            <div
                              key={sesi}
                              className="liquid-neumorph-inset p-2.5 rounded-2xl border border-white/10 bg-[rgba(8,18,28,0.40)] flex items-center justify-between gap-2 text-[11px] text-slate-400"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-slate-300 font-bold text-[10px] uppercase tracking-wider shrink-0">
                                  {sesiMeta.sesiLabel}
                                </span>
                                <span className="font-mono text-[10px] text-slate-300 truncate">
                                  {sesiMeta.compactTime}
                                </span>
                              </div>
                              <span className="text-[10px] text-emerald-300/80 font-semibold shrink-0">
                                Tersedia
                              </span>
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

      <div className="fixed bottom-4 left-4 z-40 pointer-events-auto">
        <button
          type="button"
          onClick={() =>
            setZoomedQr({
              title: "Form Pendaftaran Publik Konseling TKT",
              subtitle: "Scan QR Code ini menggunakan kamera smartphone untuk memilih jadwal sesi & psikolog konseling.",
              url: publicBookingUrl,
              badge: "PENDAFTARAN PESERTA"
            })
          }
          className="liquid-neumorph-card p-3 sm:p-3.5 rounded-3xl border-t border-l border-amber-400/40 shadow-2xl flex items-center gap-3.5 text-left hover:scale-[1.02] transition-all cursor-pointer group bg-[#091e38]/95 backdrop-blur-2xl"
        >
          <div className="p-2 rounded-2xl bg-white shadow-md border-2 border-amber-400/60 shrink-0">
            <TktQrCodeSvg value={publicBookingUrl} size={84} quietZone={2} />
          </div>
          <div className="pr-1 max-w-[175px] sm:max-w-[210px]">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[9px] font-bold text-brand-gold uppercase tracking-wider mb-1">
              <QrCode className="w-2.5 h-2.5" />
              <span>Scan Daftar Sesi</span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
              Form Publik TKT
            </h4>
            <p className="text-[10px] text-slate-300 mt-0.5 leading-snug">
              Scan untuk daftar & pilih jadwal konseling
            </p>
            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-brand-gold font-semibold">
              <Maximize2 className="w-3 h-3 opacity-80 group-hover:scale-110 transition-transform" />
              <span className="truncate">/tkt</span>
            </div>
          </div>
        </button>
      </div>

      <div className="fixed bottom-4 right-4 z-40 pointer-events-auto">
        <button
          type="button"
          onClick={() =>
            setZoomedQr({
              title: "Form Evaluasi & Feedback Konseling TKT",
              subtitle: "Scan QR Code ini setelah sesi konseling selesai untuk memberikan penilaian & masukan layanan.",
              url: publicFeedbackUrl,
              badge: "EVALUASI & FEEDBACK"
            })
          }
          className="liquid-neumorph-card p-3 sm:p-3.5 rounded-3xl border-t border-l border-emerald-400/40 shadow-2xl flex items-center gap-3.5 text-left hover:scale-[1.02] transition-all cursor-pointer group bg-[#091e38]/95 backdrop-blur-2xl"
        >
          <div className="p-2 rounded-2xl bg-white shadow-md border-2 border-emerald-400/60 shrink-0">
            <TktQrCodeSvg value={publicFeedbackUrl} size={84} quietZone={2} />
          </div>
          <div className="pr-1 max-w-[175px] sm:max-w-[210px]">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
              <QrCode className="w-2.5 h-2.5" />
              <span>Scan Usai Sesi</span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
              Form Feedback TKT
            </h4>
            <p className="text-[10px] text-slate-300 mt-0.5 leading-snug">
              Scan untuk mengisi ulasan pasca konseling
            </p>
            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-emerald-300 font-semibold">
              <Maximize2 className="w-3 h-3 opacity-80 group-hover:scale-110 transition-transform" />
              <span className="truncate">/tkt/feedback</span>
            </div>
          </div>
        </button>
      </div>

      {zoomedQr && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomedQr(null)}
        >
          <div
            className="liquid-neumorph-card rounded-3xl p-6 sm:p-8 max-w-md w-full border-t border-l border-white/25 shadow-2xl text-center space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomedQr(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full liquid-neumorph-inset flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/15 border border-brand-gold/40 text-xs font-bold text-brand-gold">
              <QrCode className="w-3.5 h-3.5" />
              <span>{zoomedQr.badge}</span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">{zoomedQr.title}</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                {zoomedQr.subtitle}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white shadow-2xl border-4 border-brand-gold/60 inline-block mx-auto">
              <TktQrCodeSvg value={zoomedQr.url} size={260} quietZone={3} />
            </div>

            <div className="p-3 rounded-2xl liquid-neumorph-inset border border-white/10 font-mono text-xs text-brand-gold break-all">
              {zoomedQr.url}
            </div>
          </div>
        </div>
      )}

      <footer className="px-6 py-3 border-t border-white/15 bg-[#081a30]/90 backdrop-blur-xl flex flex-wrap items-center justify-center text-xs text-slate-300">
        <div className="flex items-center gap-2 text-center">
          <Sparkles className="w-3.5 h-3.5 text-brand-gold shrink-0" />
          <span>
            Bagi peserta yang jadwal sesinya segera dimulai, silakan menuju meja registrasi konseling • ITB Career Center
          </span>
        </div>
      </footer>
    </div>
  )
}
