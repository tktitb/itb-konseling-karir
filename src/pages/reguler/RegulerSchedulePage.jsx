import React, { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { getCurrentMonthName } from "../../utils/timeUtils"
import { fetchMonthlySchedule } from "../../services/sheetsService"
import ScheduleControls from "../../components/reguler/ScheduleControls"
import SlotCard from "../../components/reguler/SlotCard"
import BookingModal from "../../components/reguler/BookingModal"

export default function RegulerSchedulePage() {
  const [searchParams] = useSearchParams()
  const initialPsychologist = searchParams.get("psychologist") || "all"

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthName())
  const [selectedPsychologist, setSelectedPsychologist] = useState(initialPsychologist)
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [modeTab, setModeTab] = useState("all")
  const [mobileTab, setMobileTab] = useState("all")

  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeModalSlot, setActiveModalSlot] = useState(null)

  const loadData = async (forceRefresh = false) => {
    setLoading(true)
    try {
      const data = await fetchMonthlySchedule(selectedMonth, forceRefresh)
      setSlots(data || [])
    } catch {
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(false)
  }, [selectedMonth])

  const filteredSlots = slots.filter((slot) => {
    if (modeTab === "online" && slot.mode?.toLowerCase() !== "online") {
      return false
    }
    if (modeTab === "offline" && slot.mode?.toLowerCase() !== "offline") {
      return false
    }

    if (availabilityFilter === "available" && !slot.isAvailable) {
      return false
    }

    return true
  })

  const linaSlots = filteredSlots.filter((slot) => {
    const isLina =
      slot.psychologist.toLowerCase().includes("lina") ||
      slot.psychologist.toLowerCase().includes("bu lina")
    if (!isLina) return false
    if (selectedPsychologist !== "all" && !selectedPsychologist.toLowerCase().includes("lina")) {
      return false
    }
    return true
  })

  const sitoSlots = filteredSlots.filter((slot) => {
    const isSito =
      slot.psychologist.toLowerCase().includes("sito") ||
      slot.psychologist.toLowerCase().includes("bu sito")
    if (!isSito) return false
    if (selectedPsychologist !== "all" && !selectedPsychologist.toLowerCase().includes("sito")) {
      return false
    }
    return true
  })

  const mobileDisplaySlots =
    mobileTab === "lina"
      ? linaSlots
      : mobileTab === "sito"
      ? sitoSlots
      : filteredSlots

  return (
    <div className="max-w-container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <section className="liquid-glass-card rounded-3xl p-4 sm:p-7 lg:p-9 border border-white/12 shadow-2xl transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              Jadwal Konseling Karier
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Pilih waktu yang sesuai untuk sesi pendampingan karier Anda bersama psikolog profesional ITB Career Center.
            </p>
          </div>
          <div className="self-start sm:self-auto shrink-0">
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-brand-gold/15 text-brand-gold border border-brand-gold/30 shadow-sm">
              {filteredSlots.length} Sesi Terjadwal
            </span>
          </div>
        </div>

        <ScheduleControls
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          availabilityFilter={availabilityFilter}
          onAvailabilityChange={setAvailabilityFilter}
          modeTab={modeTab}
          onModeTabChange={setModeTab}
          totalSlots={slots.length}
          availableSlots={slots.filter((s) => s.isAvailable).length}
        />

        <div className="block md:hidden mb-6">
          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <button
              type="button"
              onClick={() => setMobileTab("lina")}
              className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-2.5 ${
                mobileTab === "lina"
                  ? "bg-sky-950/70 border-sky-400/60 shadow-lg shadow-sky-950/40 ring-1 ring-sky-400/30"
                  : "liquid-glass-subtle border-white/10 opacity-75 hover:opacity-100"
              }`}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border border-sky-400/50 shrink-0 bg-slate-900">
                <img
                  src="/images/lina.png"
                  alt="Bu Lina"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    e.target.src = "/images/logo.jpg"
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-white truncate">Bu Lina</div>
                <div className="text-[10px] text-sky-300 font-bold truncate">Lina Tarlina, S.Psi</div>
                <div className="text-[10px] font-semibold text-slate-300">{linaSlots.length} Sesi</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab("sito")}
              className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-2.5 ${
                mobileTab === "sito"
                  ? "bg-amber-950/70 border-brand-gold/60 shadow-lg shadow-amber-950/40 ring-1 ring-brand-gold/30"
                  : "liquid-glass-subtle border-white/10 opacity-75 hover:opacity-100"
              }`}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border border-brand-gold/50 shrink-0 bg-slate-900">
                <img
                  src="/images/sito.png"
                  alt="Bu Sito"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    e.target.src = "/images/logo.jpg"
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-white truncate">Bu Sito</div>
                <div className="text-[10px] text-brand-gold font-bold truncate">Sito Asih, S.Psi</div>
                <div className="text-[10px] font-semibold text-slate-300">{sitoSlots.length} Sesi</div>
              </div>
            </button>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setMobileTab("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                mobileTab === "all"
                  ? "bg-white/20 text-white border-white/30 shadow-sm"
                  : "bg-black/30 text-slate-300 border-white/10 hover:text-white"
              }`}
            >
              Tampilkan Semua Jadwal ({filteredSlots.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-3.5">
              <div className="h-20 rounded-2xl liquid-glass-subtle animate-pulse" />
              <div className="h-32 rounded-2xl liquid-glass-subtle animate-pulse" />
              <div className="h-32 rounded-2xl liquid-glass-subtle animate-pulse" />
            </div>
            <div className="space-y-3.5 hidden md:block">
              <div className="h-20 rounded-2xl liquid-glass-subtle animate-pulse" />
              <div className="h-32 rounded-2xl liquid-glass-subtle animate-pulse" />
              <div className="h-32 rounded-2xl liquid-glass-subtle animate-pulse" />
            </div>
          </div>
        ) : (
          <div>
            <div className="block md:hidden">
              <div className="space-y-3.5">
                {mobileDisplaySlots.length > 0 ? (
                  mobileDisplaySlots.map((slot) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      onBook={(targetSlot) => setActiveModalSlot(targetSlot)}
                    />
                  ))
                ) : (
                  <div className="liquid-glass-subtle rounded-2xl p-8 text-center text-xs sm:text-sm text-slate-300 border border-white/10">
                    Belum ada jadwal yang cocok untuk kriteria ini.
                  </div>
                )}
              </div>
            </div>

            <div className="hidden md:grid md:grid-cols-2 gap-6 lg:gap-8">
              <div className="flex flex-col">
                <div className="liquid-glass-subtle rounded-2xl p-4 sm:p-5 mb-5 flex items-center gap-4 border border-sky-500/20 shadow-lg shadow-sky-950/20 group">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-sky-400/60 shadow-lg shadow-sky-950/40 shrink-0 group-hover:scale-105 transition-transform bg-slate-900">
                    <img
                      src="/images/lina.png"
                      alt="Lina Tarlina, S.Psi, Psikolog"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.target.src = "/images/logo.jpg"
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                      Lina Tarlina, S.Psi, Psikolog
                    </h3>
                    <p className="text-[11px] text-sky-300 font-semibold">
                      Psikolog Konseling Karier ITB
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-sky-200">
                        {linaSlots.length} Sesi Terjadwal
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-[11px] font-bold text-emerald-400">
                        {linaSlots.filter((s) => s.isAvailable).length} Tersedia
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {linaSlots.length > 0 ? (
                    linaSlots.map((slot) => (
                      <SlotCard
                        key={slot.id}
                        slot={slot}
                        onBook={(targetSlot) => setActiveModalSlot(targetSlot)}
                      />
                    ))
                  ) : (
                    <div className="liquid-glass-subtle rounded-2xl p-8 text-center text-xs sm:text-sm text-slate-300 border border-white/10">
                      Belum ada jadwal yang cocok untuk kriteria ini.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <div className="liquid-glass-subtle rounded-2xl p-4 sm:p-5 mb-5 flex items-center gap-4 border border-brand-gold/20 shadow-lg shadow-amber-950/20 group">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-brand-gold/60 shadow-lg shadow-amber-950/40 shrink-0 group-hover:scale-105 transition-transform bg-slate-900">
                    <img
                      src="/images/sito.png"
                      alt="Sito Asih Pratiwi, S.Psi, Psikolog"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.target.src = "/images/logo.jpg"
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                      Sito Asih Pratiwi, S.Psi, Psikolog
                    </h3>
                    <p className="text-[11px] text-brand-gold font-semibold">
                      Psikolog Konseling Karier ITB
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-amber-200">
                        {sitoSlots.length} Sesi Terjadwal
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-[11px] font-bold text-emerald-400">
                        {sitoSlots.filter((s) => s.isAvailable).length} Tersedia
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {sitoSlots.length > 0 ? (
                    sitoSlots.map((slot) => (
                      <SlotCard
                        key={slot.id}
                        slot={slot}
                        onBook={(targetSlot) => setActiveModalSlot(targetSlot)}
                      />
                    ))
                  ) : (
                    <div className="liquid-glass-subtle rounded-2xl p-8 text-center text-xs sm:text-sm text-slate-300 border border-white/10">
                      Belum ada jadwal yang cocok untuk kriteria ini.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {activeModalSlot && (
        <BookingModal
          slot={activeModalSlot}
          allSlots={slots}
          onClose={() => setActiveModalSlot(null)}
        />
      )}
    </div>
  )
}
