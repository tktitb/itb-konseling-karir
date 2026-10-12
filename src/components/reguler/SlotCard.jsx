import React from "react"
import { Clock, Video, Building2, Calendar } from "lucide-react"
import { formatDatetimeText, getDateDetails } from "../../utils/timeUtils"

export default function SlotCard({ slot, onBook }) {
  const datetimeText = formatDatetimeText(slot.datetimeFmt)
  const dateDetails = getDateDetails(slot.datetimeFmt)
  const isOnline = slot.mode?.toLowerCase() === "online"
  const isLina = slot.psychologist?.toLowerCase().includes("lina")

  const psychImg = isLina ? "/images/lina.png" : "/images/sito.png"
  const psychFull = isLina
    ? "Lina Tarlina, S.Psi, Psikolog"
    : "Sito Asih Pratiwi, S.Psi, Psikolog"

  const displayDate = dateDetails.dayName
    ? `${dateDetails.dayName}, ${dateDetails.dayNumber} ${dateDetails.monthName} ${dateDetails.year}`
    : datetimeText

  const cardStyle = isLina
    ? "border-sky-500/20 hover:border-sky-400/40"
    : "border-brand-gold/20 hover:border-brand-gold/40"

  const psychBadgeStyle = isLina
    ? "bg-sky-500/10 border-t border-sky-400/30 text-sky-200"
    : "bg-brand-gold/10 border-t border-brand-gold/30 text-amber-200"

  const timeHighlightStyle = isLina ? "text-sky-300" : "text-amber-300"
  const iconColor = isLina ? "text-sky-400" : "text-brand-gold"

  return (
    <div
      className={`liquid-neumorph-card rounded-2xl p-4 sm:p-5 relative transition-all duration-300 border-t border-l border-white/20 hover:-translate-y-1 ${cardStyle}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div
          className={`liquid-neumorph-pill inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md min-w-0 ${psychBadgeStyle}`}
        >
          <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/20 bg-slate-900">
            <img
              src={psychImg}
              alt={psychFull}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.target.src = "/images/logo.jpg"
              }}
            />
          </div>
          <span className="text-xs font-semibold truncate">{psychFull}</span>
        </div>

        <div className="shrink-0">
          {slot.isAvailable ? (
            <span className="liquid-neumorph-pill inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border-t border-emerald-400/30 shadow-sm">
              Tersedia
            </span>
          ) : (
            <span className="liquid-neumorph-inset inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-400 border border-white/5">
              Sudah Terisi
            </span>
          )}
        </div>
      </div>

      <div className="liquid-neumorph-inset py-2.5 px-3.5 rounded-xl mb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-white/5">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-200">
          <Calendar className={`w-4 h-4 shrink-0 ${iconColor}`} />
          <span>{displayDate}</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white shrink-0">
          <Clock className={`w-3.5 h-3.5 shrink-0 ${iconColor}`} />
          <span className={timeHighlightStyle}>
            {dateDetails.time || "09:00"} WIB
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="shrink-0 self-start sm:self-auto">
          {isOnline ? (
            <span className="liquid-neumorph-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border-t border-sky-400/30">
              <Video className="w-3.5 h-3.5" />
              <span>Online (Zoom)</span>
            </span>
          ) : (
            <span className="liquid-neumorph-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold/15 text-brand-gold border-t border-brand-gold/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>Offline (ITBCC)</span>
            </span>
          )}
        </div>

        <div className="flex-1 sm:flex-initial">
          {slot.isAvailable ? (
            <button
              type="button"
              onClick={() => onBook(slot)}
              className="liquid-neumorph-btn w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-brand-gold bg-brand-gold/15 hover:bg-brand-gold/25 border-t border-brand-gold/40 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Pilih Jadwal Ini</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="liquid-neumorph-inset w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium text-slate-500 border border-white/5 cursor-not-allowed opacity-70 flex items-center justify-center"
            >
              <span>Jadwal Terisi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
