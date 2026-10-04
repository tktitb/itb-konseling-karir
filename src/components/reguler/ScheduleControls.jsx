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
    <div className="p-3.5 sm:p-5 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md mb-6 sm:mb-8">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 sm:gap-4">
        <div className="w-full lg:w-auto">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-full bg-black/40 border border-white/10">
            <button
              type="button"
              onClick={() => onModeTabChange("all")}
              className={`py-2 px-2 sm:px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                modeTab === "all" ? "liquid-glass-tab-active" : "liquid-glass-tab"
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Semua</span>
            </button>
            <button
              type="button"
              onClick={() => onModeTabChange("online")}
              className={`py-2 px-2 sm:px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                modeTab === "online" ? "liquid-glass-tab-active" : "liquid-glass-tab"
              }`}
            >
              <Monitor className="w-3.5 h-3.5 shrink-0" />
              <span>Online</span>
            </button>
            <button
              type="button"
              onClick={() => onModeTabChange("offline")}
              className={`py-2 px-2 sm:px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                modeTab === "offline" ? "liquid-glass-tab-active" : "liquid-glass-tab"
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
              className="liquid-input w-full pl-9 pr-8 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-slate-900/80 border border-white/15 focus:border-brand-gold cursor-pointer"
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
              className="liquid-input w-full pl-9 pr-8 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-slate-900/80 border border-white/15 focus:border-brand-gold cursor-pointer"
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
