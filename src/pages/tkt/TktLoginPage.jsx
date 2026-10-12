import React, { useState, useEffect } from "react"
import { useNavigate, useSearchParams, Navigate, Link } from "react-router-dom"
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  KeyRound
} from "lucide-react"
import {
  authenticateAdmin,
  verifyAdminSession,
  getLoginRateLimitState
} from "../../services/authService"

export default function TktLoginPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [extendedMode, setExtendedMode] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [rateLimit, setRateLimit] = useState(() => getLoginRateLimitState())

  const initialSessionCheck = verifyAdminSession()
  const sessionReason = searchParams.get("reason")

  useEffect(() => {
    setRateLimit(getLoginRateLimitState())
  }, [])

  useEffect(() => {
    if (!rateLimit.isLocked) return undefined

    const timer = window.setInterval(() => {
      const nextState = getLoginRateLimitState()
      setRateLimit(nextState)
      if (!nextState.isLocked) {
        setErrorMessage("")
      }
    }, 1000)

    return () => window.clearInterval(timer)
  }, [rateLimit.isLocked])

  if (initialSessionCheck.valid) {
    return <Navigate to="/tkt/admin" replace />
  }

  const handleCapsLockCheck = (e) => {
    if (typeof e.getModifierState === "function") {
      setCapsLockOn(e.getModifierState("CapsLock"))
    }
  }

  const getSessionReasonBanner = () => {
    if (!sessionReason || errorMessage) return null

    if (sessionReason === "logged_out") {
      return {
        tone: "emerald",
        title: "Sesi Berhasil Ditutup",
        desc: "Anda telah keluar dengan aman dari Panel Admin Titian Karir Terpadu."
      }
    }

    if (sessionReason === "idle_timeout") {
      return {
        tone: "amber",
        title: "Sesi Berakhir Otomatis",
        desc: "Sesi kerja ditutup karena tidak ada aktivitas dalam batas waktu keamanan. Silakan masuk kembali."
      }
    }

    if (sessionReason === "session_expired") {
      return {
        tone: "amber",
        title: "Masa Berlaku Sesi Habis",
        desc: "Durasi sesi kerja telah berakhir. Silakan masuk kembali untuk melanjutkan pengelolaan data."
      }
    }

    return null
  }

  const reasonBanner = getSessionReasonBanner()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")

    if (sessionReason) {
      setSearchParams({}, { replace: true })
    }

    const currentLimit = getLoginRateLimitState()
    setRateLimit(currentLimit)
    if (currentLimit.isLocked) {
      setErrorMessage(
        `Akses login dikunci sementara. Silakan tunggu ${currentLimit.remainingSeconds} detik sebelum mencoba kembali.`
      )
      return
    }

    const cleanUser = username.trim()
    if (!cleanUser || !password) {
      setErrorMessage("Mohon masukkan ID staf dan kata sandi terlebih dahulu.")
      return
    }

    setLoading(true)
    try {
      const result = await authenticateAdmin({
        username: cleanUser,
        password,
        extendedMode
      })

      setRateLimit(getLoginRateLimitState())

      if (result.success) {
        navigate("/tkt/admin", { replace: true })
        return
      }

      setErrorMessage(
        result.error || "ID Pengguna atau Kata Sandi yang Anda masukkan tidak sesuai."
      )
    } catch {
      setErrorMessage("Gagal memverifikasi kredensial. Periksa koneksi internet Anda lalu coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-14 sm:py-16">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-7">
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

          <div className="liquid-neumorph-pill inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 border-t border-brand-gold/30 text-brand-gold text-xs font-semibold tracking-wide uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
            <span>Autentikasi Staf Admin</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Login Admin Titian Karir Terpadu
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm font-semibold text-brand-gold tracking-wide">
            Panel Manajemen Konseling Karier — ITB Career Center
          </p>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
            Masukkan kredensial akun staf untuk mengelola jadwal konseling, penugasan psikolog, dan data peserta.
          </p>
        </div>

        <div className="liquid-neumorph-card rounded-3xl p-6 sm:p-8 shadow-2xl relative border-t border-l border-white/20">
          {reasonBanner && (
            <div
              className={`mb-5 p-3.5 rounded-2xl text-xs flex items-start gap-3 border ${
                reasonBanner.tone === "emerald"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-200"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-200"
              }`}
            >
              {reasonBanner.tone === "emerald" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <Clock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{reasonBanner.title}</p>
                <p className="mt-0.5 opacity-90 leading-relaxed">{reasonBanner.desc}</p>
              </div>
            </div>
          )}

          {rateLimit.isLocked ? (
            <div className="mb-5 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/35 text-rose-200 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-rose-200">Proteksi Keamanan Aktif</p>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/25 border border-rose-400/30 text-[11px] font-mono font-semibold text-rose-200">
                    {rateLimit.remainingSeconds} dtk
                  </span>
                </div>
                <p className="mt-1 text-rose-300/90 leading-relaxed">
                  Terlalu banyak percobaan masuk yang gagal. Formulir akan terbuka kembali secara otomatis setelah hitung mundur selesai.
                </p>
              </div>
            </div>
          ) : (
            errorMessage && (
              <div className="mb-5 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-200">Autentikasi Gagal</p>
                  <p className="mt-0.5 text-rose-300/90 text-xs leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="tkt-admin-username"
                className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2"
              >
                ID Staf / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4 text-brand-gold" />
                </div>
                <input
                  id="tkt-admin-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  spellCheck={false}
                  disabled={loading || rateLimit.isLocked}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => setUsername((prev) => prev.trim())}
                  placeholder="admin atau email staf"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 text-sm font-semibold rounded-xl liquid-neumorph-inset text-slate-100 bg-[rgba(8,18,28,0.65)] border border-white/10 placeholder-slate-500 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="tkt-admin-password"
                  className="block text-xs font-semibold text-slate-200 uppercase tracking-wider"
                >
                  Kata Sandi
                </label>
                {capsLockOn && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300">
                    <KeyRound className="w-3 h-3" />
                    <span>Caps Lock Aktif</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-brand-gold" />
                </div>
                <input
                  id="tkt-admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={loading || rateLimit.isLocked}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleCapsLockCheck}
                  onKeyUp={handleCapsLockCheck}
                  onBlur={() => setCapsLockOn(false)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 text-sm font-semibold rounded-xl liquid-neumorph-inset text-slate-100 bg-[rgba(8,18,28,0.65)] border border-white/10 placeholder-slate-500 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  disabled={loading || rateLimit.isLocked}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer focus:outline-none disabled:opacity-40"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="liquid-neumorph-inset flex items-start gap-3 p-3 rounded-xl border border-white/10 cursor-pointer select-none hover:border-white/20 transition-all">
              <input
                type="checkbox"
                checked={extendedMode}
                disabled={loading || rateLimit.isLocked}
                onChange={(e) => setExtendedMode(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-amber-400 cursor-pointer"
              />
              <div className="text-xs leading-snug">
                <span className="font-semibold text-slate-200 block">
                  Mode Operasional Hari-H (Sesi 12 Jam)
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Memperpanjang batas waktu sesi aktif selama kegiatan berlangsung.
                </span>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading || rateLimit.isLocked}
              className="w-full mt-2 py-3.5 px-5 rounded-xl liquid-neumorph-btn text-brand-gold font-semibold text-sm flex items-center justify-center gap-2 bg-brand-gold/15 hover:bg-brand-gold/25 border-t border-brand-gold/40 shadow-lg active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Kredensial...</span>
                </>
              ) : rateLimit.isLocked ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Tunggu {rateLimit.remainingSeconds} Detik...</span>
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
