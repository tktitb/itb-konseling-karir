import React from "react"

export default function Footer() {
  return (
    <footer className="w-full mt-16 border-t border-white/10 bg-black/40 backdrop-blur-xl text-slate-300">
      <div className="max-w-container mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/95 p-0.5 shadow-md border border-white/20">
            <img
              src="/images/logo.jpg"
              alt="ITB Career Center"
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = "none"
              }}
            />
          </div>
          <span className="text-sm font-extrabold text-white tracking-wide">
            ITB Career Center
          </span>
        </div>
        <small className="text-xs text-slate-400 font-medium">
          &copy; 2026 ITB Career Center
        </small>
      </div>
    </footer>
  )
}
