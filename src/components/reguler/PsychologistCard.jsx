import React from "react"

export default function PsychologistCard() {
  const psychologists = [
    {
      nameFull: "Lina Tarlina, S.Psi, Psikolog",
      image: "/images/lina.png",
      bio: "Psikolog konseling karier yang siap mendampingi perjalanan karier Anda."
    },
    {
      nameFull: "Sito Asih Pratiwi, S.Psi, Psikolog",
      image: "/images/sito.png",
      bio: "Psikolog konseling karier yang siap mendampingi perjalanan karier Anda."
    }
  ]

  return (
    <section className="liquid-neumorph-card rounded-3xl p-6 sm:p-9 mb-8 transition-all">
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
          Psikolog Kami
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {psychologists.map((psych, index) => (
          <div
            key={index}
            className="liquid-neumorph-card rounded-2xl p-6 sm:p-7 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 group shadow-lg"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-2 relative z-10">
              <div className="relative w-28 h-36 shrink-0 rounded-2xl overflow-hidden border border-white/20 liquid-neumorph-inset shadow-md group-hover:scale-105 transition-transform duration-300 bg-slate-900/60">
                <img
                  src={psych.image}
                  alt={psych.nameFull}
                  className="relative z-10 w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/images/logo.jpg"
                  }}
                />
              </div>

              <div className="text-center sm:text-left pr-12 space-y-2">
                <h4 className="text-base sm:text-lg font-semibold text-white leading-tight">
                  {psych.nameFull}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {psych.bio}
                </p>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-xl overflow-hidden bg-white/90 p-0.5 border border-white/30 shadow-md transition-transform duration-200 group-hover:scale-105">
              <img
                src="/images/logo.jpg"
                alt="Logo ITB Career Center"
                className="w-full h-full object-cover rounded-lg opacity-95"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
