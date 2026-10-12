import React from "react"
import { Calendar, Filter, Monitor, Building2, Layers } from "lucide-react"
import { MONTH_NAMES } from "../../constants/config"

export default function ScheduleControls({
  selectedMonth,
  onMonthChange,
  availabilityFilter,
  onAvailabilityChange,
  modeTab,
  onModeTabChange,
  totalSlots = 0,
  availableSlots = 0
}) {
  return (
    <div className="liquid-neumorph-card p-4 sm:p-5 rounded-2xl mb-6 sm:mb-8 border-t border-l border-white/20">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 sm:gap-4">
        <div className="w-full lg:w-auto">
          <div className="liquid-neumorph-inset grid grid-cols-3 gap-1.5 p-1.5 rounded-full">
            <button
              type="button"
              onClick={() => onModeTabChange("all")}
              className={`py-2 px-3 sm:px-4 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                modeTab === "all"
                  ? "liquid-neumorph-pill bg-brand-gold/15 text-brand-gold border-t border-brand-gold/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Semua</span>
            </button>
            <button
              type="button"
              onClick={() => onModeTabChange("online")}
              className={`py-2 px-3 sm:px-4 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                modeTab === "online"
                  ? "liquid-neumorph-pill bg-sky-500/15 text-sky-300 border-t border-sky-400/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Monitor className="w-3.5 h-3.5 shrink-0" />
              <span>Online</span>
            </button>
            <button
              type="button"
              onClick={() => onModeTabChange("offline")}
              className={`py-2 px-3 sm:px-4 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                modeTab === "offline"
                  ? "liquid-neumorph-pill bg-brand-gold/15 text-brand-gold border-t border-brand-gold/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>Offline</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full lg:w-auto">
          <div className="relative">
            <label htmlFor="monthSelect" className="sr-only">Pilih Bulan</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-gold">
              <Calendar className="w-4 h-4 shrink-0" />
            </div>
            <select
              id="monthSelect"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="liquid-neumorph-inset w-full pl-9 pr-8 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 bg-[rgba(8,18,28,0.65)] border border-white/10 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 cursor-pointer transition-all"
            >
              {MONTH_NAMES.map((month) => (
                <option key={month} value={month} className="bg-slate-900 text-white">
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label htmlFor="availSelect" className="sr-only">Filter Ketersediaan</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-gold">
              <Filter className="w-4 h-4 shrink-0" />
            </div>
            <select
              id="availSelect"
              value={availabilityFilter}
              onChange={(e) => onAvailabilityChange(e.target.value)}
              className="liquid-neumorph-inset w-full pl-9 pr-8 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 bg-[rgba(8,18,28,0.65)] border border-white/10 focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 cursor-pointer transition-all"
            >
              <option value="all" className="bg-slate-900 text-white">Semua Jadwal ({totalSlots})</option>
              <option value="available" className="bg-slate-900 text-white">Hanya Tersedia ({availableSlots})</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
