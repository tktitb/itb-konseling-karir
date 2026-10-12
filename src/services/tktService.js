import { supabase } from "./supabaseClient"

export const ENABLE_TKT_WAITING_LIST = false

export const SESI_TKT = [
  "09.00-09.45",
  "09.50-10.35",
  "10.40-11.25",
  "11.30-12.15",
  "13.15-14.00",
  "14.05-14.50",
  "14.55-15.40"
]

export const SESI_TKT_META = [
  {
    id: "09.00-09.45",
    number: 1,
    sesiLabel: "Sesi 1",
    timeRange: "09.00 - 09.45",
    compactTime: "09.00-09.45",
    compactLabel: "Sesi 1 (09.00-09.45)",
    fullLabel: "Sesi 1 (09.00 - 09.45 WIB)",
    period: "Pagi"
  },
  {
    id: "09.50-10.35",
    number: 2,
    sesiLabel: "Sesi 2",
    timeRange: "09.50 - 10.35",
    compactTime: "09.50-10.35",
    compactLabel: "Sesi 2 (09.50-10.35)",
    fullLabel: "Sesi 2 (09.50 - 10.35 WIB)",
    period: "Pagi"
  },
  {
    id: "10.40-11.25",
    number: 3,
    sesiLabel: "Sesi 3",
    timeRange: "10.40 - 11.25",
    compactTime: "10.40-11.25",
    compactLabel: "Sesi 3 (10.40-11.25)",
    fullLabel: "Sesi 3 (10.40 - 11.25 WIB)",
    period: "Pagi"
  },
  {
    id: "11.30-12.15",
    number: 4,
    sesiLabel: "Sesi 4",
    timeRange: "11.30 - 12.15",
    compactTime: "11.30-12.15",
    compactLabel: "Sesi 4 (11.30-12.15)",
    fullLabel: "Sesi 4 (11.30 - 12.15 WIB)",
    period: "Pagi"
  },
  {
    id: "13.15-14.00",
    number: 5,
    sesiLabel: "Sesi 5",
    timeRange: "13.15 - 14.00",
    compactTime: "13.15-14.00",
    compactLabel: "Sesi 5 (13.15-14.00)",
    fullLabel: "Sesi 5 (13.15 - 14.00 WIB)",
    period: "Siang"
  },
  {
    id: "14.05-14.50",
    number: 6,
    sesiLabel: "Sesi 6",
    timeRange: "14.05 - 14.50",
    compactTime: "14.05-14.50",
    compactLabel: "Sesi 6 (14.05-14.50)",
    fullLabel: "Sesi 6 (14.05 - 14.50 WIB)",
    period: "Siang"
  },
  {
    id: "14.55-15.40",
    number: 7,
    sesiLabel: "Sesi 7",
    timeRange: "14.55 - 15.40",
    compactTime: "14.55-15.40",
    compactLabel: "Sesi 7 (14.55-15.40)",
    fullLabel: "Sesi 7 (14.55 - 15.40 WIB)",
    period: "Siang"
  }
]

export function getSesiMeta(rawSesi) {
  if (!rawSesi) {
    return {
      id: "",
      number: null,
      sesiLabel: "-",
      timeRange: "-",
      compactTime: "-",
      compactLabel: "-",
      fullLabel: "-",
      period: ""
    }
  }
  const clean = String(rawSesi).trim()
  const found = SESI_TKT_META.find((m) => m.id === clean || clean.includes(m.id))
  if (found) return found
  return {
    id: clean,
    number: null,
    sesiLabel: clean,
    timeRange: clean,
    compactTime: clean,
    compactLabel: clean,
    fullLabel: clean,
    period: ""
  }
}

export function formatSesiCompact(rawSesi) {
  return getSesiMeta(rawSesi).compactLabel
}

export function formatSesiFull(rawSesi) {
  return getSesiMeta(rawSesi).fullLabel
}

export function getActiveEventInfo(config) {
  if (!config) {
    return {
      id: "",
      nama: "Titian Karir Terpadu ITB",
      tanggal: []
    }
  }

  if (config.kegiatan_list) {
    try {
      const parsed = JSON.parse(config.kegiatan_list)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const activeEvent = parsed.find((item) => item.is_active) || parsed[0]
        if (activeEvent) {
          const rawDates = Array.isArray(activeEvent.tanggal) ? activeEvent.tanggal : []
          const cleanDates = rawDates.map((d) => String(d || "").trim()).filter(Boolean)
          if (cleanDates.length > 0) {
            return {
              id: activeEvent.id || config.kegiatan_aktif_id || "",
              nama: activeEvent.nama || config.kegiatan_aktif_nama || "Titian Karir Terpadu ITB",
              tanggal: cleanDates
            }
          }
        }
      }
    } catch {}
  }

  let dates = []
  if (config.tanggal_kegiatan_list) {
    try {
      const parsedList = JSON.parse(config.tanggal_kegiatan_list)
      if (Array.isArray(parsedList) && parsedList.length > 0) {
        dates = parsedList.map((d) => String(d || "").trim()).filter(Boolean)
      }
    } catch {}
  }

  if (dates.length === 0) {
    if (config.tanggal_kegiatan_1) dates.push(String(config.tanggal_kegiatan_1).trim())
    if (config.tanggal_kegiatan_2) dates.push(String(config.tanggal_kegiatan_2).trim())
    dates = dates.filter(Boolean)
  }

  return {
    id: config.kegiatan_aktif_id || "",
    nama: config.kegiatan_aktif_nama || "Titian Karir Terpadu ITB",
    tanggal: dates
  }
}

export function getActiveEventDates(config) {
  return getActiveEventInfo(config).tanggal
}

export function getPsikologListForDate(config, targetDate) {
  const fallback = ["Psikolog 1", "Psikolog 2", "Psikolog 3", "Psikolog 4", "Psikolog 5"]
  if (!config || !targetDate) return fallback

  const activeDates = getActiveEventDates(config)
  const cleanTarget = String(targetDate).trim()
  const dateIdx = activeDates.findIndex((d) => String(d).trim() === cleanTarget)

  if (dateIdx !== -1 && config.psikolog_lists) {
    try {
      const parsedLists = JSON.parse(config.psikolog_lists)
      if (parsedLists && Array.isArray(parsedLists[dateIdx]) && parsedLists[dateIdx].length > 0) {
        return parsedLists[dateIdx]
      }
    } catch {}
  }

  let listKey = null
  if (cleanTarget === String(config.tanggal_kegiatan_1 || "").trim() || dateIdx === 0) {
    listKey = "psikolog_list_1"
  } else if (cleanTarget === String(config.tanggal_kegiatan_2 || "").trim() || dateIdx === 1) {
    listKey = "psikolog_list_2"
  }

  if (listKey && config[listKey]) {
    try {
      const parsed = JSON.parse(config[listKey])
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch {}
  }

  return fallback
}

export function getAllActivePsikologs(config, activeDates = null) {
  const fallback = ["Psikolog 1", "Psikolog 2", "Psikolog 3", "Psikolog 4", "Psikolog 5"]
  if (!config) return fallback

  const dates =
    Array.isArray(activeDates) && activeDates.length > 0
      ? activeDates
      : getActiveEventDates(config)

  const combined = []
  dates.forEach((d) => {
    const list = getPsikologListForDate(config, d)
    list.forEach((psi) => {
      if (psi && !combined.includes(psi)) {
        combined.push(psi)
      }
    })
  })

  if (combined.length > 0) return combined

  try {
    const psi1 = JSON.parse(config.psikolog_list_1 || "[]")
    const psi2 = JSON.parse(config.psikolog_list_2 || "[]")
    const merged = Array.from(new Set([...psi1, ...psi2])).filter(Boolean)
    if (merged.length > 0) return merged
  } catch {}

  return fallback
}

export async function getSystemConfig() {
  try {
    const { data, error } = await supabase.from("pengaturan_sistem").select("*")
    if (error) throw error
    const config = {}
    let hasReminderRow = false
    let hasConfirmUrlInTemplate = false
    data.forEach((item) => {
      config[item.kunci] = item.nilai
      if (item.kunci === "wa_template_reminder" && String(item.nilai || "").trim().length > 0) {
        hasReminderRow = true
      }
      if (
        item.kunci === "wa_template_konfirmasi_sesi" &&
        String(item.nilai || "").includes("{{konfirmasi_url}}")
      ) {
        hasConfirmUrlInTemplate = true
      }
    })
    Object.entries(DEFAULT_WA_TEMPLATES).forEach(([key, defaultVal]) => {
      if (!config[key] || String(config[key]).trim().length === 0) {
        config[key] = defaultVal
      }
    })
    if (!hasConfirmUrlInTemplate) {
      config.wa_template_konfirmasi_sesi = DEFAULT_WA_TEMPLATES.wa_template_konfirmasi_sesi
      supabase
        .from("pengaturan_sistem")
        .upsert(
          {
            kunci: "wa_template_konfirmasi_sesi",
            nilai: DEFAULT_WA_TEMPLATES.wa_template_konfirmasi_sesi
          },
          { onConflict: "kunci" }
        )
        .then(() => {})
        .catch(() => {})
    }
    if (!hasReminderRow) {
      supabase
        .from("pengaturan_sistem")
        .upsert(
          { kunci: "wa_template_reminder", nilai: DEFAULT_WA_TEMPLATES.wa_template_reminder },
          { onConflict: "kunci" }
        )
        .then(() => {})
        .catch(() => {})
    }
    return config
  } catch {
    return null
  }
}

export async function updateSystemConfig(kunciOrObject, nilai) {
  try {
    if (typeof kunciOrObject === "object" && kunciOrObject !== null) {
      const rows = Object.entries(kunciOrObject).map(([k, v]) => ({
        kunci: k,
        nilai: typeof v === "object" ? JSON.stringify(v) : String(v ?? "")
      }))
      const { error } = await supabase
        .from("pengaturan_sistem")
        .upsert(rows, { onConflict: "kunci" })
      if (error) throw error
      return true
    }
    const { error } = await supabase
      .from("pengaturan_sistem")
      .upsert({ kunci: kunciOrObject, nilai: String(nilai ?? "") }, { onConflict: "kunci" })
    if (error) throw error
    return true
  } catch {
    return false
  }
}

export async function toggleRegistrationStatus(status) {
  return await updateSystemConfig("status_pendaftaran", status)
}

export async function getSemuaPeserta() {
  try {
    const { data, error } = await supabase
      .from("peserta_konseling")
      .select("*")
      .order("created_at", { ascending: true })
    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

export function normalizeWhatsAppNumber(raw) {
  if (!raw) return ""
  let clean = String(raw).replace(/\D/g, "")
  if (!clean) return ""
  if (clean.startsWith("6208")) {
    clean = "62" + clean.slice(3)
  } else if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1)
  } else if (clean.startsWith("8")) {
    clean = "62" + clean
  }
  return clean
}

export function getWhatsAppVariants(raw) {
  const rawTrimmed = String(raw || "").trim()
  const clean = normalizeWhatsAppNumber(rawTrimmed)
  if (!clean) return []
  const localZero = clean.startsWith("62") ? "0" + clean.slice(2) : clean
  const plusIntl = clean.startsWith("62") ? "+" + clean : ""
  return Array.from(new Set([rawTrimmed, clean, localZero, plusIntl].filter(Boolean)))
}

export async function checkWhatsAppRegistered(rawNomorWa, activeDates = null, excludeId = null) {
  try {
    const clean = normalizeWhatsAppNumber(rawNomorWa)
    if (!clean || clean.length < 10) return { registered: false }

    const variants = getWhatsAppVariants(rawNomorWa)
    if (variants.length === 0) return { registered: false }

    let datesToFilter = activeDates
    if (!Array.isArray(datesToFilter) || datesToFilter.length === 0) {
      const config = await getSystemConfig()
      if (config) {
        datesToFilter = getActiveEventDates(config)
      }
    }

    let query = supabase
      .from("peserta_konseling")
      .select("id, nama_lengkap, jadwal_hari, jadwal_sesi, status_peserta")
      .in("nomor_wa", variants)
      .neq("status_peserta", "BATAL")

    if (excludeId) {
      query = query.neq("id", excludeId)
    }

    if (Array.isArray(datesToFilter) && datesToFilter.length > 0) {
      query = query.in("jadwal_hari", datesToFilter)
    }

    const { data, error } = await query.limit(1)

    if (error) throw error
    if (data && data.length > 0) {
      return { registered: true, participant: data[0] }
    }
    return { registered: false }
  } catch {
    return { registered: false }
  }
}

export async function getTktSlotAvailability(tanggalHari) {
  try {
    const { data, error } = await supabase
      .from("peserta_konseling")
      .select("id, jadwal_sesi, psikolog_bertugas, status_peserta")
      .eq("jadwal_hari", tanggalHari)
      .in("status_peserta", ["DAPAT_SESI", "CONFIRMED", "HADIR", "SELESAI_FULL"])
    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

export async function submitRegistration(participantData) {
  try {
    const config = await getSystemConfig()
    if (!config) throw new Error("Gagal memuat konfigurasi sistem.")

    const activeDates = getActiveEventDates(config)
    const waCheck = await checkWhatsAppRegistered(participantData.nomor_wa, activeDates)
    if (waCheck.registered) {
      return {
        success: false,
        message: ENABLE_TKT_WAITING_LIST
          ? "Nomor WhatsApp ini sudah terdaftar dalam jadwal/antrean konseling TKT. Setiap nomor WhatsApp hanya dapat mendaftar 1 kali."
          : "Nomor WhatsApp ini sudah terdaftar dalam jadwal konseling TKT pada kegiatan ini. Setiap nomor WhatsApp hanya dapat mendaftar 1 kali."
      }
    }

    let chosenPsikolog = participantData.psikolog_bertugas || participantData.psikolog_pilihan

    let isSlotTaken = false
    if (chosenPsikolog && chosenPsikolog !== "Siapa saja (Rekomendasi)") {
      const { data: existingSlots, error: countError } = await supabase
        .from("peserta_konseling")
        .select("id")
        .eq("jadwal_hari", participantData.jadwal_hari)
        .eq("jadwal_sesi", participantData.jadwal_sesi)
        .eq("psikolog_bertugas", chosenPsikolog)
        .in("status_peserta", ["DAPAT_SESI", "CONFIRMED", "HADIR", "SELESAI_FULL"])
        .limit(1)

      if (countError) throw countError
      if (existingSlots && existingSlots.length > 0) {
        isSlotTaken = true
      }
    }

    const finalData = {
      ...participantData,
      nomor_wa: normalizeWhatsAppNumber(participantData.nomor_wa)
    }

    if (chosenPsikolog && chosenPsikolog !== "Siapa saja (Rekomendasi)") {
      finalData.psikolog_bertugas = chosenPsikolog
      if (isSlotTaken) {
        if (ENABLE_TKT_WAITING_LIST) {
          finalData.status_peserta = "WAITING_LIST"
        } else {
          return {
            success: false,
            message: "Mohon maaf, slot jadwal ini baru saja terisi oleh peserta lain. Silakan pilih sesi atau bilik psikolog lain yang masih tersedia."
          }
        }
      } else {
        finalData.status_peserta = "DAPAT_SESI"
      }
    } else {
      const allPsikologsForDay = getPsikologListForDate(config, participantData.jadwal_hari)

      const { data: existingSlots, error: countError } = await supabase
        .from("peserta_konseling")
        .select("psikolog_bertugas")
        .eq("jadwal_hari", participantData.jadwal_hari)
        .eq("jadwal_sesi", participantData.jadwal_sesi)
        .in("status_peserta", ["DAPAT_SESI", "CONFIRMED", "HADIR", "SELESAI_FULL"])

      if (countError) throw countError
      const takenPsikologs = (existingSlots || []).map((s) => s.psikolog_bertugas)
      const availablePsikologs = allPsikologsForDay.filter((p) => !takenPsikologs.includes(p))

      if (availablePsikologs.length > 0) {
        finalData.psikolog_bertugas = availablePsikologs[0]
        finalData.status_peserta = "DAPAT_SESI"
      } else {
        if (ENABLE_TKT_WAITING_LIST) {
          finalData.psikolog_bertugas = allPsikologsForDay[0] || "Psikolog 1"
          finalData.status_peserta = "WAITING_LIST"
        } else {
          return {
            success: false,
            message: "Mohon maaf, seluruh slot pada sesi ini sudah terisi penuh. Silakan pilih sesi lain yang masih tersedia."
          }
        }
      }
    }

    const { error: insertError } = await supabase
      .from("peserta_konseling")
      .insert([finalData])

    if (insertError) throw insertError

    return {
      success: true,
      status: finalData.status_peserta,
      hari: finalData.jadwal_hari,
      sesi: finalData.jadwal_sesi,
      psikolog: finalData.psikolog_bertugas
    }
  } catch (err) {
    return { success: false, message: err.message || "Gagal memproses pendaftaran." }
  }
}

export async function tambahPesertaManual(participantData) {
  try {
    const formattedData = {
      ...participantData,
      nomor_wa: normalizeWhatsAppNumber(participantData.nomor_wa)
    }
    const { data, error } = await supabase
      .from("peserta_konseling")
      .insert([formattedData])
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

export async function updatePeserta(id, updateFields) {
  try {
    const formattedFields = { ...updateFields }
    if (Object.prototype.hasOwnProperty.call(formattedFields, "nomor_wa")) {
      formattedFields.nomor_wa = normalizeWhatsAppNumber(formattedFields.nomor_wa)
    }
    const { error } = await supabase
      .from("peserta_konseling")
      .update(formattedFields)
      .eq("id", id)
    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

export async function deletePeserta(id) {
  try {
    const { error } = await supabase
      .from("peserta_konseling")
      .delete()
      .eq("id", id)
    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

export async function updateStatusPeserta(id, statusBaru, newPsikolog = null) {
  try {
    const payload = { status_peserta: statusBaru }
    if (newPsikolog !== null) {
      payload.psikolog_bertugas = newPsikolog
    }
    const { error } = await supabase
      .from("peserta_konseling")
      .update(payload)
      .eq("id", id)
    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

export async function getPesertaById(id) {
  try {
    const cleanId = String(id || "").trim()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(cleanId)) {
      return null
    }
    const { data, error } = await supabase
      .from("peserta_konseling")
      .select("*")
      .eq("id", cleanId)
      .maybeSingle()
    if (error) throw error
    return data || null
  } catch {
    return null
  }
}

export async function confirmKehadiranPeserta(id) {
  try {
    const existing = await getPesertaById(id)
    if (!existing) {
      return {
        success: false,
        message: "Data pendaftaran tidak ditemukan atau tautan konfirmasi tidak valid."
      }
    }
    if (
      existing.status_peserta === "CONFIRMED" ||
      existing.status_peserta === "HADIR" ||
      existing.status_peserta === "SELESAI_FULL"
    ) {
      return {
        success: true,
        alreadyConfirmed: true,
        participant: existing
      }
    }
    if (existing.status_peserta === "BATAL") {
      return {
        success: false,
        message: "Jadwal sesi konseling ini tercatat telah dibatalkan.",
        participant: existing
      }
    }
    const { data, error } = await supabase
      .from("peserta_konseling")
      .update({ status_peserta: "CONFIRMED" })
      .eq("id", existing.id)
      .select()
      .single()
    if (error) throw error
    return {
      success: true,
      alreadyConfirmed: false,
      participant: data || { ...existing, status_peserta: "CONFIRMED" }
    }
  } catch (err) {
    return {
      success: false,
      message: err.message || "Gagal menyimpan konfirmasi kehadiran. Silakan coba beberapa saat lagi."
    }
  }
}

export async function promosikanWaitingList(idPeserta, hariOrObj, sesiParam, psikologParam) {
  try {
    let payload = {}
    if (typeof hariOrObj === "object" && hariOrObj !== null) {
      payload = {
        jadwal_hari: hariOrObj.jadwal_hari,
        jadwal_sesi: hariOrObj.jadwal_sesi,
        psikolog_bertugas: hariOrObj.psikolog_bertugas,
        status_peserta: hariOrObj.status_peserta || "CONFIRMED"
      }
    } else {
      payload = {
        jadwal_hari: hariOrObj,
        jadwal_sesi: sesiParam,
        psikolog_bertugas: psikologParam,
        status_peserta: "CONFIRMED"
      }
    }
    const { error } = await supabase
      .from("peserta_konseling")
      .update(payload)
      .eq("id", idPeserta)
    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}


export async function getSemuaFeedback() {
  try {
    const { data, error } = await supabase
      .from("peserta_feedback")
      .select(`
        *,
        peserta_konseling (
          jadwal_hari,
          jadwal_sesi,
          psikolog_bertugas
        )
      `)
      .order("created_at", { ascending: false })
    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

export async function checkPesertaFeedbackExists(pesertaId) {
  try {
    const cleanId = String(pesertaId || "").trim()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(cleanId)) {
      return false
    }
    const { data, error } = await supabase
      .from("peserta_feedback")
      .select("id")
      .eq("peserta_id", cleanId)
      .limit(1)
    if (error) return false
    return Boolean(data && data.length > 0)
  } catch {
    return false
  }
}

export async function getPesertaForFeedbackByWhatsApp(rawNomorWa) {
  try {
    const variants = getWhatsAppVariants(rawNomorWa)
    if (variants.length === 0) {
      return { found: false }
    }

    const [config, queryRes] = await Promise.all([
      getSystemConfig(),
      supabase
        .from("peserta_konseling")
        .select("id, nama_lengkap, email, nomor_wa, jadwal_hari, jadwal_sesi, psikolog_bertugas, status_peserta")
        .in("nomor_wa", variants)
        .neq("status_peserta", "BATAL")
        .order("created_at", { ascending: false })
    ])

    const { data: candidates, error } = queryRes
    if (error || !candidates || candidates.length === 0) {
      return { found: false }
    }

    const activeDates = config ? getActiveEventDates(config) : []
    const activeDateSet = new Set(activeDates.map((d) => String(d || "").trim()).filter(Boolean))

    let pool = candidates
    if (activeDateSet.size > 0) {
      const activePool = candidates.filter((c) =>
        activeDateSet.has(String(c.jadwal_hari || "").trim())
      )
      if (activePool.length > 0) {
        pool = activePool
      }
    }

    const poolIds = pool.map((c) => c.id).filter(Boolean)
    let submittedIdSet = new Set()
    if (poolIds.length > 0) {
      const { data: existingFeedbackRows } = await supabase
        .from("peserta_feedback")
        .select("peserta_id")
        .in("peserta_id", poolIds)
      if (existingFeedbackRows && existingFeedbackRows.length > 0) {
        submittedIdSet = new Set(existingFeedbackRows.map((r) => r.peserta_id).filter(Boolean))
      }
    }

    const unsubmittedPool = pool.filter((c) => !submittedIdSet.has(c.id))
    const targetPool = unsubmittedPool.length > 0 ? unsubmittedPool : pool

    const participant =
      targetPool.find((c) => c.status_peserta === "HADIR") ||
      targetPool.find((c) => c.status_peserta === "SELESAI_FULL") ||
      targetPool.find((c) => c.status_peserta === "CONFIRMED") ||
      targetPool.find((c) => c.status_peserta === "DAPAT_SESI") ||
      targetPool[0]

    if (!participant) {
      return { found: false }
    }

    return {
      found: true,
      alreadySubmitted: submittedIdSet.has(participant.id),
      participant
    }
  } catch {
    return { found: false }
  }
}

export async function submitFeedback(feedbackData) {
  try {
    const rawWa = String(feedbackData.nomor_wa_pengisi || "").trim()
    const emailClean = String(feedbackData.email_pengisi || "").trim()
    const explicitPesertaId = String(feedbackData.peserta_id || "").trim()

    let participant = null

    if (explicitPesertaId) {
      participant = await getPesertaById(explicitPesertaId)
    }

    if (!participant) {
      const lookupRes = await getPesertaForFeedbackByWhatsApp(rawWa)
      if (lookupRes.found && lookupRes.participant) {
        participant = lookupRes.participant
      }
    }

    if (!participant) {
      return {
        success: false,
        message: "Data peserta dengan nomor WhatsApp tersebut tidak ditemukan. Pastikan nomor WhatsApp sesuai dengan yang Anda daftarkan."
      }
    }

    if (
      participant.status_peserta === "BATAL" ||
      participant.status_peserta === "WAITING_LIST"
    ) {
      return {
        success: false,
        message: "Anda hanya dapat mengisi feedback untuk jadwal sesi konseling yang aktif."
      }
    }

    const alreadyHasFeedback = await checkPesertaFeedbackExists(participant.id)
    if (alreadyHasFeedback) {
      return {
        success: false,
        message: "Anda sudah pernah mengisi feedback untuk sesi konseling ini sebelumnya."
      }
    }

    const finalNama = String(feedbackData.nama_pengisi || participant.nama_lengkap || "").trim()
    const finalEmail = emailClean || String(participant.email || "").trim()
    const finalWa = rawWa || String(participant.nomor_wa || "").trim()

    const feedbackInsertData = {
      peserta_id: participant.id,
      nama_pengisi: finalNama,
      email_pengisi: finalEmail,
      nomor_wa_pengisi: finalWa,
      rating_kepuasan: parseInt(feedbackData.rating_kepuasan, 10),
      rating_materi: parseInt(feedbackData.rating_materi, 10),
      rating_pemahaman_karir: parseInt(feedbackData.rating_pemahaman_karir, 10),
      rating_fasilitator: parseInt(feedbackData.rating_fasilitator, 10),
      rating_motivasi: parseInt(feedbackData.rating_motivasi, 10),
      info_sumber: feedbackData.info_sumber,
      info_sumber_lain:
        feedbackData.info_sumber === "Yang lain"
          ? String(feedbackData.info_sumber_lain || "").trim() || null
          : null,
      durasi_sesi: feedbackData.durasi_sesi,
      aspek_lain: String(feedbackData.aspek_lain || "").trim() || null,
      rencana_ikut_lagi: feedbackData.rencana_ikut_lagi,
      saran_feedback: String(feedbackData.saran_feedback || "").trim() || null
    }

    const { error: insertError } = await supabase
      .from("peserta_feedback")
      .insert([feedbackInsertData])
    if (insertError) throw insertError

    const { error: updateStatusError } = await supabase
      .from("peserta_konseling")
      .update({ status_peserta: "SELESAI_FULL" })
      .eq("id", participant.id)
    if (updateStatusError) throw updateStatusError

    return { success: true, participant }
  } catch (err) {
    return {
      success: false,
      message: err.message || "Terjadi kesalahan pada sistem. Silakan coba lagi nanti."
    }
  }
}

export const DEFAULT_WA_TEMPLATES = {
  wa_template_konfirmasi_sesi:
    "[KONFIRMASI JADWAL - KONSELING KARIER TITIAN KARIR TERPADU ITB]\n\nHalo {{nama_lengkap}},\n\nTerima kasih telah mendaftar pada layanan Konseling Karier Titian Karir Terpadu (TKT) ITB. Berikut adalah rincian jadwal sesi konseling Anda:\n\nTanggal: {{jadwal_hari}}\nWaktu: {{jadwal_sesi}} WIB\nPsikolog: {{psikolog_bertugas}}\nLokasi: Aula Timur ITB\n\nSebagai tambahan, Anda juga dapat mengunjungi kegiatan Titian Karir Terpadu ITB dengan melakukan registrasi tiket melalui tautan berikut:\nhttps://tiket.karir.itb.ac.id/ticket-registration/\n\nBagi peserta yang ingin membawa CV (soft file maupun hardcopy) sangat diperbolehkan.\n\nMohon konfirmasi kehadiran Anda dengan mengklik tautan konfirmasi pribadi berikut:\n{{konfirmasi_url}}\n\nAtau Anda juga dapat mengonfirmasi dengan membalas pesan ini menggunakan format:\n{{nama_lengkap}}_HADIR/TIDAK HADIR\n\nTerima kasih dan sampai bertemu di sesi Konseling Karier!\n\nSalam,\nTim Konseling Karier ITB Career Center",
  wa_template_reminder:
    "[REMINDER JADWAL - KONSELING KARIER TITIAN KARIR TERPADU ITB]\n\nHalo {{nama_lengkap}},\n\nTerima kasih telah mengonfirmasi kehadiran Anda pada layanan Konseling Karier Titian Karir Terpadu (TKT) ITB. Kami ingin mengingatkan kembali rincian jadwal sesi konseling Anda:\n\nTanggal: {{jadwal_hari}}\nWaktu: {{jadwal_sesi}} WIB\nPsikolog: {{psikolog_bertugas}}\nLokasi: Aula Timur ITB\n\nMohon hadir 10-15 menit sebelum sesi dimulai untuk melakukan registrasi ulang di lokasi konseling. Jangan lupa menyiapkan tiket masuk TKT ITB serta CV Anda (soft file maupun hardcopy) apabila diperlukan.\n\nTerima kasih dan sampai bertemu di sesi Konseling Karier!\n\nSalam,\nTim Konseling Karier ITB Career Center",
  wa_template_waiting_list:
    "[INFORMASI WAITING LIST - KONSELING KARIER TITIAN KARIR TERPADU ITB]\n\nHalo {{nama_lengkap}},\n\nTerima kasih telah mendaftar pada layanan Konseling Karier Titian Karir Terpadu (TKT) ITB. Mohon maaf, karena seluruh kuota utama pada sesi pilihan Anda telah terisi, saat ini Anda tercatat dalam daftar antrean (Waiting List) untuk jadwal berikut:\n\nTanggal: {{jadwal_hari}}\nWaktu: {{jadwal_sesi}} WIB\nLokasi: Aula Timur ITB\n\nApabila terdapat slot yang kosong atau batal, tim kami akan segera menghubungi Anda kembali. Sebagai alternatif, Anda juga dapat mengikuti layanan Konseling Karier Reguler ITB Career Center (Offline di GKU Timur ITB setiap hari Senin, atau Online setiap hari Jumat/Sabtu) dengan menghubungi WhatsApp ITB Career Center di:\n081111119463\n\nTerima kasih atas antusiasme Anda!\n\nSalam,\nTim Konseling Karier ITB Career Center",
  wa_template_minta_feedback:
    "[PERMOHONAN FEEDBACK - KONSELING KARIER TITIAN KARIR TERPADU ITB]\n\nHalo {{nama_lengkap}},\n\nTerima kasih telah mengikuti layanan Konseling Karier Titian Karir Terpadu (TKT) ITB dengan rincian sesi berikut:\n\nTanggal: {{jadwal_hari}}\nWaktu: {{jadwal_sesi}} WIB\nPsikolog: {{psikolog_bertugas}}\nLokasi: Aula Timur ITB\n\nUntuk membantu kami meningkatkan kualitas layanan di masa mendatang, mohon kesediaan Anda meluangkan waktu sejenak untuk mengisi formulir evaluasi (feedback) melalui tautan berikut:\n{{feedback_url}}\n\nMasukan dan evaluasi Anda sangat berarti bagi kami. Terima kasih atas partisipasi Anda, semoga sukses selalu dalam perjalanan karier Anda!\n\nSalam,\nTim Konseling Karier ITB Career Center"
}

export function getDefaultWaTemplateKey(statusPeserta) {
  if (ENABLE_TKT_WAITING_LIST && statusPeserta === "WAITING_LIST") {
    return "wa_template_waiting_list"
  }
  if (statusPeserta === "CONFIRMED") {
    return "wa_template_reminder"
  }
  if (statusPeserta === "HADIR" || statusPeserta === "SELESAI_FULL") {
    return "wa_template_minta_feedback"
  }
  return "wa_template_konfirmasi_sesi"
}

export function buildWhatsAppText(participantData, templateKeyOrText, config = null, customFeedbackUrl = null) {
  if (!participantData) return ""
  let template = ""
  if (config && config[templateKeyOrText]) {
    template = config[templateKeyOrText]
  } else if (DEFAULT_WA_TEMPLATES[templateKeyOrText]) {
    template = DEFAULT_WA_TEMPLATES[templateKeyOrText]
  } else if (typeof templateKeyOrText === "string" && templateKeyOrText.trim().length > 0) {
    template = templateKeyOrText
  } else {
    template = DEFAULT_WA_TEMPLATES.wa_template_konfirmasi_sesi || ""
  }

  if (!template) return ""

  const originUrl = typeof window !== "undefined" ? window.location.origin : ""
  const feedbackUrl =
    customFeedbackUrl ||
    (participantData.id
      ? `${originUrl}/tkt/feedback/${participantData.id}`
      : `${originUrl}/tkt/feedback`)
  const konfirmasiUrl = participantData.id
    ? `${originUrl}/tkt/konfirmasi/${participantData.id}`
    : `${originUrl}/tkt`
  const activeEventName = (config && config.kegiatan_aktif_nama) || "Titian Karir Terpadu ITB"

  let message = template.replace(/\\n/g, "\n")
  message = message.replace(/{{nama_lengkap}}/g, participantData.nama_lengkap || "")
  message = message.replace(/{{jadwal_hari}}/g, participantData.jadwal_hari || "")
  message = message.replace(
    /{{jadwal_sesi}}/g,
    participantData.jadwal_sesi ? formatSesiCompact(participantData.jadwal_sesi) : ""
  )
  message = message.replace(/{{psikolog_bertugas}}/g, participantData.psikolog_bertugas || "Psikolog Bertugas")
  message = message.replace(/{{asal_univ}}/g, participantData.asal_univ || "")
  message = message.replace(/{{jurusan}}/g, participantData.jurusan || "")
  message = message.replace(/{{angkatan}}/g, participantData.angkatan || "")
  message = message.replace(/{{feedback_url}}/g, feedbackUrl)
  message = message.replace(/{{konfirmasi_url}}/g, konfirmasiUrl)
  message = message.replace(/{{nama_kegiatan}}/g, activeEventName)

  return message
}

export function formatWhatsAppMessage(participantData, templateKeyOrText, config = null, customFeedbackUrl = null) {
  const message = buildWhatsAppText(participantData, templateKeyOrText, config, customFeedbackUrl)
  if (!message) return ""

  const cleanWa = normalizeWhatsAppNumber(participantData.nomor_wa || "")
  if (!cleanWa) return ""

  return `https://wa.me/${cleanWa}?text=${encodeURIComponent(message)}`
}

export async function generateWhatsAppLink(templateKey, participantData, customFeedbackUrl = null) {
  try {
    const config = await getSystemConfig()
    return formatWhatsAppMessage(participantData, templateKey, config, customFeedbackUrl)
  } catch {
    return formatWhatsAppMessage(participantData, templateKey, null, customFeedbackUrl)
  }
}

export function subscribeToPesertaChanges(callback) {
  const channel = supabase.channel("peserta_changes_tkt")
  channel
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "peserta_konseling" },
      () => {
        callback()
      }
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

export const subscribePesertaRealtime = subscribeToPesertaChanges

