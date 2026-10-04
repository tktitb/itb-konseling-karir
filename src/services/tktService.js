import { supabase } from "./supabaseClient"

export async function getSystemConfig() {
  try {
    const { data, error } = await supabase.from("pengaturan_sistem").select("*")
    if (error) throw error
    const config = {}
    data.forEach((item) => {
      config[item.kunci] = item.nilai
    })
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

export async function submitRegistration(participantData) {
  try {
    const { data: existingParticipant, error: checkError } = await supabase
      .from("peserta_konseling")
      .select("id")
      .eq("email", participantData.email)
      .eq("nomor_wa", participantData.nomor_wa)
      .limit(1)

    if (checkError) throw checkError
    if (existingParticipant && existingParticipant.length > 0) {
      return { success: false, message: "Email dan Nomor WhatsApp ini sudah terdaftar." }
    }

    const config = await getSystemConfig()
    if (!config) throw new Error("Gagal memuat konfigurasi sistem.")

    let psikologListKey = null
    if (participantData.jadwal_hari === config.tanggal_kegiatan_1) {
      psikologListKey = "psikolog_list_1"
    } else if (participantData.jadwal_hari === config.tanggal_kegiatan_2) {
      psikologListKey = "psikolog_list_2"
    }

    let allPsikologsForDay = []
    if (psikologListKey && config[psikologListKey]) {
      try {
        allPsikologsForDay = JSON.parse(config[psikologListKey])
      } catch {
        allPsikologsForDay = ["Psikolog 1", "Psikolog 2", "Psikolog 3", "Psikolog 4", "Psikolog 5"]
      }
    } else {
      allPsikologsForDay = ["Psikolog 1", "Psikolog 2", "Psikolog 3", "Psikolog 4", "Psikolog 5"]
    }

    const { data: existingSlots, error: countError } = await supabase
      .from("peserta_konseling")
      .select("psikolog_bertugas")
      .eq("jadwal_hari", participantData.jadwal_hari)
      .eq("jadwal_sesi", participantData.jadwal_sesi)
      .in("status_peserta", ["DAPAT_SESI", "CONFIRMED", "HADIR", "SELESAI_FULL"])

    if (countError) throw countError
    const takenPsikologs = (existingSlots || []).map((s) => s.psikolog_bertugas)

    let assignedPsikolog = null
    const isPreferenceChosen =
      participantData.psikolog_pilihan &&
      participantData.psikolog_pilihan !== "Siapa saja (Rekomendasi)"

    if (isPreferenceChosen && !takenPsikologs.includes(participantData.psikolog_pilihan)) {
      assignedPsikolog = participantData.psikolog_pilihan
    }

    if (!assignedPsikolog) {
      const availablePsikologs = allPsikologsForDay.filter(
        (p) => !takenPsikologs.includes(p)
      )
      if (availablePsikologs.length > 0) {
        assignedPsikolog = availablePsikologs[0]
      }
    }

    const finalData = { ...participantData }
    if (assignedPsikolog) {
      finalData.status_peserta = "DAPAT_SESI"
      finalData.psikolog_bertugas = assignedPsikolog
    } else {
      finalData.status_peserta = "WAITING_LIST"
      finalData.psikolog_bertugas = null
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
    return { success: false, message: err.message || "Gagal menyimpan pendaftaran." }
  }
}

export async function tambahPesertaManual(participantData) {
  try {
    const { error } = await supabase
      .from("peserta_konseling")
      .insert([participantData])
    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

export async function updatePeserta(id, updateFields) {
  try {
    const { error } = await supabase
      .from("peserta_konseling")
      .update(updateFields)
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
    if (statusBaru === "BATAL") {
      payload.psikolog_bertugas = null
    } else if (newPsikolog !== null) {
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

export async function submitFeedback(feedbackData) {
  try {
    const { data: participant, error: findError } = await supabase
      .from("peserta_konseling")
      .select("id, status_peserta")
      .eq("email", feedbackData.email_pengisi)
      .eq("nomor_wa", feedbackData.nomor_wa_pengisi)
      .single()

    if (findError || !participant) {
      return {
        success: false,
        message: "Data Anda tidak ditemukan. Pastikan email dan nomor WhatsApp sesuai."
      }
    }

    if (participant.status_peserta !== "HADIR") {
      if (participant.status_peserta === "SELESAI_FULL") {
        return { success: false, message: "Anda sudah mengisi feedback sebelumnya." }
      }
      return {
        success: false,
        message: "Feedback hanya dapat diisi jika sesi Anda berstatus HADIR."
      }
    }

    const { error: insertError } = await supabase
      .from("peserta_feedback")
      .insert([feedbackData])
    if (insertError) throw insertError

    await supabase
      .from("peserta_konseling")
      .update({ status_peserta: "SELESAI_FULL" })
      .eq("id", participant.id)

    return { success: true }
  } catch (err) {
    return { success: false, message: err.message || "Gagal mengirim feedback." }
  }
}

const DEFAULT_WA_TEMPLATES = {
  wa_template_konfirmasi_sesi:
    "Halo {{nama_lengkap}},\n\nTerima kasih telah mendaftar Konseling Karier Titian Karir Terpadu (TKT) ITB.\n\nJadwal Anda:\nHari/Tanggal: {{jadwal_hari}}\nPukul: {{jadwal_sesi}}\nPsikolog: {{psikolog_bertugas}}\nLokasi: Booth Konseling Karier TKT ITB\n\nMohon konfirmasi kehadiran Anda dengan membalas pesan ini. Terima kasih!",
  wa_template_waiting_list:
    "Halo {{nama_lengkap}},\n\nTerima kasih telah mendaftar Konseling Karier Titian Karir Terpadu (TKT) ITB.\n\nSaat ini Anda berada di daftar WAITING LIST untuk jadwal:\nHari/Tanggal: {{jadwal_hari}}\nPukul: {{jadwal_sesi}}\n\nJika ada slot yang batal/tersedia, staf admin kami akan segera menghubungi Anda kembali. Terima kasih!",
  wa_template_minta_feedback:
    "Halo {{nama_lengkap}},\n\nTerima kasih telah mengikuti sesi konseling karier di Titian Karir Terpadu (TKT) ITB bersama {{psikolog_bertugas}}.\n\nMohon luangkan waktu 1 menit untuk mengisi formulir feedback berikut:\n{{feedback_url}}\n\nMasukan Anda sangat berharga bagi peningkatan layanan kami!"
}

export async function generateWhatsAppLink(templateKey, participantData, customFeedbackUrl = null) {
  try {
    const config = await getSystemConfig()
    let template = (config && config[templateKey]) || DEFAULT_WA_TEMPLATES[templateKey] || ""

    if (!template) return "#"

    let message = template.replace(/\\n/g, "\n")
    message = message.replace(/{{nama_lengkap}}/g, participantData.nama_lengkap || "")
    message = message.replace(/{{jadwal_hari}}/g, participantData.jadwal_hari || "")
    message = message.replace(/{{jadwal_sesi}}/g, participantData.jadwal_sesi || "")
    message = message.replace(/{{psikolog_bertugas}}/g, participantData.psikolog_bertugas || "Psikolog")
    message = message.replace(
      /{{feedback_url}}/g,
      customFeedbackUrl || `${window.location.origin}/tkt/feedback`
    )

    let rawWa = (participantData.nomor_wa || "").replace(/[\s-+]/g, "")
    if (rawWa.startsWith("0")) {
      rawWa = "62" + rawWa.slice(1)
    }

    return `https://wa.me/${rawWa}?text=${encodeURIComponent(message)}`
  } catch {
    return "#"
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

