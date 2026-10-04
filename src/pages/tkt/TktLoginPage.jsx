import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react"

export default function TktLoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMessage("")

    if (!username.trim() || !password.trim()) {
      setErrorMessage("Mohon masukkan ID staf dan kata sandi.")
      return
    }

    setLoading(true)

    setTimeout(() => {
      const validUsers = ["admin", "admin@itb.ac.id", "itbcc", "itbcc-admin"]
      const validPass = "tktitbcc2026"

      if (validUsers.includes(username.trim().toLowerCase()) && password === validPass) {
        sessionStorage.setItem("itbcc_tkt_admin_logged", "true")
        sessionStorage.setItem("itbcc_tkt_admin_user", username.trim())
        sessionStorage.setItem("itbcc_tkt_admin_login_at", new Date().toISOString())
        navigate("/tkt/admin")
      } else {
        setErrorMessage("ID staf atau kata sandi tidak sesuai. Silakan periksa kembali kredensial Anda.")
        setLoading(false)
      }
    }, 400)
  }

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white/95 p-0.5 shadow-xl border border-white/40 mx-auto mb-4 flex items-center justify-center">
            <img
              src="/images/logo.jpg"
              alt="ITB Career Center"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.target.style.display = "none"
              }}
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/25 text-amber-300 text-xs font-bold tracking-wide uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Autentikasi Staf Admin</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Login Admin Titian Karir Terpadu
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm font-semibold text-brand-gold tracking-wide">
            Command Center Konseling Karier — ITB Career Center
          </p>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
            Masukkan kredensial akun staf untuk mengelola jadwal konseling, bilik psikolog, dan data peserta.
          </p>
        </div>

        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-bold text-rose-200">Autentikasi Gagal</p>
                <p className="mt-0.5 text-rose-300/90 text-xs">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                ID Staf / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4 text-amber-400/80" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin atau email staf"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl liquid-input placeholder-slate-400 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-amber-400/80" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 text-sm rounded-xl liquid-input placeholder-slate-400 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-5 rounded-xl liquid-btn-gold text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Memverifikasi Kredensial...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <Link
              to="/tkt"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium"
            >
              <span>Kembali ke Formulir Pendaftaran Publik</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-400 tracking-wide">
            Sistem Informasi Konseling Karier Terpadu • ITB Career Center
          </p>
        </div>
      </div>
    </div>
  )
}
