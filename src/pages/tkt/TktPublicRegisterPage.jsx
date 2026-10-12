import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  User,
  CheckCircle2,
  ArrowLeft,
  Lock,
  Info,
  MapPin,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import {
  getSystemConfig,
  getTktSlotAvailability,
  subscribePesertaRealtime,
  SESI_TKT_META,
  formatSesiFull,
  ENABLE_TKT_WAITING_LIST,
  getActiveEventDates,
  getPsikologListForDate,
} from "../../services/tktService";
import TktBookingModal from "../../components/tkt/TktBookingModal";

const SESI_LIST = SESI_TKT_META.map((m) => ({
  id: m.id,
  number: m.number,
  sesiLabel: m.sesiLabel,
  label: `${m.timeRange} WIB`,
  period: m.period.toLowerCase(),
}));

export default function TktPublicRegisterPage() {
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [config, setConfig] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [activeDate, setActiveDate] = useState("");

  const [slotData, setSlotData] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [timeFilter, setTimeFilter] = useState("all");
  const [psychFilter, setPsychFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedSlotForModal, setSelectedSlotForModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      try {
        const cfg = await getSystemConfig();
        if (isMounted && cfg) {
          setConfig(cfg);
          const dates = getActiveEventDates(cfg);
          setAvailableDates(dates);
          if (dates.length > 0) {
            setActiveDate(dates[0]);
          }
        }
      } finally {
        if (isMounted) {
          setLoadingConfig(false);
        }
      }
    }
    loadConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadSlots = async (targetDate) => {
    if (!targetDate) return;
    setLoadingSlots(true);
    try {
      const data = await getTktSlotAvailability(targetDate);
      setSlotData(data || []);
    } catch {
      setSlotData([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (!activeDate) return;
    loadSlots(activeDate);

    const unsubscribe = subscribePesertaRealtime(() => {
      loadSlots(activeDate);
    });
    return () => {
      unsubscribe();
    };
  }, [activeDate]);

  const psychListForActiveDate = useMemo(() => {
    if (!config || !activeDate) return [];
    return getPsikologListForDate(config, activeDate);
  }, [config, activeDate]);

  const takenSlotsSet = useMemo(() => {
    const set = new Set();
    slotData.forEach((s) => {
      if (s.jadwal_sesi && s.psikolog_bertugas) {
        set.add(`${s.jadwal_sesi}__${s.psikolog_bertugas}`);
      }
    });
    return set;
  }, [slotData]);

  const filteredSessions = useMemo(() => {
    return SESI_LIST.filter((s) => {
      if (timeFilter === "pagi" && s.period !== "pagi") return false;
      if (timeFilter === "siang" && s.period !== "siang") return false;
      return true;
    });
  }, [timeFilter]);

  const handleOpenBooking = (sesiId, psychName, isTaken) => {
    if (isTaken && !ENABLE_TKT_WAITING_LIST) return;
    setSelectedSlotForModal({
      hari: activeDate,
      sesi: sesiId,
      psikolog: psychName,
      isWaitingList: ENABLE_TKT_WAITING_LIST ? isTaken : false,
    });
    setIsModalOpen(true);
  };

  const handleBookingSuccess = (result) => {
    setRegistrationResult(result);
    loadSlots(activeDate);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loadingConfig) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-300">
            Menyiapkan jadwal konseling TKT...
          </p>
        </div>
      </div>
    );
  }

  const isRegistrationClosed = !config || config.status_pendaftaran !== "buka";

  if (isRegistrationClosed) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg liquid-neumorph-card rounded-3xl p-8 sm:p-10 text-center border-t border-l border-white/20 shadow-2xl animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-white/10 text-brand-gold flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Pendaftaran Sedang Ditutup
          </h2>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Pendaftaran sesi konseling karier Titian Karir Terpadu saat ini
            belum dibuka atau kuota telah terpenuhi. Anda tetap berkesempatan
            mendaftar langsung (walk-in) di booth konseling saat acara
            berlangsung.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              className="liquid-neumorph-inset px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-slate-200 hover:text-white border border-white/10 inline-flex items-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Utama</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (registrationResult) {
    const isWaitingList =
      ENABLE_TKT_WAITING_LIST && registrationResult.status === "WAITING_LIST";

    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl liquid-neumorph-card rounded-3xl p-8 sm:p-10 border-t border-l border-white/20 shadow-2xl animate-in fade-in duration-200 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 liquid-neumorph-inset border border-white/10">
            {isWaitingList ? (
              <Clock className="w-8 h-8 text-brand-gold" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            {isWaitingList
              ? "Terdaftar di Antrean Waiting List"
              : "Pendaftaran Berhasil Diterima"}
          </h2>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Terima kasih,{" "}
            <strong className="text-white font-semibold">
              {registrationResult.nama}
            </strong>
            .
            {isWaitingList
              ? " Kuota sesi utama pada waktu tersebut telah terisi. Data Anda telah masuk ke dalam antrean tunggu dan akan dipanggil apabila peserta yang terjadwal tidak hadir saat acara berlangsung."
              : " Sesi konseling karier Anda telah terjadwal. Informasi konfirmasi kehadiran telah dicatat dalam sistem ITB Career Center."}
          </p>

          <div className="mt-6 p-4 rounded-2xl liquid-neumorph-inset text-left text-xs sm:text-sm space-y-2.5 border border-white/10">
            <div className="flex justify-between py-1 border-b border-white/10">
              <span className="text-slate-400">Hari & Tanggal:</span>
              <span className="font-semibold text-white">
                {registrationResult.hari}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/10">
              <span className="text-slate-400">Sesi Waktu:</span>
              <span className="font-semibold text-brand-gold">
                {formatSesiFull(registrationResult.sesi)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/10">
              <span className="text-slate-400">Psikolog:</span>
              <span className="font-semibold text-white">
                {registrationResult.psikolog}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Status Alokasi:</span>
              <span
                className={`font-semibold ${
                  isWaitingList ? "text-amber-300" : "text-emerald-400"
                }`}
              >
                {isWaitingList ? "Waiting List" : "Terkonfirmasi (Kuota Utama)"}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setRegistrationResult(null)}
              className="w-full sm:w-auto px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-slate-200 hover:text-white liquid-neumorph-inset border border-white/10 transition-all"
            >
              Lihat Jadwal Lain
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-slate-900 bg-brand-gold hover:bg-amber-400 shadow-md active:scale-95 transition-all inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white/95 p-0.5 shadow-xl border border-white/40 mx-auto mb-4 flex items-center justify-center">
          <img
            src="/images/logo.jpg"
            alt="ITB Career Center"
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
          Konseling Karier Titian Karir Terpadu
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm font-semibold text-brand-gold tracking-wide uppercase">
          ITB Career Center
        </p>
        <p className="mt-2 text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Pilih jadwal dan psikolog yang tersedia untuk sesi pendampingan karier
          Anda.
        </p>
      </div>

      <div
        className={`mb-6 grid grid-cols-1 ${
          ENABLE_TKT_WAITING_LIST ? "md:grid-cols-2" : ""
        } gap-3.5`}
      >
        {ENABLE_TKT_WAITING_LIST && (
          <div className="p-4 rounded-2xl liquid-neumorph-card border-t border-l border-white/20 shadow-md flex items-center gap-3">
            <div className="p-2.5 rounded-xl liquid-neumorph-inset text-brand-gold shrink-0 border border-white/10">
              <Info className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong className="text-white font-semibold">
                Antrean Waiting List:
              </strong>{" "}
              Jika jadwal terisi, Anda dapat mendaftar antrean dan akan dipanggil
              apabila peserta yang terjadwal tidak hadir saat acara berlangsung.
            </div>
          </div>
        )}

        <div className="p-4 rounded-2xl liquid-neumorph-card border-t border-l border-white/20 shadow-md flex items-center gap-3">
          <div className="p-2.5 rounded-xl liquid-neumorph-inset text-brand-gold shrink-0 border border-white/10">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <strong className="text-white font-semibold">
              Walk-in di Lokasi:
            </strong>{" "}
            Apabila seluruh kuota online penuh, pendaftaran langsung tetap
            tersedia di booth konseling karier saat acara berlangsung.
          </div>
        </div>
      </div>

      {availableDates.length > 1 && (
        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1.5 rounded-2xl liquid-neumorph-inset border border-white/10 gap-1.5">
            {availableDates.map((date, idx) => {
              const isActive = activeDate === date;
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setActiveDate(date)}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-brand-gold text-slate-900 shadow-md"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Hari {idx + 1}: {date}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-8 p-3 sm:p-4 rounded-2xl liquid-neumorph-card border-t border-l border-white/20 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="w-full lg:w-auto p-1 rounded-xl liquid-neumorph-inset border border-white/10 grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setTimeFilter("all")}
            className={`h-9 sm:h-10 px-2 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all text-center flex items-center justify-center ${
              timeFilter === "all"
                ? "bg-brand-gold text-slate-900 font-semibold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>Semua Sesi</span>
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter("pagi")}
            className={`h-9 sm:h-10 px-2 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all text-center flex items-center justify-center ${
              timeFilter === "pagi"
                ? "bg-brand-gold text-slate-900 font-semibold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="sm:hidden">Pagi</span>
            <span className="hidden sm:inline">Pagi (09.00 - 12.15)</span>
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter("siang")}
            className={`h-9 sm:h-10 px-2 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all text-center flex items-center justify-center ${
              timeFilter === "siang"
                ? "bg-brand-gold text-slate-900 font-semibold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="sm:hidden">Siang</span>
            <span className="hidden sm:inline">Siang (13.15 - 15.40)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-52 min-w-0">
            <select
              value={psychFilter}
              onChange={(e) => setPsychFilter(e.target.value)}
              className="w-full h-10 pl-2.5 sm:pl-3.5 pr-7 sm:pr-8 rounded-xl liquid-neumorph-inset bg-[#0e2744] text-white border border-white/10 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-gold appearance-none truncate"
            >
              <option value="all" className="bg-[#0b1a27] text-white">
                Semua Psikolog
              </option>
              {psychListForActiveDate.map((p) => (
                <option key={p} value={p} className="bg-[#0b1a27] text-white">
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative flex-1 lg:w-44 min-w-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 pl-2.5 sm:pl-3.5 pr-7 sm:pr-8 rounded-xl liquid-neumorph-inset bg-[#0e2744] text-white border border-white/10 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-gold appearance-none truncate"
            >
              <option value="all" className="bg-[#0b1a27] text-white">
                Semua Status
              </option>
              <option value="available" className="bg-[#0b1a27] text-white">
                Tersedia Saja
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => loadSlots(activeDate)}
            className="h-10 w-10 shrink-0 rounded-xl liquid-neumorph-inset text-slate-300 hover:text-brand-gold active:scale-95 transition-all flex items-center justify-center border border-white/10"
            title="Muat Ulang Ketersediaan"
          >
            <RefreshCw
              className={`w-4 h-4 ${loadingSlots ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {filteredSessions.map((session) => {
          const psychsToShow = psychListForActiveDate.filter((p) => {
            if (psychFilter !== "all" && p !== psychFilter) return false;
            return true;
          });

          const visibleSlots = psychsToShow
            .map((psych) => {
              const isTaken = takenSlotsSet.has(`${session.id}__${psych}`);
              return { psych, isTaken };
            })
            .filter((slot) => {
              if (statusFilter === "available" && slot.isTaken) return false;
              if (statusFilter === "taken" && !slot.isTaken) return false;
              return true;
            });

          if (visibleSlots.length === 0) return null;

          const availableCount = visibleSlots.filter((s) => !s.isTaken).length;

          return (
            <div
              key={session.id}
              className="liquid-neumorph-card rounded-2xl p-4 sm:p-6 border-t border-l border-white/20 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-white/10 mb-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 rounded-xl bg-brand-gold/15 text-brand-gold border border-brand-gold/30 text-xs sm:text-sm font-bold tracking-wide shrink-0">
                    {session.sesiLabel}
                  </span>
                  <div className="flex items-center gap-1.5 text-white">
                    <Clock className="w-4 h-4 text-brand-gold shrink-0" />
                    <span className="text-sm sm:text-base font-bold font-mono tracking-wide">
                      {session.label}
                    </span>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-300">
                  Tersedia {availableCount} dari {visibleSlots.length} Kuota
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4">
                {visibleSlots.map(({ psych, isTaken }) => {
                  return (
                    <div
                      key={psych}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                        isTaken
                          ? "liquid-neumorph-inset border-white/5 bg-white/[0.02]"
                          : "liquid-neumorph-card border-white/15 hover:border-brand-gold/40 bg-white/5"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="text-xs text-slate-400 font-medium">
                            Psikolog
                          </span>
                          {isTaken ? (
                            <span className="text-slate-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-xs font-medium">
                              Terisi
                            </span>
                          ) : (
                            <span className="text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-medium">
                              Tersedia
                            </span>
                          )}
                        </div>

                        <div className="flex items-start gap-2.5 pt-1">
                          <User
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isTaken ? "text-slate-500" : "text-brand-gold"
                            }`}
                          />
                          <h4
                            className={`text-sm sm:text-base font-semibold leading-snug ${
                              isTaken ? "text-slate-400" : "text-white"
                            }`}
                          >
                            {psych}
                          </h4>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isTaken && !ENABLE_TKT_WAITING_LIST}
                        onClick={() =>
                          handleOpenBooking(session.id, psych, isTaken)
                        }
                        className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                          isTaken
                            ? ENABLE_TKT_WAITING_LIST
                              ? "liquid-neumorph-inset text-amber-300 hover:text-white hover:bg-amber-500/15 border border-amber-400/20 active:scale-95"
                              : "liquid-neumorph-inset text-slate-500 border border-white/5 cursor-not-allowed opacity-70"
                            : "bg-brand-gold text-slate-900 hover:bg-amber-400 shadow-md active:scale-95"
                        }`}
                      >
                        {isTaken
                          ? ENABLE_TKT_WAITING_LIST
                            ? "Daftar Waiting List"
                            : "Jadwal Terisi"
                          : "Pilih Jadwal"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <TktBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedSlot={selectedSlotForModal}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}
