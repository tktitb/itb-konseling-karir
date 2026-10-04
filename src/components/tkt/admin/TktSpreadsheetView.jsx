import React, { useState, useMemo } from "react"
import {
  Search,
  Download,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter
} from "lucide-react"

export default function TktSpreadsheetView({
  participants = [],
  config = {},
  availableDates = [],
  availablePsikologs = [],
  onUpdateStatus,
  onUpdateParticipant,
  onDeleteParticipant,
  onOpenWalkIn,
  onOpenDetail,
  onOpenEdit,
  getWaLink
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [dateFilter, setDateFilter] = useState("ALL")
  const [sesiFilter, setSesiFilter] = useState("ALL")
  const [sortField, setSortField] = useState("created_at")
  const [sortDirection, setSortDirection] = useState("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  const sesiList = [
    "09.00-09.45",
    "09.50-10.35",
    "10.40-11.25",
    "11.30-12.15",
    "13.15-14.00",
    "14.05-14.50",
    "14.55-15.40"
  ]

  const statusOptions = [
    { value: "DAPAT_SESI", label: "DAPAT SESI", color: "bg-sky-500/15 text-sky-300 border-sky-400/30" },
    { value: "CONFIRMED", label: "CONFIRMED", color: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" },
    { value: "HADIR", label: "HADIR DI BOOTH", color: "bg-amber-500/15 text-amber-300 border-amber-400/30" },
    { value: "SELESAI_FULL", label: "SELESAI", color: "bg-blue-500/15 text-blue-300 border-blue-400/30" },
    { value: "WAITING_LIST", label: "WAITING LIST", color: "bg-amber-500/15 text-amber-300 border-amber-400/30" },
    { value: "BATAL", label: "BATAL", color: "bg-rose-500/15 text-rose-300 border-rose-400/30" }
  ]

  const filteredData = useMemo(() => {
    return participants.filter((p) => {
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        (p.nama_lengkap && p.nama_lengkap.toLowerCase().includes(q)) ||
        (p.nomor_wa && p.nomor_wa.toLowerCase().includes(q)) ||
        (p.asal_univ && p.asal_univ.toLowerCase().includes(q)) ||
        (p.jurusan && p.jurusan.toLowerCase().includes(q))

      const matchStatus = statusFilter === "ALL" || p.status_peserta === statusFilter
      const matchDate = dateFilter === "ALL" || p.jadwal_hari === dateFilter
      const matchSesi = sesiFilter === "ALL" || p.jadwal_sesi === sesiFilter

      return matchSearch && matchStatus && matchDate && matchSesi
    })
  }, [participants, searchQuery, statusFilter, dateFilter, sesiFilter])

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortField] || ""
      let bVal = b[sortField] || ""

      if (typeof aVal === "string") aVal = aVal.toLowerCase()
      if (typeof bVal === "string") bVal = bVal.toLowerCase()

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredData, sortField, sortDirection])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedData.slice(start, start + itemsPerPage)
  }, [sortedData, currentPage, itemsPerPage])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const exportToCSV = () => {
    if (filteredData.length === 0) return

    const headers = [
      "No",
      "Nama Lengkap",
      "Nomor WA",
      "Email",
      "Universitas",
      "Jurusan",
      "Angkatan",
      "Member ITBCC",
      "Hari Kegiatan",
      "Sesi Konseling",
      "Psikolog Bertugas",
      "Status Peserta",
      "Fokus Sesi",
      "Waktu Mendaftar"
    ]

    const rows = filteredData.map((p, idx) => [
      idx + 1,
      `"${p.nama_lengkap || ""}"`,
      `"${p.nomor_wa || ""}"`,
      `"${p.email || ""}"`,
      `"${p.asal_univ || ""}"`,
      `"${p.jurusan || ""}"`,
      `"${p.angkatan || ""}"`,
      p.is_member_itbcc ? "Ya" : "Tidak",
      `"${p.jadwal_hari || ""}"`,
      `"${p.jadwal_sesi || ""}"`,
      `"${p.psikolog_bertugas || ""}"`,
      `"${p.status_peserta || ""}"`,
      `"${p.harapan_sesi || ""}"`,
      `"${p.created_at || ""}"`
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `data_peserta_tkt_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="liquid-glass-card p-4 flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div className="flex flex-1 flex-wrap gap-2 items-center">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Cari nama, WA, prodi, universitas..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all shadow-inner"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 text-xs rounded-xl bg-slate-900/60 border border-white/10 text-slate-200 font-medium focus:outline-none focus:border-amber-400/50 cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">
              Semua Status ({participants.length})
            </option>
            <option value="DAPAT_SESI" className="bg-slate-900 text-slate-200">
              Dapat Sesi
            </option>
            <option value="CONFIRMED" className="bg-slate-900 text-slate-200">
              Confirmed
            </option>
            <option value="HADIR" className="bg-slate-900 text-slate-200">
              Hadir di Booth
            </option>
            <option value="SELESAI_FULL" className="bg-slate-900 text-slate-200">
              Selesai
            </option>
            <option value="WAITING_LIST" className="bg-slate-900 text-slate-200">
              Waiting List
            </option>
            <option value="BATAL" className="bg-slate-900 text-slate-200">
              Batal
            </option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 text-xs rounded-xl bg-slate-900/60 border border-white/10 text-slate-200 font-medium focus:outline-none focus:border-amber-400/50 cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">
              Semua Tanggal
            </option>
            {availableDates.map((d) => (
              <option key={d} value={d} className="bg-slate-900 text-slate-200">
                {d}
              </option>
            ))}
          </select>

          <select
            value={sesiFilter}
            onChange={(e) => {
              setSesiFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 text-xs rounded-xl bg-slate-900/60 border border-white/10 text-slate-200 font-medium focus:outline-none focus:border-amber-400/50 cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">
              Semua Sesi Jam
            </option>
            {sesiList.map((s) => (
              <option key={s} value={s} className="bg-slate-900 text-slate-200">
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto">
          <button
            onClick={exportToCSV}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Unduh seluruh data yang tersaring ke CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={onOpenWalkIn}
            className="liquid-btn-gold px-4 py-2 rounded-xl text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-950" />
            <span>+ Peserta Walk-In</span>
          </button>
        </div>
      </div>

      <div className="liquid-glass-card rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-300 text-[11px] uppercase font-bold tracking-wider select-none border-b border-white/10">
                <th className="py-3.5 px-3 text-center w-10">No</th>
                <th
                  onClick={() => handleSort("nama_lengkap")}
                  className="py-3.5 px-4 cursor-pointer hover:text-amber-300 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Peserta & Kontak</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("jadwal_hari")}
                  className="py-3.5 px-4 cursor-pointer hover:text-amber-300 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Jadwal & Sesi (Live Edit)</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3.5 px-4">
                  <span>Psikolog Bertugas (Live Edit)</span>
                </th>
                <th
                  onClick={() => handleSort("status_peserta")}
                  className="py-3.5 px-4 cursor-pointer hover:text-amber-300 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Status Peserta (Live Edit)</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <p className="font-semibold text-sm text-slate-300">
                      Tidak ada data peserta ditemukan.
                    </p>
                    <p className="text-xs mt-1">
                      Sesuaikan kata kunci pencarian atau ubah opsi filter di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((p, idx) => {
                  const absoluteIdx = (currentPage - 1) * itemsPerPage + idx + 1
                  const waTemplateKey =
                    p.status_peserta === "WAITING_LIST"
                      ? "wa_template_waiting_list"
                      : p.status_peserta === "HADIR"
                      ? "wa_template_minta_feedback"
                      : "wa_template_konfirmasi_sesi"
                  const waUrl = getWaLink(waTemplateKey, p)

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="py-3 px-3 text-center text-slate-500 font-mono font-bold">
                        {absoluteIdx}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-white leading-tight">
                          {p.nama_lengkap}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{p.nomor_wa}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-600" />
                          <span className="truncate max-w-[150px]">
                            {p.jurusan || p.asal_univ}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-amber-300 text-[11px]">
                            {p.jadwal_hari || "-"}
                          </span>
                          <select
                            value={p.jadwal_sesi || "09.00-09.45"}
                            onChange={(e) =>
                              onUpdateParticipant(p.id, { jadwal_sesi: e.target.value })
                            }
                            className="text-[11px] py-1 px-2 rounded-lg bg-slate-900/70 border border-white/10 font-medium text-slate-200 focus:outline-none focus:border-amber-400/50 cursor-pointer hover:bg-slate-900 transition-colors"
                          >
                            {sesiList.map((s) => (
                              <option key={s} value={s} className="bg-slate-900 text-slate-200">
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={p.psikolog_bertugas || "Antre"}
                          onChange={(e) =>
                            onUpdateParticipant(p.id, { psikolog_bertugas: e.target.value })
                          }
                          className="text-[11px] py-1.5 px-2.5 rounded-lg bg-slate-900/70 border border-white/10 font-medium text-slate-200 focus:outline-none focus:border-amber-400/50 cursor-pointer hover:bg-slate-900 transition-colors max-w-[170px] truncate"
                        >
                          <option value="Antre" className="bg-slate-900 text-slate-200">
                            Antre (Belum Ditentukan)
                          </option>
                          {availablePsikologs.map((psi) => (
                            <option key={psi} value={psi} className="bg-slate-900 text-slate-200">
                              {psi}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <select
                          value={p.status_peserta || "DAPAT_SESI"}
                          onChange={(e) => onUpdateStatus(p.id, e.target.value)}
                          className={`text-[11px] font-bold py-1.5 px-2.5 rounded-xl border transition-all cursor-pointer shadow-sm ${
                            statusOptions.find((opt) => opt.value === p.status_peserta)
                              ?.color || "bg-slate-800 text-slate-300 border-white/10"
                          }`}
                        >
                          {statusOptions.map((opt) => (
                            <option
                              key={opt.value}
                              value={opt.value}
                              className="bg-slate-900 text-slate-200 font-medium"
                            >
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenDetail(p)}
                            title="Detail Profil Lengkap"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenEdit(p)}
                            title="Edit Data Lengkap"
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors cursor-pointer border border-amber-400/20"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              title={
                                p.status_peserta === "HADIR"
                                  ? "Kirim Pesan Minta Ulasan Feedback"
                                  : "Kirim Pesan WhatsApp"
                              }
                              className={`p-1.5 rounded-lg text-white transition-all shadow-sm cursor-pointer border ${
                                p.status_peserta === "HADIR"
                                  ? "bg-sky-600/80 hover:bg-sky-600 border-sky-400/30"
                                  : "bg-emerald-600/80 hover:bg-emerald-600 border-emerald-400/30"
                              }`}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => onDeleteParticipant(p)}
                            title="Hapus Peserta"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer border border-rose-400/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 border-t border-white/10 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Menampilkan <span className="font-bold text-white">{paginatedData.length}</span> dari{" "}
            <span className="font-bold text-white">{filteredData.length}</span> pendaftar tersaring
            {filteredData.length !== participants.length && (
              <span> (total keseluruhan: {participants.length})</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
