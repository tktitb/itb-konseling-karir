import React from "react"
import { Link } from "react-router-dom"
import { Sparkles, Calendar, ArrowRight, Layers, ShieldCheck, Clock, Users } from "lucide-react"
import { APP_CONFIG } from "../../constants/config"
import GlassCard from "../../components/common/GlassCard"

export default function TktGatewayPlaceholder() {
  return (
    <div className="py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassCard className="p-8 sm:p-12 text-center border-2 border-brand-gold/30 shadow-glass-lg">
          <div className="w-16 h-16 rounded-2xl bg-brand-gold/20 text-brand-gold flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full liquid-badge-gold text-xs font-bold uppercase tracking-wider mb-4">
            <span>{APP_CONFIG.isTktActive ? "Event Sedang Aktif" : "Fase Pengembangan & Persiapan"}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-navy tracking-tight mb-4">
            {APP_CONFIG.tktEventName}
          </h1>

          <p className="text-sm sm:text-base text-brand-charcoal/80 leading-relaxed max-w-2xl mx-auto mb-8">
            Layanan konseling kilat dan bedah CV untuk bursa kerja Titian Karir Terpadu (TKT) ITB sedang dalam proses integrasi arsitektur sistem baru. Pendaftaran akan dibuka menjelang pelaksanaan event akbar TKT ITB.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto mb-8 text-left text-xs text-brand-charcoal/80">
            <div className="p-3.5 rounded-xl bg-white/60 border border-white/80">
              <ShieldCheck className="w-4 h-4 text-brand-gold mb-1.5" />
              <div className="font-bold text-brand-navy">Review CV Kilat</div>
              <div>Konsultasi berkas kerja langsung bersama psikolog.</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/60 border border-white/80">
              <Clock className="w-4 h-4 text-brand-gold mb-1.5" />
              <div className="font-bold text-brand-navy">Sesi Cepat & Tepat</div>
              <div>Dioptimalkan khusus untuk pengunjung bursa kerja.</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/60 border border-white/80">
              <Users className="w-4 h-4 text-brand-gold mb-1.5" />
              <div className="font-bold text-brand-navy">Antrean Terpadu</div>
              <div>Sistem kuota dinamis saat bursa kerja berlangsung.</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/reguler"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs text-white bg-brand-navy hover:bg-brand-blue shadow-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Calendar className="w-4 h-4 text-brand-gold" />
              <span>Gunakan Konseling Reguler</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-bold text-xs text-brand-navy bg-white/80 hover:bg-white border border-brand-navy/15 flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Layers className="w-4 h-4 text-brand-gold" />
              <span>Kembali ke Portal Utama</span>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
