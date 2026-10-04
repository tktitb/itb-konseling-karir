import React, { useState } from "react"
import {
  Users,
  Clock,
  ArrowUpRight,
  MessageCircle,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles
} from "lucide-react"

export default function TktWaitingListTab({
  participants = [],
  availableDates = [],
  availablePsikologs = [],
  onPromote,
  onOpenDetail,
  onDeleteParticipant,
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

  const sesiList = [
    "09.00-09.45",
    "09.50-10.35",
    "10.40-11.25",
    "11.30-12.15",
    "13.15-14.00",
    "14.05-14.50",
    "14.55-15.40"
  ]

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
          <h2 className="text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <span>Antrean Waiting List Peserta</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Peserta yang mendaftar saat kuota penuh. Dapat dipromosikan sewaktu-waktu saat ada slot lowong.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 text-xs font-bold flex items-center gap-2">
          <span>Total Menunggu:</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[11px]">
            {waitingList.length}
          </span>
        </div>
      </div>

      {waitingList.length === 0 ? (
        <div className="rounded-3xl p-12 bg-white/70 backdrop-blur-xl border border-white/80 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-800">
            Tidak Ada Antrean Waiting List
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
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
                className="rounded-2xl p-5 bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_10px_30px_rgba(0,33,71,0.05)] flex flex-col justify-between hover:border-amber-400 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                      Waiting List
                    </span>
                  </div>

                  <h4 className="font-extrabold text-neutral-900 text-sm leading-snug">
                    {p.nama_lengkap}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">{p.nomor_wa}</p>

                  <div className="mt-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200/60 text-xs space-y-1 text-neutral-600">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Institusi:</span>
                      <span className="font-medium text-neutral-800 truncate max-w-[150px]">
                        {p.asal_univ}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Pilihan Hari:</span>
                      <span className="font-semibold text-neutral-800">
                        {p.jadwal_hari || "Bebas"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Fokus:</span>
                      <span className="font-medium text-neutral-800">{p.harapan_sesi}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenDetail(p)}
                      title="Lihat Profil"
                      className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        title="Kirim Pesan Notifikasi Waiting List"
                        className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => onDeleteParticipant(p)}
                      title="Hapus dari Antrean"
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenPromote(p)}
                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-md animate-fadeIn">
          <div
            className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_25px_60px_rgba(0,33,71,0.25)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-neutral-900 leading-tight">
                  Promosikan ke Slot Terjadwal
                </h3>
                <p className="text-xs text-neutral-500">
                  {promoteModal.participant?.nama_lengkap}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmPromote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Pilih Hari Konseling
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy"
                >
                  {availableDates.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Pilih Sesi Waktu
                </label>
                <select
                  value={selectedSesi}
                  onChange={(e) => setSelectedSesi(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy"
                >
                  {sesiList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Tugaskan Psikolog
                </label>
                <select
                  value={selectedPsikolog}
                  onChange={(e) => setSelectedPsikolog(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-brand-navy"
                >
                  {availablePsikologs.map((psi) => (
                    <option key={psi} value={psi}>
                      {psi}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPromoteModal({ isOpen: false, participant: null })}
                  className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md cursor-pointer"
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
