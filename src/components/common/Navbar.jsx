import React, { useState } from "react"
import { NavLink, Link, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  if (location.pathname === "/") {
    return null
  }

  const navLinks = [
    { name: "Home", path: "/reguler", end: true },
    { name: "Jadwal", path: "/reguler/jadwal", end: false },
    { name: "Tentang", path: "/reguler/tentang", end: false }
  ]

  const navLinkClass = ({ isActive }) =>
    `px-4 py-1.5 rounded-full text-xs sm:text-sm transition-all duration-200 ${
      isActive
        ? "bg-white/18 text-white shadow-sm border border-white/25 backdrop-blur-md font-semibold"
        : "text-slate-300 hover:text-white hover:bg-white/8 font-medium"
    }`

  return (
    <header className="sticky top-3 sm:top-5 z-50 w-full px-4 sm:px-6 flex flex-col items-center pointer-events-none">
      <div className="pointer-events-auto w-full max-w-4xl mx-auto rounded-full liquid-glass-navbar px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-2xl transition-all duration-300">
        <Link to="/reguler" className="flex items-center gap-3 sm:gap-3.5 group">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-white/95 shadow-md border border-white/30 flex items-center justify-center p-0.5 shrink-0 transition-transform duration-200 group-hover:scale-105">
            <img
              src="/images/logo.jpg"
              alt="ITB Career Center"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.target.style.display = "none"
              }}
            />
          </div>
          <div>
            <h1 className="text-sm sm:text-base md:text-lg font-semibold text-white tracking-tight leading-tight">
              Booking Konseling Karier
            </h1>
            <p className="text-[10px] sm:text-xs text-amber-300 font-medium tracking-wide">
              ITB Career Center
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center">
          <div className="flex items-center gap-1 p-1 rounded-full liquid-glass-pill-container">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={navLinkClass}
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 cursor-pointer"
            aria-label="Menu Navigasi"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="pointer-events-auto w-full max-w-4xl mx-auto mt-2 p-3 rounded-2xl liquid-glass-navbar shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? "bg-white/18 text-white border border-white/25 font-semibold"
                      : "text-slate-300 hover:bg-white/10 font-medium"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
