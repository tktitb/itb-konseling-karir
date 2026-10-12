import React, { useState } from "react"
import {
  Users,
  ArrowUpRight,
  Eye,
  CheckCircle2,
  Sparkles
} from "lucide-react"
import WhatsAppIcon from "../common/WhatsAppIcon"
import { SESI_TKT_META } from "../../services/tktService"

export default function TktWaitingListTab({
  participants = [],
  availableDates = [],
  availablePsikologs = [],
  onPromote,
  onOpenDetail,
  getWaLink
}) {
  const waitingList = participants.filter((p) => p.status_peserta === "WAITING_LIST")
  const [promoteModal, setPromoteModal] = useState({ isOpen: false, participant: null })
  const [selectedDay, setSelectedDay] = useState(
    availableDates && availableDates.length > 0 ? availableDates[0] : ""
  )
  const [selectedSesi, setSelectedSesi] = useState("09.00-09.45")
  const [selectedPsikolog, setSelectedPsikolog] = useState(
    availablePsikologs && availablePsikologs.length > 0 ? availablePsikologs[0] : "Psikolog 1"
  )

  const handleOpenPromote = (p) => {
    setPromoteModal({ isOpen: true, participant: p })
    if (p.jadwal_hari && availableDates.includes(p.jadwal_hari)) {
      setSelectedDay(p.jadwal_hari)
    }
  }

  const handleConfirmPromote = (e) => {
    e.preventDefault()
    if (!promoteModal.participant) return

    onPromote(promoteModal.participant.id, {
      jadwal_hari: selectedDay,
      jadwal_sesi: selectedSesi,
      psikolog_bertugas: selectedPsikolog,
      status_peserta: "CONFIRMED"
    })
    setPromoteModal({ isOpen: false, participant: null })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-gold" />
            <span>Antrean Waiting List Peserta</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Peserta yang mendaftar saat kuota penuh. Dapat dipromosikan sewaktu-waktu saat ada slot lowong.
          </p>
        </div>

        <div className="liquid-neumorph-pill px-3.5 py-1.5 rounded-full text-brand-gold text-xs font-semibold flex items-center gap-2 border-t border-brand-gold/30">
          <span>Total Menunggu:</span>
          <span className="px-2 py-0.5 rounded-full bg-brand-gold text-slate-950 font-bold text-[11px]">
            {waitingList.length}
          </span>
        </div>
      </div>

      {waitingList.length === 0 ? (
        <div className="liquid-neumorph-card rounded-3xl p-12 text-center border-t border-l border-white/20">
          <div className="liquid-neumorph-pill w-12 h-12 rounded-2xl bg-emerald-500/10 border-t border-emerald-500/25 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">
            Tidak Ada Antrean Waiting List
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Semua peserta yang terdaftar saat ini telah dialokasikan ke jadwal sesi masing-masing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {waitingList.map((p, idx) => {
            const waLink = getWaLink("wa_template_waiting_list", p)

            return (
              <div
                key={p.id}
                className="liquid-neumorph-card rounded-2xl p-5 border-t border-l border-white/20 shadow-lg flex flex-col justify-between hover:border-brand-gold/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="liquid-neumorph-inset w-7 h-7 rounded-xl text-brand-gold font-bold text-xs flex items-center justify-center border border-white/10">
                      #{idx + 1}
                    </span>
                    <span className="liquid-neumorph-pill px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-500/15 text-brand-gold border-t border-amber-400/30">
                      Waiting List
                    </span>
                  </div>

                  <h4 className="font-semibold text-white text-sm leading-snug">
                    {p.nama_lengkap}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{p.nomor_wa}</p>

                  <div className="liquid-neumorph-inset mt-3 p-3 rounded-xl border border-white/5 text-xs space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Institusi:</span>
                      <span className="font-semibold text-slate-200 truncate max-w-[150px]">
                        {p.asal_univ}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pilihan Hari:</span>
                      <span className="font-semibold text-brand-gold">
                        {p.jadwal_hari || "Bebas"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fokus:</span>
                      <span className="font-semibold text-slate-200">{p.harapan_sesi}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenDetail(p)}
                      title="Lihat Profil"
                      className="liquid-neumorph-pill p-2 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        title="Kirim Pesan Notifikasi Waiting List"
                        className="liquid-neumorph-pill p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border-t border-emerald-400/30 transition-colors cursor-pointer"
                      >
                        <WhatsAppIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenPromote(p)}
                    className="liquid-neumorph-btn px-3 py-2 rounded-xl text-brand-gold text-xs font-semibold flex items-center gap-1.5 bg-brand-gold/15 hover:bg-brand-gold/25 border-t border-brand-gold/40 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <span>Promosikan</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {promoteModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setPromoteModal({ isOpen: false, participant: null })}
        >
          <div
            className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 liquid-neumorph-card border-t border-l border-white/20 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="liquid-neumorph-pill w-10 h-10 rounded-2xl bg-amber-500/15 border-t border-amber-500/30 flex items-center justify-center text-brand-gold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white leading-tight">
                  Promosikan ke Slot Terjadwal
                </h3>
                <p className="text-xs text-slate-300">
                  {promoteModal.participant?.nama_lengkap}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmPromote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Pilih Hari Konseling
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="liquid-neumorph-inset w-full px-3 py-2 text-xs font-semibold rounded-xl text-slate-100 bg-[rgba(8,18,28,0.65)] border border-white/10 focus:outline-none focus:border-brand-gold/50 cursor-pointer"
                >
                  {availableDates.map((d) => (
                    <option key={d} value={d} className="bg-slate-900 text-white">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Pilih Sesi Waktu
                </label>
                <select
                  value={selectedSesi}
                  onChange={(e) => setSelectedSesi(e.target.value)}
                  className="liquid-neumorph-inset w-full px-3 py-2 text-xs font-semibold rounded-xl text-slate-100 bg-[rgba(8,18,28,0.65)] border border-white/10 focus:outline-none focus:border-brand-gold/50 cursor-pointer"
                >
                  {SESI_TKT_META.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                      {s.compactLabel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Tugaskan Psikolog
                </label>
                <select
                  value={selectedPsikolog}
                  onChange={(e) => setSelectedPsikolog(e.target.value)}
                  className="liquid-neumorph-inset w-full px-3 py-2 text-xs font-semibold rounded-xl text-slate-100 bg-[rgba(8,18,28,0.65)] border border-white/10 focus:outline-none focus:border-brand-gold/50 cursor-pointer"
                >
                  {availablePsikologs.map((psi) => (
                    <option key={psi} value={psi} className="bg-slate-900 text-white">
                      {psi}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPromoteModal({ isOpen: false, participant: null })}
                  className="liquid-neumorph-inset px-4 py-2 rounded-xl text-slate-300 hover:text-white font-semibold text-xs border border-white/10 cursor-pointer active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="liquid-btn-gold px-5 py-2 rounded-xl text-[#07131e] font-bold text-xs shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  Konfirmasi Promosi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
