import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  BarChart3,
  Calendar,
  Table,
  MessageSquareHeart,
  Settings,
  Tv,
  ExternalLink,
  ClipboardCheck,
  RefreshCw,
  LogOut,
  Menu,
  X,
  Power,
  ShieldCheck
} from "lucide-react"
import {
  getSemuaPeserta,
  getSystemConfig,
  updateSystemConfig,
  updateStatusPeserta,
  updatePeserta,
  tambahPesertaManual,
  promosikanWaitingList,
  generateWhatsAppLink,
  formatWhatsAppMessage,
  subscribePesertaRealtime,
  getActiveEventDates,
  getAllActivePsikologs,
  deletePeserta
} from "../../services/tktService"
import {
  verifyAdminSession,
  logoutAdminSession
} from "../../services/authService"
import TktAnalyticsView from "../../components/tkt/admin/TktAnalyticsView"
import TktBoardView from "../../components/tkt/admin/TktBoardView"
import TktSpreadsheetView from "../../components/tkt/admin/TktSpreadsheetView"
import TktFeedbackView from "../../components/tkt/admin/TktFeedbackView"
import TktWaitingListTab from "../../components/tkt/TktWaitingListTab"
import TktConfigTab from "../../components/tkt/TktConfigTab"
import {
  TktDetailModal,
  TktWalkInModal,
  TktEditModal,
  TktWhatsAppModal
} from "../../components/tkt/TktModals"

export default function TktAdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("table")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [togglingReg, setTogglingReg] = useState(false)
  const [participants, setParticipants] = useState([])
  const [config, setConfig] = useState(null)
  const [availableDates, setAvailableDates] = useState([])
  const [availablePsikologs, setAvailablePsikologs] = useState([])

  const [modalWalkInOpen, setModalWalkInOpen] = useState(false)
  const [modalDetailOpen, setModalDetailOpen] = useState(false)
  const [modalEditOpen, setModalEditOpen] = useState(false)
  const [modalWhatsAppOpen, setModalWhatsAppOpen] = useState(false)
  const [modalLogoutOpen, setModalLogoutOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [selectedWaParticipant, setSelectedWaParticipant] = useState(null)

  const currentSession = verifyAdminSession().session
  const adminUser = currentSession?.displayName || "Petugas Admin"
  const adminUsername = currentSession?.username || "admin"
  const adminRole = currentSession?.role || "Super Admin"

  const loadAllData = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true)
    try {
      const [pts, cfg] = await Promise.all([getSemuaPeserta(), getSystemConfig()])
      setParticipants(pts || [])
      if (cfg) {
        setConfig(cfg)
        const dates = getActiveEventDates(cfg)
        setAvailableDates(dates)
        const allPsi = getAllActivePsikologs(cfg, dates)
        setAvailablePsikologs(allPsi)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const activeParticipants = useMemo(() => {
    if (!availableDates || availableDates.length === 0) return participants
    const activeDateSet = new Set(availableDates.map((d) => String(d || "").trim()))
    return participants.filter((p) => activeDateSet.has(String(p.jadwal_hari || "").trim()))
  }, [participants, availableDates])

  useEffect(() => {
    loadAllData()

    const unsub = subscribePesertaRealtime(() => {
      loadAllData(true)
    })

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      if (unsub) unsub()
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [loadAllData])

  const handleLogout = () => {
    setMobileMenuOpen(false)
    setModalLogoutOpen(true)
  }

  const handleConfirmLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logoutAdminSession()
    } finally {
      setLoggingOut(false)
      setModalLogoutOpen(false)
      navigate("/tkt/admin-rahasia?reason=logged_out", { replace: true })
    }
  }

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateStatusPeserta(id, newStatus)
      setParticipants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status_peserta: newStatus } : p))
      )
    } catch {
      await loadAllData(true)
    }
  }

  const handleUpdateParticipant = async (id, updates) => {
    try {
      await updatePeserta(id, updates)
      setParticipants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      )
      setModalEditOpen(false)
    } catch {
      await loadAllData(true)
    }
  }

  const handleSaveWalkIn = async (newParticipantData) => {
    try {
      const res = await tambahPesertaManual(newParticipantData)
      if (res && res.success && res.data) {
        setParticipants((prev) => [res.data, ...prev])
        setModalWalkInOpen(false)
        return { success: true, data: res.data }
      } else {
        await loadAllData(true)
        setModalWalkInOpen(false)
        return res || { success: true }
      }
    } catch (err) {
      await loadAllData(true)
      setModalWalkInOpen(false)
      return { success: false, message: err?.message || "Gagal menyimpan data walk-in" }
    }
  }

  const handlePromoteWaitingList = async (id, allocationData) => {
    try {
      await promosikanWaitingList(id, allocationData)
      setParticipants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...allocationData } : p))
      )
    } catch {
      await loadAllData(true)
    }
  }

  const handleDeleteParticipant = async (id) => {
    try {
      const res = await deletePeserta(id)
      if (res && res.success) {
        setParticipants((prev) => prev.filter((p) => p.id !== id))
        return { success: true }
      } else {
        await loadAllData(true)
        return res || { success: false, message: "Gagal menghapus data peserta" }
      }
    } catch (err) {
      await loadAllData(true)
      return { success: false, message: err?.message || "Gagal menghapus data peserta" }
    }
  }

  const handleSaveConfig = async (newConfigData) => {
    await updateSystemConfig(newConfigData)
    await loadAllData(true)
  }

  const handleToggleRegistration = async () => {
    if (togglingReg) return
    const currentStatus = config?.status_pendaftaran || "buka"
    const newStatus = currentStatus === "buka" ? "tutup" : "buka"
    setTogglingReg(true)
    try {
      await updateSystemConfig("status_pendaftaran", newStatus)
      setConfig((prev) => (prev ? { ...prev, status_pendaftaran: newStatus } : { status_pendaftaran: newStatus }))
    } catch {
      await loadAllData(true)
    } finally {
      setTogglingReg(false)
    }
  }

  const getWaLink = useCallback(
    (templateKey, participant) => {
      if (!participant) return ""
      return formatWhatsAppMessage(participant, templateKey, config)
    },
    [config]
  )

  const handleOpenWhatsAppModal = useCallback((participant) => {
    setSelectedWaParticipant(participant)
    setModalWhatsAppOpen(true)
  }, [])

  const navTabs = [
    { id: "table", label: "Master Data", icon: Table },
    { id: "matrix", label: "Papan Jadwal", icon: Calendar },
    { id: "analytics", label: "Analitik", icon: BarChart3 },
    { id: "feedback", label: "Feedback", icon: MessageSquareHeart },
    { id: "config", label: "Pengaturan", icon: Settings }
  ]

  const isRegOpen = (config?.status_pendaftaran || "buka") === "buka"

  return (
    <div className="min-h-screen text-white relative pb-20">
      <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 w-full px-3 sm:px-6 flex flex-col items-center pointer-events-none mb-6">
        <div
          className={`pointer-events-auto w-full max-w-4xl sm:max-w-5xl mx-auto rounded-full liquid-neumorph-card px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between transition-all duration-300 gap-2 sm:gap-4 border-t border-l border-white/20 ${
            isScrolled
              ? "shadow-2xl bg-[#0d1b2a]/95 backdrop-blur-2xl"
              : "shadow-xl"
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-white/95 shadow-lg border border-white/40 flex items-center justify-center p-0.5 shrink-0">
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
              <h1 className="text-xs sm:text-sm font-semibold text-white tracking-tight leading-tight">
                Admin TKT
              </h1>
              <p className="hidden sm:block text-[10px] text-brand-gold font-semibold tracking-wide">
                ITB Career Center
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 liquid-neumorph-inset p-1 rounded-full">
            {navTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  className={`group h-8 sm:h-9 flex items-center rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "liquid-neumorph-pill bg-brand-gold/15 text-brand-gold border-t border-brand-gold/30 shadow-sm px-3 sm:px-3.5 gap-2"
                      : "text-slate-400 hover:text-white px-2.5 hover:px-3.5 gap-0 hover:gap-1.5"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-brand-gold" : "text-slate-400 group-hover:text-white"}`} />
                  <span
                    className={`text-xs whitespace-nowrap transition-all duration-300 ease-out overflow-hidden ${
                      isActive
                        ? "max-w-[120px] opacity-100 font-semibold text-brand-gold inline-block"
                        : "max-w-0 opacity-0 font-medium group-hover:max-w-[120px] group-hover:opacity-100 text-slate-200 inline-block"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </nav>

          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => loadAllData()}
              disabled={refreshing}
              className="liquid-neumorph-pill w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              title="Segarkan Data Peserta"
              aria-label="Segarkan Data Peserta"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            <button
              type="button"
              onClick={handleToggleRegistration}
              disabled={togglingReg}
              className={`liquid-neumorph-pill w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-50 ${
                isRegOpen
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                  : "bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 shadow-[0_0_12px_rgba(244,63,94,0.25)]"
              }`}
              title={
                isRegOpen
                  ? "Form Pendaftaran Publik: BUKA (Klik untuk Menutup)"
                  : "Form Pendaftaran Publik: TUTUP (Klik untuk Membuka)"
              }
              aria-label={
                isRegOpen
                  ? "Form Pendaftaran Publik: BUKA (Klik untuk Menutup)"
                  : "Form Pendaftaran Publik: TUTUP (Klik untuk Membuka)"
              }
            >
              <Power className={`w-3.5 h-3.5 ${togglingReg ? "animate-pulse" : ""}`} />
            </button>

            <Link
              to="/tkt/display"
              target="_blank"
              className="liquid-neumorph-pill w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all active:scale-95"
              title="Buka Layar Display Antrean Booth"
              aria-label="Buka Layar Display Antrean Booth"
            >
              <Tv className="w-3.5 h-3.5 text-brand-gold" />
            </Link>

            <Link
              to="/tkt"
              target="_blank"
              className="liquid-neumorph-pill w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all active:scale-95"
              title="Tinjau Formulir Pendaftaran Publik"
              aria-label="Tinjau Formulir Pendaftaran Publik"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/tkt/feedback"
              target="_blank"
              className="liquid-neumorph-pill w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all active:scale-95"
              title="Tinjau Formulir Feedback Peserta"
              aria-label="Tinjau Formulir Feedback Peserta"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-brand-gold" />
            </Link>

            <button
              onClick={handleLogout}
              className="liquid-neumorph-pill w-9 h-9 rounded-full flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border-t border-rose-500/30 transition-all cursor-pointer active:scale-95 ml-0.5"
              title="Keluar dari Sesi Admin"
              aria-label="Keluar dari Sesi Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex md:hidden items-center gap-1 shrink-0">
            <button
              onClick={() => loadAllData()}
              disabled={refreshing}
              className="liquid-neumorph-pill w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95"
              title="Segarkan Data Peserta"
              aria-label="Segarkan Data Peserta"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            <button
              type="button"
              onClick={handleToggleRegistration}
              disabled={togglingReg}
              className={`liquid-neumorph-pill w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-50 ${
                isRegOpen
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                  : "bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 shadow-[0_0_10px_rgba(244,63,94,0.25)]"
              }`}
              title={
                isRegOpen
                  ? "Form Pendaftaran Publik: BUKA (Klik untuk Menutup)"
                  : "Form Pendaftaran Publik: TUTUP (Klik untuk Membuka)"
              }
              aria-label={
                isRegOpen
                  ? "Form Pendaftaran Publik: BUKA (Klik untuk Menutup)"
                  : "Form Pendaftaran Publik: TUTUP (Klik untuk Membuka)"
              }
            >
              <Power className={`w-3.5 h-3.5 ${togglingReg ? "animate-pulse" : ""}`} />
            </button>

            <button
              onClick={handleLogout}
              className="liquid-neumorph-pill w-8 h-8 rounded-full flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-t border-rose-500/30 transition-all cursor-pointer active:scale-95"
              title="Keluar dari Sesi Admin"
              aria-label="Keluar dari Sesi Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="liquid-neumorph-pill w-8 h-8 rounded-full flex items-center justify-center text-white border border-white/15 transition-all cursor-pointer active:scale-95 focus:outline-none"
              title="Menu Navigasi"
              aria-label="Menu Navigasi"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md md:hidden pointer-events-auto"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-50 md:hidden pointer-events-auto w-full max-w-4xl mx-auto mt-2 p-3 rounded-2xl liquid-neumorph-card border-t border-l border-white/20 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
              <nav className="flex flex-col gap-1.5">
                {navTabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setMobileMenuOpen(false)
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                        isActive
                          ? "liquid-neumorph-pill bg-brand-gold/15 text-brand-gold border-t border-brand-gold/30 shadow-sm"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-brand-gold" : "text-slate-400"}`} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>

              <div className="border-t border-white/10 mt-3 pt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-xl liquid-neumorph-inset text-xs">
                  <span className="text-slate-300 font-medium">Form Pendaftaran:</span>
                  <button
                    type="button"
                    onClick={handleToggleRegistration}
                    disabled={togglingReg}
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                      isRegOpen
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{isRegOpen ? "Buka" : "Tutup"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Link
                    to="/tkt/display"
                    target="_blank"
                    onClick={() => setMobileMenuOpen(false)}
                    className="liquid-neumorph-inset px-2.5 py-2 rounded-xl text-[11px] font-semibold text-slate-200 hover:bg-white/10 flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <Tv className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                    <span className="truncate">Layar Booth</span>
                  </Link>

                  <Link
                    to="/tkt"
                    target="_blank"
                    onClick={() => setMobileMenuOpen(false)}
                    className="liquid-neumorph-inset px-2.5 py-2 rounded-xl text-[11px] font-semibold text-slate-200 hover:bg-white/10 flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Form Publik</span>
                  </Link>

                  <Link
                    to="/tkt/feedback"
                    target="_blank"
                    onClick={() => setMobileMenuOpen(false)}
                    className="liquid-neumorph-inset px-2.5 py-2 rounded-xl text-[11px] font-semibold text-slate-200 hover:bg-white/10 flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                    <span className="truncate">Form Feedback</span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      <main
        className={`mx-auto pt-24 sm:pt-28 transition-all duration-200 ${
          activeTab === "table" || activeTab === "matrix"
            ? "w-full max-w-full px-2.5 sm:px-5 lg:px-6"
            : "max-w-7xl px-4 sm:px-6 lg:px-8"
        }`}
      >
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium text-slate-400">
              Memuat data operasional Titian Karir Terpadu...
            </p>
          </div>
        ) : (
          <div>
            {activeTab === "analytics" && (
              <TktAnalyticsView
                participants={activeParticipants}
                config={config}
                availableDates={availableDates}
                availablePsikologs={availablePsikologs}
              />
            )}

            {activeTab === "matrix" && (
              <TktBoardView
                participants={activeParticipants}
                config={config}
                availableDates={availableDates}
                availablePsikologs={availablePsikologs}
                onOpenDetail={(p) => {
                  setSelectedParticipant(p)
                  setModalDetailOpen(true)
                }}
                onOpenEdit={(p) => {
                  setSelectedParticipant(p)
                  setModalEditOpen(true)
                }}
                onUpdateStatus={handleUpdateStatus}
                onUpdateParticipant={handleUpdateParticipant}
                onSaveWalkIn={handleSaveWalkIn}
                onOpenWhatsApp={handleOpenWhatsAppModal}
                onPromoteWaitingList={handlePromoteWaitingList}
                getWaLink={getWaLink}
              />
            )}

            {activeTab === "table" && (
              <TktSpreadsheetView
                participants={activeParticipants}
                config={config}
                availableDates={availableDates}
                availablePsikologs={availablePsikologs}
                onUpdateStatus={handleUpdateStatus}
                onUpdateParticipant={handleUpdateParticipant}
                onOpenWalkIn={() => setModalWalkInOpen(true)}
                onSaveWalkIn={handleSaveWalkIn}
                onOpenDetail={(p) => {
                  setSelectedParticipant(p)
                  setModalDetailOpen(true)
                }}
                onOpenEdit={(p) => {
                  setSelectedParticipant(p)
                  setModalEditOpen(true)
                }}
                getWaLink={getWaLink}
                onOpenWhatsApp={handleOpenWhatsAppModal}
                onDeleteParticipant={handleDeleteParticipant}
              />
            )}

            {activeTab === "feedback" && (
              <TktFeedbackView
                availableDates={availableDates}
                participants={activeParticipants}
              />
            )}

            {activeTab === "config" && (
              <TktConfigTab
                config={config}
                onSaveConfig={handleSaveConfig}
                refreshing={refreshing}
                onRefresh={() => loadAllData()}
              />
            )}
          </div>
        )}
      </main>

      <TktDetailModal
        isOpen={modalDetailOpen}
        onClose={() => setModalDetailOpen(false)}
        participant={selectedParticipant}
        getWaLink={getWaLink}
        onOpenWhatsApp={handleOpenWhatsAppModal}
        onEdit={(p) => {
          setModalDetailOpen(false)
          setSelectedParticipant(p)
          setModalEditOpen(true)
        }}
      />

      <TktWalkInModal
        isOpen={modalWalkInOpen}
        onClose={() => setModalWalkInOpen(false)}
        onSave={handleSaveWalkIn}
        dates={availableDates}
        psikologList={availablePsikologs}
      />

      <TktEditModal
        isOpen={modalEditOpen}
        onClose={() => setModalEditOpen(false)}
        onSave={handleUpdateParticipant}
        participant={selectedParticipant}
        dates={availableDates}
        psikologList={availablePsikologs}
      />

      <TktWhatsAppModal
        isOpen={modalWhatsAppOpen}
        onClose={() => setModalWhatsAppOpen(false)}
        participant={selectedWaParticipant}
        config={config || {}}
      />

      {modalLogoutOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => !loggingOut && setModalLogoutOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl liquid-neumorph-card p-6 sm:p-7 border-t border-l border-white/25 shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl liquid-neumorph-inset border border-rose-500/30 flex items-center justify-center text-rose-300 shrink-0">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white leading-tight">
                    Keluar dari Sesi Panel Admin?
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Konfirmasi keamanan penutupan sesi kerja
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => setModalLogoutOpen(false)}
                className="w-8 h-8 rounded-full liquid-neumorph-pill flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Tutup dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="liquid-neumorph-inset p-3.5 rounded-2xl border border-white/10 mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <ShieldCheck className="w-4 h-4 text-brand-gold shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{adminUser}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    ID: {adminUsername} • {adminRole}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                Sesi Aktif
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Sesi kerja Anda pada perangkat ini beserta tab Panel Admin lain yang sedang terbuka akan ditutup. Anda dapat masuk kembali kapan saja menggunakan kredensial staf.
            </p>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => setModalLogoutOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-white/20 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-all cursor-pointer active:scale-95"
              >
                Tetap di Panel Admin
              </button>
              <button
                type="button"
                disabled={loggingOut}
                onClick={handleConfirmLogout}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl liquid-neumorph-btn bg-rose-500/20 hover:bg-rose-500/30 border-t border-rose-500/40 text-xs sm:text-sm font-semibold text-rose-200 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
              >
                <LogOut className="w-4 h-4" />
                <span>{loggingOut ? "Menutup Sesi..." : "Ya, Keluar Sekarang"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
