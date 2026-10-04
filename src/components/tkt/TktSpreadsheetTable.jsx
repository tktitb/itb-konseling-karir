import React, { useState, useMemo } from "react"
import {
  Search,
  Filter,
  Download,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Check,
  AlertCircle
} from "lucide-react"

export default function TktSpreadsheetTable({
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
    { value: "DAPAT_SESI", label: "DAPAT SESI", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { value: "CONFIRMED", label: "CONFIRMED", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { value: "HADIR", label: "HADIR (BOOTH)", color: "bg-brand-navy text-white border-brand-navy" },
    { value: "SELESAI_FULL", label: "SELESAI", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { value: "WAITING_LIST", label: "WAITING LIST", color: "bg-amber-50 text-amber-700 border-amber-200" },
    { value: "BATAL", label: "BATAL", color: "bg-rose-50 text-rose-700 border-rose-200" }
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

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `data_peserta_tkt_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div className="flex flex-1 flex-wrap gap-2 items-center">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Cari nama, WA, atau prodi..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white/90 border border-neutral-200/90 focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all shadow-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 text-xs rounded-xl bg-white/90 border border-neutral-200/90 text-neutral-800 font-medium focus:outline-none focus:border-brand-navy shadow-sm cursor-pointer"
          >
            <option value="ALL">Semua Status ({participants.length})</option>
            <option value="DAPAT_SESI">Dapat Sesi</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="HADIR">Hadir di Booth</option>
            <option value="SELESAI_FULL">Selesai</option>
            <option value="WAITING_LIST">Waiting List</option>
            <option value="BATAL">Batal</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 text-xs rounded-xl bg-white/90 border border-neutral-200/90 text-neutral-800 font-medium focus:outline-none focus:border-brand-navy shadow-sm cursor-pointer"
          >
            <option value="ALL">Semua Tanggal</option>
            {availableDates.map((d) => (
              <option key={d} value={d}>
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
            className="px-3 py-2 text-xs rounded-xl bg-white/90 border border-neutral-200/90 text-neutral-800 font-medium focus:outline-none focus:border-brand-navy shadow-sm cursor-pointer"
          >
            <option value="ALL">Semua Sesi</option>
            {sesiList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto">
          <button
            onClick={exportToCSV}
            className="px-3.5 py-2 rounded-xl bg-white/90 hover:bg-neutral-50 text-neutral-700 border border-neutral-200/90 font-semibold text-xs flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={onOpenWalkIn}
            className="px-4 py-2 rounded-xl bg-brand-navy hover:bg-brand-navy/95 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-brand-navy/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-brand-gold" />
            <span>+ Peserta Walk-In</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,33,71,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-brand-navy text-white text-[11px] uppercase font-bold tracking-wider select-none">
                <th className="py-3.5 px-3 text-center w-10">No</th>
                <th
                  onClick={() => handleSort("nama_lengkap")}
                  className="py-3.5 px-4 cursor-pointer hover:text-brand-gold transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Peserta & Kontak</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("jadwal_hari")}
                  className="py-3.5 px-4 cursor-pointer hover:text-brand-gold transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Jadwal & Sesi (Inline)</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="py-3.5 px-4">
                  <span>Psikolog Bertugas (Inline)</span>
                </th>
                <th
                  onClick={() => handleSort("status_peserta")}
                  className="py-3.5 px-4 cursor-pointer hover:text-brand-gold transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Status (Inline)</span>
                    <ArrowUpDown className="w-3 h-3 opacity-70" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/70">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <p className="font-semibold text-sm">Tidak ada data peserta ditemukan.</p>
                    <p className="text-xs mt-1">Sesuaikan kata kunci pencarian atau ubah filter di atas.</p>
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
                      className="hover:bg-brand-navy/[0.02] transition-colors group"
                    >
                      <td className="py-3 px-3 text-center text-neutral-400 font-bold">
                        {absoluteIdx}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-neutral-900 leading-tight">
                          {p.nama_lengkap}
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                          <span>{p.nomor_wa}</span>
                          <span className="w-1 h-1 rounded-full bg-neutral-300" />
                          <span className="truncate max-w-[150px]">{p.jurusan || p.asal_univ}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-neutral-800 text-[11px]">
                            {p.jadwal_hari || "-"}
                          </span>
                          <select
                            value={p.jadwal_sesi || "09.00-09.45"}
                            onChange={(e) =>
                              onUpdateParticipant(p.id, { jadwal_sesi: e.target.value })
                            }
                            className="text-[11px] py-1 px-2 rounded-lg bg-neutral-50 border border-neutral-300 font-medium text-brand-navy focus:outline-none focus:border-brand-navy cursor-pointer hover:bg-white transition-colors"
                          >
                            {sesiList.map((s) => (
                              <option key={s} value={s}>
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
                          className="text-[11px] py-1.5 px-2.5 rounded-lg bg-neutral-50 border border-neutral-300 font-medium text-neutral-800 focus:outline-none focus:border-brand-navy cursor-pointer hover:bg-white transition-colors max-w-[170px] truncate"
                        >
                          <option value="Antre">Antre (Belum Ditentukan)</option>
                          {availablePsikologs.map((psi) => (
                            <option key={psi} value={psi}>
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
                            p.status_peserta === "CONFIRMED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : p.status_peserta === "HADIR"
                              ? "bg-brand-navy text-white border-brand-navy"
                              : p.status_peserta === "WAITING_LIST"
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : p.status_peserta === "BATAL"
                              ? "bg-rose-50 text-rose-800 border-rose-300"
                              : p.status_peserta === "SELESAI_FULL"
                              ? "bg-purple-50 text-purple-800 border-purple-300"
                              : "bg-blue-50 text-blue-800 border-blue-300"
                          }`}
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-white text-neutral-900 font-medium">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenDetail(p)}
                            title="Detail Profil"
                            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenEdit(p)}
                            title="Edit Data Lengkap"
                            className="p-1.5 rounded-lg bg-brand-gold/15 hover:bg-brand-gold/25 text-brand-gold transition-colors cursor-pointer"
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
                              className={`p-1.5 rounded-lg text-white transition-all shadow-sm cursor-pointer ${
                                p.status_peserta === "HADIR"
                                  ? "bg-purple-600 hover:bg-purple-700"
                                  : "bg-emerald-600 hover:bg-emerald-700"
                              }`}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => onDeleteParticipant(p)}
                            title="Hapus Peserta"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
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

        <div className="p-3.5 border-t border-neutral-200/70 bg-neutral-50/60 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-600">
          <div>
            Menampilkan <span className="font-bold text-neutral-900">{paginatedData.length}</span> dari{" "}
            <span className="font-bold text-neutral-900">{filteredData.length}</span> pendaftar tersaring
            {filteredData.length !== participants.length && (
              <span> (total keseluruhan: {participants.length})</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-neutral-800">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
