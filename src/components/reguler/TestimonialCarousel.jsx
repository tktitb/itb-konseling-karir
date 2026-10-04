import React, { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { fetchFeedback } from "../../services/feedbackService"

export default function TestimonialCarousel() {
  const [feedbackList, setFeedbackList] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadTestimonials() {
      try {
        const data = await fetchFeedback()
        if (isMounted) {
          if (data && data.length > 0) {
            setFeedbackList(data)
          } else {
            setFeedbackList([
              {
                id: "default-1",
                name: "Mahasiswa ITB Angkatan 2021",
                category: "Mahasiswa ITB",
                feedback: "Sesi konseling sangat mencerahkan. Saya jadi tahu kelemahan CV saya dan bagaimana menjawab pertanyaan interview dengan lebih percaya diri."
              },
              {
                id: "default-2",
                name: "Alumni ITB Angkatan 2019",
                category: "Alumni ITB",
                feedback: "Bu psikolog sangat mendengarkan tanpa menghakimi. Diskusi karier membuka perspektif baru saat saya merasa buntu di tempat kerja sebelumnya."
              },
              {
                id: "default-3",
                name: "Mahasiswa ITB Angkatan 2022",
                category: "Mahasiswa ITB",
                feedback: "Sangat membantu untuk memetakan minat dan karier impian saya sebelum memasuki tahun kelulusan."
              }
            ])
          }
        }
      } catch {
        if (isMounted) {
          setFeedbackList([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    loadTestimonials()
    return () => {
      isMounted = false
    }
  }, [])

  const itemsPerPage = 3
  const maxIndex = Math.max(0, feedbackList.length - itemsPerPage)

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
  }

  const visibleItems = feedbackList.slice(currentIndex, currentIndex + itemsPerPage)

  return (
    <section className="relative liquid-glass-card rounded-3xl p-6 sm:p-9 mb-8 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Apa kata peserta?
          </h3>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-48 rounded-2xl liquid-glass-subtle animate-pulse" />
          <div className="h-48 rounded-2xl liquid-glass-subtle animate-pulse hidden md:block" />
          <div className="h-48 rounded-2xl liquid-glass-subtle animate-pulse hidden md:block" />
        </div>
      ) : (
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className="liquid-glass-subtle rounded-2xl p-6 relative flex flex-col justify-between border border-white/10 hover:border-brand-gold/40 shadow-lg transition-all duration-300 hover:-translate-y-1.5 group"
              >
                <div>
                  <span className="text-4xl text-brand-gold font-serif leading-none mb-3 block select-none">
                    ❝
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed mb-6 font-normal">
                    "{item.feedback}"
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white name-blur">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-brand-gold font-medium mt-0.5">
                      {item.category}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2.5 mt-6">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Sebelumnya"
              className="p-2.5 rounded-full liquid-btn-ghost disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              aria-label="Berikutnya"
              className="p-2.5 rounded-full liquid-btn-ghost disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
