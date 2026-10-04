import React, { useState, useEffect, useCallback } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  BarChart3,
  Calendar,
  Table,
  MessageSquareHeart,
  Settings,
  Tv,
  ExternalLink,
  RefreshCw,
  LogOut,
  Menu,
  X
} from "lucide-react"
import {
  getSemuaPeserta,
  getSystemConfig,
  updateSystemConfig,
  updateStatusPeserta,
  updatePeserta,
  deletePeserta,
  tambahPesertaManual,
  promosikanWaitingList,
  generateWhatsAppLink,
  subscribePesertaRealtime
} from "../../services/tktService"
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
  TktDeleteConfirmModal
} from "../../components/tkt/TktModals"

export default function TktAdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("table")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [participants, setParticipants] = useState([])
  const [config, setConfig] = useState(null)
  const [availableDates, setAvailableDates] = useState([])
  const [availablePsikologs, setAvailablePsikologs] = useState([])

  const [modalWalkInOpen, setModalWalkInOpen] = useState(false)
  const [modalDetailOpen, setModalDetailOpen] = useState(false)
  const [modalEditOpen, setModalEditOpen] = useState(false)
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState(null)

  const adminUser =
    (typeof window !== "undefined" && sessionStorage.getItem("itbcc_tkt_admin_user")) || "Petugas Admin"

  const loadAllData = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true)
    try {
      const [pts, cfg] = await Promise.all([getSemuaPeserta(), getSystemConfig()])
      setParticipants(pts || [])
      if (cfg) {
        setConfig(cfg)
        let dates = []
        if (cfg.kegiatan_list) {
          try {
            const list = JSON.parse(cfg.kegiatan_list)
            const activeEvent = list.find((e) => e.is_active) || list[0]
            if (activeEvent && Array.isArray(activeEvent.tanggal) && activeEvent.tanggal.length > 0) {
              dates = activeEvent.tanggal
            }
          } catch {}
        }
        if (dates.length === 0) {
          if (cfg.tanggal_kegiatan_1) dates.push(cfg.tanggal_kegiatan_1)
          if (cfg.tanggal_kegiatan_2) dates.push(cfg.tanggal_kegiatan_2)
        }
        setAvailableDates(dates)

        let allPsi = []
        try {
          const psi1 = JSON.parse(cfg.psikolog_list_1 || "[]")
          const psi2 = JSON.parse(cfg.psikolog_list_2 || "[]")
          allPsi = Array.from(new Set([...psi1, ...psi2]))
        } catch {
          allPsi = ["Psikolog 1", "Psikolog 2", "Psikolog 3", "Psikolog 4", "Psikolog 5"]
        }
        setAvailablePsikologs(allPsi)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

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
    sessionStorage.removeItem("itbcc_tkt_admin_logged")
    sessionStorage.removeItem("itbcc_tkt_admin_user")
    sessionStorage.removeItem("itbcc_tkt_admin_login_at")
    navigate("/tkt/admin-rahasia")
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

  const handleDeleteParticipant = async (id) => {
    try {
      await deletePeserta(id)
      setParticipants((prev) => prev.filter((p) => p.id !== id))
      setModalDeleteOpen(false)
    } catch {
      await loadAllData(true)
    }
  }

  const handleSaveWalkIn = async (newParticipantData) => {
    try {
      const inserted = await tambahPesertaManual(newParticipantData)
      if (inserted) {
        setParticipants((prev) => [inserted, ...prev])
      }
      setModalWalkInOpen(false)
    } catch {
      await loadAllData(true)
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

  const handleSaveConfig = async (newConfigData) => {
    await updateSystemConfig(newConfigData)
    await loadAllData(true)
  }

  const getWaLink = (templateKey, participant) => {
    if (!config || !participant) return ""
    const template = config[templateKey] || ""
    return generateWhatsAppLink(template, participant)
  }

  const navTabs = [
    { id: "table", label: "Master Data", icon: Table },
    { id: "matrix", label: "Papan Jadwal", icon: Calendar },
    { id: "analytics", label: "Analitik", icon: BarChart3 },
    { id: "feedback", label: "Feedback", icon: MessageSquareHeart },
    { id: "config", label: "Pengaturan", icon: Settings }
  ]

  return (
    <div className="min-h-screen text-white relative pb-20">
      <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 w-full px-3 sm:px-6 flex flex-col items-center pointer-events-none mb-6">
        <div
          className={`pointer-events-auto w-full max-w-4xl sm:max-w-5xl mx-auto rounded-full liquid-glass-navbar px-3.5 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between transition-all duration-300 gap-2 sm:gap-4 ${
            isScrolled
              ? "shadow-[0_25px_60px_-10px_rgba(0,0,0,0.75)] border-white/30 bg-[#0d1b2a]/90 backdrop-blur-2xl"
              : "shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/20"
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
              <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight leading-tight">
                Admin TKT
              </h1>
              <p className="hidden sm:block text-[10px] text-brand-gold font-semibold tracking-wide">
                ITB Career Center
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5">
            {navTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  className={`group h-9 flex items-center rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-white/20 text-white shadow-sm border border-white/30 px-3 sm:px-3.5 gap-2"
                      : "text-slate-300 hover:text-white hover:bg-white/10 px-2.5 hover:px-3.5 border border-transparent hover:border-white/10 gap-0 hover:gap-1.5"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-brand-gold" : "text-slate-300 group-hover:text-white"}`} />
                  <span
                    className={`text-xs whitespace-nowrap transition-all duration-300 ease-out overflow-hidden ${
                      isActive
                        ? "max-w-[120px] opacity-100 font-bold text-white inline-block"
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
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              title="Segarkan Data Peserta"
              aria-label="Segarkan Data Peserta"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            <Link
              to="/tkt/display"
              target="_blank"
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all active:scale-95"
              title="Buka Layar Display Antrean Booth"
              aria-label="Buka Layar Display Antrean Booth"
            >
              <Tv className="w-3.5 h-3.5 text-brand-gold" />
            </Link>

            <Link
              to="/tkt"
              target="_blank"
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all active:scale-95"
              title="Tinjau Formulir Pendaftaran Publik"
              aria-label="Tinjau Formulir Pendaftaran Publik"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/20 transition-all cursor-pointer active:scale-95 ml-0.5"
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
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer active:scale-95"
              title="Segarkan Data Peserta"
              aria-label="Segarkan Data Peserta"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-all cursor-pointer active:scale-95"
              title="Keluar dari Sesi Admin"
              aria-label="Keluar dari Sesi Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 border border-white/15 transition-all cursor-pointer active:scale-95 focus:outline-none"
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
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden pointer-events-auto"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-50 md:hidden pointer-events-auto w-full max-w-4xl mx-auto mt-2 p-3 rounded-2xl liquid-glass-navbar shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
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
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${
                        isActive
                          ? "bg-white/20 text-white border border-white/30 shadow-sm"
                          : "text-slate-200 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-brand-gold" : "text-slate-300"}`} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>

              <div className="border-t border-white/10 mt-3 pt-3 grid grid-cols-2 gap-2">
                <Link
                  to="/tkt/display"
                  target="_blank"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 flex items-center justify-center gap-2 border border-white/10"
                >
                  <Tv className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Layar Booth</span>
                </Link>

                <Link
                  to="/tkt"
                  target="_blank"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 flex items-center justify-center gap-2 border border-white/10"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Form Publik</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium text-slate-400">
              Memuat data operasional Titian Karir Terpadu...
            </p>
          </div>
        ) : (
          <div>
            {activeTab === "analytics" && (
              <TktAnalyticsView participants={participants} />
            )}

            {activeTab === "matrix" && (
              <TktBoardView
                participants={participants}
                config={config}
                availableDates={availableDates}
                onOpenDetail={(p) => {
                  setSelectedParticipant(p)
                  setModalDetailOpen(true)
                }}
                getWaLink={getWaLink}
              />
            )}

            {activeTab === "table" && (
              <TktSpreadsheetView
                participants={participants}
                config={config}
                availableDates={availableDates}
                availablePsikologs={availablePsikologs}
                onUpdateStatus={handleUpdateStatus}
                onUpdateParticipant={handleUpdateParticipant}
                onDeleteParticipant={(p) => {
                  setSelectedParticipant(p)
                  setModalDeleteOpen(true)
                }}
                onOpenWalkIn={() => setModalWalkInOpen(true)}
                onOpenDetail={(p) => {
                  setSelectedParticipant(p)
                  setModalDetailOpen(true)
                }}
                onOpenEdit={(p) => {
                  setSelectedParticipant(p)
                  setModalEditOpen(true)
                }}
                getWaLink={getWaLink}
              />
            )}

            {activeTab === "feedback" && <TktFeedbackView />}

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

      <TktDeleteConfirmModal
        isOpen={modalDeleteOpen}
        onClose={() => setModalDeleteOpen(false)}
        onConfirm={handleDeleteParticipant}
        participant={selectedParticipant}
      />
    </div>
  )
}
