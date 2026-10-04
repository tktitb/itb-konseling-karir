import React, { useEffect } from "react"
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

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function TktAdminRoute({ children }) {
  const isLogged = typeof window !== "undefined" && sessionStorage.getItem("itbcc_tkt_admin_logged") === "true"
  if (!isLogged) {
    return <Navigate to="/tkt/admin-rahasia" replace />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}


