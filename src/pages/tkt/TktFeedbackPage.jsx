import React, { useState } from "react"
import { Link } from "react-router-dom"
import {
  Sparkles,
  Heart,
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  MessageSquare
} from "lucide-react"
import { submitFeedback } from "../../services/tktService"

export default function TktFeedbackPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [formData, setFormData] = useState({
    nama_pengisi: "",
    email_pengisi: "",
    nomor_wa_pengisi: "",
    rating_kepuasan: 5,
    rating_materi: 5,
    rating_pemahaman_karir: 5,
    rating_fasilitator: 5,
    rating_motivasi: 5,
    info_sumber: "Media Sosial ITB Career Center",
    durasi_sesi: "Cukup",
    aspek_lain: "",
    rencana_ikut_lagi: "Ya",
    saran_feedback: ""
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")

    if (!formData.nama_pengisi || !formData.email_pengisi || !formData.nomor_wa_pengisi) {
      setErrorMessage("Mohon lengkapi identitas nama, email, dan nomor WhatsApp Anda.")
      return
    }

    setSubmitting(true)
    try {
      await submitFeedback(formData)
      setSubmitted(true)
    } catch (err) {
      setErrorMessage(err.message || "Gagal mengirimkan feedback. Silakan coba kembali.")
    } finally {
      setSubmitting(false)
    }
  }

  const renderRatingStars = (fieldName, label) => {
    return (
      <div className="p-4 rounded-2xl bg-white/70 border border-neutral-200/70 space-y-2">
        <label className="block text-xs font-bold text-neutral-800">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              type="button"
              key={val}
              onClick={() => setFormData({ ...formData, [fieldName]: val })}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                formData[fieldName] >= val
                  ? "text-brand-gold bg-brand-gold/15 scale-105"
                  : "text-neutral-300 hover:text-neutral-400 bg-neutral-100"
              }`}
            >
              <Star className="w-5 h-5 fill-current" />
            </button>
          ))}
          <span className="text-xs font-semibold text-neutral-500 ml-2">
            Nilai: {formData[fieldName]} / 5
          </span>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg rounded-3xl p-8 sm:p-10 bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_20px_60px_rgba(0,33,71,0.1)] text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
            Ulasan Berhasil Terkirim!
          </h2>
          <p className="mt-2 text-sm text-neutral-600 max-w-sm mx-auto leading-relaxed">
            Terima kasih banyak telah berpartisipasi dan membagikan pandangan Anda. Masukan Anda sangat berharga bagi peningkatan mutu layanan konseling karier ITB Career Center.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/tkt"
              className="px-6 py-3 rounded-xl bg-brand-navy hover:bg-brand-navy/95 text-white font-semibold text-xs shadow-md transition-all inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Utama</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/25 text-brand-gold text-xs font-semibold uppercase tracking-wider mb-3">
          <Heart className="w-3.5 h-3.5" />
          <span>Survei Kepuasan Konseling</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Feedback Konseling Karier TKT
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
          Bagikan pengalaman dan masukan Anda untuk membantu kami menyelenggarakan sesi konseling yang lebih berdampak.
        </p>
      </div>

      <div className="rounded-3xl p-6 sm:p-10 bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_20px_50px_rgba(0,33,71,0.06)] relative overflow-hidden">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-5 rounded-2xl bg-brand-navy/5 border border-brand-navy/15 space-y-4">
            <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              Identitas Peserta Konseling
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_pengisi}
                  onChange={(e) => setFormData({ ...formData, nama_pengisi: e.target.value })}
                  placeholder="Nama sesuai pendaftaran"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-neutral-300 focus:outline-none focus:border-brand-navy"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  required
                  value={formData.nomor_wa_pengisi}
                  onChange={(e) => setFormData({ ...formData, nomor_wa_pengisi: e.target.value })}
                  placeholder="0812xxxxxxx"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-neutral-300 focus:outline-none focus:border-brand-navy"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                required
                value={formData.email_pengisi}
                onChange={(e) => setFormData({ ...formData, email_pengisi: e.target.value })}
                placeholder="email@domain.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-neutral-300 focus:outline-none focus:border-brand-navy"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Penilaian Mutu Sesi Konseling
            </h3>
            {renderRatingStars("rating_kepuasan", "1. Seberapa puas Anda secara umum terhadap sesi yang telah diikuti?")}
            {renderRatingStars("rating_materi", "2. Bagaimana pendapat Anda mengenai materi & saran karier yang diberikan?")}
            {renderRatingStars("rating_pemahaman_karir", "3. Apakah sesi ini membantu Anda memahami peta karier & potensi diri?")}
            {renderRatingStars("rating_fasilitator", "4. Bagaimana profesionalisme dan empati psikolog konselor yang mendampingi?")}
            {renderRatingStars("rating_motivasi", "5. Apakah Anda merasa lebih percaya diri dan termotivasi setelah sesi selesai?")}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Darimana Anda mengetahui informasi konseling TKT?
              </label>
              <select
                value={formData.info_sumber}
                onChange={(e) => setFormData({ ...formData, info_sumber: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-neutral-300 focus:outline-none focus:border-brand-navy"
              >
                <option value="Media Sosial ITB Career Center">Media Sosial ITB Career Center</option>
                <option value="Website ITB Career Center">Website ITB Career Center</option>
                <option value="Rekomendasi Rekan / Teman">Rekomendasi Rekan / Teman</option>
                <option value="Email Pemberitahuan ITB">Email Pemberitahuan ITB</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Menurut Anda, apakah durasi sesi (45 menit) sudah mencukupi?
              </label>
              <div className="flex gap-4">
                {["Terlalu Pendek", "Cukup", "Terlalu Lama"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="durasi_sesi"
                      value={opt}
                      checked={formData.durasi_sesi === opt}
                      onChange={(e) => setFormData({ ...formData, durasi_sesi: e.target.value })}
                      className="text-brand-navy focus:ring-brand-navy"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Topik atau aspek apa yang ingin Anda tambahkan di masa mendatang?
              </label>
              <textarea
                rows={2}
                value={formData.aspek_lain}
                onChange={(e) => setFormData({ ...formData, aspek_lain: e.target.value })}
                placeholder="Contoh: Bedah portofolio UI/UX, simulasi interview teknis, dll."
                className="w-full p-3 text-xs rounded-xl bg-white border border-neutral-300 focus:outline-none focus:border-brand-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Saran atau evaluasi umum untuk penyelenggaraan konseling Titian Karir Terpadu:
              </label>
              <textarea
                rows={3}
                value={formData.saran_feedback}
                onChange={(e) => setFormData({ ...formData, saran_feedback: e.target.value })}
                placeholder="Tuliskan saran konstruktif Anda di sini..."
                className="w-full p-3 text-xs rounded-xl bg-white border border-neutral-300 focus:outline-none focus:border-brand-navy"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-2xl bg-brand-navy hover:bg-brand-navy/95 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-brand-navy/20 cursor-pointer disabled:opacity-60 transition-all"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mengirimkan Masukan...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-brand-gold" />
                  <span>Kirimkan Feedback Saya</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
