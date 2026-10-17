import React, { useState, useMemo, useRef, useEffect, useCallback } from "react"
import {
  Search,
  UserPlus,
  Eye,
  Edit,
  ArrowUpDown,
  RotateCcw,
  X,
  ChevronDown,
  FileSpreadsheet,
  Plus,
  Check,
  Loader2,
  GripVertical,
  ArrowUp,
  SlidersHorizontal,
  Copy,
  ArrowDownUp,
  Trash2
} from "lucide-react"
import {
  validateFullName,
  validateWhatsApp,
  validateEmail,
  validateAngkatan,
  sanitizeWhatsAppInput,
  formatWhatsAppDisplay
} from "../../../utils/validationUtils"
import WhatsAppIcon from "../../common/WhatsAppIcon"
import {
  SESI_TKT_META,
  formatSesiCompact,
  ENABLE_TKT_WAITING_LIST,
  getDefaultWaTemplateKey,
  checkWhatsAppRegistered
} from "../../../services/tktService"
import { TktDeleteModal } from "../TktModals"

export default function TktSpreadsheetView({
  participants = [],
  config = {},
  availableDates = [],
  availablePsikologs = [],
  onUpdateStatus,
  onUpdateParticipant,
  onOpenWalkIn,
  onSaveWalkIn,
  onOpenDetail,
  onOpenEdit,
  getWaLink,
  onOpenWhatsApp,
  onDeleteParticipant
}) {
  const DEFAULT_COLUMN_WIDTHS = {
    aksi: 155,
    no: 55,
    nama_lengkap: 200,
    nomor_wa: 155,
    email: 185,
    asal_univ: 180,
    jurusan: 165,
    angkatan: 95,
    is_member_itbcc: 115,
    jadwal_hari: 140,
    jadwal_sesi: 185,
    psikolog_bertugas: 175,
    status_peserta: 155,
    harapan_sesi: 180,
    created_at: 135
  }

  const DEFAULT_COLUMN_ORDER = [
    "no",
    "nama_lengkap",
    "nomor_wa",
    "email",
    "asal_univ",
    "jurusan",
    "angkatan",
    "is_member_itbcc",
    "jadwal_hari",
    "jadwal_sesi",
    "psikolog_bertugas",
    "status_peserta",
    "harapan_sesi",
    "created_at"
  ]

  const COLUMN_LABELS = {
    no: "No",
    nama_lengkap: "Nama Lengkap",
    nomor_wa: "Nomor WhatsApp",
    email: "Email Peserta",
    asal_univ: "Asal Universitas",
    jurusan: "Program Studi",
    angkatan: "Angkatan",
    is_member_itbcc: "Member ITB CC",
    jadwal_hari: "Hari Kegiatan",
    jadwal_sesi: "Sesi Waktu",
    psikolog_bertugas: "Psikolog Bertugas",
    status_peserta: "Status Peserta",
    harapan_sesi: "Fokus Sesi",
    created_at: "Waktu Daftar"
  }

  const [columnWidths, setColumnWidths] = useState(() => {
    try {
      const saved = localStorage.getItem("tkt_spreadsheet_column_widths")
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          ...DEFAULT_COLUMN_WIDTHS,
          ...parsed,
          aksi: Math.max(parsed.aksi || 155, 155),
          jadwal_sesi: Math.max(parsed.jadwal_sesi || 185, 185)
        }
      }
    } catch {}
    return DEFAULT_COLUMN_WIDTHS
  })

  const [columnOrder, setColumnOrder] = useState(() => {
    try {
      const saved = localStorage.getItem("tkt_spreadsheet_column_order")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validSet = new Set(DEFAULT_COLUMN_ORDER)
          const filtered = parsed.filter((k) => validSet.has(k))
          const missing = DEFAULT_COLUMN_ORDER.filter((k) => !filtered.includes(k))
          return [...filtered, ...missing]
        }
      }
    } catch {}
    return DEFAULT_COLUMN_ORDER
  })

  const [draggedCol, setDraggedCol] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)

  const resizingColRef = useRef(null)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  const handleResizeStart = (colKey, e) => {
    e.preventDefault()
    e.stopPropagation()
    resizingColRef.current = colKey
    startXRef.current = e.clientX
    startWidthRef.current = columnWidths[colKey] || DEFAULT_COLUMN_WIDTHS[colKey] || 120

    const handleMouseMove = (moveEvent) => {
      if (!resizingColRef.current) return
      const deltaX = moveEvent.clientX - startXRef.current
      const newWidth = Math.max(55, startWidthRef.current + deltaX)
      setColumnWidths((prev) => {
        const updated = { ...prev, [resizingColRef.current]: newWidth }
        try {
          localStorage.setItem("tkt_spreadsheet_column_widths", JSON.stringify(updated))
        } catch {}
        return updated
      })
    }

    const handleMouseUp = () => {
      resizingColRef.current = null
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }

  const handleResetColWidth = (colKey, e) => {
    e.preventDefault()
    e.stopPropagation()
    setColumnWidths((prev) => {
      const updated = { ...prev, [colKey]: DEFAULT_COLUMN_WIDTHS[colKey] }
      try {
        localStorage.setItem("tkt_spreadsheet_column_widths", JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  const handleColDragStart = (colKey, e) => {
    setDraggedCol(colKey)
    e.dataTransfer.setData("text/plain", colKey)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleColDragOver = (colKey, e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (draggedCol && draggedCol !== colKey && dragOverCol !== colKey) {
      setDragOverCol(colKey)
    }
  }

  const handleColDragLeave = (colKey) => {
    if (dragOverCol === colKey) {
      setDragOverCol(null)
    }
  }

  const handleColDrop = (targetColKey, e) => {
    e.preventDefault()
    if (!draggedCol || draggedCol === targetColKey) {
      setDraggedCol(null)
      setDragOverCol(null)
      return
    }

    const newOrder = [...columnOrder]
    const fromIdx = newOrder.indexOf(draggedCol)
    const toIdx = newOrder.indexOf(targetColKey)

    if (fromIdx !== -1 && toIdx !== -1) {
      newOrder.splice(fromIdx, 1)
      newOrder.splice(toIdx, 0, draggedCol)
      setColumnOrder(newOrder)
      try {
        localStorage.setItem("tkt_spreadsheet_column_order", JSON.stringify(newOrder))
      } catch {}
    }

    setDraggedCol(null)
    setDragOverCol(null)
  }

  const handleResetColumnOrder = () => {
    setColumnOrder(DEFAULT_COLUMN_ORDER)
    try {
      localStorage.removeItem("tkt_spreadsheet_column_order")
    } catch {}
  }

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [dateFilter, setDateFilter] = useState("ALL")
  const [sesiFilter, setSesiFilter] = useState("ALL")
  const [sortField, setSortField] = useState("created_at")
  const [sortDirection, setSortDirection] = useState("desc")
  const [isExporting, setIsExporting] = useState(false)
  const [editingRowId, setEditingRowId] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [editErrors, setEditErrors] = useState({})
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isAddingNewRow, setIsAddingNewRow] = useState(false)
  const [newRowData, setNewRowData] = useState({})
  const [newRowErrors, setNewRowErrors] = useState({})
  const [isSavingNewRow, setIsSavingNewRow] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async (id) => {
    if (!onDeleteParticipant || isDeleting) return
    setIsDeleting(true)
    try {
      const res = await onDeleteParticipant(id)
      if (res && res.success) {
        setDeleteTarget(null)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const sesiList = [
    "09.00-09.45",
    "09.50-10.35",
    "10.40-11.25",
    "11.30-12.15",
    "13.15-14.00",
    "14.05-14.50",
    "14.55-15.40"
  ]

  const STANDARD_HARAPAN_OPTIONS = [
    "Konsultasi Karier",
    "Review CV & Portofolio",
    "Persiapan Wawancara Kerja",
    "Perencanaan Studi Lanjut",
    "Lainnya"
  ]

  const allStatusOptions = [
    { value: "DAPAT_SESI", label: "DAPAT SESI", color: "bg-sky-500/15 text-sky-300 border-sky-400/30" },
    { value: "CONFIRMED", label: "CONFIRMED", color: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" },
    { value: "HADIR", label: "HADIR DI BOOTH", color: "bg-amber-500/15 text-amber-300 border-amber-400/30" },
    { value: "SELESAI_FULL", label: "SELESAI", color: "bg-blue-500/15 text-blue-300 border-blue-400/30" },
    { value: "WAITING_LIST", label: "WAITING LIST", color: "bg-amber-500/15 text-amber-300 border-amber-400/30" },
    { value: "BATAL", label: "BATAL", color: "bg-rose-500/15 text-rose-300 border-rose-400/30" }
  ]

  const statusOptions = allStatusOptions.filter(
    (opt) => ENABLE_TKT_WAITING_LIST || opt.value !== "WAITING_LIST"
  )

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

  const statusSummary = useMemo(() => {
    const counts = {
      DAPAT_SESI: 0,
      CONFIRMED: 0,
      HADIR: 0,
      SELESAI_FULL: 0,
      WAITING_LIST: 0,
      BATAL: 0
    }
    for (const p of filteredData) {
      if (counts[p.status_peserta] !== undefined) {
        counts[p.status_peserta]++
      }
    }
    return counts
  }, [filteredData])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const hasActiveFilter = Boolean(
    searchQuery.trim() ||
    statusFilter !== "ALL" ||
    dateFilter !== "ALL" ||
    sesiFilter !== "ALL"
  )

  const [selectionStart, setSelectionStart] = useState(null)
  const [selectionEnd, setSelectionEnd] = useState(null)
  const [copiedToast, setCopiedToast] = useState(null)
  const isSelectingCellsRef = useRef(false)
  const toastTimeoutRef = useRef(null)

  const clearBlockSelection = useCallback(() => {
    isSelectingCellsRef.current = false
    setSelectionStart(null)
    setSelectionEnd(null)
  }, [])

  const selectionBounds = useMemo(() => {
    if (!selectionStart || !selectionEnd || sortedData.length === 0) return null
    const maxRowLimit = sortedData.length - 1
    const maxColLimit = columnOrder.length - 1
    const r1 = Math.min(Math.max(0, selectionStart.row), maxRowLimit)
    const r2 = Math.min(Math.max(0, selectionEnd.row), maxRowLimit)
    const c1 = Math.min(Math.max(0, selectionStart.col), maxColLimit)
    const c2 = Math.min(Math.max(0, selectionEnd.col), maxColLimit)
    const minRow = Math.min(r1, r2)
    const maxRow = Math.max(r1, r2)
    const minCol = Math.min(c1, c2)
    const maxCol = Math.max(c1, c2)
    const rowCount = maxRow - minRow + 1
    const colCount = maxCol - minCol + 1
    const totalCells = rowCount * colCount
    const singleColKey = colCount === 1 ? columnOrder[minCol] : null
    const singleColLabel = singleColKey ? COLUMN_LABELS[singleColKey] || singleColKey : null
    return {
      minRow,
      maxRow,
      minCol,
      maxCol,
      rowCount,
      colCount,
      totalCells,
      singleColKey,
      singleColLabel
    }
  }, [selectionStart, selectionEnd, sortedData.length, columnOrder])

  const getCellPlainText = useCallback((p, colKey, rowIdx) => {
    if (!p) return ""
    switch (colKey) {
      case "no":
        return String(rowIdx + 1)
      case "nama_lengkap":
        return p.nama_lengkap || ""
      case "nomor_wa":
        return p.nomor_wa ? String(p.nomor_wa) : ""
      case "email":
        return p.email || ""
      case "asal_univ":
        return p.asal_univ || ""
      case "jurusan":
        return p.jurusan || ""
      case "angkatan":
        return p.angkatan ? String(p.angkatan) : ""
      case "is_member_itbcc":
        return p.is_member_itbcc ? "Member ITB CC" : "Non-Member"
      case "jadwal_hari":
        return p.jadwal_hari || ""
      case "jadwal_sesi":
        return (
          SESI_TKT_META.find((s) => s.id === p.jadwal_sesi)?.compactLabel ||
          (p.jadwal_sesi ? formatSesiCompact(p.jadwal_sesi) : "")
        )
      case "psikolog_bertugas":
        return p.psikolog_bertugas || "Belum Ditentukan"
      case "status_peserta":
        return (
          allStatusOptions.find((opt) => opt.value === p.status_peserta)?.label ||
          p.status_peserta ||
          ""
        )
      case "harapan_sesi":
        return p.harapan_sesi || ""
      case "created_at":
        return p.created_at
          ? new Date(p.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            })
          : ""
      default:
        return ""
    }
  }, [])

  const buildSelectedBlockText = useCallback(() => {
    if (!selectionBounds) return ""
    const lines = []
    for (let r = selectionBounds.minRow; r <= selectionBounds.maxRow; r++) {
      const rowParticipant = sortedData[r]
      if (!rowParticipant) continue
      const cols = []
      for (let c = selectionBounds.minCol; c <= selectionBounds.maxCol; c++) {
        const colKey = columnOrder[c]
        cols.push(getCellPlainText(rowParticipant, colKey, r))
      }
      lines.push(cols.join("\t"))
    }
    return lines.join("\n")
  }, [selectionBounds, sortedData, columnOrder, getCellPlainText])

  const showCopyNotification = useCallback((bounds) => {
    if (!bounds) return
    const labelInfo = bounds.singleColLabel
      ? `${bounds.rowCount} baris (${bounds.singleColLabel})`
      : `${bounds.totalCells} sel (${bounds.rowCount} baris × ${bounds.colCount} kolom)`
    setCopiedToast(`Berhasil disalin: ${labelInfo}`)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => {
      setCopiedToast(null)
    }, 3200)
  }, [])

  const copySelectedBlockToClipboard = useCallback(async () => {
    if (!selectionBounds) return false
    const text = buildSelectedBlockText()
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const ta = document.createElement("textarea")
        ta.value = text
        ta.style.position = "fixed"
        ta.style.opacity = "0"
        document.body.appendChild(ta)
        ta.select()
        document.execCommand("copy")
        document.body.removeChild(ta)
      }
      showCopyNotification(selectionBounds)
      return true
    } catch {
      return false
    }
  }, [selectionBounds, buildSelectedBlockText, showCopyNotification])

  const handleCellMouseDown = (rowIdx, colIdx, e) => {
    if (e.button !== 0 || editingRowId !== null) return
    if (typeof window !== "undefined" && window.getSelection) {
      const sel = window.getSelection()
      if (sel) sel.removeAllRanges()
    }
    if (e.shiftKey && selectionStart) {
      e.preventDefault()
      setSelectionEnd({ row: rowIdx, col: colIdx })
      return
    }
    isSelectingCellsRef.current = true
    setSelectionStart({ row: rowIdx, col: colIdx })
    setSelectionEnd({ row: rowIdx, col: colIdx })
  }

  const handleCellMouseEnter = (rowIdx, colIdx) => {
    if (!isSelectingCellsRef.current) return
    setSelectionEnd({ row: rowIdx, col: colIdx })
  }

  const handleSelectFullColumn = (colIdx) => {
    if (sortedData.length === 0) return
    setSelectionStart({ row: 0, col: colIdx })
    setSelectionEnd({ row: sortedData.length - 1, col: colIdx })
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelectingCellsRef.current) {
        isSelectingCellsRef.current = false
      }
    }
    window.addEventListener("mouseup", handleGlobalMouseUp)
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [])

  useEffect(() => {
    if (!selectionBounds) return

    const isFormElementActive = () => {
      const el = document.activeElement
      if (!el) return false
      const tag = el.tagName
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable
    }

    const handleKeyDown = (e) => {
      if (isFormElementActive() || editingRowId !== null) return

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        e.preventDefault()
        copySelectedBlockToClipboard()
        return
      }

      if (e.key === "Escape") {
        e.preventDefault()
        clearBlockSelection()
        return
      }

      const maxRow = sortedData.length - 1
      const maxCol = columnOrder.length - 1
      if (maxRow < 0 || maxCol < 0) return

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault()
        const target = e.shiftKey ? selectionEnd || selectionStart : selectionStart
        if (!target) return
        let nextRow = target.row
        let nextCol = target.col
        if (e.key === "ArrowUp") nextRow = Math.max(0, nextRow - 1)
        if (e.key === "ArrowDown") nextRow = Math.min(maxRow, nextRow + 1)
        if (e.key === "ArrowLeft") nextCol = Math.max(0, nextCol - 1)
        if (e.key === "ArrowRight") nextCol = Math.min(maxCol, nextCol + 1)

        if (e.shiftKey) {
          setSelectionEnd({ row: nextRow, col: nextCol })
        } else {
          setSelectionStart({ row: nextRow, col: nextCol })
          setSelectionEnd({ row: nextRow, col: nextCol })
        }
      }
    }

    const handleCopyEvent = (e) => {
      if (isFormElementActive() || editingRowId !== null) return
      const text = buildSelectedBlockText()
      if (e.clipboardData) {
        e.preventDefault()
        e.clipboardData.setData("text/plain", text)
        showCopyNotification(selectionBounds)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("copy", handleCopyEvent)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("copy", handleCopyEvent)
    }
  }, [
    selectionBounds,
    selectionStart,
    selectionEnd,
    editingRowId,
    sortedData.length,
    columnOrder.length,
    copySelectedBlockToClipboard,
    buildSelectedBlockText,
    showCopyNotification,
    clearBlockSelection
  ])

  const handleResetFilters = () => {
    setSearchQuery("")
    setStatusFilter("ALL")
    setDateFilter("ALL")
    setSesiFilter("ALL")
    clearBlockSelection()
  }

  const handleStartEdit = (p) => {
    clearBlockSelection()
    setEditingRowId(p.id)
    setEditFormData({
      nama_lengkap: p.nama_lengkap || "",
      nomor_wa: formatWhatsAppDisplay(p.nomor_wa || ""),
      email: p.email || "",
      asal_univ: p.asal_univ || "",
      jurusan: p.jurusan || "",
      angkatan: p.angkatan || "",
      is_member_itbcc: Boolean(p.is_member_itbcc),
      jadwal_hari: p.jadwal_hari || (availableDates[0] || ""),
      jadwal_sesi: p.jadwal_sesi || "09.00-09.45",
      psikolog_bertugas: p.psikolog_bertugas || "Belum Ditentukan",
      status_peserta: p.status_peserta || "DAPAT_SESI",
      harapan_sesi: p.harapan_sesi || "Konsultasi Karier"
    })
    setEditErrors({})
  }

  const handleCancelEdit = () => {
    setEditingRowId(null)
    setEditFormData({})
    setEditErrors({})
  }

  const handleSaveEdit = async (id) => {
    if (isSavingEdit) return
    const errors = {}

    const nameRes = validateFullName(editFormData.nama_lengkap)
    if (!nameRes.isValid) errors.nama_lengkap = nameRes.error

    const waRes = validateWhatsApp(editFormData.nomor_wa)
    if (!waRes.isValid) errors.nomor_wa = waRes.error

    if (editFormData.email && editFormData.email.trim()) {
      const emailRes = validateEmail(editFormData.email, true)
      if (!emailRes.isValid) errors.email = emailRes.error
    }

    if (editFormData.angkatan && editFormData.angkatan.trim()) {
      const angkatanRes = validateAngkatan(editFormData.angkatan, true)
      if (!angkatanRes.isValid) errors.angkatan = angkatanRes.error
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }

    setIsSavingEdit(true)
    try {
      const waDupCheck = await checkWhatsAppRegistered(waRes.cleanValue, availableDates, id)
      if (waDupCheck.isRegistered) {
        setEditErrors({
          nomor_wa: "Nomor WA sudah terdaftar di peserta lain"
        })
        return
      }

      await onUpdateParticipant(id, {
        nama_lengkap: nameRes.cleanValue,
        nomor_wa: waRes.cleanValue,
        email: editFormData.email ? editFormData.email.trim().toLowerCase() : "",
        asal_univ: editFormData.asal_univ ? editFormData.asal_univ.trim() : "",
        jurusan: editFormData.jurusan ? editFormData.jurusan.trim() : "",
        angkatan: editFormData.angkatan ? editFormData.angkatan.trim() : "",
        is_member_itbcc: Boolean(editFormData.is_member_itbcc),
        jadwal_hari: editFormData.jadwal_hari,
        jadwal_sesi: editFormData.jadwal_sesi,
        psikolog_bertugas: editFormData.psikolog_bertugas,
        status_peserta: editFormData.status_peserta,
        harapan_sesi: editFormData.harapan_sesi ? editFormData.harapan_sesi.trim() : ""
      })
      setEditingRowId(null)
      setEditFormData({})
      setEditErrors({})
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleStartAddRow = () => {
    setIsAddingNewRow(true)
    setNewRowData({
      nama_lengkap: "",
      nomor_wa: "",
      email: "",
      asal_univ: "Institut Teknologi Bandung",
      status_mhs: "Mahasiswa Aktif ITB",
      jurusan: "",
      angkatan: String(new Date().getFullYear()),
      is_member_itbcc: true,
      jadwal_hari: availableDates[0] || "",
      jadwal_sesi: "09.00-09.45",
      psikolog_bertugas: availablePsikologs[0] || "Psikolog 1",
      status_peserta: "CONFIRMED",
      harapan_sesi: "Konsultasi Karier"
    })
    setNewRowErrors({})
  }

  const handleCancelAddRow = () => {
    setIsAddingNewRow(false)
    setNewRowData({})
    setNewRowErrors({})
  }

  const handleSaveNewRow = async () => {
    if (isSavingNewRow) return
    const errors = {}

    const nameRes = validateFullName(newRowData.nama_lengkap)
    if (!nameRes.isValid) errors.nama_lengkap = nameRes.error

    const waRes = validateWhatsApp(newRowData.nomor_wa)
    if (!waRes.isValid) errors.nomor_wa = waRes.error

    if (newRowData.email && newRowData.email.trim()) {
      const emailRes = validateEmail(newRowData.email, true)
      if (!emailRes.isValid) errors.email = emailRes.error
    }

    if (newRowData.angkatan && newRowData.angkatan.trim()) {
      const angkatanRes = validateAngkatan(newRowData.angkatan, true)
      if (!angkatanRes.isValid) errors.angkatan = angkatanRes.error
    }

    if (Object.keys(errors).length > 0) {
      setNewRowErrors(errors)
      return
    }

    setIsSavingNewRow(true)
    try {
      const waDupCheck = await checkWhatsAppRegistered(waRes.cleanValue, availableDates)
      if (waDupCheck.isRegistered) {
        setNewRowErrors({
          nomor_wa: "Nomor WA sudah terdaftar di jadwal aktif"
        })
        return
      }

      const payload = {
        nama_lengkap: nameRes.cleanValue,
        nomor_wa: waRes.cleanValue,
        email: newRowData.email ? newRowData.email.trim().toLowerCase() : "",
        asal_univ: newRowData.asal_univ ? newRowData.asal_univ.trim() : "Institut Teknologi Bandung",
        status_mhs: newRowData.status_mhs || "Mahasiswa Aktif ITB",
        jurusan: newRowData.jurusan ? newRowData.jurusan.trim() : "",
        angkatan: newRowData.angkatan ? newRowData.angkatan.trim() : "",
        is_member_itbcc: Boolean(newRowData.is_member_itbcc),
        jadwal_hari: newRowData.jadwal_hari || (availableDates[0] || ""),
        jadwal_sesi: newRowData.jadwal_sesi || "09.00-09.45",
        psikolog_bertugas: newRowData.psikolog_bertugas || (availablePsikologs[0] || "Psikolog 1"),
        status_peserta: newRowData.status_peserta || "CONFIRMED",
        harapan_sesi: newRowData.harapan_sesi ? newRowData.harapan_sesi.trim() : "Konsultasi Karier"
      }

      if (onSaveWalkIn) {
        const res = await onSaveWalkIn(payload)
        if (res && res.success === false) {
          setNewRowErrors({ form: res.message || "Gagal menyimpan baris baru" })
          return
        }
      }

      setIsAddingNewRow(false)
      setNewRowData({})
      setNewRowErrors({})
    } finally {
      setIsSavingNewRow(false)
    }
  }

  const exportToExcel = async () => {
    if (isExporting || filteredData.length === 0) return
    setIsExporting(true)
    try {
      const XLSX = await import("xlsx")
      const headers = [
        "No",
        "Nama Lengkap",
        "Nomor WhatsApp",
        "Email",
        "Universitas / Institusi",
        "Program Studi",
        "Angkatan",
        "Status Member ITB CC",
        "Hari Kegiatan",
        "Sesi Konseling",
        "Psikolog Bertugas",
        "Status Peserta",
        "Fokus Sesi",
        "Waktu Mendaftar"
      ]

      const statusMap = {
        DAPAT_SESI: "DAPAT SESI",
        CONFIRMED: "CONFIRMED",
        HADIR: "HADIR DI BOOTH",
        SELESAI_FULL: "SELESAI",
        WAITING_LIST: "WAITING LIST",
        BATAL: "BATAL"
      }

      const formatDateTime = (rawDate) => {
        if (!rawDate) return "-"
        const dateObj = new Date(rawDate)
        if (isNaN(dateObj.getTime())) return String(rawDate)
        return dateObj.toLocaleString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }) + " WIB"
      }

      const rows = filteredData.map((p, idx) => [
        idx + 1,
        p.nama_lengkap || "-",
        p.nomor_wa ? String(p.nomor_wa) : "-",
        p.email || "-",
        p.asal_univ || "-",
        p.jurusan || "-",
        p.angkatan || "-",
        p.is_member_itbcc ? "Member Aktif ITB CC" : "Bukan Member",
        p.jadwal_hari || "-",
        p.jadwal_sesi ? formatSesiCompact(p.jadwal_sesi) : "-",
        p.psikolog_bertugas || "Belum Ditentukan",
        statusMap[p.status_peserta] || p.status_peserta || "-",
        p.harapan_sesi || "-",
        formatDateTime(p.created_at)
      ])

      const worksheetData = [headers, ...rows]
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

      const colWidths = headers.map((header, colIndex) => {
        let maxLen = header.length
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
          const val = rows[rowIndex][colIndex]
          const cellLen = val !== null && val !== undefined ? String(val).length : 0
          if (cellLen > maxLen) {
            maxLen = cellLen
          }
        }
        return { wch: Math.min(Math.max(maxLen + 3, 10), 45) }
      })
      worksheet["!cols"] = colWidths

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Peserta TKT")

      const fileDate = new Date().toISOString().slice(0, 10)
      XLSX.writeFile(workbook, `Data_Peserta_Konseling_TKT_ITBCC_${fileDate}.xlsx`)
    } catch (err) {
      console.error("Gagal mengekspor data Excel:", err)
    } finally {
      setIsExporting(false)
    }
  }

  const renderHeaderCell = (colKey) => {
    const isSortable = ["nama_lengkap", "jadwal_hari", "jadwal_sesi", "status_peserta", "created_at"].includes(colKey)
    const isColActive = sortField === colKey
    const w = columnWidths[colKey] || DEFAULT_COLUMN_WIDTHS[colKey] || 130
    const label = COLUMN_LABELS[colKey] || colKey

    return (
      <th
        key={colKey}
        draggable={true}
        onDragStart={(e) => handleColDragStart(colKey, e)}
        onDragOver={(e) => handleColDragOver(colKey, e)}
        onDragLeave={() => handleColDragLeave(colKey)}
        onDrop={(e) => handleColDrop(colKey, e)}
        style={{ width: w, minWidth: w }}
        className={`relative py-2.5 px-2.5 border-r border-b border-white/15 bg-[#091726] font-bold text-xs select-none transition-colors group ${
          colKey === "no" ? "text-center text-brand-gold" : "text-white uppercase tracking-wider"
        } ${dragOverCol === colKey ? "border-l-2 border-brand-gold bg-amber-500/15" : ""} ${
          draggedCol === colKey ? "opacity-40" : ""
        }`}
      >
        <div
          onClick={isSortable ? () => handleSort(colKey) : undefined}
          className={`flex items-center gap-1.5 cursor-grab active:cursor-grabbing ${
            colKey === "no" ? "justify-center" : "justify-between"
          } ${isSortable ? "hover:text-brand-gold transition-colors" : ""}`}
        >
          <div className="flex items-center gap-1 min-w-0">
            <GripVertical className="w-3 h-3 text-slate-500 group-hover:text-brand-gold/70 shrink-0" />
            <span className="truncate">{label}</span>
          </div>
          {isSortable && (
            <ArrowUpDown
              className={`w-3 h-3 shrink-0 ${
                isColActive ? "text-brand-gold" : "text-slate-500 group-hover:text-slate-300"
              }`}
            />
          )}
        </div>
        <div
          draggable={false}
          onMouseDown={(e) => handleResizeStart(colKey, e)}
          onDoubleClick={(e) => handleResetColWidth(colKey, e)}
          title="Tarik untuk ubah lebar / Klik ganda untuk reset"
          className="absolute right-0 top-0 bottom-0 w-1.5 hover:w-2 hover:bg-brand-gold/80 cursor-col-resize transition-all z-20"
        />
      </th>
    )
  }

  const renderNewRowCell = (colKey) => {
    const w = columnWidths[colKey] || DEFAULT_COLUMN_WIDTHS[colKey] || 130

    switch (colKey) {
      case "no":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2.5 px-2 text-center text-brand-gold font-bold text-xs border-r border-b border-white/10"
          >
            +
          </td>
        )
      case "nama_lengkap":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <input
              type="text"
              autoFocus
              value={newRowData.nama_lengkap || ""}
              onChange={(e) => setNewRowData({ ...newRowData, nama_lengkap: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveNewRow()
                if (e.key === "Escape") handleCancelAddRow()
              }}
              placeholder="Nama lengkap..."
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border focus:outline-none transition-all ${
                newRowErrors.nama_lengkap
                  ? "border-rose-500/70 ring-1 ring-rose-500/30"
                  : "border-brand-gold/40 focus:border-brand-gold"
              }`}
            />
            {newRowErrors.nama_lengkap && (
              <span className="text-[10px] text-rose-400 block mt-0.5">
                {newRowErrors.nama_lengkap}
              </span>
            )}
          </td>
        )
      case "nomor_wa":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={14}
              value={newRowData.nomor_wa || ""}
              onChange={(e) => {
                const sanitizedWa = sanitizeWhatsAppInput(e.target.value)
                setNewRowData({ ...newRowData, nomor_wa: sanitizedWa })
                if (newRowErrors.nomor_wa) {
                  setNewRowErrors({ ...newRowErrors, nomor_wa: null })
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveNewRow()
                if (e.key === "Escape") handleCancelAddRow()
              }}
              placeholder="081234567890"
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border focus:outline-none transition-all ${
                newRowErrors.nomor_wa
                  ? "border-rose-500/70 ring-1 ring-rose-500/30"
                  : "border-brand-gold/40 focus:border-brand-gold"
              }`}
            />
            {newRowErrors.nomor_wa && (
              <span className="text-[10px] text-rose-400 block mt-0.5">
                {newRowErrors.nomor_wa}
              </span>
            )}
          </td>
        )
      case "email":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <input
              type="email"
              value={newRowData.email || ""}
              onChange={(e) => setNewRowData({ ...newRowData, email: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveNewRow()
                if (e.key === "Escape") handleCancelAddRow()
              }}
              placeholder="email@contoh.com..."
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border focus:outline-none ${
                newRowErrors.email
                  ? "border-rose-500/70 ring-1 ring-rose-500/30"
                  : "border-white/15 focus:border-brand-gold/60"
              }`}
            />
            {newRowErrors.email && (
              <span className="text-[10px] text-rose-400 block mt-0.5">
                {newRowErrors.email}
              </span>
            )}
          </td>
        )
      case "asal_univ":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <input
              type="text"
              value={newRowData.asal_univ || ""}
              onChange={(e) => setNewRowData({ ...newRowData, asal_univ: e.target.value })}
              placeholder="Institut Teknologi Bandung"
              className="w-full px-2.5 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border border-white/15 focus:border-brand-gold/60 focus:outline-none"
            />
          </td>
        )
      case "jurusan":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <input
              type="text"
              value={newRowData.jurusan || ""}
              onChange={(e) => setNewRowData({ ...newRowData, jurusan: e.target.value })}
              placeholder="Teknik Informatika..."
              className="w-full px-2.5 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border border-white/15 focus:border-brand-gold/60 focus:outline-none"
            />
          </td>
        )
      case "angkatan":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <input
              type="text"
              value={newRowData.angkatan || ""}
              onChange={(e) => setNewRowData({ ...newRowData, angkatan: e.target.value })}
              placeholder="2022"
              maxLength={4}
              className={`w-full px-2.5 py-1.5 text-xs text-center rounded-lg liquid-neumorph-inset text-white bg-[#091726] border focus:outline-none ${
                newRowErrors.angkatan
                  ? "border-rose-500/70 ring-1 ring-rose-500/30"
                  : "border-white/15 focus:border-brand-gold/60"
              }`}
            />
            {newRowErrors.angkatan && (
              <span className="text-[10px] text-rose-400 block mt-0.5">
                {newRowErrors.angkatan}
              </span>
            )}
          </td>
        )
      case "is_member_itbcc":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 text-center border-r border-b border-white/10"
          >
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(newRowData.is_member_itbcc)}
                onChange={(e) =>
                  setNewRowData({ ...newRowData, is_member_itbcc: e.target.checked })
                }
                className="w-4 h-4 rounded text-brand-gold bg-slate-900 border-white/20 focus:ring-brand-gold cursor-pointer"
              />
              <span className="text-[11px] text-slate-200">
                {newRowData.is_member_itbcc ? "Member" : "Non"}
              </span>
            </label>
          </td>
        )
      case "jadwal_hari":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <select
              value={newRowData.jadwal_hari || (availableDates[0] || "")}
              onChange={(e) => setNewRowData({ ...newRowData, jadwal_hari: e.target.value })}
              className="w-full px-2 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border border-white/15 cursor-pointer focus:outline-none"
            >
              {availableDates.map((d) => (
                <option key={d} value={d} className="bg-slate-900">{d}</option>
              ))}
            </select>
          </td>
        )
      case "jadwal_sesi":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <select
              value={newRowData.jadwal_sesi || "09.00-09.45"}
              onChange={(e) => setNewRowData({ ...newRowData, jadwal_sesi: e.target.value })}
              className="w-full px-2 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border border-white/15 cursor-pointer focus:outline-none"
            >
              {SESI_TKT_META.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900">{s.compactLabel}</option>
              ))}
            </select>
          </td>
        )
      case "psikolog_bertugas":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <select
              value={newRowData.psikolog_bertugas || (availablePsikologs[0] || "Psikolog 1")}
              onChange={(e) =>
                setNewRowData({ ...newRowData, psikolog_bertugas: e.target.value })
              }
              className="w-full px-2 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border border-white/15 cursor-pointer focus:outline-none"
            >
              {availablePsikologs.map((psi) => (
                <option key={psi} value={psi} className="bg-slate-900">{psi}</option>
              ))}
            </select>
          </td>
        )
      case "status_peserta":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 text-center border-r border-b border-white/10"
          >
            <select
              value={newRowData.status_peserta || "CONFIRMED"}
              onChange={(e) =>
                setNewRowData({ ...newRowData, status_peserta: e.target.value })
              }
              className="w-full px-2 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border border-white/15 cursor-pointer focus:outline-none"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
              ))}
            </select>
          </td>
        )
      case "harapan_sesi":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <select
              value={newRowData.harapan_sesi || "Konsultasi Karier"}
              onChange={(e) =>
                setNewRowData({ ...newRowData, harapan_sesi: e.target.value })
              }
              className="w-full px-2 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border border-white/15 cursor-pointer focus:outline-none"
            >
              {STANDARD_HARAPAN_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-slate-900">
                  {opt}
                </option>
              ))}
            </select>
          </td>
        )
      case "created_at":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 text-center text-xs text-brand-gold font-bold border-r border-b border-white/10"
          >
            Baru (Draft)
          </td>
        )
      default:
        return null
    }
  }

  const renderEditCell = (colKey) => {
    const w = columnWidths[colKey] || DEFAULT_COLUMN_WIDTHS[colKey] || 130

    switch (colKey) {
      case "no":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2.5 px-2 text-center text-slate-300 font-mono font-semibold text-xs border-r border-b border-white/10"
          >
            •
          </td>
        )
      case "nama_lengkap":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <input
              type="text"
              value={editFormData.nama_lengkap || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, nama_lengkap: e.target.value })
              }
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border focus:outline-none transition-all ${
                editErrors.nama_lengkap
                  ? "border-rose-500/70 ring-1 ring-rose-500/30"
                  : "border-brand-gold/40 focus:border-brand-gold"
              }`}
            />
            {editErrors.nama_lengkap && (
              <span className="text-[10px] text-rose-400 block mt-0.5">
                {editErrors.nama_lengkap}
              </span>
            )}
          </td>
        )
      case "nomor_wa":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={14}
              value={editFormData.nomor_wa || ""}
              onChange={(e) => {
                const sanitizedWa = sanitizeWhatsAppInput(e.target.value)
                setEditFormData({ ...editFormData, nomor_wa: sanitizedWa })
                if (editErrors.nomor_wa) {
                  setEditErrors({ ...editErrors, nomor_wa: null })
                }
              }}
              placeholder="081234567890"
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border focus:outline-none transition-all ${
                editErrors.nomor_wa
                  ? "border-rose-500/70 ring-1 ring-rose-500/30"
                  : "border-brand-gold/40 focus:border-brand-gold"
              }`}
            />
            {editErrors.nomor_wa && (
              <span className="text-[10px] text-rose-400 block mt-0.5">
                {editErrors.nomor_wa}
              </span>
            )}
          </td>
        )
      case "email":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <input
              type="email"
              value={editFormData.email || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, email: e.target.value })
              }
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border focus:outline-none ${
                editErrors.email
                  ? "border-rose-500/70 ring-1 ring-rose-500/30"
                  : "border-white/15 focus:border-brand-gold/60"
              }`}
            />
            {editErrors.email && (
              <span className="text-[10px] text-rose-400 block mt-0.5">
                {editErrors.email}
              </span>
            )}
          </td>
        )
      case "asal_univ":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <input
              type="text"
              value={editFormData.asal_univ || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, asal_univ: e.target.value })
              }
              className="w-full px-2.5 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border border-white/15 focus:border-brand-gold/60 focus:outline-none"
            />
          </td>
        )
      case "jurusan":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <input
              type="text"
              value={editFormData.jurusan || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, jurusan: e.target.value })
              }
              className="w-full px-2.5 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border border-white/15 focus:border-brand-gold/60 focus:outline-none"
            />
          </td>
        )
      case "angkatan":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <input
              type="text"
              value={editFormData.angkatan || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, angkatan: e.target.value })
              }
              maxLength={4}
              className={`w-full px-2.5 py-1.5 text-xs text-center rounded-lg liquid-neumorph-inset text-white bg-[#091726] border focus:outline-none ${
                editErrors.angkatan
                  ? "border-rose-500/70 ring-1 ring-rose-500/30"
                  : "border-white/15 focus:border-brand-gold/60"
              }`}
            />
            {editErrors.angkatan && (
              <span className="text-[10px] text-rose-400 block mt-0.5">
                {editErrors.angkatan}
              </span>
            )}
          </td>
        )
      case "is_member_itbcc":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 text-center border-r border-b border-white/10"
          >
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(editFormData.is_member_itbcc)}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, is_member_itbcc: e.target.checked })
                }
                className="w-4 h-4 rounded text-brand-gold bg-slate-900 border-white/20 focus:ring-brand-gold cursor-pointer"
              />
              <span className="text-[11px] text-slate-200">
                {editFormData.is_member_itbcc ? "Member" : "Non"}
              </span>
            </label>
          </td>
        )
      case "jadwal_hari":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <select
              value={editFormData.jadwal_hari || (availableDates[0] || "")}
              onChange={(e) =>
                setEditFormData({ ...editFormData, jadwal_hari: e.target.value })
              }
              className="w-full px-2 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border border-white/15 cursor-pointer focus:outline-none"
            >
              {availableDates.map((d) => (
                <option key={d} value={d} className="bg-slate-900">{d}</option>
              ))}
            </select>
          </td>
        )
      case "jadwal_sesi":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <select
              value={editFormData.jadwal_sesi || "09.00-09.45"}
              onChange={(e) =>
                setEditFormData({ ...editFormData, jadwal_sesi: e.target.value })
              }
              className="w-full px-2 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border border-white/15 cursor-pointer focus:outline-none"
            >
              {SESI_TKT_META.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900">{s.compactLabel}</option>
              ))}
            </select>
          </td>
        )
      case "psikolog_bertugas":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <select
              value={editFormData.psikolog_bertugas || "Belum Ditentukan"}
              onChange={(e) =>
                setEditFormData({ ...editFormData, psikolog_bertugas: e.target.value })
              }
              className="w-full px-2 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border border-white/15 cursor-pointer focus:outline-none"
            >
              <option value="Belum Ditentukan" className="bg-slate-900 text-slate-400">
                Belum Ditentukan
              </option>
              {availablePsikologs.map((psi) => (
                <option key={psi} value={psi} className="bg-slate-900">{psi}</option>
              ))}
            </select>
          </td>
        )
      case "status_peserta":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 text-center border-r border-b border-white/10"
          >
            <select
              value={editFormData.status_peserta || "DAPAT_SESI"}
              onChange={(e) =>
                setEditFormData({ ...editFormData, status_peserta: e.target.value })
              }
              className="w-full px-2 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border border-white/15 cursor-pointer focus:outline-none"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
              ))}
            </select>
          </td>
        )
      case "harapan_sesi": {
        const currentHarapan = editFormData.harapan_sesi || "Konsultasi Karier"
        const harapanOptions = STANDARD_HARAPAN_OPTIONS.includes(currentHarapan)
          ? STANDARD_HARAPAN_OPTIONS
          : [currentHarapan, ...STANDARD_HARAPAN_OPTIONS]
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 border-r border-b border-white/10"
          >
            <select
              value={currentHarapan}
              onChange={(e) =>
                setEditFormData({ ...editFormData, harapan_sesi: e.target.value })
              }
              className="w-full px-2 py-1.5 text-xs rounded-lg liquid-neumorph-inset text-white bg-[#091726] border border-white/15 cursor-pointer focus:outline-none"
            >
              {harapanOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-slate-900">
                  {opt}
                </option>
              ))}
            </select>
          </td>
        )
      }
      case "created_at":
        return (
          <td
            key={colKey}
            style={{ width: w, minWidth: w }}
            className="py-2 px-3 text-center text-slate-300 font-mono text-xs border-r border-b border-white/10"
          >
            -
          </td>
        )
      default:
        return null
    }
  }

  const renderViewCell = (colKey, p, idx, colIdx) => {
    const w = columnWidths[colKey] || DEFAULT_COLUMN_WIDTHS[colKey] || 130
    const isSelected = Boolean(
      selectionBounds &&
        idx >= selectionBounds.minRow &&
        idx <= selectionBounds.maxRow &&
        colIdx >= selectionBounds.minCol &&
        colIdx <= selectionBounds.maxCol
    )
    const isAnchor = Boolean(
      selectionStart && selectionStart.row === idx && selectionStart.col === colIdx
    )

    const shadowParts = []
    if (isSelected && selectionBounds) {
      if (idx === selectionBounds.minRow) shadowParts.push("inset 0 2px 0 0 #dda853")
      if (idx === selectionBounds.maxRow) shadowParts.push("inset 0 -2px 0 0 #dda853")
      if (colIdx === selectionBounds.minCol) shadowParts.push("inset 2px 0 0 0 #dda853")
      if (colIdx === selectionBounds.maxCol) shadowParts.push("inset -2px 0 0 0 #dda853")
    }

    const cellStyle = {
      width: w,
      minWidth: w,
      ...(shadowParts.length > 0 ? { boxShadow: shadowParts.join(", ") } : {})
    }

    const selectionBgClass = isAnchor
      ? "bg-brand-gold/25"
      : isSelected
      ? "bg-[#0e74f1]/25"
      : ""

    const commonProps = {
      style: cellStyle,
      onMouseDown: (e) => handleCellMouseDown(idx, colIdx, e),
      onMouseEnter: () => handleCellMouseEnter(idx, colIdx)
    }

    switch (colKey) {
      case "no":
        return (
          <td
            key={colKey}
            {...commonProps}
            className={`py-2.5 px-2 text-center text-brand-gold font-mono font-bold text-xs border-r border-b border-white/10 select-none cursor-cell transition-colors ${selectionBgClass}`}
          >
            {idx + 1}
          </td>
        )
      case "nama_lengkap":
        return (
          <td
            key={colKey}
            {...commonProps}
            className={`py-2.5 px-3 border-r border-b border-white/10 select-none cursor-cell transition-colors ${selectionBgClass}`}
          >
            <div className="font-semibold text-white text-[13px] tracking-wide leading-snug">
              {p.nama_lengkap}
            </div>
          </td>
        )
      case "nomor_wa":
        return (
          <td
            key={colKey}
            {...commonProps}
            className={`py-2.5 px-3 border-r border-b border-white/10 select-none cursor-cell transition-colors ${selectionBgClass}`}
          >
            <span className="text-slate-100 font-mono text-xs font-medium">
              {p.nomor_wa || "-"}
            </span>
          </td>
        )
      case "email":
        return (
          <td
            key={colKey}
            {...commonProps}
            className={`py-2.5 px-3 border-r border-b border-white/10 select-none cursor-cell transition-colors ${selectionBgClass}`}
          >
            <span className="text-slate-200 text-xs block truncate" title={p.email}>
              {p.email || "-"}
            </span>
          </td>
        )
      case "asal_univ":
        return (
          <td
            key={colKey}
            {...commonProps}
            className={`py-2.5 px-3 border-r border-b border-white/10 select-none cursor-cell transition-colors ${selectionBgClass}`}
          >
            <span className="text-slate-200 text-xs block truncate" title={p.asal_univ}>
              {p.asal_univ || "-"}
            </span>
          </td>
        )
      case "jurusan":
        return (
          <td
            key={colKey}
            {...commonProps}
            className={`py-2.5 px-3 border-r border-b border-white/10 select-none cursor-cell transition-colors ${selectionBgClass}`}
          >
            <span className="text-slate-200 text-xs block truncate" title={p.jurusan}>
              {p.jurusan || "-"}
            </span>
          </td>
        )
      case "angkatan":
        return (
          <td
            key={colKey}
            {...commonProps}
            className={`py-2.5 px-3 text-center border-r border-b border-white/10 select-none cursor-cell transition-colors ${selectionBgClass}`}
          >
            <span className="text-slate-200 font-mono text-xs font-semibold">
              {p.angkatan || "-"}
            </span>
          </td>
        )
      case "is_member_itbcc":
        return (
          <td
            key={colKey}
            {...commonProps}
            className={`py-2.5 px-3 text-center border-r border-b border-white/10 select-none cursor-cell transition-colors ${selectionBgClass}`}
          >
            {p.is_member_itbcc ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                Member ITB CC
              </span>
            ) : (
              <span className="text-slate-400 text-xs">Non-Member</span>
            )}
          </td>
        )
      case "jadwal_hari":
        return (
          <td
            key={colKey}
            {...commonProps}
            className={`py-2.5 px-3 border-r border-b border-white/10 select-none cursor-cell transition-colors ${selectionBgClass}`}
          >
            <span className="text-slate-100 font-semibold text-xs whitespace-nowrap">
              {p.jadwal_hari || "-"}
            </span>
          </td>
        )
      case "jadwal_sesi":
        return (
          <td
            key={colKey}
            {...commonProps}
            className={`py-2.5 px-3 border-r border-b border-white/10 select-none cursor-cell transition-colors ${selectionBgClass}`}
          >
            <span className="text-slate-100 font-semibold text-xs whitespace-nowrap">
              {SESI_TKT_META.find((s) => s.id === p.jadwal_sesi)?.compactLabel ||
                (p.jadwal_sesi ? formatSesiCompact(p.jadwal_sesi) : "-")}
            </span>
          </td>
        )
      case "psikolog_bertugas":
        return (
          <td
            key={colKey}
            {...commonProps}
            className={`py-2.5 px-3 border-r border-b border-white/10 select-none cursor-cell transition-colors ${selectionBgClass}`}
          >
            <span
              className={`text-xs font-semibold block truncate ${
                p.psikolog_bertugas && p.psikolog_bertugas !== "Belum Ditentukan"
                  ? "text-slate-100"
                  : "text-slate-400"
              }`}
              title={p.psikolog_bertugas || "Belum Ditentukan"}
            >
              {p.psikolog_bertugas || "Belum Ditentukan"}
            </span>
          </td>
        )
      case "status_peserta":
        return (
          <td
            key={colKey}
            {...commonProps}
            className={`py-2.5 px-3 text-center border-r border-b border-white/10 select-none cursor-cell transition-colors ${selectionBgClass}`}
          >
            <span
              className={`inline-block text-[11px] font-bold py-1 px-3 rounded-full border shadow-sm whitespace-nowrap ${
                allStatusOptions.find((opt) => opt.value === p.status_peserta)?.color ||
                "bg-slate-800 text-slate-200 border-white/15"
              }`}
            >
              {allStatusOptions.find((opt) => opt.value === p.status_peserta)?.label ||
                p.status_peserta ||
                "-"}
            </span>
          </td>
        )
      case "harapan_sesi":
        return (
          <td
            key={colKey}
            {...commonProps}
            className={`py-2.5 px-3 border-r border-b border-white/10 select-none cursor-cell transition-colors ${selectionBgClass}`}
          >
            <span className="text-slate-200 text-xs block truncate" title={p.harapan_sesi}>
              {p.harapan_sesi || "-"}
            </span>
          </td>
        )
      case "created_at":
        return (
          <td
            key={colKey}
            {...commonProps}
            className={`py-2.5 px-3 text-center text-slate-200 font-mono text-xs font-medium border-r border-b border-white/10 select-none cursor-cell transition-colors ${selectionBgClass}`}
          >
            {p.created_at
              ? new Date(p.created_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric"
                })
              : "-"}
          </td>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="w-full liquid-neumorph-card rounded-2xl p-4 flex flex-col gap-3 border-t border-l border-white/20 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap gap-2.5 items-stretch sm:items-center flex-1">
            <div className="relative min-w-[220px] flex-1 sm:max-w-xs md:max-w-sm lg:max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gold pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, WA, prodi, universitas..."
                className="liquid-neumorph-inset w-full pl-9 pr-8 py-2 text-xs font-semibold rounded-xl text-slate-100 bg-[rgba(8,18,28,0.65)] border border-white/10 placeholder:text-slate-500 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-full transition-colors cursor-pointer"
                  title="Hapus kata kunci pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 sm:flex-initial">
              <div className="relative min-w-[130px]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`w-full appearance-none pl-3 pr-8 py-2 text-xs rounded-xl liquid-neumorph-inset font-semibold focus:outline-none cursor-pointer transition-all ${
                    statusFilter !== "ALL"
                      ? "border border-brand-gold/50 text-brand-gold bg-[rgba(8,18,28,0.85)] shadow-sm"
                      : "border border-white/10 text-slate-200 bg-[rgba(8,18,28,0.65)]"
                  }`}
                >
                  <option value="ALL" className="bg-[#0b1a27] text-slate-200">
                    Semua Status ({participants.length})
                  </option>
                  <option value="DAPAT_SESI" className="bg-[#0b1a27] text-slate-200">
                    Dapat Sesi
                  </option>
                  <option value="CONFIRMED" className="bg-[#0b1a27] text-slate-200">
                    Confirmed
                  </option>
                  <option value="HADIR" className="bg-[#0b1a27] text-slate-200">
                    Hadir di Booth
                  </option>
                  <option value="SELESAI_FULL" className="bg-[#0b1a27] text-slate-200">
                    Selesai
                  </option>
                  {ENABLE_TKT_WAITING_LIST && (
                    <option value="WAITING_LIST" className="bg-[#0b1a27] text-slate-200">
                      Waiting List
                    </option>
                  )}
                  <option value="BATAL" className="bg-[#0b1a27] text-slate-200">
                    Batal
                  </option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>

              <div className="relative min-w-[125px]">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={`w-full appearance-none pl-3 pr-8 py-2 text-xs rounded-xl liquid-neumorph-inset font-semibold focus:outline-none cursor-pointer transition-all ${
                    dateFilter !== "ALL"
                      ? "border border-brand-gold/50 text-brand-gold bg-[rgba(8,18,28,0.85)] shadow-sm"
                      : "border border-white/10 text-slate-200 bg-[rgba(8,18,28,0.65)]"
                  }`}
                >
                  <option value="ALL" className="bg-[#0b1a27] text-slate-200">
                    Semua Tanggal
                  </option>
                  {availableDates.map((d) => (
                    <option key={d} value={d} className="bg-[#0b1a27] text-slate-200">
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>

              <div className="relative min-w-[175px]">
                <select
                  value={sesiFilter}
                  onChange={(e) => setSesiFilter(e.target.value)}
                  className={`w-full appearance-none pl-3 pr-8 py-2 text-xs rounded-xl liquid-neumorph-inset font-semibold focus:outline-none cursor-pointer transition-all ${
                    sesiFilter !== "ALL"
                      ? "border border-brand-gold/50 text-brand-gold bg-[rgba(8,18,28,0.85)] shadow-sm"
                      : "border border-white/10 text-slate-200 bg-[rgba(8,18,28,0.65)]"
                  }`}
                >
                  <option value="ALL" className="bg-[#0b1a27] text-slate-200">
                    Semua Sesi Jam
                  </option>
                  {SESI_TKT_META.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#0b1a27] text-slate-200">
                      {s.compactLabel}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="liquid-neumorph-inset px-3 py-2 rounded-xl text-rose-300 hover:text-white border border-rose-500/30 hover:border-rose-500/50 bg-rose-500/10 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
                title="Reset seluruh kata kunci dan filter aktif"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap sm:items-center gap-2 pt-2 lg:pt-0 border-t border-white/5 lg:border-t-0">
            <button
              type="button"
              onClick={handleResetColumnOrder}
              className="liquid-neumorph-inset px-3 py-2 rounded-xl text-slate-300 hover:text-white border border-white/10 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
              title="Reset urutan kolom kembali ke susunan awal"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Kolom</span>
            </button>
            <button
              type="button"
              onClick={exportToExcel}
              disabled={isExporting}
              className="liquid-neumorph-inset px-3.5 py-2 rounded-xl text-slate-100 hover:text-white border border-white/15 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
              title="Unduh seluruh data yang tersaring ke Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isExporting ? "Mengekspor..." : "Ekspor Excel"}</span>
            </button>
            <button
              type="button"
              onClick={onOpenWalkIn}
              className="liquid-neumorph-inset px-3.5 py-2 rounded-xl text-brand-gold hover:text-white border border-brand-gold/30 hover:border-brand-gold/60 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
              title="Buka form pendaftaran walk-in modal"
            >
              <UserPlus className="w-3.5 h-3.5 text-brand-gold" />
              <span>Walk-In Modal</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full liquid-neumorph-card rounded-2xl overflow-hidden border border-white/15 shadow-xl">
        {(selectionBounds || copiedToast) && (
          <div className="px-4 py-2.5 bg-[#0a1929]/95 border-b border-brand-gold/30 flex flex-wrap items-center justify-between gap-2.5 text-xs animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center gap-2">
              {selectionBounds && (
                <span className="px-2.5 py-1 rounded-lg bg-brand-gold/15 text-brand-gold border border-brand-gold/35 font-semibold flex items-center gap-1.5">
                  <ArrowDownUp className="w-3.5 h-3.5" />
                  <span>
                    Block Terpilih:{" "}
                    {selectionBounds.singleColLabel
                      ? `${selectionBounds.rowCount} baris (${selectionBounds.singleColLabel})`
                      : `${selectionBounds.rowCount} baris × ${selectionBounds.colCount} kolom (${selectionBounds.totalCells} sel)`}
                  </span>
                </span>
              )}
              {copiedToast && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{copiedToast}</span>
                </span>
              )}
            </div>

            {selectionBounds && (
              <div className="flex flex-wrap items-center gap-2">
                {selectionBounds.colCount === 1 &&
                  sortedData.length > 1 &&
                  selectionBounds.rowCount < sortedData.length && (
                    <button
                      type="button"
                      onClick={() => handleSelectFullColumn(selectionBounds.minCol)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border border-white/15 font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      title="Block seluruh baris pada kolom ini"
                    >
                      <ArrowDownUp className="w-3.5 h-3.5 text-brand-gold" />
                      <span>Block 1 Kolom Penuh ({sortedData.length})</span>
                    </button>
                  )}

                <button
                  type="button"
                  onClick={copySelectedBlockToClipboard}
                  className="px-3 py-1 rounded-lg bg-brand-gold hover:bg-amber-400 text-[#07131e] font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                  title="Salin data yang di-block ke clipboard (Ctrl+C)"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Block (Ctrl+C)</span>
                </button>

                <button
                  type="button"
                  onClick={clearBlockSelection}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-400/30 font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                  title="Bersihkan seleksi block (Esc)"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Batal</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#091726] text-white border-b-2 border-white/20 select-none">
                <th
                  style={{ width: columnWidths.aksi, minWidth: columnWidths.aksi }}
                  className="relative py-2.5 px-3 text-center sticky left-0 bg-[#091726] z-20 border-r-2 border-b border-white/20 shadow-md select-none group"
                >
                  <div className="flex items-center justify-between gap-1.5 px-0.5">
                    <span className="font-bold text-white text-xs tracking-wider uppercase">Aksi</span>
                    <button
                      type="button"
                      onClick={handleStartAddRow}
                      title="Tambah Baris Baru Langsung (+)"
                      className="w-6 h-6 rounded-full bg-brand-gold hover:bg-amber-400 text-[#07131e] flex items-center justify-center font-bold shadow-md cursor-pointer transition-all active:scale-90 hover:scale-105 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3] text-[#07131e]" />
                    </button>
                  </div>
                  <div
                    draggable={false}
                    onMouseDown={(e) => handleResizeStart("aksi", e)}
                    onDoubleClick={(e) => handleResetColWidth("aksi", e)}
                    title="Tarik untuk ubah lebar / Klik ganda untuk reset"
                    className="absolute right-0 top-0 bottom-0 w-1.5 hover:w-2 hover:bg-brand-gold/80 cursor-col-resize transition-all z-30"
                  />
                </th>

                {columnOrder.map((colKey) => renderHeaderCell(colKey))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {isAddingNewRow && (
                <tr className="bg-brand-gold/[0.08] border-b-2 border-brand-gold/40 shadow-inner">
                  <td
                    style={{ width: columnWidths.aksi, minWidth: columnWidths.aksi }}
                    className="py-2.5 px-3 text-center sticky left-0 bg-[#0c1e30] z-20 border-r-2 border-b border-brand-gold/40 shadow-md"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleSaveNewRow}
                        disabled={isSavingNewRow}
                        title="Simpan Baris Baru"
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-400/50 flex items-center gap-1 text-[11px] font-bold shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        {isSavingNewRow ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-emerald-300 stroke-[3]" />
                        )}
                        <span>Simpan</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelAddRow}
                        disabled={isSavingNewRow}
                        title="Batal Tambah Baris"
                        className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-400/40 flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </td>

                  {columnOrder.map((colKey) => renderNewRowCell(colKey))}
                </tr>
              )}

              {sortedData.length === 0 && !isAddingNewRow ? (
                <tr>
                  <td colSpan={columnOrder.length + 1} className="py-16 text-center text-slate-400">
                    <p className="font-semibold text-sm text-slate-300">
                      Tidak ada data peserta ditemukan.
                    </p>
                    <p className="text-xs mt-1">
                      Sesuaikan kata kunci pencarian atau ubah opsi filter di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                sortedData.map((p, idx) => {
                  const isRowEditing = editingRowId === p.id
                  const waTemplateKey = getDefaultWaTemplateKey(p.status_peserta)
                  const waUrl = getWaLink ? getWaLink(waTemplateKey, p) : ""

                  if (isRowEditing) {
                    return (
                      <tr
                        key={p.id}
                        style={{ contentVisibility: "auto", containIntrinsicSize: "1px 44px" }}
                        className="bg-brand-gold/[0.06] border-b-2 border-brand-gold/30 transition-colors"
                      >
                        <td
                          style={{ width: columnWidths.aksi, minWidth: columnWidths.aksi }}
                          className="py-2.5 px-3 text-center sticky left-0 bg-[#0c1e30] z-20 border-r-2 border-b border-brand-gold/40 shadow-md"
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(p.id)}
                              disabled={isSavingEdit}
                              title="Simpan Perubahan"
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-400/50 flex items-center gap-1 text-[11px] font-bold shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                              {isSavingEdit ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-emerald-300 stroke-[3]" />
                              )}
                              <span>Simpan</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              disabled={isSavingEdit}
                              title="Batal Edit"
                              className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-400/40 flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        </td>

                        {columnOrder.map((colKey) => renderEditCell(colKey))}
                      </tr>
                    )
                  }

                  return (
                    <tr
                      key={p.id}
                      style={{ contentVisibility: "auto", containIntrinsicSize: "1px 44px" }}
                      className="hover:bg-[#0e74f1]/10 transition-colors group odd:bg-white/[0.015] border-b border-white/10"
                    >
                      <td
                        style={{ width: columnWidths.aksi, minWidth: columnWidths.aksi }}
                        className="py-2.5 px-3 text-center sticky left-0 bg-[#081523] z-20 border-r-2 border-b border-white/20 shadow-md"
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(p)}
                            title="Edit Langsung di Tabel"
                            className="w-7 h-7 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-amber-400/30 hover:border-amber-400/60 shadow-sm active:scale-95"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenDetail(p)}
                            title="Detail Profil Lengkap"
                            className="w-7 h-7 rounded-lg bg-sky-500/15 hover:bg-sky-500/30 text-sky-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-sky-400/30 hover:border-sky-400/60 shadow-sm active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenWhatsApp) {
                                onOpenWhatsApp(p)
                              } else if (waUrl) {
                                window.open(waUrl, "_blank")
                              }
                            }}
                            title="Pilih Template & Kirim WhatsApp"
                            className={`w-7 h-7 rounded-lg text-white flex items-center justify-center transition-all shadow-sm cursor-pointer border active:scale-95 ${
                              p.status_peserta === "HADIR"
                                ? "bg-sky-600/80 hover:bg-sky-500 border-sky-400/40"
                                : "bg-emerald-600/80 hover:bg-emerald-500 border-emerald-400/40"
                            }`}
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(p)}
                            title="Hapus Data Peserta"
                            className="w-7 h-7 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-rose-400/30 hover:border-rose-400/60 shadow-sm active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {columnOrder.map((colKey, colIdx) => renderViewCell(colKey, p, idx, colIdx))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 border-t border-white/10 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              Menampilkan <span className="font-bold text-white">{sortedData.length}</span> pendaftar
              {sortedData.length !== participants.length && (
                <span className="text-slate-400"> (tersaring dari total {participants.length})</span>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-white/10 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/20">
                Sesi: {statusSummary.DAPAT_SESI}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">
                Confirmed: {statusSummary.CONFIRMED}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/20">
                Hadir: {statusSummary.HADIR}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/20">
                Selesai: {statusSummary.SELESAI_FULL}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-400/20">
                Batal: {statusSummary.BATAL}
              </span>
              {ENABLE_TKT_WAITING_LIST && (
                <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-400/20">
                  WL: {statusSummary.WAITING_LIST}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              title="Kembali ke Bagian Atas Halaman"
              className="liquid-neumorph-pill px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95 text-xs font-semibold"
            >
              <ArrowUp className="w-3.5 h-3.5 text-brand-gold" />
              <span>Ke Atas</span>
            </button>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <TktDeleteModal
          isOpen={Boolean(deleteTarget)}
          participant={deleteTarget}
          onClose={() => {
            if (!isDeleting) setDeleteTarget(null)
          }}
          onConfirmDelete={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}
