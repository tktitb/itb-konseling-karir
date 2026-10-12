import React, { useState, useEffect, useRef } from "react"
import { Link, useParams } from "react-router-dom"
import {
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  UserCheck,
  MessageSquareHeart,
  ChevronDown,
  Loader2,
  Lock,
  X
} from "lucide-react"
import {
  submitFeedback,
  getSystemConfig,
  getActiveEventInfo,
  getPesertaById,
  getPesertaForFeedbackByWhatsApp,
  checkPesertaFeedbackExists,
  formatSesiFull
} from "../../services/tktService"
import {
  validateFullName,
  validateWhatsApp,
  validateEmail,
  sanitizeWhatsAppInput,
  formatWhatsAppDisplay
} from "../../utils/validationUtils"

const RATING_QUESTIONS = [
  {
    name: "rating_kepuasan",
    number: 1,
    question: "Seberapa puas Anda dengan sesi Konseling Karier yang Anda ikuti?",
    labelMin: "Sangat Tidak Puas",
    labelMax: "Sangat Puas"
  },
  {
    name: "rating_materi",
    number: 2,
    question: "Bagaimana pendapat Anda mengenai materi yang disampaikan?",
    labelMin: "Sangat Kurang",
    labelMax: "Sangat Baik"
  },
  {
    name: "rating_pemahaman_karir",
    number: 3,
    question: "Apakah sesi ini membantu Anda memahami lebih lanjut mengenai karier?",
    labelMin: "Sangat Tidak Membantu",
    labelMax: "Sangat Membantu"
  },
  {
    name: "rating_fasilitator",
    number: 4,
    question: "Bagaimana kualitas fasilitator/konselor yang memandu sesi?",
    labelMin: "Sangat Kurang",
    labelMax: "Sangat Baik"
  },
  {
    name: "rating_motivasi",
    number: 5,
    question: "Apakah Anda merasa termotivasi setelah mengikuti sesi ini?",
    labelMin: "Sangat Tidak Terdorong",
    labelMax: "Sangat Terdorong"
  }
]

const INFO_SUMBER_OPTIONS = [
  { value: "Media Sosial ITB Career Center", label: "Media Sosial ITB Career Center" },
  { value: "Website ITB Career Center", label: "Website ITB Career Center" },
  { value: "Rekomendasi Teman", label: "Rekomendasi Teman" },
  { value: "Email Pemberitahuan", label: "Email Pemberitahuan" },
  { value: "Yang lain", label: "Yang lain..." }
]

const DURASI_OPTIONS = ["Terlalu Pendek", "Cukup", "Terlalu Lama"]
const RENCANA_OPTIONS = ["Ya", "Tidak", "Mungkin"]

const sanitizeParticipantEmail = (rawEmail) => {
  const trimmed = String(rawEmail || "").trim()
  return trimmed === "-" ? "" : trimmed
}

const getParticipantStatusBadge = (status) => {
  switch (status) {
    case "SELESAI_FULL":
      return {
        label: "Selesai Konseling",
        cls: "bg-blue-500/15 text-blue-300 border-blue-400/30"
      }
    case "HADIR":
      return {
        label: "Hadir di Lokasi",
        cls: "bg-amber-500/15 text-amber-300 border-amber-400/30"
      }
    case "CONFIRMED":
      return {
        label: "Terkonfirmasi",
        cls: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30"
      }
    case "DAPAT_SESI":
      return {
        label: "Dapat Sesi",
        cls: "bg-sky-500/15 text-sky-300 border-sky-400/30"
      }
    case "WAITING_LIST":
      return {
        label: "Waiting List",
        cls: "bg-orange-500/15 text-orange-300 border-orange-400/30"
      }
    default:
      return {
        label: status || "Terdaftar",
        cls: "bg-slate-500/15 text-slate-300 border-slate-400/30"
      }
  }
}

export default function TktFeedbackPage() {
  const { id: routePesertaId } = useParams()
  const [submitted, setSubmitted] = useState(false)
  const [alreadySubmittedOnLoad, setAlreadySubmittedOnLoad] = useState(false)
  const [submittedParticipant, setSubmittedParticipant] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [loadingPersonalLink, setLoadingPersonalLink] = useState(Boolean(routePesertaId))
  const [isPersonalLocked, setIsPersonalLocked] = useState(false)
  const [personalLinkNotFound, setPersonalLinkNotFound] = useState(false)
  const [waLookupStatus, setWaLookupStatus] = useState("idle")
  const [matchedParticipant, setMatchedParticipant] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [activeEventName, setActiveEventName] = useState("TKT ITB")
  const [hoveredRatings, setHoveredRatings] = useState({})
  const [errors, setErrors] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const waLookupTimerRef = useRef(null)

  const [formData, setFormData] = useState({
    peserta_id: "",
    nomor_wa_pengisi: "",
    nama_pengisi: "",
    email_pengisi: "",
    rating_kepuasan: 0,
    rating_materi: 0,
    rating_pemahaman_karir: 0,
    rating_fasilitator: 0,
    rating_motivasi: 0,
    info_sumber: "",
    info_sumber_lain: "",
    durasi_sesi: "",
    aspek_lain: "",
    rencana_ikut_lagi: "",
    saran_feedback: ""
  })

  useEffect(() => {
    let isMounted = true
    async function fetchInitialContext() {
      try {
        const cfgPromise = getSystemConfig()
        const pesertaPromise = routePesertaId
          ? getPesertaById(routePesertaId)
          : Promise.resolve(null)
        const hasFeedbackPromise = routePesertaId
          ? checkPesertaFeedbackExists(routePesertaId)
          : Promise.resolve(false)

        const [cfg, pesertaData, hasFeedbackRecord] = await Promise.all([
          cfgPromise,
          pesertaPromise,
          hasFeedbackPromise
        ])

        if (!isMounted) return

        if (cfg) {
          const info = getActiveEventInfo(cfg)
          if (info && (info.nama || info.nama_kegiatan)) {
            setActiveEventName(info.nama || info.nama_kegiatan)
          }
        }

        if (routePesertaId) {
          if (pesertaData && pesertaData.status_peserta !== "BATAL") {
            const displayWa = formatWhatsAppDisplay(pesertaData.nomor_wa || "")
            const cleanEmail = sanitizeParticipantEmail(pesertaData.email)
            setFormData((prev) => ({
              ...prev,
              peserta_id: pesertaData.id || "",
              nomor_wa_pengisi: displayWa,
              nama_pengisi: pesertaData.nama_lengkap || "",
              email_pengisi: cleanEmail
            }))
            setMatchedParticipant(pesertaData)
            setIsPersonalLocked(true)
            setPersonalLinkNotFound(false)

            if (hasFeedbackRecord) {
              setSubmittedParticipant(pesertaData)
              setAlreadySubmittedOnLoad(true)
            } else {
              setAlreadySubmittedOnLoad(false)
            }
          } else {
            setIsPersonalLocked(false)
            setPersonalLinkNotFound(true)
            setMatchedParticipant(null)
            setFormData((prev) => ({
              ...prev,
              peserta_id: "",
              nomor_wa_pengisi: "",
              nama_pengisi: "",
              email_pengisi: ""
            }))
          }
          setLoadingPersonalLink(false)
        } else {
          setIsPersonalLocked(false)
          setPersonalLinkNotFound(false)
          setAlreadySubmittedOnLoad(false)
          setMatchedParticipant(null)
          setWaLookupStatus("idle")
          setFormData((prev) => ({
            ...prev,
            peserta_id: "",
            nomor_wa_pengisi: "",
            nama_pengisi: "",
            email_pengisi: ""
          }))
          setLoadingPersonalLink(false)
        }
      } catch {
        if (isMounted) {
          setActiveEventName("TKT ITB")
          setLoadingPersonalLink(false)
        }
      }
    }
    fetchInitialContext()
    return () => {
      isMounted = false
    }
  }, [routePesertaId])

  const triggerWhatsAppAutoFill = async (sanitizedWa) => {
    const waCheck = validateWhatsApp(sanitizedWa)
    if (!waCheck.isValid) {
      setWaLookupStatus("idle")
      setMatchedParticipant(null)
      return null
    }

    setWaLookupStatus("loading")
    const res = await getPesertaForFeedbackByWhatsApp(sanitizedWa)
    if (res.found && res.participant) {
      const cleanEmail = sanitizeParticipantEmail(res.participant.email)
      setMatchedParticipant(res.participant)
      setFormData((prev) => ({
        ...prev,
        peserta_id: res.participant.id || "",
        nama_pengisi: res.participant.nama_lengkap || prev.nama_pengisi,
        email_pengisi: cleanEmail || sanitizeParticipantEmail(prev.email_pengisi)
      }))
      setErrors((prev) => ({
        ...prev,
        nomor_wa_pengisi: null,
        nama_pengisi: null,
        email_pengisi: null
      }))
      if (res.alreadySubmitted) {
        setWaLookupStatus("already_submitted")
      } else {
        setWaLookupStatus("found")
      }
      return res.participant
    } else {
      setMatchedParticipant(null)
      setFormData((prev) => ({
        ...prev,
        peserta_id: "",
        nama_pengisi: "",
        email_pengisi: ""
      }))
      setWaLookupStatus("not_found")
      return null
    }
  }

  const handleWhatsAppChange = (rawVal) => {
    if (isPersonalLocked) return
    const cleaned = sanitizeWhatsAppInput(rawVal)
    setFormData((prev) => ({
      ...prev,
      peserta_id: "",
      nomor_wa_pengisi: cleaned
    }))
    if (errors.nomor_wa_pengisi) {
      setErrors((prev) => ({ ...prev, nomor_wa_pengisi: null }))
    }
    if (errorMessage) {
      setErrorMessage("")
    }

    if (waLookupTimerRef.current) {
      clearTimeout(waLookupTimerRef.current)
    }

    const waCheck = validateWhatsApp(cleaned)
    if (!waCheck.isValid) {
      setWaLookupStatus("idle")
      setMatchedParticipant(null)
      if (!cleaned) {
        setFormData((prev) => ({
          ...prev,
          peserta_id: "",
          nama_pengisi: "",
          email_pengisi: ""
        }))
      }
      return
    }

    waLookupTimerRef.current = setTimeout(() => {
      triggerWhatsAppAutoFill(cleaned)
    }, 300)
  }

  const handleWhatsAppBlur = () => {
    if (isPersonalLocked) return
    if (waLookupTimerRef.current) {
      clearTimeout(waLookupTimerRef.current)
    }
    const cleaned = sanitizeWhatsAppInput(formData.nomor_wa_pengisi)
    if (!cleaned) return
    const waCheck = validateWhatsApp(cleaned)
    if (!waCheck.isValid) {
      setErrors((prev) => ({ ...prev, nomor_wa_pengisi: waCheck.error }))
      setWaLookupStatus("idle")
      setMatchedParticipant(null)
      return
    }
    triggerWhatsAppAutoFill(cleaned)
  }

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
    if (errorMessage) {
      setErrorMessage("")
    }
  }

  const validateAllFields = (overrideData = null) => {
    const targetData = overrideData || formData
    const newErrors = {}

    if (!isPersonalLocked) {
      const waCheck = validateWhatsApp(targetData.nomor_wa_pengisi)
      if (!waCheck.isValid) {
        newErrors.nomor_wa_pengisi = waCheck.error
      }

      const nameCheck = validateFullName(targetData.nama_pengisi)
      if (!nameCheck.isValid) {
        newErrors.nama_pengisi = nameCheck.error
      }

      const cleanedEmail = sanitizeParticipantEmail(targetData.email_pengisi)
      const emailCheck = validateEmail(cleanedEmail, false)
      if (!emailCheck.isValid) {
        newErrors.email_pengisi = emailCheck.error
      }
    }

    RATING_QUESTIONS.forEach((q) => {
      const val = Number(targetData[q.name]) || 0
      if (val < 1 || val > 5) {
        newErrors[q.name] = "Pertanyaan penilaian ini wajib diisi (pilih 1 sampai 5 bintang)."
      }
    })

    if (!targetData.info_sumber) {
      newErrors.info_sumber = "Pilih sumber informasi terlebih dahulu."
    } else if (
      targetData.info_sumber === "Yang lain" &&
      !String(targetData.info_sumber_lain || "").trim()
    ) {
      newErrors.info_sumber_lain = "Mohon sebutkan sumber informasi lainnya."
    }

    if (!targetData.durasi_sesi) {
      newErrors.durasi_sesi = "Pertanyaan durasi sesi wajib dipilih."
    }

    if (!targetData.rencana_ikut_lagi) {
      newErrors.rencana_ikut_lagi = "Pertanyaan rencana mengikuti acara serupa wajib dipilih."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInitialSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")

    if (waLookupTimerRef.current) {
      clearTimeout(waLookupTimerRef.current)
    }

    let dataToValidate = {
      ...formData,
      email_pengisi: sanitizeParticipantEmail(formData.email_pengisi)
    }

    if (!isPersonalLocked) {
      const cleanedWa = sanitizeWhatsAppInput(formData.nomor_wa_pengisi)
      const waCheck = validateWhatsApp(cleanedWa)
      if (waCheck.isValid && (!formData.peserta_id || !String(formData.nama_pengisi || "").trim())) {
        const resolvedParticipant = await triggerWhatsAppAutoFill(cleanedWa)
        if (resolvedParticipant) {
          const cleanResolvedEmail = sanitizeParticipantEmail(resolvedParticipant.email)
          dataToValidate = {
            ...dataToValidate,
            peserta_id: resolvedParticipant.id || "",
            nama_pengisi: resolvedParticipant.nama_lengkap || dataToValidate.nama_pengisi,
            email_pengisi: cleanResolvedEmail || dataToValidate.email_pengisi
          }
        }
      }
    }

    if (!validateAllFields(dataToValidate)) {
      setErrorMessage("Mohon perbaiki isian Anda pada bagian yang ditandai merah.")
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    setConfirmOpen(true)
  }

  const handleConfirmSubmit = async () => {
    setSubmitting(true)
    setErrorMessage("")
    try {
      const nameCheck = validateFullName(formData.nama_pengisi)
      const cleanedEmail = sanitizeParticipantEmail(formData.email_pengisi)
      const emailCheck = validateEmail(cleanedEmail, false)
      const waCheck = validateWhatsApp(formData.nomor_wa_pengisi)

      const payload = {
        ...formData,
        peserta_id: formData.peserta_id || (isPersonalLocked ? routePesertaId : ""),
        nama_pengisi: nameCheck.cleanValue || String(formData.nama_pengisi || "").trim(),
        email_pengisi: emailCheck.cleanValue || cleanedEmail,
        nomor_wa_pengisi: waCheck.cleanValue || sanitizeWhatsAppInput(formData.nomor_wa_pengisi)
      }

      const result = await submitFeedback(payload)

      if (result && result.success) {
        setConfirmOpen(false)
        setSubmittedParticipant(result.participant || matchedParticipant || null)
        setSubmitted(true)
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        setConfirmOpen(false)
        setErrorMessage(
          result?.message || "Gagal mengirimkan feedback. Pastikan nomor WhatsApp sesuai dengan yang Anda daftarkan."
        )
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    } catch (err) {
      setConfirmOpen(false)
      setErrorMessage(err.message || "Terjadi kesalahan pada sistem. Silakan coba lagi nanti.")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingPersonalLink) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl p-8 liquid-neumorph-card border-t border-l border-white/20 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl liquid-neumorph-inset border border-brand-gold/30 text-brand-gold flex items-center justify-center mx-auto">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <h2 className="text-lg font-semibold text-white">Memuat Data Peserta...</h2>
          <p className="text-xs text-slate-300">
            Menyiapkan formulir feedback pribadi Anda dari tautan WhatsApp.
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl rounded-3xl p-8 sm:p-10 liquid-neumorph-card border-t border-l border-white/20 shadow-2xl text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full liquid-neumorph-inset border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Terima Kasih!
          </h2>

          <p className="mt-3 text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Feedback Anda telah berhasil kami terima,{" "}
            <strong className="text-white font-semibold">{formData.nama_pengisi}</strong>. Kontribusi
            dan masukan Anda sangat berarti bagi peningkatan kualitas layanan konseling karier ITB
            Career Center.
          </p>

          {submittedParticipant && (
            <div className="mt-6 p-4 rounded-2xl liquid-neumorph-inset text-left text-xs sm:text-sm space-y-2 border border-white/10">
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-slate-400">Hari Kegiatan:</span>
                <span className="font-semibold text-white">
                  {submittedParticipant.jadwal_hari || "-"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-slate-400">Sesi Konseling:</span>
                <span className="font-semibold text-brand-gold">
                  {submittedParticipant.jadwal_sesi
                    ? formatSesiFull(submittedParticipant.jadwal_sesi)
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Psikolog:</span>
                <span className="font-semibold text-white">
                  {submittedParticipant.psikolog_bertugas || "-"}
                </span>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Link
              to="/tkt"
              className="liquid-btn-gold px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all inline-flex items-center gap-2 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Utama TKT</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const participantBadge = matchedParticipant
    ? getParticipantStatusBadge(matchedParticipant.status_peserta)
    : null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/tkt"
          className="liquid-neumorph-inset px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white border border-white/10 inline-flex items-center gap-2 transition-all active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-brand-gold" />
          <span>Halaman Jadwal TKT</span>
        </Link>

        <div className="liquid-neumorph-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-gold/10 border-t border-brand-gold/30 text-brand-gold text-xs font-semibold uppercase tracking-wider">
          <MessageSquareHeart className="w-3.5 h-3.5" />
          <span>Evaluasi Peserta</span>
        </div>
      </div>

      <div className="rounded-3xl liquid-neumorph-card border-t border-l border-white/20 shadow-2xl overflow-hidden">
        <div className="px-6 sm:px-10 py-8 sm:py-10 border-b border-white/10 bg-[#081523]/60 text-center relative">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-white/95 shadow-lg border border-white/40 flex items-center justify-center p-0.5 mx-auto mb-4">
            <img
              src="/images/logo.jpg"
              alt="ITB Career Center"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.target.style.display = "none"
              }}
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Feedback Konseling Karier
          </h1>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Terima kasih atas partisipasi Anda dalam kegiatan{" "}
            <span className="text-brand-gold font-semibold">{activeEventName}</span>. Masukan Anda
            sangat berharga untuk membantu kami meningkatkan kualitas layanan konseling di masa
            mendatang.
          </p>
        </div>

        <div className="p-6 sm:p-10">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/35 text-rose-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-rose-300">Pengiriman Feedback Belum Berhasil</p>
                <p className="text-rose-200/90 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {alreadySubmittedOnLoad && (
            <div className="mb-6 p-4 rounded-2xl bg-sky-500/15 border border-sky-500/35 text-sky-200 text-xs sm:text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-sky-400 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-sky-300">Evaluasi Sebelumnya Sudah Tercatat</p>
                <p className="text-sky-200/90 leading-relaxed">
                  Halo <strong className="text-white">{formData.nama_pengisi}</strong>, Anda sudah pernah mengirimkan evaluasi untuk sesi ini. Anda tetap dapat mengisi formulir di bawah ini jika ingin memperbarui penilaian Anda.
                </p>
              </div>
            </div>
          )}

          {personalLinkNotFound && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-amber-300">Tautan Pribadi Tidak Ditemukan</p>
                <p className="text-amber-200/90 leading-relaxed">
                  Silakan masukkan Nomor WhatsApp yang Anda daftarkan di bawah ini untuk mengisi data Anda secara otomatis.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleInitialSubmit} className="space-y-8" noValidate>
            <div className="liquid-neumorph-inset p-5 sm:p-6 rounded-2xl border border-white/10 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl liquid-neumorph-pill bg-brand-gold/15 border-t border-brand-gold/30 flex items-center justify-center text-brand-gold shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-semibold text-white">
                      Validasi Data Peserta
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      {isPersonalLocked
                        ? "Data Anda telah terisi dan terkunci otomatis dari tautan pribadi WhatsApp."
                        : "Masukkan Nomor WhatsApp yang Anda daftarkan agar Nama Lengkap & Email terisi otomatis."}
                    </p>
                  </div>
                </div>

                {isPersonalLocked && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <Lock className="w-3 h-3" />
                    <span>Data Terverifikasi</span>
                  </span>
                )}
              </div>

              {matchedParticipant && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>
                      Sesi Terdaftar: {matchedParticipant.jadwal_hari || "-"} •{" "}
                      {matchedParticipant.jadwal_sesi
                        ? formatSesiFull(matchedParticipant.jadwal_sesi)
                        : "-"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-300 font-medium">
                      Psikolog: <strong className="text-white">{matchedParticipant.psikolog_bertugas || "-"}</strong>
                    </span>
                    {participantBadge && (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${participantBadge.cls}`}
                      >
                        {participantBadge.label}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                    Nomor WhatsApp <span className="text-amber-400 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={14}
                      name="nomor_wa_pengisi"
                      required
                      disabled={isPersonalLocked}
                      value={formData.nomor_wa_pengisi}
                      onChange={(e) => handleWhatsAppChange(e.target.value)}
                      onBlur={handleWhatsAppBlur}
                      placeholder="Ketik nomor WhatsApp Anda (contoh: 081234567890)"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium placeholder-slate-500 liquid-neumorph-inset border transition-all focus:outline-none ${
                        isPersonalLocked
                          ? "bg-[#06101b]/90 text-slate-300 border-white/10 opacity-80 cursor-not-allowed"
                          : errors.nomor_wa_pengisi
                          ? "bg-[#091726]/85 text-white border-rose-500/70 ring-1 ring-rose-500/30"
                          : "bg-[#091726]/85 text-white border-white/12 focus:border-brand-gold/60 focus:ring-2 focus:ring-brand-gold/25"
                      }`}
                    />
                    {waLookupStatus === "loading" && !isPersonalLocked && (
                      <Loader2 className="w-4 h-4 text-brand-gold animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  {errors.nomor_wa_pengisi && (
                    <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.nomor_wa_pengisi}</span>
                    </p>
                  )}
                  {!isPersonalLocked && !errors.nomor_wa_pengisi && waLookupStatus === "found" && (
                    <p className="mt-1.5 text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Data peserta ditemukan — Nama Lengkap dan Email telah terisi otomatis.</span>
                    </p>
                  )}
                  {!isPersonalLocked && !errors.nomor_wa_pengisi && waLookupStatus === "already_submitted" && (
                    <p className="mt-1.5 text-xs text-sky-400 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Data peserta ditemukan — Pengiriman kembali akan memperbarui evaluasi Anda.</span>
                    </p>
                  )}
                  {!isPersonalLocked && !errors.nomor_wa_pengisi && waLookupStatus === "not_found" && (
                    <p className="mt-1.5 text-xs text-amber-400 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Nomor WhatsApp belum ditemukan pada daftar peserta aktif. Pastikan nomor sesuai saat mendaftar.</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                    Nama Lengkap <span className="text-amber-400 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_pengisi"
                    required
                    disabled={isPersonalLocked}
                    value={formData.nama_pengisi}
                    onChange={(e) => updateField("nama_pengisi", e.target.value)}
                    placeholder="Otomatis terisi dari Nomor WhatsApp"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium placeholder-slate-500 liquid-neumorph-inset border transition-all focus:outline-none ${
                      isPersonalLocked
                        ? "bg-[#06101b]/90 text-slate-300 border-white/10 opacity-80 cursor-not-allowed"
                        : errors.nama_pengisi
                        ? "bg-[#091726]/85 text-white border-rose-500/70 ring-1 ring-rose-500/30"
                        : "bg-[#091726]/85 text-white border-white/12 focus:border-brand-gold/60 focus:ring-2 focus:ring-brand-gold/25"
                    }`}
                  />
                  {errors.nama_pengisi && (
                    <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.nama_pengisi}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    name="email_pengisi"
                    disabled={isPersonalLocked}
                    value={formData.email_pengisi}
                    onChange={(e) => updateField("email_pengisi", e.target.value)}
                    placeholder="Otomatis terisi dari Nomor WhatsApp"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium placeholder-slate-500 liquid-neumorph-inset border transition-all focus:outline-none ${
                      isPersonalLocked
                        ? "bg-[#06101b]/90 text-slate-300 border-white/10 opacity-80 cursor-not-allowed"
                        : errors.email_pengisi
                        ? "bg-[#091726]/85 text-white border-rose-500/70 ring-1 ring-rose-500/30"
                        : "bg-[#091726]/85 text-white border-white/12 focus:border-brand-gold/60 focus:ring-2 focus:ring-brand-gold/25"
                    }`}
                  />
                  {errors.email_pengisi && (
                    <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.email_pengisi}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-white">
                  Penilaian Sesi Konseling
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  Berikan penilaian bintang dari skala 1 hingga 5 untuk setiap aspek berikut.
                </p>
              </div>

              {RATING_QUESTIONS.map((q) => {
                const selectedVal = Number(formData[q.name]) || 0
                const hoverVal = Number(hoveredRatings[q.name]) || 0
                const displayVal = hoverVal || selectedVal
                const hasError = Boolean(errors[q.name])

                return (
                  <div
                    key={q.name}
                    className={`liquid-neumorph-inset p-5 rounded-2xl border transition-all ${
                      hasError ? "border-rose-500/60 bg-rose-950/10" : "border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <label className="block text-xs sm:text-sm font-semibold text-slate-100 leading-snug">
                        {q.number}. {q.question} <span className="text-amber-400 ml-0.5">*</span>
                      </label>
                      {selectedVal > 0 && (
                        <span className="liquid-neumorph-pill px-2.5 py-0.5 rounded-full text-[11px] font-bold text-brand-gold bg-brand-gold/15 border-t border-brand-gold/30 shrink-0">
                          {selectedVal} / 5
                        </span>
                      )}
                    </div>

                    <div
                      role="radiogroup"
                      aria-label={q.question}
                      className="flex items-center justify-center gap-2.5 sm:gap-4 py-1"
                      onMouseLeave={() =>
                        setHoveredRatings((prev) => ({ ...prev, [q.name]: 0 }))
                      }
                    >
                      {[1, 2, 3, 4, 5].map((val) => {
                        const isActive = displayVal >= val
                        return (
                          <button
                            type="button"
                            key={val}
                            role="radio"
                            aria-checked={selectedVal === val}
                            aria-label={`${val} Bintang`}
                            onMouseEnter={() =>
                              setHoveredRatings((prev) => ({ ...prev, [q.name]: val }))
                            }
                            onClick={() => updateField(q.name, val)}
                            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 ${
                              isActive
                                ? "liquid-neumorph-pill bg-brand-gold/20 text-brand-gold border-t border-brand-gold/50 shadow-md scale-105"
                                : "liquid-neumorph-inset text-slate-500 hover:text-slate-300 border border-white/10"
                            }`}
                          >
                            <Star
                              className={`w-6 h-6 transition-transform ${
                                isActive ? "fill-brand-gold text-brand-gold" : ""
                              }`}
                            />
                          </button>
                        )
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mt-3 px-1 font-medium">
                      <span>1 — {q.labelMin}</span>
                      <span>5 — {q.labelMax}</span>
                    </div>

                    {hasError && (
                      <p className="mt-2.5 text-xs text-rose-400 flex items-center justify-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors[q.name]}</span>
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="liquid-neumorph-inset p-5 sm:p-6 rounded-2xl border border-white/10 space-y-6">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-white">
                  Pertanyaan Evaluasi & Masukan
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  Bantu kami memahami pengalaman Anda secara menyeluruh.
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                  Bagaimana Anda mengetahui informasi mengenai {activeEventName}?{" "}
                  <span className="text-amber-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <select
                    name="info_sumber"
                    required
                    value={formData.info_sumber}
                    onChange={(e) => {
                      const val = e.target.value
                      updateField("info_sumber", val)
                      if (val !== "Yang lain") {
                        updateField("info_sumber_lain", "")
                      }
                    }}
                    className={`w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl text-xs sm:text-sm font-medium liquid-neumorph-inset bg-[#091726]/85 border transition-all cursor-pointer focus:outline-none ${
                      !formData.info_sumber ? "text-slate-400" : "text-white"
                    } ${
                      errors.info_sumber
                        ? "border-rose-500/70 ring-1 ring-rose-500/30"
                        : "border-white/12 focus:border-brand-gold/60 focus:ring-2 focus:ring-brand-gold/25"
                    }`}
                  >
                    <option value="" disabled className="bg-[#0b1a27] text-slate-400">
                      Pilih sumber informasi...
                    </option>
                    {INFO_SUMBER_OPTIONS.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="bg-[#0b1a27] text-slate-100"
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {errors.info_sumber && (
                  <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.info_sumber}</span>
                  </p>
                )}

                {formData.info_sumber === "Yang lain" && (
                  <div className="mt-3 animate-in fade-in duration-200">
                    <input
                      type="text"
                      name="info_sumber_lain"
                      required
                      value={formData.info_sumber_lain}
                      onChange={(e) => updateField("info_sumber_lain", e.target.value)}
                      placeholder="Sebutkan sumber lain"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-white placeholder-slate-500 liquid-neumorph-inset bg-[#091726]/85 border transition-all focus:outline-none ${
                        errors.info_sumber_lain
                          ? "border-rose-500/70 ring-1 ring-rose-500/30"
                          : "border-white/12 focus:border-brand-gold/60 focus:ring-2 focus:ring-brand-gold/25"
                      }`}
                    />
                    {errors.info_sumber_lain && (
                      <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.info_sumber_lain}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                  Menurut Anda, apakah durasi sesi konseling karier sudah cukup?{" "}
                  <span className="text-amber-400 ml-0.5">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {DURASI_OPTIONS.map((opt) => {
                    const isSelected = formData.durasi_sesi === opt
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => updateField("durasi_sesi", opt)}
                        className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? "liquid-neumorph-pill bg-brand-gold/20 text-brand-gold border-t border-brand-gold/50 shadow-sm"
                            : "liquid-neumorph-inset bg-[#091726]/60 text-slate-300 hover:text-white border border-white/10"
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-brand-gold bg-brand-gold"
                              : "border-slate-400 bg-transparent"
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#07131e]" />}
                        </span>
                        <span>{opt}</span>
                      </button>
                    )
                  })}
                </div>
                {errors.durasi_sesi && (
                  <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.durasi_sesi}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                  Apakah ada aspek lain yang ingin Anda tambahkan atau bahas di masa mendatang?
                </label>
                <textarea
                  name="aspek_lain"
                  rows={3}
                  value={formData.aspek_lain}
                  onChange={(e) => updateField("aspek_lain", e.target.value)}
                  placeholder="Contoh: Sesi praktik wawancara, bedah portofolio, dll."
                  className="w-full p-3.5 rounded-xl text-xs sm:text-sm font-medium text-white placeholder-slate-500 liquid-neumorph-inset bg-[#091726]/85 border border-white/12 focus:border-brand-gold/60 focus:ring-2 focus:ring-brand-gold/25 focus:outline-none transition-all resize-y"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                  Apakah Anda berencana untuk mengikuti acara serupa di masa mendatang?{" "}
                  <span className="text-amber-400 ml-0.5">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {RENCANA_OPTIONS.map((opt) => {
                    const isSelected = formData.rencana_ikut_lagi === opt
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => updateField("rencana_ikut_lagi", opt)}
                        className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? "liquid-neumorph-pill bg-brand-gold/20 text-brand-gold border-t border-brand-gold/50 shadow-sm"
                            : "liquid-neumorph-inset bg-[#091726]/60 text-slate-300 hover:text-white border border-white/10"
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-brand-gold bg-brand-gold"
                              : "border-slate-400 bg-transparent"
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#07131e]" />}
                        </span>
                        <span>{opt}</span>
                      </button>
                    )
                  })}
                </div>
                {errors.rencana_ikut_lagi && (
                  <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.rencana_ikut_lagi}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-1.5">
                  Apakah ada saran atau feedback untuk penyelenggaraan konseling karier di TKT ITB
                  mendatang?
                </label>
                <textarea
                  name="saran_feedback"
                  rows={3}
                  value={formData.saran_feedback}
                  onChange={(e) => updateField("saran_feedback", e.target.value)}
                  placeholder="Saran Anda sangat kami hargai."
                  className="w-full p-3.5 rounded-xl text-xs sm:text-sm font-medium text-white placeholder-slate-500 liquid-neumorph-inset bg-[#091726]/85 border border-white/12 focus:border-brand-gold/60 focus:ring-2 focus:ring-brand-gold/25 focus:outline-none transition-all resize-y"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full liquid-btn-gold py-3.5 px-6 rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 shadow-xl cursor-pointer disabled:opacity-60 transition-all active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Feedback</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => !submitting && setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl liquid-neumorph-card border-t border-l border-white/25 p-6 sm:p-7 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl liquid-neumorph-pill bg-brand-gold/15 border-t border-brand-gold/30 flex items-center justify-center text-brand-gold shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Konfirmasi Pengiriman Feedback
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Pastikan data dan penilaian Anda sudah sesuai.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setConfirmOpen(false)}
                className="w-8 h-8 rounded-xl liquid-neumorph-inset flex items-center justify-center text-slate-400 hover:text-white border border-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl liquid-neumorph-inset border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/10 gap-2">
                <span className="text-slate-400 shrink-0">Nama Peserta:</span>
                <span className="font-semibold text-white text-right truncate">
                  {formData.nama_pengisi}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10 gap-2">
                <span className="text-slate-400 shrink-0">Email:</span>
                <span className="font-semibold text-slate-200 text-right truncate">
                  {formData.email_pengisi || "-"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10 gap-2">
                <span className="text-slate-400 shrink-0">Nomor WhatsApp:</span>
                <span className="font-semibold text-brand-gold text-right font-mono">
                  {formData.nomor_wa_pengisi}
                </span>
              </div>
              <div className="flex justify-between py-1 gap-2">
                <span className="text-slate-400 shrink-0">Rata-rata Penilaian:</span>
                <span className="font-semibold text-emerald-400">
                  {(
                    (Number(formData.rating_kepuasan) +
                      Number(formData.rating_materi) +
                      Number(formData.rating_pemahaman_karir) +
                      Number(formData.rating_fasilitator) +
                      Number(formData.rating_motivasi)) /
                    5
                  ).toFixed(1)}{" "}
                  / 5.0 Bintang
                </span>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white liquid-neumorph-inset border border-white/15 cursor-pointer transition-all"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmSubmit}
                className="liquid-btn-gold px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim Feedback...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ya, Kirim Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
