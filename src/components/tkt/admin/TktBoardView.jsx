import React, { useState, useMemo } from "react"
import {
  Calendar,
  Clock,
  Plus,
  UserPlus,
  ArrowRightLeft,
  Edit,
  Ban,
  X,
  Check,
  AlertTriangle,
  Loader2,
  Users,
  Copy,
  Sparkles,
  Phone,
  Mail,
  GraduationCap,
  Building,
  CheckCircle2,
  ChevronDown,
  Search,
  Star
} from "lucide-react"
import WhatsAppIcon from "../../common/WhatsAppIcon"
import {
  validateFullName,
  validateWhatsApp,
  validateEmail,
  validateAngkatan,
  sanitizeWhatsAppInput
} from "../../../utils/validationUtils"
import {
  SESI_TKT_META,
  formatSesiCompact,
  ENABLE_TKT_WAITING_LIST,
  getPsikologListForDate,
  getDefaultWaTemplateKey,
  checkWhatsAppRegistered
} from "../../../services/tktService"

export default function TktBoardView({
  participants = [],
  config = {},
  availableDates = [],
  availablePsikologs = [],
  onOpenEdit,
  onUpdateStatus,
  onUpdateParticipant,
  onSaveWalkIn,
  onOpenWhatsApp,
  onPromoteWaitingList,
  getWaLink
}) {
  const [selectedDate, setSelectedDate] = useState(
    availableDates && availableDates.length > 0 ? availableDates[0] : ""
  )

  const [selectedManageParticipant, setSelectedManageParticipant] = useState(null)
  const [copiedPhone, setCopiedPhone] = useState(false)

  const getInitialWalkInFormData = () => ({
    nama_lengkap: "",
    email: "",
    nomor_wa: "",
    status_mhs: "Mahasiswa Aktif ITB",
    asal_univ_select: "Institut Teknologi Bandung",
    asal_univ_lain: "",
    jurusan: "",
    angkatan: "",
    is_member_itbcc: "true",
    harapan_sesi: "Konsultasi Karier",
    detail_harapan: "",
    status_peserta: "CONFIRMED"
  })

  const [addModalSlot, setAddModalSlot] = useState(null)
  const [addMethodTab, setAddMethodTab] = useState(
    ENABLE_TKT_WAITING_LIST ? "waiting_list" : "walk_in"
  )
  const [moveSearchQuery, setMoveSearchQuery] = useState("")
  const [walkInFormData, setWalkInFormData] = useState(getInitialWalkInFormData)
  const [walkInErrors, setWalkInErrors] = useState({})
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false)

  const [reassignTarget, setReassignTarget] = useState(null)
  const [reassignMethod, setReassignMethod] = useState(
    ENABLE_TKT_WAITING_LIST ? "waiting_list" : "move_scheduled"
  )
  const [selectedReplacementId, setSelectedReplacementId] = useState("")
  const [oldParticipantOutcome, setOldParticipantOutcome] = useState(
    ENABLE_TKT_WAITING_LIST ? "WAITING_LIST" : "SWAP"
  )
  const [isSubmittingReassign, setIsSubmittingReassign] = useState(false)

  const [confirmDialog, setConfirmDialog] = useState(null)
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false)

  const currentDate =
    selectedDate && availableDates.includes(selectedDate)
      ? selectedDate
      : availableDates.length > 0
        ? availableDates[0]
        : ""

  const psikologList = useMemo(() => {
    if (config && currentDate) {
      return getPsikologListForDate(config, currentDate)
    }
    return availablePsikologs.length > 0
      ? availablePsikologs
      : ["Psikolog 1", "Psikolog 2", "Psikolog 3", "Psikolog 4", "Psikolog 5"]
  }, [config, currentDate, availablePsikologs])

  const waitingListForDay = useMemo(() => {
    return participants.filter(
      (p) => p.jadwal_hari === currentDate && p.status_peserta === "WAITING_LIST"
    )
  }, [participants, currentDate])

  const scheduledParticipants = useMemo(() => {
    return participants.filter(
      (p) =>
        p.jadwal_hari &&
        p.jadwal_sesi &&
        p.psikolog_bertugas &&
        !["WAITING_LIST", "BATAL"].includes(p.status_peserta)
    )
  }, [participants])

  const movableParticipantsForAdd = useMemo(() => {
    if (!addModalSlot) return []
    const baseList = scheduledParticipants.filter(
      (p) =>
        !(
          p.jadwal_hari === addModalSlot.hari &&
          p.jadwal_sesi === addModalSlot.sesi &&
          p.psikolog_bertugas === addModalSlot.psikolog
        )
    )
    if (!moveSearchQuery.trim()) return baseList
    const q = moveSearchQuery.toLowerCase().trim()
    return baseList.filter(
      (p) =>
        (p.nama_lengkap && p.nama_lengkap.toLowerCase().includes(q)) ||
        (p.nomor_wa && p.nomor_wa.toLowerCase().includes(q)) ||
        (p.psikolog_bertugas && p.psikolog_bertugas.toLowerCase().includes(q)) ||
        (p.jadwal_sesi && formatSesiCompact(p.jadwal_sesi).toLowerCase().includes(q)) ||
        (p.jadwal_hari && p.jadwal_hari.toLowerCase().includes(q)) ||
        (p.jurusan && p.jurusan.toLowerCase().includes(q))
    )
  }, [scheduledParticipants, addModalSlot, moveSearchQuery])

  const movableParticipantsForReassign = useMemo(() => {
    if (!reassignTarget) return []
    return scheduledParticipants.filter(
      (p) =>
        p.id !== reassignTarget.id &&
        !(
          p.jadwal_hari === reassignTarget.jadwal_hari &&
          p.jadwal_sesi === reassignTarget.jadwal_sesi &&
          p.psikolog_bertugas === reassignTarget.psikolog_bertugas
        )
    )
  }, [scheduledParticipants, reassignTarget])

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return {
          label: "Confirmed (Siap)",
          className: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30"
        }
      case "HADIR":
        return {
          label: "Hadir di Booth",
          className: "bg-amber-500/15 text-amber-300 border-amber-400/30"
        }
      case "SELESAI_FULL":
        return {
          label: "Selesai Konseling",
          className: "bg-blue-500/15 text-blue-300 border-blue-400/30"
        }
      case "DAPAT_SESI":
        return {
          label: "Dapat Sesi",
          className: "bg-sky-500/15 text-sky-300 border-sky-400/30"
        }
      case "WAITING_LIST":
        return {
          label: "Waiting List",
          className: "bg-orange-500/15 text-orange-300 border-orange-400/30"
        }
      case "BATAL":
        return {
          label: "Batal / Ditolak",
          className: "bg-rose-500/15 text-rose-300 border-rose-400/30"
        }
      default:
        return {
          label: status || "Belum Ditentukan",
          className: "bg-slate-700/40 text-slate-300 border-slate-600/40"
        }
    }
  }

  const handleCopyPhone = (phone) => {
    if (!phone) return
    navigator.clipboard.writeText(phone)
    setCopiedPhone(true)
    setTimeout(() => setCopiedPhone(false), 2000)
  }

  const handleWalkInInputChange = (e) => {
    const { name, value } = e.target
    if (name === "nomor_wa") {
      const sanitizedWa = sanitizeWhatsAppInput(value)
      setWalkInFormData((prev) => ({ ...prev, nomor_wa: sanitizedWa }))
      if (walkInErrors.nomor_wa) {
        setWalkInErrors((prev) => ({ ...prev, nomor_wa: null }))
      }
      return
    }
    if (name === "status_mhs") {
      if (value === "Mahasiswa Aktif ITB" || value === "Alumni ITB") {
        setWalkInFormData((prev) => ({
          ...prev,
          status_mhs: value,
          asal_univ_select: "Institut Teknologi Bandung",
          asal_univ_lain: ""
        }))
        setWalkInErrors((prev) => ({ ...prev, status_mhs: null, asal_univ_lain: null }))
        return
      }
      if (value === "Mahasiswa Non-ITB" || value === "Alumni Non-ITB") {
        setWalkInFormData((prev) => ({
          ...prev,
          status_mhs: value,
          asal_univ_select: "Perguruan Tinggi Lain"
        }))
        setWalkInErrors((prev) => ({ ...prev, status_mhs: null }))
        return
      }
    }
    setWalkInFormData((prev) => ({ ...prev, [name]: value }))
    if (walkInErrors[name]) {
      setWalkInErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validateWalkInForm = () => {
    const errors = {}

    const nameRes = validateFullName(walkInFormData.nama_lengkap)
    if (!nameRes.isValid) errors.nama_lengkap = nameRes.error

    const emailRes = validateEmail(walkInFormData.email, true)
    if (!emailRes.isValid) errors.email = emailRes.error

    const waRes = validateWhatsApp(walkInFormData.nomor_wa)
    if (!waRes.isValid) errors.nomor_wa = waRes.error

    if (walkInFormData.asal_univ_select === "Perguruan Tinggi Lain") {
      const trimmedUniv = (walkInFormData.asal_univ_lain || "").trim()
      const lowerUniv = trimmedUniv.toLowerCase()
      if (!trimmedUniv) {
        errors.asal_univ_lain = "Nama perguruan tinggi wajib diisi"
      } else if (
        (walkInFormData.status_mhs === "Mahasiswa Non-ITB" ||
          walkInFormData.status_mhs === "Alumni Non-ITB") &&
        (lowerUniv === "itb" ||
          lowerUniv === "institut teknologi bandung" ||
          lowerUniv.includes("institut teknologi bandung"))
      ) {
        errors.asal_univ_lain =
          "Untuk status Non-ITB, silakan tuliskan nama perguruan tinggi selain ITB"
      }
    }

    if (!(walkInFormData.jurusan || "").trim()) {
      errors.jurusan = "Program studi wajib diisi"
    }

    const angkatanRes = validateAngkatan(walkInFormData.angkatan, true)
    if (!angkatanRes.isValid) errors.angkatan = angkatanRes.error

    if (Object.keys(errors).length > 0) {
      setWalkInErrors(errors)
      return { isValid: false }
    }

    const finalAsalUniv =
      walkInFormData.asal_univ_select === "Perguruan Tinggi Lain"
        ? walkInFormData.asal_univ_lain.trim()
        : walkInFormData.asal_univ_select

    return {
      isValid: true,
      cleanData: {
        nama_lengkap: nameRes.cleanValue,
        email: walkInFormData.email.trim().toLowerCase(),
        nomor_wa: waRes.cleanValue,
        status_mhs: walkInFormData.status_mhs || "Mahasiswa Aktif ITB",
        asal_univ: finalAsalUniv,
        jurusan: walkInFormData.jurusan.trim(),
        angkatan: walkInFormData.angkatan.trim(),
        is_member_itbcc:
          walkInFormData.is_member_itbcc === "true" ||
          walkInFormData.is_member_itbcc === true,
        status_peserta: walkInFormData.status_peserta || "CONFIRMED",
        harapan_sesi: walkInFormData.harapan_sesi || "Konsultasi Karier",
        detail_harapan: (walkInFormData.detail_harapan || "").trim()
      }
    }
  }

  const handleOpenAddModal = (psikologName, sesi, existingCount) => {
    setAddModalSlot({
      psikolog: psikologName,
      sesi: sesi,
      hari: currentDate,
      existingCount: existingCount
    })
    setMoveSearchQuery("")
    if (ENABLE_TKT_WAITING_LIST) {
      setAddMethodTab(waitingListForDay.length > 0 ? "waiting_list" : "walk_in")
    } else {
      setAddMethodTab("walk_in")
    }
    setWalkInFormData(getInitialWalkInFormData())
    setWalkInErrors({})
  }

  const handleCloseAddModal = () => {
    setAddModalSlot(null)
    setMoveSearchQuery("")
    setWalkInErrors({})
    setIsSubmittingAdd(false)
  }

  const handleAssignFromWaitingList = (waitingParticipant) => {
    if (!addModalSlot || isSubmittingAdd) return

    setConfirmDialog({
      title: "Konfirmasi Alokasi Waiting List",
      description: `Alokasikan peserta ${waitingParticipant.nama_lengkap} dari antrean Waiting List ke jadwal ${addModalSlot.psikolog} pada ${formatSesiCompact(addModalSlot.sesi)}?`,
      confirmText: "Ya, Alokasikan ke Jadwal",
      confirmButtonClass: "bg-brand-gold hover:bg-amber-400 text-[#07131e]",
      onConfirm: async () => {
        setIsSubmittingAdd(true)
        try {
          if (onPromoteWaitingList) {
            await onPromoteWaitingList(waitingParticipant.id, {
              jadwal_hari: addModalSlot.hari,
              jadwal_sesi: addModalSlot.sesi,
              psikolog_bertugas: addModalSlot.psikolog,
              status_peserta: "CONFIRMED"
            })
          } else if (onUpdateParticipant) {
            await onUpdateParticipant(waitingParticipant.id, {
              jadwal_hari: addModalSlot.hari,
              jadwal_sesi: addModalSlot.sesi,
              psikolog_bertugas: addModalSlot.psikolog,
              status_peserta: "CONFIRMED"
            })
          }
          handleCloseAddModal()
        } finally {
          setIsSubmittingAdd(false)
        }
      }
    })
  }

  const handleMoveScheduledToSlot = (scheduledParticipant) => {
    if (!addModalSlot || isSubmittingAdd) return

    setConfirmDialog({
      title: "Konfirmasi Pindah Jadwal Peserta",
      description: `Pindahkan jadwal peserta ${scheduledParticipant.nama_lengkap} dari ${scheduledParticipant.psikolog_bertugas} (${formatSesiCompact(scheduledParticipant.jadwal_sesi)} • ${scheduledParticipant.jadwal_hari}) ke bilik ${addModalSlot.psikolog} pada ${formatSesiCompact(addModalSlot.sesi)} (${addModalSlot.hari})? Slot lama peserta ini akan otomatis menjadi kosong.`,
      confirmText: "Ya, Pindahkan Jadwal",
      confirmButtonClass: "bg-brand-gold hover:bg-amber-400 text-[#07131e]",
      onConfirm: async () => {
        setIsSubmittingAdd(true)
        try {
          if (onUpdateParticipant) {
            await onUpdateParticipant(scheduledParticipant.id, {
              jadwal_hari: addModalSlot.hari,
              jadwal_sesi: addModalSlot.sesi,
              psikolog_bertugas: addModalSlot.psikolog
            })
          }
          handleCloseAddModal()
        } finally {
          setIsSubmittingAdd(false)
        }
      }
    })
  }

  const handleSaveWalkInToSlot = async () => {
    if (!addModalSlot || isSubmittingAdd) return

    const validation = validateWalkInForm()
    if (!validation.isValid) return

    const { cleanData } = validation

    setIsSubmittingAdd(true)
    try {
      const waDupCheck = await checkWhatsAppRegistered(cleanData.nomor_wa, availableDates)
      if (waDupCheck.isRegistered) {
        setWalkInErrors({
          nomor_wa: "Nomor WhatsApp ini sudah terdaftar di jadwal aktif pada periode kegiatan ini."
        })
        return
      }
    } finally {
      setIsSubmittingAdd(false)
    }

    setConfirmDialog({
      title: "Konfirmasi Pendaftaran Walk-In",
      description: `Daftarkan peserta ${cleanData.nama_lengkap} (${cleanData.status_mhs} • ${cleanData.asal_univ}) ke bilik ${addModalSlot.psikolog} pada ${formatSesiCompact(addModalSlot.sesi)} (${addModalSlot.hari}) dengan status ${cleanData.status_peserta}?`,
      confirmText: "Ya, Daftarkan Peserta",
      confirmButtonClass: "liquid-btn-gold text-[#07131e] font-bold",
      onConfirm: async () => {
        setIsSubmittingAdd(true)
        try {
          const payload = {
            ...cleanData,
            jadwal_hari: addModalSlot.hari,
            jadwal_sesi: addModalSlot.sesi,
            psikolog_bertugas: addModalSlot.psikolog,
            psikolog_pilihan: addModalSlot.psikolog
          }

          if (onSaveWalkIn) {
            const res = await onSaveWalkIn(payload)
            if (res && res.success === false) {
              setWalkInErrors({ form: res.message || "Gagal menyimpan jadwal peserta" })
              return
            }
          }
          handleCloseAddModal()
        } finally {
          setIsSubmittingAdd(false)
        }
      }
    })
  }

  const handleOpenReassignModal = (participant) => {
    setReassignTarget(participant)
    const otherScheduled = scheduledParticipants.filter(
      (p) =>
        p.id !== participant.id &&
        !(
          p.jadwal_hari === participant.jadwal_hari &&
          p.jadwal_sesi === participant.jadwal_sesi &&
          p.psikolog_bertugas === participant.psikolog_bertugas
        )
    )
    if (ENABLE_TKT_WAITING_LIST) {
      setReassignMethod("waiting_list")
      setSelectedReplacementId(waitingListForDay.length > 0 ? waitingListForDay[0].id : "")
      setOldParticipantOutcome("WAITING_LIST")
    } else {
      if (otherScheduled.length > 0) {
        setReassignMethod("move_scheduled")
        setSelectedReplacementId(otherScheduled[0].id)
        setOldParticipantOutcome("SWAP")
      } else {
        setReassignMethod("walk_in")
        setSelectedReplacementId("")
        setOldParticipantOutcome("BATAL")
      }
    }
    setWalkInFormData(getInitialWalkInFormData())
    setWalkInErrors({})
  }

  const handleCloseReassignModal = () => {
    setReassignTarget(null)
    setSelectedReplacementId("")
    setWalkInErrors({})
    setIsSubmittingReassign(false)
  }

  const handleExecuteReassign = () => {
    if (!reassignTarget || isSubmittingReassign) return

    let replacementName = ""
    let replacementParticipant = null
    let validatedWalkIn = null

    if (reassignMethod === "waiting_list") {
      const replacement = waitingListForDay.find((w) => w.id === selectedReplacementId)
      if (!replacement) return
      replacementName = replacement.nama_lengkap
      replacementParticipant = replacement
    } else if (reassignMethod === "move_scheduled") {
      const replacement = movableParticipantsForReassign.find((p) => p.id === selectedReplacementId)
      if (!replacement) return
      replacementName = replacement.nama_lengkap
      replacementParticipant = replacement
    } else {
      const validation = validateWalkInForm()
      if (!validation.isValid) return
      validatedWalkIn = validation.cleanData
      replacementName = validatedWalkIn.nama_lengkap
    }

    const effectiveOutcome =
      reassignMethod === "walk_in" && oldParticipantOutcome === "SWAP"
        ? "BATAL"
        : oldParticipantOutcome

    const outcomeDescription =
      effectiveOutcome === "SWAP" && replacementParticipant
        ? `Peserta lama (${reassignTarget.nama_lengkap}) akan bertukar tempat ke jadwal milik ${replacementName} (${replacementParticipant.psikolog_bertugas} • ${formatSesiCompact(replacementParticipant.jadwal_sesi)}).`
        : effectiveOutcome === "WAITING_LIST"
        ? "Peserta lama akan dialihkan ke status Waiting List."
        : "Peserta lama akan diubah statusnya menjadi Batal."

    setConfirmDialog({
      title: "Konfirmasi Ganti Orang pada Jadwal",
      description: `Gantikan peserta ${reassignTarget.nama_lengkap} dengan ${replacementName} pada bilik ${reassignTarget.psikolog_bertugas} ${formatSesiCompact(reassignTarget.jadwal_sesi)}? ${outcomeDescription}`,
      confirmText: "Ya, Konfirmasi Ganti Orang",
      confirmButtonClass: "bg-amber-500 hover:bg-amber-400 text-[#07131e]",
      onConfirm: async () => {
        setIsSubmittingReassign(true)
        try {
          if (reassignMethod === "waiting_list") {
            const replacement = waitingListForDay.find((w) => w.id === selectedReplacementId)
            if (!replacement) return

            if (onUpdateParticipant) {
              await onUpdateParticipant(reassignTarget.id, {
                status_peserta: effectiveOutcome
              })
              await onUpdateParticipant(replacement.id, {
                jadwal_hari: reassignTarget.jadwal_hari,
                jadwal_sesi: reassignTarget.jadwal_sesi,
                psikolog_bertugas: reassignTarget.psikolog_bertugas,
                status_peserta: "CONFIRMED"
              })
            }
          } else if (reassignMethod === "move_scheduled") {
            const replacement = movableParticipantsForReassign.find((p) => p.id === selectedReplacementId)
            if (!replacement) return

            if (onUpdateParticipant) {
              if (effectiveOutcome === "SWAP") {
                await onUpdateParticipant(reassignTarget.id, {
                  jadwal_hari: replacement.jadwal_hari,
                  jadwal_sesi: replacement.jadwal_sesi,
                  psikolog_bertugas: replacement.psikolog_bertugas
                })
              } else {
                await onUpdateParticipant(reassignTarget.id, {
                  status_peserta: "BATAL"
                })
              }
              await onUpdateParticipant(replacement.id, {
                jadwal_hari: reassignTarget.jadwal_hari,
                jadwal_sesi: reassignTarget.jadwal_sesi,
                psikolog_bertugas: reassignTarget.psikolog_bertugas
              })
            }
          } else if (validatedWalkIn) {
            if (onUpdateParticipant) {
              await onUpdateParticipant(reassignTarget.id, {
                status_peserta: effectiveOutcome === "WAITING_LIST" ? "WAITING_LIST" : "BATAL"
              })
            }

            if (onSaveWalkIn) {
              await onSaveWalkIn({
                ...validatedWalkIn,
                jadwal_hari: reassignTarget.jadwal_hari,
                jadwal_sesi: reassignTarget.jadwal_sesi,
                psikolog_bertugas: reassignTarget.psikolog_bertugas,
                psikolog_pilihan: reassignTarget.psikolog_bertugas
              })
            }
          }

          handleCloseReassignModal()
          setSelectedManageParticipant(null)
        } finally {
          setIsSubmittingReassign(false)
        }
      }
    })
  }

  const handleRequestStatusChange = (newStatus) => {
    if (!selectedManageParticipant || selectedManageParticipant.status_peserta === newStatus) return

    const newBadge = getStatusBadge(newStatus)
    setConfirmDialog({
      title: "Konfirmasi Pembaruan Status Kehadiran",
      description: `Ubah status kehadiran peserta ${selectedManageParticipant.nama_lengkap} menjadi "${newBadge.label}"? Perubahan ini akan langsung tersinkronisasi ke Layar Display Booth.`,
      confirmText: "Ya, Perbarui Status",
      confirmButtonClass: "bg-brand-gold hover:bg-amber-400 text-[#07131e]",
      onConfirm: async () => {
        if (onUpdateStatus) {
          await onUpdateStatus(selectedManageParticipant.id, newStatus)
          setSelectedManageParticipant((prev) => (prev ? { ...prev, status_peserta: newStatus } : null))
        }
      }
    })
  }

  const handleRequestCancelSchedule = (participant) => {
    setConfirmDialog({
      title: "Konfirmasi Pembatalan Jadwal",
      description: `Batalkan jadwal konseling untuk peserta ${participant.nama_lengkap} pada ${formatSesiCompact(participant.jadwal_sesi)} (${participant.psikolog_bertugas})? Status peserta akan diubah menjadi "Batal" dengan data peserta & riwayat jadwal tetap tercatat utuh di Master Data, sementara slot jadwal ini akan kembali kosong dan tersedia untuk peserta lain.`,
      confirmText: "Ya, Ubah Status ke Batal",
      confirmButtonClass: "bg-rose-600 hover:bg-rose-500 text-white",
      onConfirm: async () => {
        if (onUpdateStatus) {
          await onUpdateStatus(participant.id, "BATAL")
        } else if (onUpdateParticipant) {
          await onUpdateParticipant(participant.id, { status_peserta: "BATAL" })
        }
        setSelectedManageParticipant(null)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="liquid-neumorph-card p-3 sm:p-4 rounded-3xl flex items-center justify-between border-t border-l border-white/20 shadow-xl">
        {availableDates.length > 0 && (
          <div className="liquid-neumorph-inset flex items-center gap-1.5 p-1 rounded-2xl border border-white/10">
            {availableDates.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDate(d)}
                className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  currentDate === d
                    ? "bg-brand-gold text-[#07131e] font-bold shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {ENABLE_TKT_WAITING_LIST && waitingListForDay.length > 0 && (
          <div className="px-4 py-2 rounded-2xl liquid-neumorph-inset border border-amber-400/30 text-amber-300 font-semibold text-xs flex items-center gap-2 shrink-0">
            <Users className="w-4 h-4 text-brand-gold" />
            <span>Antrean Waiting List: <strong className="text-white font-mono">{waitingListForDay.length}</strong></span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {psikologList.map((psikologName, pIdx) => {
          const allDayOccupants = participants.filter(
            (p) =>
              p.jadwal_hari === currentDate &&
              p.psikolog_bertugas === psikologName &&
              !["WAITING_LIST", "BATAL"].includes(p.status_peserta)
          )

          const occupiedSessionsCount = new Set(allDayOccupants.map((p) => p.jadwal_sesi)).size

          return (
            <div
              key={psikologName}
              className="liquid-neumorph-card p-4 sm:p-5 relative overflow-hidden border-t border-l border-white/20 shadow-xl rounded-3xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="liquid-neumorph-inset w-10 h-10 rounded-2xl border border-white/10 flex items-center justify-center text-brand-gold font-bold text-base shadow-inner">
                    {pIdx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      {psikologName}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      Bilik Konseling #{pIdx + 1}
                    </span>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-full liquid-neumorph-inset border border-white/10 text-xs font-semibold text-slate-300">
                  <span className="text-brand-gold font-mono font-bold">{occupiedSessionsCount}</span> / 7 Sesi Terisi
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-3.5">
                {SESI_TKT_META.map((sesiMeta) => {
                  const sesi = sesiMeta.id
                  let occupants = participants.filter(
                    (p) =>
                      p.jadwal_hari === currentDate &&
                      p.psikolog_bertugas === psikologName &&
                      p.jadwal_sesi === sesi &&
                      !["WAITING_LIST", "BATAL"].includes(p.status_peserta)
                  )

                  if (occupants.length > 0) {
                    return (
                      <div
                        key={sesi}
                        className="flex flex-col gap-2 p-2.5 rounded-2xl liquid-neumorph-inset border border-white/10 bg-[rgba(6,15,26,0.65)] justify-between min-h-[160px]"
                      >
                        <div className="pb-1.5 border-b border-white/10 px-0.5 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="px-1.5 py-0.5 rounded-md bg-brand-gold/15 border border-brand-gold/35 text-brand-gold font-bold text-[10px] uppercase tracking-wider shrink-0">
                              {sesiMeta.sesiLabel}
                            </span>
                            <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-slate-200 tracking-tight">
                              {sesiMeta.compactTime}
                            </span>
                          </div>
                          {occupants.length > 1 && (
                            <div className="flex justify-end">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                {occupants.length} Peserta
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 overflow-y-auto max-h-[360px] pr-0.5">
                          {occupants.map((occ) => {
                            const badge = getStatusBadge(occ.status_peserta)

                            return (
                              <div
                                key={occ.id}
                                onClick={() => setSelectedManageParticipant(occ)}
                                className="liquid-neumorph-card p-3 rounded-2xl border border-white/15 hover:border-brand-gold/60 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer shadow-md bg-[rgba(13,27,42,0.85)] flex flex-col justify-between group"
                                title="Klik untuk lihat detail lengkap & kelola jadwal"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-1.5">
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${badge.className}`}
                                      >
                                        {badge.label}
                                      </span>
                                      {occ.has_feedback && (
                                        <span
                                          className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/35 flex items-center gap-0.5 shadow-sm"
                                          title={`Sudah Mengisi Feedback Layanan${occ.feedback_rating ? ` (Rating: ★${occ.feedback_rating})` : ""}`}
                                        >
                                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-300 stroke-[2.5]" />
                                          <span>FB</span>
                                          {occ.feedback_rating && (
                                            <span className="flex items-center text-amber-300 font-bold ml-0.5">
                                              ★{occ.feedback_rating}
                                            </span>
                                          )}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 group-hover:text-brand-gold transition-colors font-medium">
                                      Detail
                                    </span>
                                  </div>

                                  <h4
                                    className="text-xs sm:text-[13px] font-bold text-white group-hover:text-brand-gold transition-colors line-clamp-1 leading-snug"
                                    title={occ.nama_lengkap}
                                  >
                                    {occ.nama_lengkap}
                                  </h4>

                                  <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                                    {occ.jurusan || occ.asal_univ || "-"}
                                  </p>
                                </div>

                                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                                  <span className="truncate max-w-[100px] text-slate-300">
                                    {occ.harapan_sesi || "Konseling"}
                                  </span>
                                  <span className="text-brand-gold font-semibold flex items-center gap-0.5">
                                    Kelola &rarr;
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenAddModal(psikologName, sesi, occupants.length)}
                          className="mt-1 w-full py-1.5 px-2 rounded-xl text-[10px] font-semibold text-brand-gold hover:text-white bg-brand-gold/10 hover:bg-brand-gold/25 border border-brand-gold/30 flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                          title="Tambah Peserta Ekstra ke Sesi Ini"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                          <span>+ Tambah Peserta</span>
                        </button>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={sesi}
                      onClick={() => handleOpenAddModal(psikologName, sesi, 0)}
                      className="liquid-neumorph-inset p-3 rounded-2xl border border-white/10 bg-[rgba(8,18,28,0.45)] hover:border-brand-gold/40 hover:bg-[rgba(13,27,42,0.55)] transition-all cursor-pointer flex flex-col justify-between min-h-[160px] text-center group"
                    >
                      <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-white/5 px-0.5">
                        <span className="px-1.5 py-0.5 rounded-md bg-white/[0.04] group-hover:bg-brand-gold/15 border border-white/10 group-hover:border-brand-gold/35 text-slate-300 group-hover:text-brand-gold font-bold text-[10px] uppercase tracking-wider transition-colors shrink-0">
                          {sesiMeta.sesiLabel}
                        </span>
                        <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-slate-400 group-hover:text-slate-200 transition-colors tracking-tight">
                          {sesiMeta.compactTime}
                        </span>
                      </div>

                      <div className="py-2">
                        <span className="text-xs font-medium text-slate-400 block mb-2.5">
                          Slot Kosong
                        </span>
                        <button
                          type="button"
                          className="w-full py-1.5 px-3 rounded-xl text-xs font-bold text-[#07131e] bg-brand-gold hover:bg-amber-400 shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer group-hover:scale-105"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Isi Jadwal</span>
                        </button>
                      </div>

                      <div className="text-[10px] text-emerald-400 font-semibold">
                        Tersedia
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {selectedManageParticipant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050b14]/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedManageParticipant(null)}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl p-6 sm:p-8 liquid-neumorph-card border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedManageParticipant(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-2xl liquid-neumorph-inset text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-white/10 shrink-0">
              <div className="w-14 h-14 rounded-2xl liquid-neumorph-inset border border-white/15 flex items-center justify-center text-brand-gold font-bold text-2xl shadow-inner shrink-0">
                {selectedManageParticipant.nama_lengkap?.charAt(0)?.toUpperCase() || "P"}
              </div>
              <div className="pr-10">
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {selectedManageParticipant.nama_lengkap}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {(() => {
                    const badge = getStatusBadge(selectedManageParticipant.status_peserta)
                    return (
                      <span className={`px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${badge.className}`}>
                        {badge.label}
                      </span>
                    )
                  })()}
                  {selectedManageParticipant.has_feedback ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/35 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-300 stroke-[2.5]" />
                      <span>Sudah Isi Feedback</span>
                      {selectedManageParticipant.feedback_rating && (
                        <span className="text-amber-300 ml-0.5 font-bold">
                          ★{selectedManageParticipant.feedback_rating}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800/80 text-slate-400 border border-white/10 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Belum Isi Feedback</span>
                    </span>
                  )}
                  {selectedManageParticipant.is_member_itbcc && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-brand-gold" />
                      <span>Member ITB CC</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl liquid-neumorph-inset border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Phone className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Kontak & Identitas</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Nomor WhatsApp:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono">
                        {selectedManageParticipant.nomor_wa || "-"}
                      </span>
                      {selectedManageParticipant.nomor_wa && (
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(selectedManageParticipant.nomor_wa)}
                          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                          title="Salin Nomor WhatsApp"
                        >
                          {copiedPhone ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Alamat Email:</span>
                    <span className="text-xs font-medium text-slate-200 truncate block">
                      {selectedManageParticipant.email || "-"}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl liquid-neumorph-inset border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Data Akademik</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Asal Kampus:</span>
                    <span className="text-xs font-bold text-white">
                      {selectedManageParticipant.asal_univ || "Institut Teknologi Bandung"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Program Studi & Angkatan:</span>
                    <span className="text-xs font-medium text-slate-200">
                      {selectedManageParticipant.jurusan || "-"} ({selectedManageParticipant.angkatan || "-"})
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Status Mahasiswa:</span>
                    <span className="text-xs font-medium text-slate-300">
                      {selectedManageParticipant.status_mhs || "Mahasiswa Aktif ITB"}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl liquid-neumorph-inset border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Jadwal & Bilik</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Bilik Psikolog Bertugas:</span>
                    <span className="text-sm font-bold text-white">
                      {selectedManageParticipant.psikolog_bertugas}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Waktu Sesi & Hari:</span>
                    <span className="text-xs font-semibold text-brand-gold font-mono">
                      {formatSesiCompact(selectedManageParticipant.jadwal_sesi)} • {selectedManageParticipant.jadwal_hari}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl liquid-neumorph-inset border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Kebutuhan & Pendaftaran</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Fokus Konsultasi:</span>
                    <span className="text-xs font-bold text-amber-300">
                      {selectedManageParticipant.harapan_sesi || "Konsultasi Karier"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Waktu Mendaftar:</span>
                    <span className="text-xs font-medium text-slate-300">
                      {selectedManageParticipant.created_at
                        ? new Date(selectedManageParticipant.created_at).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          }) + " WIB"
                        : "-"}
                    </span>
                  </div>
                  {selectedManageParticipant.detail_harapan && (
                    <div className="pt-1 border-t border-white/5">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Catatan Tambahan:</span>
                      <p className="text-xs text-slate-200 italic leading-relaxed">
                        "{selectedManageParticipant.detail_harapan}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedManageParticipant.has_feedback && (
                <div className="p-3.5 rounded-2xl liquid-neumorph-inset border border-emerald-400/25 bg-emerald-500/[0.04] space-y-2">
                  <div className="text-xs font-bold text-emerald-300 flex items-center justify-between uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                      <span>Evaluasi & Feedback Layanan</span>
                    </span>
                    {selectedManageParticipant.feedback_rating && (
                      <span className="text-amber-300 font-bold text-xs flex items-center gap-1 bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-400/30">
                        <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                        <span>Rating: {selectedManageParticipant.feedback_rating}/5</span>
                      </span>
                    )}
                  </div>
                  {selectedManageParticipant.feedback_data && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                      {selectedManageParticipant.feedback_data.rating_fasilitator && (
                        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                          <span className="text-slate-400 block text-[10px]">Fasilitator:</span>
                          <span className="text-amber-300 font-bold">★ {selectedManageParticipant.feedback_data.rating_fasilitator}/5</span>
                        </div>
                      )}
                      {selectedManageParticipant.feedback_data.rating_pemahaman_karir && (
                        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                          <span className="text-slate-400 block text-[10px]">Pemahaman Karier:</span>
                          <span className="text-amber-300 font-bold">★ {selectedManageParticipant.feedback_data.rating_pemahaman_karir}/5</span>
                        </div>
                      )}
                      {selectedManageParticipant.feedback_data.rencana_ikut_lagi && (
                        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                          <span className="text-slate-400 block text-[10px]">Ikut Sesi Lagi:</span>
                          <span className="text-white font-semibold">{selectedManageParticipant.feedback_data.rencana_ikut_lagi}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedManageParticipant.feedback_data?.saran_feedback && (
                    <div className="pt-1.5 border-t border-white/5">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Saran & Masukan:</span>
                      <p className="text-xs text-slate-200 italic leading-relaxed">
                        "{selectedManageParticipant.feedback_data.saran_feedback}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 rounded-2xl liquid-neumorph-card border border-white/15 space-y-3 bg-[rgba(8,18,28,0.75)]">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Pusat Aksi & Rekayasa Jadwal (CRUD)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Dilindungi konfirmasi aman</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const target = selectedManageParticipant
                    setSelectedManageParticipant(null)
                    if (onOpenWhatsApp) {
                      onOpenWhatsApp(target)
                    } else if (getWaLink) {
                      const link = getWaLink(getDefaultWaTemplateKey(target.status_peserta), target)
                      if (link) window.open(link, "_blank")
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 border border-emerald-400/30"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Kirim Pesan WhatsApp (Pilih Template)</span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedManageParticipant
                      setSelectedManageParticipant(null)
                      if (onOpenEdit) onOpenEdit(target)
                    }}
                    className="py-2.5 px-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/40 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit Data & Status</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedManageParticipant
                      setSelectedManageParticipant(null)
                      handleOpenReassignModal(target)
                    }}
                    className="py-2.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Ganti Orang (Swap)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const p = selectedManageParticipant.psikolog_bertugas
                      const s = selectedManageParticipant.jadwal_sesi
                      setSelectedManageParticipant(null)
                      handleOpenAddModal(p, s, 1)
                    }}
                    className="py-2.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-gold stroke-[3]" />
                    <span>+ Tambah Peserta Sesi</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => handleRequestCancelSchedule(selectedManageParticipant)}
                className="py-2.5 px-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border border-rose-400/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Batalkan Jadwal Ini</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedManageParticipant(null)}
                className="liquid-neumorph-inset px-5 py-2.5 rounded-2xl text-slate-300 hover:text-white font-semibold text-xs cursor-pointer border border-white/10"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {addModalSlot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050b14]/80 backdrop-blur-md animate-fadeIn"
          onClick={handleCloseAddModal}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl p-6 sm:p-8 liquid-neumorph-card border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleCloseAddModal}
              className="absolute top-5 right-5 w-9 h-9 rounded-2xl liquid-neumorph-inset text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-white/10 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 text-brand-gold flex items-center justify-center shadow-inner shrink-0">
                <Calendar className="w-6 h-6 text-brand-gold" />
              </div>
              <div className="pr-10">
                <h3 className="text-xl font-bold text-white leading-tight">
                  Alokasi Peserta ke Jadwal
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  <strong className="text-white">{addModalSlot.psikolog}</strong> • <span className="font-mono text-brand-gold font-semibold">{formatSesiCompact(addModalSlot.sesi)}</span> ({addModalSlot.hari})
                </p>
              </div>
            </div>

            {addModalSlot.existingCount > 0 && (
              <div className="p-3 mb-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-2 text-xs text-amber-200 shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Sesi ini sudah memiliki <strong>{addModalSlot.existingCount} peserta</strong> terdaftar. Menambahkan peserta akan menambah kapasitas sesi ini secara aman.
                </span>
              </div>
            )}

            <div
              className={`grid ${
                ENABLE_TKT_WAITING_LIST ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
              } gap-2 p-1.5 mb-4 rounded-2xl liquid-neumorph-inset border border-white/10 shrink-0`}
            >
              {ENABLE_TKT_WAITING_LIST && (
                <button
                  type="button"
                  onClick={() => setAddMethodTab("waiting_list")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    addMethodTab === "waiting_list"
                      ? "bg-brand-gold text-[#07131e] font-bold shadow-md"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Pilih dari Waiting List ({waitingListForDay.length})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setAddMethodTab("walk_in")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  addMethodTab === "walk_in"
                    ? "bg-brand-gold text-[#07131e] font-bold shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Input Peserta Baru (Walk-In)</span>
              </button>
              <button
                type="button"
                onClick={() => setAddMethodTab("move_scheduled")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  addMethodTab === "move_scheduled"
                    ? "bg-brand-gold text-[#07131e] font-bold shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Pindahkan Peserta Terjadwal</span>
              </button>
            </div>

            {ENABLE_TKT_WAITING_LIST && addMethodTab === "waiting_list" ? (
              <div className="overflow-y-auto space-y-3 pr-1">
                {waitingListForDay.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-300">
                      Tidak ada antrean Waiting List pada tanggal {addModalSlot.hari}.
                    </p>
                    <p className="text-xs mt-1">
                      Silakan beralih ke tab "Input Peserta Baru (Walk-In)" untuk mendaftarkan peserta langsung.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {waitingListForDay.map((wl, idx) => (
                      <div
                        key={wl.id}
                        className="p-3.5 rounded-2xl liquid-neumorph-inset border border-white/10 hover:border-brand-gold/40 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                            <span className="text-brand-gold font-mono">#{idx + 1}</span>
                            <span>{wl.nama_lengkap}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {wl.nomor_wa || "-"} • {wl.jurusan || wl.asal_univ || "-"}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAssignFromWaitingList(wl)}
                          disabled={isSubmittingAdd}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Pilih Peserta Ini</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : addMethodTab === "move_scheduled" ? (
              <div className="overflow-y-auto space-y-3 pr-1 flex flex-col">
                <div className="relative shrink-0">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={moveSearchQuery}
                    onChange={(e) => setMoveSearchQuery(e.target.value)}
                    placeholder="Cari nama peserta, nomor WA, psikolog, atau sesi..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl liquid-neumorph-inset border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/60 transition-all"
                  />
                </div>

                {movableParticipantsForAdd.length === 0 ? (
                  <div className="py-10 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-300">
                      Tidak ditemukan peserta terjadwal lain yang dapat dipindahkan.
                    </p>
                    <p className="text-xs mt-1">
                      Gunakan tab "Input Peserta Baru (Walk-In)" untuk mengisi jadwal dengan peserta baru.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {movableParticipantsForAdd.map((sp) => {
                      const badge = getStatusBadge(sp.status_peserta)
                      return (
                        <div
                          key={sp.id}
                          className="p-3.5 rounded-2xl liquid-neumorph-inset border border-white/10 hover:border-brand-gold/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-white truncate">
                                {sp.nama_lengkap}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                            </div>
                            <div className="text-[11px] text-brand-gold font-mono font-semibold">
                              Jadwal Saat Ini: {sp.psikolog_bertugas} • {formatSesiCompact(sp.jadwal_sesi)} ({sp.jadwal_hari})
                            </div>
                            <div className="text-xs text-slate-400">
                              {sp.nomor_wa || "-"} • {sp.jurusan || sp.asal_univ || "-"}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleMoveScheduledToSlot(sp)}
                            disabled={isSubmittingAdd}
                            className="px-4 py-2 rounded-xl bg-brand-gold hover:bg-amber-400 text-[#07131e] font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Pindahkan ke Sini</span>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-y-auto space-y-4 pr-1 text-left">
                {walkInErrors.form && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {walkInErrors.form}
                  </div>
                )}

                <div className="p-3.5 rounded-2xl liquid-neumorph-inset border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-300">
                    Status Masuk Peserta:
                  </span>
                  <div className="relative sm:w-64">
                    <select
                      name="status_peserta"
                      value={walkInFormData.status_peserta}
                      onChange={handleWalkInInputChange}
                      className="w-full px-3 py-1.5 pr-8 text-xs font-semibold rounded-xl liquid-neumorph-inset border border-white/10 text-emerald-300 bg-[#091726]/85 focus:outline-none focus:border-brand-gold/60 appearance-none cursor-pointer transition-all"
                    >
                      <option value="CONFIRMED" className="bg-[#0b1a27] text-emerald-300">CONFIRMED (Langsung Siap)</option>
                      <option value="HADIR" className="bg-[#0b1a27] text-amber-300">HADIR (Di Booth Sekarang)</option>
                      <option value="DAPAT_SESI" className="bg-[#0b1a27] text-sky-300">DAPAT SESI</option>
                      {ENABLE_TKT_WAITING_LIST && (
                        <option value="WAITING_LIST" className="bg-[#0b1a27] text-amber-300">WAITING LIST</option>
                      )}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                    Nama Lengkap <span className="text-amber-400 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_lengkap"
                    value={walkInFormData.nama_lengkap}
                    onChange={handleWalkInInputChange}
                    placeholder="Contoh: Budi Pratama"
                    className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                      walkInErrors.nama_lengkap ? "border border-rose-500/60" : "border border-white/10"
                    }`}
                  />
                  {walkInErrors.nama_lengkap && (
                    <p className="mt-1.5 text-xs text-rose-400 font-medium">
                      {walkInErrors.nama_lengkap}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                      Email <span className="text-amber-400 ml-0.5">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={walkInFormData.email}
                      onChange={handleWalkInInputChange}
                      placeholder="nama@email.com"
                      className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                        walkInErrors.email ? "border border-rose-500/60" : "border border-white/10"
                      }`}
                    />
                    {walkInErrors.email && (
                      <p className="mt-1.5 text-xs text-rose-400 font-medium">
                        {walkInErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                      Nomor WhatsApp <span className="text-amber-400 ml-0.5">*</span>
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={14}
                      name="nomor_wa"
                      value={walkInFormData.nomor_wa}
                      onChange={handleWalkInInputChange}
                      placeholder="081234567890"
                      className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                        walkInErrors.nomor_wa ? "border border-rose-500/60" : "border border-white/10"
                      }`}
                    />
                    {walkInErrors.nomor_wa && (
                      <p className="mt-1.5 text-xs text-rose-400 font-medium">
                        {walkInErrors.nomor_wa}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                      Status Peserta <span className="text-amber-400 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="status_mhs"
                        value={walkInFormData.status_mhs}
                        onChange={handleWalkInInputChange}
                        className="w-full px-4 py-2.5 pr-9 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all appearance-none cursor-pointer"
                      >
                        <option value="Mahasiswa Aktif ITB" className="bg-[#0b1a27] text-slate-100">Mahasiswa Aktif ITB</option>
                        <option value="Alumni ITB" className="bg-[#0b1a27] text-slate-100">Alumni ITB</option>
                        <option value="Mahasiswa Non-ITB" className="bg-[#0b1a27] text-slate-100">Mahasiswa Non-ITB</option>
                        <option value="Alumni Non-ITB" className="bg-[#0b1a27] text-slate-100">Alumni Non-ITB</option>
                        <option value="Umum" className="bg-[#0b1a27] text-slate-100">Umum</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                      Asal Perguruan Tinggi <span className="text-amber-400 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="asal_univ_select"
                        value={walkInFormData.asal_univ_select}
                        onChange={handleWalkInInputChange}
                        disabled={walkInFormData.status_mhs !== "Umum"}
                        className={`w-full px-4 py-2.5 pr-9 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all appearance-none ${
                          walkInFormData.status_mhs !== "Umum" ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
                        }`}
                      >
                        <option value="Institut Teknologi Bandung" className="bg-[#0b1a27] text-slate-100">Institut Teknologi Bandung</option>
                        <option value="Perguruan Tinggi Lain" className="bg-[#0b1a27] text-slate-100">Perguruan Tinggi Lain</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {walkInFormData.asal_univ_select === "Perguruan Tinggi Lain" && (
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                      Nama Perguruan Tinggi <span className="text-amber-400 ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      name="asal_univ_lain"
                      value={walkInFormData.asal_univ_lain}
                      onChange={handleWalkInInputChange}
                      placeholder="Tuliskan nama perguruan tinggi peserta"
                      className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                        walkInErrors.asal_univ_lain ? "border border-rose-500/60" : "border border-white/10"
                      }`}
                    />
                    {walkInErrors.asal_univ_lain && (
                      <p className="mt-1.5 text-xs text-rose-400 font-medium">
                        {walkInErrors.asal_univ_lain}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                      Program Studi / Jurusan <span className="text-amber-400 ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      name="jurusan"
                      value={walkInFormData.jurusan}
                      onChange={handleWalkInInputChange}
                      placeholder="Contoh: Teknik Informatika"
                      className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                        walkInErrors.jurusan ? "border border-rose-500/60" : "border border-white/10"
                      }`}
                    />
                    {walkInErrors.jurusan && (
                      <p className="mt-1.5 text-xs text-rose-400 font-medium">
                        {walkInErrors.jurusan}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                      Tahun Angkatan <span className="text-amber-400 ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      name="angkatan"
                      value={walkInFormData.angkatan}
                      onChange={handleWalkInInputChange}
                      placeholder="Contoh: 2022"
                      className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                        walkInErrors.angkatan ? "border border-rose-500/60" : "border border-white/10"
                      }`}
                    />
                    {walkInErrors.angkatan && (
                      <p className="mt-1.5 text-xs text-rose-400 font-medium">
                        {walkInErrors.angkatan}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                      Status Member ITB Career Center <span className="text-amber-400 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="is_member_itbcc"
                        value={String(walkInFormData.is_member_itbcc)}
                        onChange={handleWalkInInputChange}
                        className="w-full px-4 py-2.5 pr-9 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all appearance-none cursor-pointer"
                      >
                        <option value="true" className="bg-[#0b1a27] text-slate-100">Sudah Menjadi Member</option>
                        <option value="false" className="bg-[#0b1a27] text-slate-100">Belum Menjadi Member</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                      Topik Konsultasi <span className="text-amber-400 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="harapan_sesi"
                        value={walkInFormData.harapan_sesi}
                        onChange={handleWalkInInputChange}
                        className="w-full px-4 py-2.5 pr-9 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all appearance-none cursor-pointer"
                      >
                        <option value="Konsultasi Karier" className="bg-[#0b1a27] text-slate-100">Konsultasi Karier</option>
                        <option value="Review CV & Portofolio" className="bg-[#0b1a27] text-slate-100">Review CV & Portofolio</option>
                        <option value="Persiapan Wawancara Kerja" className="bg-[#0b1a27] text-slate-100">Persiapan Wawancara Kerja</option>
                        <option value="Perencanaan Studi Lanjut" className="bg-[#0b1a27] text-slate-100">Perencanaan Studi Lanjut</option>
                        <option value="Lainnya" className="bg-[#0b1a27] text-slate-100">Lainnya</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                    Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    name="detail_harapan"
                    rows="2"
                    value={walkInFormData.detail_harapan}
                    onChange={handleWalkInInputChange}
                    placeholder="Tuliskan poin spesifik yang ingin didiskusikan..."
                    className="w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleCloseAddModal}
                    disabled={isSubmittingAdd}
                    className="liquid-neumorph-inset px-4 py-2.5 rounded-xl text-slate-300 hover:text-white font-semibold text-xs cursor-pointer transition-colors border border-white/10 active:scale-95 disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveWalkInToSlot}
                    disabled={isSubmittingAdd}
                    className="liquid-btn-gold px-5 py-2.5 rounded-xl text-[#07131e] font-bold text-xs shadow-lg cursor-pointer transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#07131e]" />
                    <span>Simpan & Daftarkan</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {reassignTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050b14]/80 backdrop-blur-md animate-fadeIn"
          onClick={handleCloseReassignModal}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl p-6 sm:p-7 liquid-neumorph-card border border-amber-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleCloseReassignModal}
              className="absolute top-5 right-5 w-9 h-9 rounded-2xl liquid-neumorph-inset text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-white/10 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center shadow-inner shrink-0">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <div className="pr-10">
                <h3 className="text-lg font-bold text-white leading-tight">
                  Ganti Orang pada Slot Jadwal
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Slot: <strong className="text-white">{reassignTarget.psikolog_bertugas}</strong> • <span className="font-mono text-brand-gold font-semibold">{formatSesiCompact(reassignTarget.jadwal_sesi)}</span>
                </p>
              </div>
            </div>

            <div className="overflow-y-auto pr-1 space-y-4">
              <div className="p-3.5 rounded-2xl liquid-neumorph-inset border border-white/10">
                <span className="text-[11px] text-slate-400 block mb-0.5">Peserta Saat Ini:</span>
                <div className="text-sm font-bold text-white">{reassignTarget.nama_lengkap}</div>
                <div className="text-xs text-slate-300">{reassignTarget.nomor_wa || "-"} • {reassignTarget.jurusan || "-"}</div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1.5">
                  Perlakuan untuk Peserta Lama:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ENABLE_TKT_WAITING_LIST && (
                    <label className={`p-2.5 rounded-2xl border flex items-center gap-2 cursor-pointer transition-colors ${
                      oldParticipantOutcome === "WAITING_LIST"
                        ? "border-amber-400/50 bg-amber-500/15 text-amber-200"
                        : "border-white/10 text-slate-300 hover:bg-white/5"
                    }`}>
                      <input
                        type="radio"
                        name="outcome"
                        value="WAITING_LIST"
                        checked={oldParticipantOutcome === "WAITING_LIST"}
                        onChange={(e) => setOldParticipantOutcome(e.target.value)}
                        className="text-brand-gold focus:ring-brand-gold"
                      />
                      <span className="text-xs font-semibold">Ke Waiting List</span>
                    </label>
                  )}

                  {reassignMethod === "move_scheduled" && (
                    <label className={`p-2.5 rounded-2xl border flex items-center gap-2 cursor-pointer transition-colors ${
                      oldParticipantOutcome === "SWAP"
                        ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
                        : "border-white/10 text-slate-300 hover:bg-white/5"
                    }`}>
                      <input
                        type="radio"
                        name="outcome"
                        value="SWAP"
                        checked={oldParticipantOutcome === "SWAP"}
                        onChange={(e) => setOldParticipantOutcome(e.target.value)}
                        className="text-emerald-400 focus:ring-emerald-400"
                      />
                      <span className="text-xs font-semibold">Tukar Jadwal (Swap)</span>
                    </label>
                  )}

                  <label className={`p-2.5 rounded-2xl border flex items-center gap-2 cursor-pointer transition-colors ${
                    oldParticipantOutcome === "BATAL" || (reassignMethod === "walk_in" && !ENABLE_TKT_WAITING_LIST)
                      ? "border-rose-400/50 bg-rose-500/15 text-rose-200"
                      : "border-white/10 text-slate-300 hover:bg-white/5"
                  }`}>
                    <input
                      type="radio"
                      name="outcome"
                      value="BATAL"
                      checked={oldParticipantOutcome === "BATAL" || (reassignMethod === "walk_in" && !ENABLE_TKT_WAITING_LIST)}
                      onChange={(e) => setOldParticipantOutcome(e.target.value)}
                      className="text-rose-500 focus:ring-rose-500"
                    />
                    <span className="text-xs font-semibold">Batal / Dibatalkan</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1.5">
                  Pilih Peserta Pengganti:
                </label>
                <div
                  className={`grid ${
                    ENABLE_TKT_WAITING_LIST ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"
                  } gap-2 mb-3`}
                >
                  {ENABLE_TKT_WAITING_LIST && (
                    <button
                      type="button"
                      onClick={() => {
                        setReassignMethod("waiting_list")
                        setSelectedReplacementId(waitingListForDay.length > 0 ? waitingListForDay[0].id : "")
                      }}
                      className={`py-2 px-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                        reassignMethod === "waiting_list"
                          ? "bg-brand-gold text-[#07131e] font-bold shadow-md"
                          : "liquid-neumorph-inset text-slate-300"
                      }`}
                    >
                      Dari Waiting List
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setReassignMethod("move_scheduled")
                      setSelectedReplacementId(
                        movableParticipantsForReassign.length > 0 ? movableParticipantsForReassign[0].id : ""
                      )
                      setOldParticipantOutcome("SWAP")
                    }}
                    className={`py-2 px-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                      reassignMethod === "move_scheduled"
                        ? "bg-brand-gold text-[#07131e] font-bold shadow-md"
                        : "liquid-neumorph-inset text-slate-300"
                    }`}
                  >
                    Pindahkan Peserta Lain
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReassignMethod("walk_in")
                      if (!ENABLE_TKT_WAITING_LIST) {
                        setOldParticipantOutcome("BATAL")
                      }
                    }}
                    className={`py-2 px-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                      reassignMethod === "walk_in"
                        ? "bg-brand-gold text-[#07131e] font-bold shadow-md"
                        : "liquid-neumorph-inset text-slate-300"
                    }`}
                  >
                    Peserta Baru / Walk-In
                  </button>
                </div>

                {ENABLE_TKT_WAITING_LIST && reassignMethod === "waiting_list" ? (
                  waitingListForDay.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      Tidak ada antrean Waiting List pada hari ini. Gunakan opsi lain.
                    </p>
                  ) : (
                    <select
                      value={selectedReplacementId}
                      onChange={(e) => setSelectedReplacementId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-2xl liquid-neumorph-inset text-white bg-[#091726] border border-white/10 cursor-pointer focus:outline-none"
                    >
                      {waitingListForDay.map((wl, idx) => (
                        <option key={wl.id} value={wl.id} className="bg-slate-900">
                          #{idx + 1} {wl.nama_lengkap} ({wl.nomor_wa || "-"})
                        </option>
                      ))}
                    </select>
                  )
                ) : reassignMethod === "move_scheduled" ? (
                  movableParticipantsForReassign.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      Tidak ada peserta terjadwal lain yang tersedia untuk dipindahkan. Gunakan opsi "Peserta Baru / Walk-In".
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <select
                          value={selectedReplacementId}
                          onChange={(e) => setSelectedReplacementId(e.target.value)}
                          className="w-full px-3.5 py-2.5 pr-8 text-xs rounded-2xl liquid-neumorph-inset text-white bg-[#091726] border border-white/10 cursor-pointer focus:outline-none appearance-none"
                        >
                          {movableParticipantsForReassign.map((sp) => (
                            <option key={sp.id} value={sp.id} className="bg-slate-900 text-white">
                              {sp.nama_lengkap} — {sp.psikolog_bertugas} • {formatSesiCompact(sp.jadwal_sesi)} ({sp.jadwal_hari})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  )
                ) : (
                  <div className="space-y-4 text-left pt-2">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                        Nama Lengkap <span className="text-amber-400 ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        name="nama_lengkap"
                        value={walkInFormData.nama_lengkap}
                        onChange={handleWalkInInputChange}
                        placeholder="Contoh: Budi Pratama"
                        className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                          walkInErrors.nama_lengkap ? "border border-rose-500/60" : "border border-white/10"
                        }`}
                      />
                      {walkInErrors.nama_lengkap && (
                        <p className="mt-1.5 text-xs text-rose-400 font-medium">
                          {walkInErrors.nama_lengkap}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                          Email <span className="text-amber-400 ml-0.5">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={walkInFormData.email}
                          onChange={handleWalkInInputChange}
                          placeholder="nama@email.com"
                          className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                            walkInErrors.email ? "border border-rose-500/60" : "border border-white/10"
                          }`}
                        />
                        {walkInErrors.email && (
                          <p className="mt-1.5 text-xs text-rose-400 font-medium">
                            {walkInErrors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                          Nomor WhatsApp <span className="text-amber-400 ml-0.5">*</span>
                        </label>
                        <input
                          type="tel"
                          name="nomor_wa"
                          value={walkInFormData.nomor_wa}
                          onChange={handleWalkInInputChange}
                          placeholder="08xxxxxxxxxx"
                          className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                            walkInErrors.nomor_wa ? "border border-rose-500/60" : "border border-white/10"
                          }`}
                        />
                        {walkInErrors.nomor_wa && (
                          <p className="mt-1.5 text-xs text-rose-400 font-medium">
                            {walkInErrors.nomor_wa}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                          Status Peserta <span className="text-amber-400 ml-0.5">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="status_mhs"
                            value={walkInFormData.status_mhs}
                            onChange={handleWalkInInputChange}
                            className="w-full px-4 py-2.5 pr-9 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all appearance-none cursor-pointer"
                          >
                            <option value="Mahasiswa Aktif ITB" className="bg-[#0b1a27] text-slate-100">Mahasiswa Aktif ITB</option>
                            <option value="Alumni ITB" className="bg-[#0b1a27] text-slate-100">Alumni ITB</option>
                            <option value="Mahasiswa Non-ITB" className="bg-[#0b1a27] text-slate-100">Mahasiswa Non-ITB</option>
                            <option value="Alumni Non-ITB" className="bg-[#0b1a27] text-slate-100">Alumni Non-ITB</option>
                            <option value="Umum" className="bg-[#0b1a27] text-slate-100">Umum</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                          Asal Perguruan Tinggi <span className="text-amber-400 ml-0.5">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="asal_univ_select"
                            value={walkInFormData.asal_univ_select}
                            onChange={handleWalkInInputChange}
                            disabled={walkInFormData.status_mhs !== "Umum"}
                            className={`w-full px-4 py-2.5 pr-9 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all appearance-none ${
                              walkInFormData.status_mhs !== "Umum" ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
                            }`}
                          >
                            <option value="Institut Teknologi Bandung" className="bg-[#0b1a27] text-slate-100">Institut Teknologi Bandung</option>
                            <option value="Perguruan Tinggi Lain" className="bg-[#0b1a27] text-slate-100">Perguruan Tinggi Lain</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {walkInFormData.asal_univ_select === "Perguruan Tinggi Lain" && (
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                          Nama Perguruan Tinggi <span className="text-amber-400 ml-0.5">*</span>
                        </label>
                        <input
                          type="text"
                          name="asal_univ_lain"
                          value={walkInFormData.asal_univ_lain}
                          onChange={handleWalkInInputChange}
                          placeholder="Tuliskan nama perguruan tinggi peserta"
                          className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                            walkInErrors.asal_univ_lain ? "border border-rose-500/60" : "border border-white/10"
                          }`}
                        />
                        {walkInErrors.asal_univ_lain && (
                          <p className="mt-1.5 text-xs text-rose-400 font-medium">
                            {walkInErrors.asal_univ_lain}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                          Program Studi / Jurusan <span className="text-amber-400 ml-0.5">*</span>
                        </label>
                        <input
                          type="text"
                          name="jurusan"
                          value={walkInFormData.jurusan}
                          onChange={handleWalkInInputChange}
                          placeholder="Contoh: Teknik Informatika"
                          className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                            walkInErrors.jurusan ? "border border-rose-500/60" : "border border-white/10"
                          }`}
                        />
                        {walkInErrors.jurusan && (
                          <p className="mt-1.5 text-xs text-rose-400 font-medium">
                            {walkInErrors.jurusan}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                          Tahun Angkatan <span className="text-amber-400 ml-0.5">*</span>
                        </label>
                        <input
                          type="text"
                          name="angkatan"
                          value={walkInFormData.angkatan}
                          onChange={handleWalkInInputChange}
                          placeholder="Contoh: 2022"
                          className={`w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all ${
                            walkInErrors.angkatan ? "border border-rose-500/60" : "border border-white/10"
                          }`}
                        />
                        {walkInErrors.angkatan && (
                          <p className="mt-1.5 text-xs text-rose-400 font-medium">
                            {walkInErrors.angkatan}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                          Status Member ITB Career Center <span className="text-amber-400 ml-0.5">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="is_member_itbcc"
                            value={String(walkInFormData.is_member_itbcc)}
                            onChange={handleWalkInInputChange}
                            className="w-full px-4 py-2.5 pr-9 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all appearance-none cursor-pointer"
                          >
                            <option value="true" className="bg-[#0b1a27] text-slate-100">Sudah Menjadi Member</option>
                            <option value="false" className="bg-[#0b1a27] text-slate-100">Belum Menjadi Member</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                          Topik Konsultasi <span className="text-amber-400 ml-0.5">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="harapan_sesi"
                            value={walkInFormData.harapan_sesi}
                            onChange={handleWalkInInputChange}
                            className="w-full px-4 py-2.5 pr-9 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all appearance-none cursor-pointer"
                          >
                            <option value="Konsultasi Karier" className="bg-[#0b1a27] text-slate-100">Konsultasi Karier</option>
                            <option value="Review CV & Portofolio" className="bg-[#0b1a27] text-slate-100">Review CV & Portofolio</option>
                            <option value="Persiapan Wawancara Kerja" className="bg-[#0b1a27] text-slate-100">Persiapan Wawancara Kerja</option>
                            <option value="Perencanaan Studi Lanjut" className="bg-[#0b1a27] text-slate-100">Perencanaan Studi Lanjut</option>
                            <option value="Lainnya" className="bg-[#0b1a27] text-slate-100">Lainnya</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                        Catatan Tambahan (Opsional)
                      </label>
                      <textarea
                        name="detail_harapan"
                        rows="2"
                        value={walkInFormData.detail_harapan}
                        onChange={handleWalkInInputChange}
                        placeholder="Tuliskan poin spesifik yang ingin didiskusikan..."
                        className="w-full px-4 py-2.5 rounded-xl liquid-neumorph-inset text-sm font-medium text-white bg-[#091726]/85 placeholder-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/60 transition-all resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 mt-4 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={handleCloseReassignModal}
                className="liquid-neumorph-inset px-4 py-2.5 rounded-2xl text-slate-300 hover:text-white font-semibold text-xs cursor-pointer border border-white/10"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteReassign}
                disabled={
                  isSubmittingReassign ||
                  ((reassignMethod === "waiting_list" || reassignMethod === "move_scheduled") &&
                    !selectedReplacementId)
                }
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-[#07131e] font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>Lanjut ke Konfirmasi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#050b14]/85 backdrop-blur-md animate-fadeIn"
          onClick={() => !isSubmittingConfirm && setConfirmDialog(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 liquid-neumorph-card border border-brand-gold/40 shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 text-brand-gold flex items-center justify-center mb-4 shadow-inner">
              <AlertTriangle className="w-6 h-6 text-brand-gold" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2 leading-tight">
              {confirmDialog.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              {confirmDialog.description}
            </p>

            <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                disabled={isSubmittingConfirm}
                onClick={() => setConfirmDialog(null)}
                className="liquid-neumorph-inset px-4 py-2.5 rounded-2xl text-slate-300 hover:text-white font-semibold text-xs cursor-pointer border border-white/10 active:scale-95 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmittingConfirm}
                onClick={async () => {
                  setIsSubmittingConfirm(true)
                  try {
                    await confirmDialog.onConfirm()
                    setConfirmDialog(null)
                  } finally {
                    setIsSubmittingConfirm(false)
                  }
                }}
                className={`px-5 py-2.5 rounded-2xl font-bold text-xs shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 ${
                  confirmDialog.confirmButtonClass || "bg-brand-gold text-[#07131e]"
                }`}
              >
                {isSubmittingConfirm ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                )}
                <span>{confirmDialog.confirmText || "Konfirmasi"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
