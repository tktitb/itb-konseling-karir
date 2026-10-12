import React, { useState, useEffect, useCallback } from "react"
import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import AmbientGlow from "./components/common/AmbientGlow"
import Navbar from "./components/common/Navbar"
import Footer from "./components/common/Footer"
import PortalPage from "./pages/PortalPage"
import RegulerHomePage from "./pages/reguler/RegulerHomePage"
import RegulerSchedulePage from "./pages/reguler/RegulerSchedulePage"
import RegulerAboutPage from "./pages/reguler/RegulerAboutPage"
import TktPublicRegisterPage from "./pages/tkt/TktPublicRegisterPage"
import TktLoginPage from "./pages/tkt/TktLoginPage"
import TktAdminDashboard from "./pages/tkt/TktAdminDashboard"
import TktDisplayPage from "./pages/tkt/TktDisplayPage"
import TktFeedbackPage from "./pages/tkt/TktFeedbackPage"
import TktConfirmAttendancePage from "./pages/tkt/TktConfirmAttendancePage"
import {
  verifyAdminSession,
  touchAdminSessionActivity,
  subscribeAdminAuthSync
} from "./services/authService"

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function TktAdminRoute({ children }) {
  const [authStatus, setAuthStatus] = useState(() => verifyAdminSession())

  const revalidateSession = useCallback(() => {
    const check = verifyAdminSession()
    setAuthStatus((prev) => {
      if (prev.valid === check.valid && prev.reason === check.reason) {
        return prev
      }
      return check
    })
  }, [])

  useEffect(() => {
    revalidateSession()

    const heartbeatTimer = window.setInterval(() => {
      revalidateSession()
    }, 15000)

    const handleActivity = () => {
      const ok = touchAdminSessionActivity()
      if (!ok) {
        revalidateSession()
      }
    }

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        revalidateSession()
      }
    }

    const unsubscribeSync = subscribeAdminAuthSync((reason) => {
      setAuthStatus({
        valid: false,
        reason: reason || "logged_out",
        session: null
      })
    })

    window.addEventListener("mousedown", handleActivity, { passive: true })
    window.addEventListener("keydown", handleActivity, { passive: true })
    window.addEventListener("touchstart", handleActivity, { passive: true })
    window.addEventListener("scroll", handleActivity, { passive: true })
    window.addEventListener("focus", handleVisibilityOrFocus)
    document.addEventListener("visibilitychange", handleVisibilityOrFocus)

    return () => {
      window.clearInterval(heartbeatTimer)
      window.removeEventListener("mousedown", handleActivity)
      window.removeEventListener("keydown", handleActivity)
      window.removeEventListener("touchstart", handleActivity)
      window.removeEventListener("scroll", handleActivity)
      window.removeEventListener("focus", handleVisibilityOrFocus)
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus)
      unsubscribeSync()
    }
  }, [revalidateSession])

  if (!authStatus.valid) {
    const reasonParam =
      authStatus.reason === "idle_timeout" ||
      authStatus.reason === "session_expired" ||
      authStatus.reason === "logged_out"
        ? `?reason=${authStatus.reason}`
        : ""
    return <Navigate to={`/tkt/admin-rahasia${reasonParam}`} replace />
  }

  return children
}

export default function App() {
  const { pathname } = useLocation()
  const isRegulerRoute = pathname.startsWith("/reguler")
  const hideFooter = pathname.startsWith("/tkt/display") || pathname.startsWith("/tkt/admin")

  return (
    <div className="min-h-screen flex flex-col justify-between relative selection:bg-brand-navy selection:text-white">
      {!pathname.startsWith("/tkt/display") && <AmbientGlow />}
      <ScrollToTop />
      {isRegulerRoute && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<PortalPage />} />
          <Route path="/reguler" element={<RegulerHomePage />} />
          <Route path="/reguler/jadwal" element={<RegulerSchedulePage />} />
          <Route path="/reguler/tentang" element={<RegulerAboutPage />} />
          <Route path="/tkt" element={<TktPublicRegisterPage />} />
          <Route path="/tkt/admin-rahasia" element={<TktLoginPage />} />
          <Route
            path="/tkt/admin"
            element={
              <TktAdminRoute>
                <TktAdminDashboard />
              </TktAdminRoute>
            }
          />
          <Route path="/tkt/display" element={<TktDisplayPage />} />
          <Route path="/tkt/feedback" element={<TktFeedbackPage />} />
          <Route path="/tkt/feedback/:id" element={<TktFeedbackPage />} />
          <Route path="/tkt/konfirmasi/:id" element={<TktConfirmAttendancePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}
