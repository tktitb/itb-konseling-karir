import React, { useState, useMemo } from "react"
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  GraduationCap,
  BarChart3,
  Target,
  FileText,
  Compass,
  Briefcase,
  BookOpen,
  Sparkles,
  UserCheck,
  Award,
  Calendar
} from "lucide-react"
import {
  ENABLE_TKT_WAITING_LIST,
  SESI_TKT_META,
  getPsikologListForDate
} from "../../../services/tktService"

export default function TktAnalyticsView({
  participants = [],
  config = {},
  availableDates = [],
  availablePsikologs = []
}) {
  const [selectedDate, setSelectedDate] = useState("ALL")

  const filteredParticipants = useMemo(() => {
    if (selectedDate === "ALL") return participants
    return participants.filter((p) => p.jadwal_hari === selectedDate)
  }, [participants, selectedDate])

  const totalCapacitySlots = useMemo(() => {
    const sessionsPerDay = SESI_TKT_META.length
    if (selectedDate !== "ALL") {
      const psiList = getPsikologListForDate(config, selectedDate)
      return (psiList?.length || 5) * sessionsPerDay
    }
    if (availableDates && availableDates.length > 0) {
      return availableDates.reduce((sum, dateStr) => {
        const psiList = getPsikologListForDate(config, dateStr)
        return sum + (psiList?.length || 5) * sessionsPerDay
      }, 0)
    }
    return 70
  }, [config, selectedDate, availableDates])

  const total = filteredParticipants.length
  const activeScheduled = filteredParticipants.filter(
    (p) => !["WAITING_LIST", "BATAL"].includes(p.status_peserta)
  ).length
  const countConfirmed = filteredParticipants.filter((p) =>
    ["CONFIRMED", "DAPAT_SESI"].includes(p.status_peserta)
  ).length
  const countHadir = filteredParticipants.filter((p) =>
    ["HADIR", "SELESAI_FULL"].includes(p.status_peserta)
  ).length
  const countWaiting = filteredParticipants.filter(
    (p) => p.status_peserta === "WAITING_LIST"
  ).length
  const countBatal = filteredParticipants.filter(
    (p) => p.status_peserta === "BATAL"
  ).length

  const occupancyPct =
    totalCapacitySlots > 0
      ? Math.min(100, Math.round((activeScheduled / totalCapacitySlots) * 100))
      : 0

  const countITB = filteredParticipants.filter(
    (p) =>
      (p.asal_univ || "").toLowerCase().includes("institut teknologi bandung") ||
      (p.status_mhs || "").includes("ITB") && !(p.status_mhs || "").includes("Non-ITB")
  ).length
  const countNonITB = Math.max(0, total - countITB)
  const pctITB = total > 0 ? Math.round((countITB / total) * 100) : 0
  const pctNonITB = total > 0 ? 100 - pctITB : 0

  const countMemberItbCc = filteredParticipants.filter(
    (p) => p.is_member_itbcc === true || String(p.is_member_itbcc) === "true"
  ).length
  const pctMemberItbCc = total > 0 ? Math.round((countMemberItbCc / total) * 100) : 0

  const statusMhsCategories = useMemo(() => {
    const categories = [
      { label: "Mahasiswa Aktif ITB", color: "bg-amber-400" },
      { label: "Alumni ITB", color: "bg-brand-gold" },
      { label: "Mahasiswa Non-ITB", color: "bg-sky-400" },
      { label: "Alumni Non-ITB", color: "bg-blue-400" },
      { label: "Umum", color: "bg-emerald-400" }
    ]
    return categories.map((cat) => {
      const count = filteredParticipants.filter((p) => {
        if (cat.label === "Mahasiswa Aktif ITB") {
          return p.status_mhs === "Mahasiswa Aktif ITB" || p.status_mhs === "Mahasiswa"
        }
        if (cat.label === "Alumni ITB") {
          return (
            p.status_mhs === "Alumni ITB" ||
            (p.status_mhs === "Alumni" &&
              (p.asal_univ || "").toLowerCase().includes("institut teknologi bandung"))
          )
        }
        if (cat.label === "Alumni Non-ITB") {
          return (
            p.status_mhs === "Alumni Non-ITB" ||
            (p.status_mhs === "Alumni" &&
              !(p.asal_univ || "").toLowerCase().includes("institut teknologi bandung"))
          )
        }
        return p.status_mhs === cat.label
      }).length
      const pct = total > 0 ? Math.round((count / total) * 100) : 0
      return { ...cat, count, pct }
    })
  }, [filteredParticipants, total])

  const allStatusBreakdown = [
    {
      label: "Dapat Sesi (Menunggu Konfirmasi)",
      count: filteredParticipants.filter((p) => p.status_peserta === "DAPAT_SESI").length,
      color: "bg-sky-400"
    },
    {
      label: "Terkonfirmasi Hadir",
      count: filteredParticipants.filter((p) => p.status_peserta === "CONFIRMED").length,
      color: "bg-emerald-400"
    },
    {
      label: "Hadir di Lokasi Konseling",
      count: filteredParticipants.filter((p) => p.status_peserta === "HADIR").length,
      color: "bg-amber-400"
    },
    {
      label: "Selesai Sesi Konseling",
      count: filteredParticipants.filter((p) => p.status_peserta === "SELESAI_FULL").length,
      color: "bg-blue-400"
    },
    {
      label: "Waiting List",
      count: countWaiting,
      color: "bg-amber-500/80"
    },
    {
      label: "Batal / Dibatalkan",
      count: countBatal,
      color: "bg-rose-400"
    }
  ]

  const statusBreakdown = allStatusBreakdown.filter(
    (item) => ENABLE_TKT_WAITING_LIST || item.label !== "Waiting List"
  )

  const harapanBreakdown = useMemo(() => {
    const items = [
      {
        key: "Konsultasi Karier",
        title: "Konsultasi Karier",
        subtitle: "Eksplorasi minat, arah karier & pengembangan diri",
        icon: Compass,
        accentText: "text-sky-300",
        accentBar: "bg-sky-400",
        pillClass: "bg-sky-500/15 border-sky-400/30 text-sky-300",
        matcher: (val) => val === "Konsultasi Karier" || val === "Keduanya"
      },
      {
        key: "Review CV & Portofolio",
        title: "Review CV & Portofolio",
        subtitle: "Bedah kualitas resume, CV & portofolio kerja",
        icon: FileText,
        accentText: "text-brand-gold",
        accentBar: "bg-amber-400",
        pillClass: "bg-amber-500/15 border-amber-400/30 text-brand-gold",
        matcher: (val) => val === "Review CV & Portofolio" || val === "CV Review"
      },
      {
        key: "Persiapan Wawancara Kerja",
        title: "Persiapan Wawancara Kerja",
        subtitle: "Simulasi & strategi menghadapi interview rekrutmen",
        icon: Briefcase,
        accentText: "text-emerald-300",
        accentBar: "bg-emerald-400",
        pillClass: "bg-emerald-500/15 border-emerald-400/30 text-emerald-300",
        matcher: (val) => val === "Persiapan Wawancara Kerja"
      },
      {
        key: "Perencanaan Studi Lanjut",
        title: "Perencanaan Studi Lanjut",
        subtitle: "Konsultasi pemilihan studi pascasarjana & beasiswa",
        icon: BookOpen,
        accentText: "text-blue-300",
        accentBar: "bg-blue-400",
        pillClass: "bg-blue-500/15 border-blue-400/30 text-blue-300",
        matcher: (val) => val === "Perencanaan Studi Lanjut"
      },
      {
        key: "Lainnya",
        title: "Kebutuhan Lainnya",
        subtitle: "Topik spesifik di luar kategori utama",
        icon: Sparkles,
        accentText: "text-slate-200",
        accentBar: "bg-slate-300",
        pillClass: "bg-white/10 border-white/25 text-white",
        matcher: (val) =>
          val === "Lainnya" ||
          (Boolean(val) &&
            ![
              "Konsultasi Karier",
              "Keduanya",
              "Review CV & Portofolio",
              "CV Review",
              "Persiapan Wawancara Kerja",
              "Perencanaan Studi Lanjut"
            ].includes(val))
      }
    ]

    return items.map((item) => {
      const count = filteredParticipants.filter((p) => item.matcher(p.harapan_sesi)).length
      const pct = total > 0 ? Math.round((count / total) * 100) : 0
      return { ...item, count, pct }
    })
  }, [filteredParticipants, total])

  const psikologWorkload = useMemo(() => {
    const activePsikologSet = new Set()
    if (selectedDate !== "ALL") {
      const list = getPsikologListForDate(config, selectedDate)
      list.forEach((name) => activePsikologSet.add(name))
    } else if (availablePsikologs && availablePsikologs.length > 0) {
      availablePsikologs.forEach((name) => activePsikologSet.add(name))
    }

    filteredParticipants.forEach((p) => {
      if (p.psikolog_bertugas && !["WAITING_LIST", "BATAL"].includes(p.status_peserta)) {
        activePsikologSet.add(p.psikolog_bertugas)
      }
    })

    const maxSesiPerPsikolog =
      selectedDate !== "ALL"
        ? SESI_TKT_META.length
        : Math.max(1, availableDates.length) * SESI_TKT_META.length

    return Array.from(activePsikologSet).map((name) => {
      const assigned = filteredParticipants.filter(
        (p) =>
          p.psikolog_bertugas === name &&
          !["WAITING_LIST", "BATAL"].includes(p.status_peserta)
      )
      const selesaiCount = assigned.filter((p) =>
        ["HADIR", "SELESAI_FULL"].includes(p.status_peserta)
      ).length
      const count = assigned.length
      const pct =
        maxSesiPerPsikolog > 0
          ? Math.min(100, Math.round((count / maxSesiPerPsikolog) * 100))
          : 0
      return {
        name,
        count,
        selesaiCount,
        maxSesi: maxSesiPerPsikolog,
        pct
      }
    })
  }, [filteredParticipants, config, selectedDate, availablePsikologs, availableDates])

  return (
    <div className="space-y-6">
      <div className="liquid-neumorph-card p-3 sm:p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-l border-white/20 shadow-xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="liquid-neumorph-inset flex items-center gap-1.5 p-1 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setSelectedDate("ALL")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedDate === "ALL"
                  ? "bg-brand-gold text-[#07131e] font-bold shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Semua Hari
            </button>
            {availableDates.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDate(d)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedDate === d
                    ? "bg-brand-gold text-[#07131e] font-bold shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-2xl liquid-neumorph-inset border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-brand-gold shrink-0" />
            <span>
              Okupansi Jadwal:{" "}
              <strong className="text-brand-gold font-mono">{activeScheduled}</strong> /{" "}
              <span className="font-mono text-slate-300">{totalCapacitySlots}</span> Sesi (
              {occupancyPct}%)
            </span>
          </div>
        </div>
      </div>

      <div
        className={`grid ${
          ENABLE_TKT_WAITING_LIST
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            : "grid-cols-1 sm:grid-cols-3"
        } gap-4 sm:gap-5`}
      >
        <div className="liquid-neumorph-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border-t border-l border-white/20 shadow-xl hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Total Pendaftar
            </span>
            <div className="liquid-neumorph-pill w-10 h-10 rounded-2xl bg-sky-500/15 border-t border-sky-400/30 flex items-center justify-center text-sky-300">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-mono">
              {total}
            </span>
            <span className="text-xs text-slate-300 font-semibold">peserta</span>
          </div>
          <p className="mt-2 text-xs text-slate-300">
            {activeScheduled} terjadwal aktif • {countBatal} batal
          </p>
        </div>

        <div className="liquid-neumorph-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border-t border-l border-white/20 shadow-xl hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
              Jadwal Terkonfirmasi
            </span>
            <div className="liquid-neumorph-pill w-10 h-10 rounded-2xl bg-emerald-500/15 border-t border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-emerald-300 tracking-tight font-mono">
              {countConfirmed}
            </span>
            <span className="text-xs text-emerald-300/90 font-semibold">
              ({total > 0 ? Math.round((countConfirmed / total) * 100) : 0}%)
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-300">
            Slot jadwal konseling siap dilayani psikolog
          </p>
        </div>

        <div className="liquid-neumorph-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border-t border-l border-white/20 shadow-xl hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-gold uppercase tracking-wider">
              Hadir & Selesai Sesi
            </span>
            <div className="liquid-neumorph-pill w-10 h-10 rounded-2xl bg-amber-500/15 border-t border-amber-400/30 flex items-center justify-center text-brand-gold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-brand-gold tracking-tight font-mono">
              {countHadir}
            </span>
            <span className="text-xs text-amber-300/90 font-semibold">
              ({total > 0 ? Math.round((countHadir / total) * 100) : 0}%)
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-300">
            Peserta hadir di lokasi atau telah tuntas konseling
          </p>
        </div>

        {ENABLE_TKT_WAITING_LIST && (
          <div className="liquid-neumorph-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border-t border-l border-white/20 shadow-xl hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                Waiting List
              </span>
              <div className="liquid-neumorph-pill w-10 h-10 rounded-2xl bg-amber-500/15 border-t border-amber-400/30 flex items-center justify-center text-brand-gold">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-brand-gold tracking-tight font-mono">
                {countWaiting}
              </span>
              <span className="text-xs text-amber-300/90 font-semibold">
                ({total > 0 ? Math.round((countWaiting / total) * 100) : 0}%)
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Antrean cadangan siap alokasi bila slot kosong
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="liquid-neumorph-card p-6 rounded-3xl flex flex-col justify-between border-t border-l border-white/20 shadow-xl">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="liquid-neumorph-pill w-9 h-9 rounded-xl bg-amber-500/15 border-t border-amber-400/30 flex items-center justify-center text-brand-gold shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Demografi Kampus & Member
                </h2>
                <p className="text-[11px] text-slate-300">
                  Komposisi asal perguruan tinggi & keanggotaan ITB CC
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-5">
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span className="text-slate-200">Mahasiswa & Alumni ITB</span>
                  <span className="text-brand-gold font-mono">
                    {countITB} ({pctITB}%)
                  </span>
                </div>
                <div className="liquid-neumorph-inset w-full h-2.5 rounded-full p-0.5 border border-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                    style={{ width: `${pctITB}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span className="text-slate-200">Kampus Mitra / Umum Non-ITB</span>
                  <span className="text-sky-300 font-mono">
                    {countNonITB} ({pctNonITB}%)
                  </span>
                </div>
                <div className="liquid-neumorph-inset w-full h-2.5 rounded-full p-0.5 border border-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-300 transition-all duration-300"
                    style={{ width: `${pctNonITB}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-brand-gold" />
                  Kategori Status Peserta
                </span>
              </div>
              {statusMhsCategories.map((cat) => (
                <div key={cat.label} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-200">{cat.label}</span>
                    <span className="font-mono text-slate-300 font-semibold">
                      {cat.count} ({cat.pct}%)
                    </span>
                  </div>
                  <div className="liquid-neumorph-inset w-full h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cat.color} transition-all duration-300`}
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Terdaftar Member ITB CC</span>
            <span className="px-2.5 py-1 rounded-lg liquid-neumorph-inset border border-amber-400/30 font-mono text-brand-gold font-bold">
              {countMemberItbCc} Peserta ({pctMemberItbCc}%)
            </span>
          </div>
        </div>

        <div className="liquid-neumorph-card p-6 rounded-3xl lg:col-span-2 border-t border-l border-white/20 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="liquid-neumorph-pill w-9 h-9 rounded-xl bg-sky-500/15 border-t border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Distribusi Status Kehadiran & Tahapan Operasional
                </h2>
                <p className="text-[11px] text-slate-300">
                  Proporsi real-time perkembangan jadwal peserta dari pendaftaran hingga selesai konseling
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-5">
              {statusBreakdown.map((item) => {
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
                return (
                  <div key={item.label} className="liquid-neumorph-inset p-3.5 rounded-2xl border border-white/10">
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="text-slate-100 font-semibold">{item.label}</span>
                      <span className="font-mono text-white font-bold">
                        {item.count}{" "}
                        <span className="text-slate-300 text-[11px] font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900/80 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <span>Tingkat Keterisian Slot Konseling</span>
            <span className="font-mono text-brand-gold font-bold">
              {activeScheduled} Terjadwal dari {totalCapacitySlots} Kapasitas Slot ({occupancyPct}%)
            </span>
          </div>
        </div>
      </div>

      <div className="liquid-neumorph-card p-6 rounded-3xl border-t border-l border-white/20 shadow-xl">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="liquid-neumorph-pill w-9 h-9 rounded-xl bg-amber-500/15 border-t border-amber-400/30 flex items-center justify-center text-brand-gold shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              Distribusi Harapan & Kebutuhan Sesi Konseling
            </h2>
            <p className="text-[11px] text-slate-300">
              Topik kebutuhan utama yang dipilih peserta saat pengisian formulir pendaftaran konseling
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-5">
          {harapanBreakdown.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.key}
                className="liquid-neumorph-inset p-4 rounded-2xl border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className={`liquid-neumorph-pill w-9 h-9 rounded-xl border-t flex items-center justify-center shrink-0 ${item.pillClass}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-lg font-bold font-mono ${item.accentText}`}>
                      {item.pct}%
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">Jumlah Peminat</span>
                    <span className="font-mono font-bold text-white">{item.count} peserta</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900/90 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.accentBar} transition-all duration-300`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {psikologWorkload.length > 0 && (
        <div className="liquid-neumorph-card p-6 rounded-3xl border-t border-l border-white/20 shadow-xl">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="liquid-neumorph-pill w-9 h-9 rounded-xl bg-emerald-500/15 border-t border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Distribusi Beban Sesi per Psikolog Bertugas
              </h2>
              <p className="text-[11px] text-slate-300">
                Jumlah sesi terjadwal aktif dan realisasi kehadiran peserta untuk setiap psikolog bertugas
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {psikologWorkload.map((psi, idx) => (
              <div
                key={psi.name}
                className="liquid-neumorph-inset p-4 rounded-2xl border border-white/10 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold font-bold text-xs font-mono shrink-0">
                      {idx + 1}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate" title={psi.name}>
                      {psi.name}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono font-bold text-brand-gold shrink-0">
                    {psi.count} / {psi.maxSesi} Sesi
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-900/90 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${psi.pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Hadir / Selesai: <strong className="text-emerald-300 font-mono">{psi.selesaiCount}</strong></span>
                  <span className="font-mono text-slate-300">{psi.pct}% Terisi</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
