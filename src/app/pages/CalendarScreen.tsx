import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Search,
  AlertTriangle,
  Loader2,
  Clock,
  User,
  CalendarDays,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { api } from "../services/api";
import { animate } from "animejs";
import { toast } from "sonner";

// ── Constants ─────────────────────────────────────────────────────────────────

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const CELL_H = 80;
const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const CABINS = ["Cabina Facial 1", "Cabina Corporal 2", "Box Fisioterapia", "Ninguna"];

const LOCAL_STORAGE_KEY_APPTS = "bloom_skin_local_appointments";
const LOCAL_STORAGE_KEY_PROFS = "bloom_skin_local_professionals";

const MOCK_PROFESSIONALS: Professional[] = [
  { id: "prof1", name: "Dra. Ana Valencia", specialty: "Dermatología Facial", role: "PHYSIO" },
  { id: "prof2", name: "Lic. Carlos Ruiz", specialty: "Fisioterapia Corporal", role: "PHYSIO" },
  { id: "prof3", name: "Dra. Elena Gómez", specialty: "Estética Avanzada", role: "AESTHETICIAN" },
];

const getMockAppointments = (profId1: string, profId2: string): Appointment[] => {
  const todayStr = new Date();
  const formatIso = (offsetDays: number, hour: number, minutes = 0) => {
    const d = new Date(todayStr);
    d.setDate(todayStr.getDate() + offsetDays);
    d.setHours(hour, minutes, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: "appt-1",
      patientId: "p1",
      patient: { fullName: "Sofía Vergara" },
      professionalId: profId1,
      professional: { name: "Dra. Ana Valencia" },
      dateTime: formatIso(0, 9),
      duration: 60,
      status: "CONFIRMADA",
      cabin: "Cabina Facial 1"
    },
    {
      id: "appt-2",
      patientId: "p2",
      patient: { fullName: "Alejandro Sanz" },
      professionalId: profId2,
      professional: { name: "Lic. Carlos Ruiz" },
      dateTime: formatIso(0, 11),
      duration: 90,
      status: "PENDIENTE",
      cabin: "Cabina Corporal 2"
    },
    {
      id: "appt-3",
      patientId: "p3",
      patient: { fullName: "Laura Pausini" },
      professionalId: profId1,
      professional: { name: "Dra. Ana Valencia" },
      dateTime: formatIso(1, 14),
      duration: 60,
      status: "COMPLETADA",
      cabin: "Box Fisioterapia"
    },
    {
      id: "appt-4",
      patientId: "p4",
      patient: { fullName: "Marc Anthony" },
      professionalId: profId2,
      professional: { name: "Lic. Carlos Ruiz" },
      dateTime: formatIso(0, 16),
      duration: 60,
      status: "NO_ASISTIO",
      cabin: "Ninguna"
    }
  ];
};

// Quick-pick time slots for the form
const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "13:00", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00",
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface Appointment {
  id: string;
  patientId: string;
  patient: { fullName: string };
  professionalId: string;
  professional: { name: string };
  dateTime: string;
  duration: number;
  status: "PENDIENTE" | "CONFIRMADA" | "COMPLETADA" | "CANCELADA_CON_CARGO" | "CANCELADA_SIN_CARGO" | "NO_ASISTIO";
  cabin?: string | null;
  notes?: string;
}

interface Professional {
  id: string;
  name: string;
  specialty?: string;
  role?: string;
}

interface Patient {
  id: string;
  fullName: string;
  phone: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getWeekDates(referenceDate: Date) {
  const day = referenceDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatMonthYear(dates: Date[]) {
  const months = [...new Set(dates.map((d) => d.toLocaleDateString("es-MX", { month: "long" })))];
  const year = dates[0].getFullYear();
  return `${months.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(" / ")} ${year}`;
}

function formatSingleDay(d: Date) {
  return d.toLocaleDateString("es-MX", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .replace(/^\w/, (c) => c.toUpperCase());
}

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

function isToday(d: Date) {
  return isSameDay(d, new Date());
}

function getDayIndex(dateStr: string, weekDates: Date[]) {
  const d = new Date(dateStr);
  return weekDates.findIndex((wd) => isSameDay(wd, d));
}

function getStartHourFloat(dateStr: string) {
  const d = new Date(dateStr);
  return d.getHours() + d.getMinutes() / 60;
}

interface OverlapInfo {
  column: number;
  totalColumns: number;
}

function computeOverlapColumns(appointments: Appointment[], weekDates: Date[], dayIdx: number): Map<string, OverlapInfo> {
  const dayAppts = appointments
    .filter((a) => getDayIndex(a.dateTime, weekDates) === dayIdx)
    .map((a) => ({ id: a.id, start: getStartHourFloat(a.dateTime), end: getStartHourFloat(a.dateTime) + a.duration / 60 }))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const result = new Map<string, OverlapInfo>();
  if (dayAppts.length === 0) return result;

  const components: { start: number; end: number; items: typeof dayAppts }[] = [];
  for (const item of dayAppts) {
    const last = components[components.length - 1];
    if (last && item.start < last.end) {
      last.items.push(item);
      last.end = Math.max(last.end, item.end);
    } else {
      components.push({ start: item.start, end: item.end, items: [item] });
    }
  }

  for (const comp of components) {
    const cols: { end: number; ids: string[] }[] = [];
    for (const item of comp.items) {
      let placed = false;
      for (let c = 0; c < cols.length; c++) {
        if (cols[c].end <= item.start) {
          cols[c].end = item.end;
          cols[c].ids.push(item.id);
          result.set(item.id, { column: c, totalColumns: cols.length });
          placed = true;
          break;
        }
      }
      if (!placed) {
        cols.push({ end: item.end, ids: [item.id] });
        result.set(item.id, { column: cols.length - 1, totalColumns: cols.length });
      }
    }
    const maxCols = cols.length;
    for (const col of cols) {
      for (const id of col.ids) {
        const info = result.get(id);
        if (info) info.totalColumns = maxCols;
      }
    }
  }

  return result;
}

const STATUS_STYLE: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  CONFIRMADA:           { bg: "bg-success/10",      border: "border-success/20",     text: "text-success",     dot: "bg-success" },
  COMPLETADA:           { bg: "bg-secondary/10",    border: "border-secondary/20",   text: "text-secondary",   dot: "bg-secondary" },
  PENDIENTE:            { bg: "bg-warning/10",      border: "border-warning/20",     text: "text-warning",     dot: "bg-warning" },
  CANCELADA_CON_CARGO:  { bg: "bg-error/10",        border: "border-error/20",       text: "text-error",       dot: "bg-error" },
  CANCELADA_SIN_CARGO:  { bg: "bg-muted",            border: "border-border",         text: "text-muted-foreground", dot: "bg-muted-foreground" },
  NO_ASISTIO:           { bg: "bg-muted border-dashed border-error/30", border: "border-error/20", text: "text-error", dot: "bg-error" },
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function CalendarScreen({
  presetAppointmentData,
  clearPresetAppointmentData,
  onNavigate,
  onSelectPatient,
}: {
  presetAppointmentData?: { patientId: string; patientName: string; date?: string } | null;
  clearPresetAppointmentData?: () => void;
  onNavigate?: (screen: string) => void;
  onSelectPatient?: (patientId: string) => void;
}) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<"weekly" | "cabins">("weekly");

  useEffect(() => {
    if (presetAppointmentData) {
      setSelectedPatientId(presetAppointmentData.patientId || "");
      setSearchQuery(presetAppointmentData.patientName || "");
      if (presetAppointmentData.date) {
        setDate(presetAppointmentData.date);
        setCurrentDate(new Date(presetAppointmentData.date + "T00:00:00"));
      }
      setShowSlideOver(true);
    }
  }, [presetAppointmentData]);
  const [showSlideOver, setShowSlideOver] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedProfessionalId, setSelectedProfessionalId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");
  const [cabin, setCabin] = useState("Ninguna");

  // Edit & Detail modal state
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<{ day: number; hour: number } | null>(null);

  // Quick Register & Patient Verification States
  const [selectedPatientObj, setSelectedPatientObj] = useState<any | null>(null);
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [quickPhone, setQuickPhone] = useState("");

  useEffect(() => {
    if (!selectedPatientId) {
      setSelectedPatientObj(null);
      return;
    }
    api.get(`/patients/${selectedPatientId}`)
      .then(res => {
        setSelectedPatientObj(res);
      })
      .catch(err => {
        console.error("Error fetching patient details:", err);
      });
  }, [selectedPatientId]);

  const slideOverRef = useRef<HTMLDivElement>(null);

  // Computed week dates
  const weekDates = getWeekDates(currentDate);

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      let apptsData: Appointment[] = [];
      let profData: Professional[] = [];

      try {
        apptsData = await api.get<Appointment[]>("/appointments");
        localStorage.setItem(LOCAL_STORAGE_KEY_APPTS, JSON.stringify(apptsData));
      } catch (err) {
        console.warn("Error al cargar citas de la API, usando localStorage fallback:", err);
        const local = localStorage.getItem(LOCAL_STORAGE_KEY_APPTS);
        if (local) {
          apptsData = JSON.parse(local);
        } else {
          const mockProfs = MOCK_PROFESSIONALS;
          apptsData = getMockAppointments(mockProfs[0].id, mockProfs[1].id);
          localStorage.setItem(LOCAL_STORAGE_KEY_APPTS, JSON.stringify(apptsData));
        }
      }

      try {
        profData = await api.get<Professional[]>("/professionals");
        localStorage.setItem(LOCAL_STORAGE_KEY_PROFS, JSON.stringify(profData));
      } catch (err) {
        console.warn("Error al cargar profesionales de la API, usando localStorage fallback:", err);
        const local = localStorage.getItem(LOCAL_STORAGE_KEY_PROFS);
        if (local) {
          profData = JSON.parse(local);
        } else {
          profData = MOCK_PROFESSIONALS;
          localStorage.setItem(LOCAL_STORAGE_KEY_PROFS, JSON.stringify(profData));
        }
      }

      setAppointments(apptsData);
      setProfessionals(profData);
    } catch (err) {
      console.error("Error al cargar citas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Animate slide-over on open
  useEffect(() => {
    if (showSlideOver && slideOverRef.current) {
      animate(slideOverRef.current, {
        translateX: ["100%", "0%"],
        duration: 380,
        easing: "easeOutExpo",
      });
    }
  }, [showSlideOver]);

  // Debounced patient search
  useEffect(() => {
    if (searchQuery.trim().length < 2) { setPatients([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await api.get<Patient[]>(`/patients?search=${encodeURIComponent(searchQuery)}`);
        setPatients(res);
      } catch {
        const mockPatients: Patient[] = [
          { id: "p1", fullName: "Sofía Vergara", phone: "+54 9 11 5555-1234" },
          { id: "p2", fullName: "Alejandro Sanz", phone: "+54 9 11 5555-5678" },
          { id: "p3", fullName: "Laura Pausini", phone: "+54 9 11 5555-9012" },
          { id: "p4", fullName: "Marc Anthony", phone: "+54 9 11 5555-3456" },
          { id: "p5", fullName: "Shakira Ripoll", phone: "+54 9 11 5555-7890" },
        ];
        const filtered = mockPatients.filter(p =>
          p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.phone.includes(searchQuery)
        );
        setPatients(filtered);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const openSlot = (dayDate: Date, hour: number) => {
    setDate(dayDate.toISOString().slice(0, 10));
    setTime(`${String(hour).padStart(2, "0")}:00`);
    setCabin("Ninguna");
    setError(null);
    setEditingAppointment(null);
    setShowSlideOver(true);
  };

  const openCabinSlot = (cabinName: string, hour: number) => {
    setDate(currentDate.toISOString().slice(0, 10));
    setTime(`${String(hour).padStart(2, "0")}:00`);
    setCabin(cabinName);
    setError(null);
    setEditingAppointment(null);
    setShowSlideOver(true);
  };

  const resetForm = () => {
    setSelectedPatientId("");
    setSelectedProfessionalId("");
    setSearchQuery("");
    setNotes("");
    setDate(new Date().toISOString().slice(0, 10));
    setTime("09:00");
    setDuration(60);
    setCabin("Ninguna");
    setEditingAppointment(null);
  };

  const closeSlideOver = () => {
    setShowSlideOver(false);
    resetForm();
    if (clearPresetAppointmentData) {
      clearPresetAppointmentData();
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!selectedPatientId) { setError("Selecciona un paciente."); setSubmitting(false); return; }
    if (!selectedProfessionalId) { setError("Selecciona un profesional."); setSubmitting(false); return; }

    const dateTimeStr = new Date(`${date}T${time}:00`).toISOString();
    const payload = {
      patientId: selectedPatientId,
      professionalId: selectedProfessionalId,
      dateTime: dateTimeStr,
      duration,
      notes,
      cabin: cabin !== "Ninguna" ? cabin : null
    };

    try {
      if (editingAppointment) {
        await api.put(`/appointments/${editingAppointment.id}`, payload);
      } else {
        await api.post("/appointments", payload);
      }
      const apptsData = await api.get<Appointment[]>("/appointments");
      setAppointments(apptsData);
      localStorage.setItem(LOCAL_STORAGE_KEY_APPTS, JSON.stringify(apptsData));
      closeSlideOver();
    } catch (err: any) {
      console.warn("Error al guardar en el servidor, aplicando fallback local:", err);
      
      // Save to offline queue
      const apptQueueData = {
        appointmentId: editingAppointment ? editingAppointment.id : null,
        payload,
        isNew: !editingAppointment
      };
      const localOffStatusRaw = localStorage.getItem("offline_appointment_status");
      const localOffStatus = localOffStatusRaw ? JSON.parse(localOffStatusRaw) : [];
      localOffStatus.push(apptQueueData);
      localStorage.setItem("offline_appointment_status", JSON.stringify(localOffStatus));

      let currentAppts: Appointment[] = [];
      const local = localStorage.getItem(LOCAL_STORAGE_KEY_APPTS);
      if (local) currentAppts = JSON.parse(local);

      const patientObj = patients.find(p => p.id === selectedPatientId) || { fullName: searchQuery };
      const profObj = professionals.find(p => p.id === selectedProfessionalId) || { name: "Profesional" };

      if (editingAppointment) {
        currentAppts = currentAppts.map(appt => {
          if (appt.id === editingAppointment.id) {
            return {
              ...appt,
              patientId: selectedPatientId,
              patient: { fullName: patientObj.fullName },
              professionalId: selectedProfessionalId,
              professional: { name: profObj.name },
              dateTime: dateTimeStr,
              duration,
              notes,
              cabin: cabin !== "Ninguna" ? cabin : null
            };
          }
          return appt;
        });
      } else {
        const newAppt: Appointment = {
          id: `appt-${Date.now()}`,
          patientId: selectedPatientId,
          patient: { fullName: patientObj.fullName },
          professionalId: selectedProfessionalId,
          professional: { name: profObj.name },
          dateTime: dateTimeStr,
          duration,
          notes,
          cabin: cabin !== "Ninguna" ? cabin : null,
          status: "PENDIENTE"
        };
        currentAppts.push(newAppt);
      }

      setAppointments(currentAppts);
      localStorage.setItem(LOCAL_STORAGE_KEY_APPTS, JSON.stringify(currentAppts));
      closeSlideOver();

      if (slideOverRef.current) {
        animate(slideOverRef.current, { translateX: [-12, 12, -12, 12, 0], duration: 380, easing: "linear" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkNoShow = async (apptId: string) => {
    try {
      await api.put(`/appointments/${apptId}`, { status: "NO_ASISTIO" });
      const apptsData = await api.get<Appointment[]>("/appointments");
      setAppointments(apptsData);
      localStorage.setItem(LOCAL_STORAGE_KEY_APPTS, JSON.stringify(apptsData));
    } catch (err) {
      console.warn("Error al marcar inasistencia en servidor, aplicando fallback local:", err);
      
      // Save status update to offline queue
      const statusData = {
        appointmentId: apptId,
        status: "NO_ASISTIO",
        isStatusUpdateOnly: true,
        isNew: false
      };
      const localOffStatusRaw = localStorage.getItem("offline_appointment_status");
      const localOffStatus = localOffStatusRaw ? JSON.parse(localOffStatusRaw) : [];
      localOffStatus.push(statusData);
      localStorage.setItem("offline_appointment_status", JSON.stringify(localOffStatus));

      let currentAppts: Appointment[] = [];
      const local = localStorage.getItem(LOCAL_STORAGE_KEY_APPTS);
      if (local) currentAppts = JSON.parse(local);

      currentAppts = currentAppts.map(appt => {
        if (appt.id === apptId) {
          return { ...appt, status: "NO_ASISTIO" };
        }
        return appt;
      });

      setAppointments(currentAppts);
      localStorage.setItem(LOCAL_STORAGE_KEY_APPTS, JSON.stringify(currentAppts));
    } finally {
      setShowDetailModal(false);
      setSelectedAppointment(null);
    }
  };

  const handlePrev = () => {
    const nextDate = new Date(currentDate);
    if (viewMode === "weekly") {
      nextDate.setDate(nextDate.getDate() - 7);
    } else {
      nextDate.setDate(nextDate.getDate() - 1);
    }
    setCurrentDate(nextDate);
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    if (viewMode === "weekly") {
      nextDate.setDate(nextDate.getDate() + 7);
    } else {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    setCurrentDate(nextDate);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden select-none">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-border flex-shrink-0" style={{ background: 'var(--popover)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-muted/50 border border-border p-1 rounded-xl">
            <button
              onClick={handlePrev}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-card transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-sm font-bold text-foreground min-w-[200px] text-center px-1">
              {viewMode === "weekly" ? formatMonthYear(weekDates) : formatSingleDay(currentDate)}
            </span>
            <button
              onClick={handleNext}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-card transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-border hover:bg-primary hover:text-white hover:border-primary transition-all text-muted-foreground cursor-pointer"
          >
            Hoy
          </button>
        </div>

        {/* View Mode Toggle */}
        <div id="tour-calendar-cabins" className="flex border border-border rounded-xl p-1 bg-muted/40">
          <button
            onClick={() => setViewMode("weekly")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === "weekly"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Vista Semanal
          </button>
          <button
            onClick={() => setViewMode("cabins")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === "cabins"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Vista Cabinas (Día)
          </button>
        </div>

        {/* Legend + button */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4 text-[11px] font-semibold text-muted-foreground">
            {[
              { label: "Confirmada", color: "bg-success" },
              { label: "Pendiente", color: "bg-warning" },
              { label: "Completada", color: "bg-secondary" },
              { label: "Inasistencia", color: "bg-error" },
            ].map(({ label, color }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${color} inline-block flex-shrink-0`} />
                {label}
              </span>
            ))}
          </div>
          <button
            onClick={() => { resetForm(); setShowSlideOver(true); }}
            id="tour-calendar-create-btn"
            className="flex items-center gap-2 bg-primary text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nueva Cita
          </button>
        </div>
      </div>

      {/* ── Calendar Grid ── */}
      <div id="tour-calendar-grid" className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden">
        <div style={{ minWidth: 700 }}>

          {/* Header */}
          {viewMode === "weekly" ? (
            <div
              className="grid sticky top-0 bg-card z-20 border-b-2 border-border shadow-sm"
              style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}
            >
              <div className="border-r border-border/50" />
              {weekDates.map((dayDate, i) => {
                const todayDay = isToday(dayDate);
                const dayAppts = appointments.filter((a) => getDayIndex(a.dateTime, weekDates) === i);
                return (
                  <div
                    key={i}
                    className={`text-center py-3 px-2 border-r border-border/50 last:border-r-0 ${todayDay ? "bg-primary/5" : ""}`}
                  >
                    <div className={`text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 ${todayDay ? "text-primary" : "text-muted-foreground"}`}>
                      {DAY_NAMES[i]}
                    </div>
                    <div
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-base font-black transition-all ${
                        todayDay
                          ? "bg-primary text-white shadow-lg shadow-primary/40"
                          : "text-foreground hover:bg-muted cursor-pointer"
                      }`}
                    >
                      {dayDate.getDate()}
                    </div>
                    {/* Appointment count badge */}
                    {dayAppts.length > 0 && (
                      <div className="flex justify-center mt-1.5 gap-0.5">
                        {dayAppts.slice(0, 5).map((_, idx) => (
                          <span key={idx} className="w-1.5 h-1.5 rounded-full bg-primary/60 inline-block" />
                        ))}
                        {dayAppts.length > 5 && <span className="text-[8px] text-primary font-bold">+{dayAppts.length - 5}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // Cabin headers
            <div
              className="grid sticky top-0 bg-card z-20 border-b-2 border-border shadow-sm"
              style={{ gridTemplateColumns: "64px repeat(4, 1fr)" }}
            >
              <div className="border-r border-border/50" />
              {CABINS.map((cabinName, i) => {
                const cabinAppts = appointments.filter((a) => {
                  const isSame = isSameDay(new Date(a.dateTime), currentDate);
                  const isCabin = (a.cabin || "Ninguna") === cabinName;
                  return isSame && isCabin;
                });
                return (
                  <div
                    key={i}
                    className="text-center py-3.5 px-2 border-r border-border/50 last:border-r-0 bg-muted/15"
                  >
                    <div className="text-[11px] font-black uppercase tracking-[0.15em] text-primary mb-1">
                      {cabinName}
                    </div>
                    <div className="text-xs font-bold text-muted-foreground">
                      {cabinAppts.length} {cabinAppts.length === 1 ? "cita" : "citas"} hoy
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Time rows */}
          <div className="relative" style={{ height: HOURS.length * CELL_H }}>
            {/* Background grid */}
            <div
              className="absolute inset-0 grid"
              style={{ gridTemplateColumns: viewMode === "weekly" ? "64px repeat(7, 1fr)" : "64px repeat(4, 1fr)" }}
            >
              {HOURS.map((hour) => (
                <div key={`row-${hour}`} className="contents">
                  {/* Hour label */}
                    <div
                      className="border-r border-b border-border flex items-start justify-end pr-3 pt-2 flex-shrink-0 bg-muted"
                      style={{ height: CELL_H }}
                    >
                    <span className="text-[11px] text-muted-foreground font-bold tabular-nums">
                      {hour < 12 ? `${hour}:00` : hour === 12 ? "12:00" : `${hour - 12}:00`}
                      <span className="ml-0.5 text-[9px] opacity-60">{hour < 12 ? "am" : "pm"}</span>
                    </span>
                  </div>

                  {/* Day or Cabin cells */}
                  {viewMode === "weekly" ? (
                    weekDates.map((dayDate, di) => {
                      const isHovered = hoveredSlot?.day === di && hoveredSlot?.hour === hour;
                      const todayCol = isToday(dayDate);
                      return (
                        <div
                          key={`cell-${hour}-${di}`}
                          className={`border-r border-b border-border last:border-r-0 relative cursor-pointer transition-all duration-150 group ${
                            isHovered
                              ? "bg-primary/10"
                              : todayCol
                              ? "bg-primary/[0.02] hover:bg-primary/10"
                              : "hover:bg-primary/8"
                          }`}
                          style={{ height: CELL_H }}
                          onMouseEnter={() => setHoveredSlot({ day: di, hour })}
                          onMouseLeave={() => setHoveredSlot(null)}
                          onClick={() => openSlot(dayDate, hour)}
                        >
                          {/* Hover "+" indicator */}
                          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-150 ${isHovered ? "opacity-100" : "opacity-0"}`}>
                            <div className="flex items-center gap-1.5 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-primary/30">
                              <Plus className="w-2.5 h-2.5" />
                              {String(hour).padStart(2, "0")}:00
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Cabins cells
                    CABINS.map((cabinName, ci) => {
                      const isHovered = hoveredSlot?.day === ci && hoveredSlot?.hour === hour;
                      return (
                        <div
                          key={`cell-cabin-${hour}-${ci}`}
                          className={`border-r border-b border-border last:border-r-0 relative cursor-pointer transition-all duration-150 group ${
                            isHovered ? "bg-primary/10" : "hover:bg-primary/8"
                          }`}
                          style={{ height: CELL_H }}
                          onMouseEnter={() => setHoveredSlot({ day: ci, hour })}
                          onMouseLeave={() => setHoveredSlot(null)}
                          onClick={() => openCabinSlot(cabinName, hour)}
                        >
                          {/* Hover "+" indicator */}
                          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-150 ${isHovered ? "opacity-100" : "opacity-0"}`}>
                            <div className="flex items-center gap-1.5 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-primary/30">
                              <Plus className="w-2.5 h-2.5" />
                              {String(hour).padStart(2, "0")}:00
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ))}
            </div>

            {/* Appointment cards overlay */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{ left: 64, right: 0 }}
            >
              {loading ? (
                <div className="flex items-center justify-center h-40 gap-2 mt-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground font-medium">Cargando citas...</span>
                </div>
              ) : (() => {
                const overlapMap = new Map<string, OverlapInfo>();
                if (viewMode === "weekly") {
                  for (let di = 0; di < 7; di++) {
                    const dayGroups = computeOverlapColumns(appointments, weekDates, di);
                    dayGroups.forEach((v, k) => overlapMap.set(k, v));
                  }
                }
                console.log("[Calendar] overlapMap size:", overlapMap.size, "appointments:", appointments.length);
                overlapMap.forEach((v, k) => console.log("[Calendar] ", k, "->", v));

                return appointments.map((appt) => {
                  const startHr = getStartHourFloat(appt.dateTime);
                  const durHrs = appt.duration / 60;
                  const style = STATUS_STYLE[appt.status] ?? STATUS_STYLE.PENDIENTE;

                  if (startHr < 8 || startHr >= 20) return null;

                  if (viewMode === "weekly") {
                    const dayIndex = getDayIndex(appt.dateTime, weekDates);
                    if (dayIndex < 0 || dayIndex > 6) return null;

                    const overlap = overlapMap.get(appt.id);
                    const col = overlap?.column ?? 0;
                    const total = overlap?.totalColumns ?? 1;
                    const dayPct = 100 / 7;
                    const pad = 0.4;
                    const gapPct = 0.3;
                    const slotW = (dayPct - pad * 2 - gapPct * (total - 1)) / total;
                    const leftPct = dayIndex * dayPct + pad + col * (slotW + gapPct);

                    return (
                      <div
                        key={appt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointment(appt);
                          setShowDetailModal(true);
                        }}
                        className={`absolute rounded-xl px-2.5 py-2 overflow-hidden pointer-events-auto cursor-pointer border-l-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] ${style.bg} ${style.border} ${style.text}`}
                        style={{
                          top: (startHr - 8) * CELL_H + 3,
                          height: Math.max(durHrs * CELL_H - 6, 28),
                          left: `${leftPct}%`,
                          width: `${slotW}%`,
                        }}
                      >
                        <div className="flex items-start gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${style.dot}`} />
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold leading-tight truncate flex items-center gap-1">
                              <span>{appt.patient?.fullName}</span>
                              {(!appt.patient?.consentSigned || !appt.patient?.medicalHistory) && (
                                <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0" title="Paciente con documentos pendientes: Ficha Dermatofuncional / Consentimiento" />
                              )}
                            </div>
                            {appt.service && (
                              <div className="text-[9px] opacity-75 font-semibold leading-tight truncate mt-0.5">{appt.service.name}</div>
                            )}
                            {durHrs >= 0.75 && (
                              <>
                                <div className="text-[10px] opacity-70 leading-tight truncate mt-0.5">{appt.professional?.name}</div>
                                {appt.cabin && (
                                  <div className="text-[9px] opacity-75 font-semibold leading-tight truncate">{appt.cabin}</div>
                                )}
                                <div className="text-[9px] opacity-60 leading-tight mt-0.5">{appt.duration} min</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // Cabins View
                    if (!isSameDay(new Date(appt.dateTime), currentDate)) return null;

                    const cabinName = appt.cabin || "Ninguna";
                    const cabinIndex = CABINS.indexOf(cabinName);
                    if (cabinIndex === -1) return null;

                    return (
                      <div
                        key={appt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointment(appt);
                          setShowDetailModal(true);
                        }}
                        className={`absolute rounded-xl px-2.5 py-2 overflow-hidden pointer-events-auto cursor-pointer border-l-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] ${style.bg} ${style.border} ${style.text}`}
                        style={{
                          top: (startHr - 8) * CELL_H + 3,
                          height: Math.max(durHrs * CELL_H - 6, 28),
                          left: `calc(${cabinIndex} * 100% / 4 + 4px)`,
                          width: `calc(100% / 4 - 8px)`,
                        }}
                      >
                        <div className="flex items-start gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${style.dot}`} />
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold leading-tight truncate flex items-center gap-1">
                              <span>{appt.patient?.fullName}</span>
                              {(!appt.patient?.consentSigned || !appt.patient?.medicalHistory) && (
                                <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0" title="Paciente con documentos pendientes: Ficha Dermatofuncional / Consentimiento" />
                              )}
                            </div>
                            {appt.service && (
                              <div className="text-[9px] opacity-75 font-semibold leading-tight truncate mt-0.5">{appt.service.name}</div>
                            )}
                            {durHrs >= 0.75 && (
                              <>
                                <div className="text-[10px] opacity-70 leading-tight truncate mt-0.5">{appt.professional?.name}</div>
                                <div className="text-[9px] opacity-60 leading-tight mt-0.5">{appt.duration} min</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                });
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* ── Slide-over Form ── */}
      {showSlideOver && (
        <>
          <div
            className="fixed inset-0 bg-popover/50 backdrop-blur-sm z-40"
            onClick={closeSlideOver}
          />
          <div
            ref={slideOverRef}
            className="fixed right-0 top-0 bottom-0 w-[440px] bg-card z-50 shadow-2xl flex flex-col border-l border-border"
            style={{ transform: "translateX(100%)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {editingAppointment ? "Editar Cita" : "Nueva Cita"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Bloom Skin · Centro Médico</p>
                </div>
              </div>
              <button
                onClick={closeSlideOver}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 [&::-webkit-scrollbar]:hidden">

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-3 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* ── Patient Search ── */}
                <div id="tour-calendar-drawer-patient">
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-2">
                    <User className="w-3 h-3 text-primary" />
                    Paciente
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setSelectedPatientId(""); }}
                      placeholder="Buscar nombre o teléfono..."
                      className="w-full pl-10 pr-4 py-3 text-sm border-2 border-border rounded-xl focus:outline-none focus:ring-0 focus:border-primary transition-colors placeholder:text-muted-foreground bg-background"
                    />
                  </div>
                  {searchQuery.trim().length >= 2 && !selectedPatientId && (
                    <div className="mt-1.5 border border-border/80 rounded-xl bg-popover max-h-48 overflow-y-auto shadow-2xl divide-y divide-border/40 z-50 relative">
                      {patients.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => { setSelectedPatientId(p.id); setSearchQuery(p.fullName); setPatients([]); }}
                          className="px-4 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors flex items-center gap-3"
                        >
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {p.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{p.fullName}</p>
                            <p className="text-[11px] text-muted-foreground">{p.phone}</p>
                          </div>
                        </div>
                      ))}
                      <div
                        onClick={() => {
                          setQuickPhone("");
                          setShowQuickRegister(true);
                        }}
                        className="px-4 py-3 text-xs font-bold text-primary hover:bg-primary/10 cursor-pointer transition-colors flex items-center gap-2 bg-muted"
                      >
                        <Plus className="w-3.5 h-3.5" /> Registrar "{searchQuery}" como nuevo paciente (Registro Rápido)
                      </div>
                    </div>
                  )}
                  {selectedPatientId && selectedPatientObj && (
                    <div className="mt-2.5 space-y-1">
                      <p className="text-xs text-success font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Paciente seleccionado: {selectedPatientObj.fullName}
                      </p>
                      {(!selectedPatientObj.consentSigned || !selectedPatientObj.medicalHistory) && (
                        <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-xl text-warning text-xs mt-1">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Documentos pendientes:</span>
                            <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                              {!selectedPatientObj.consentSigned && <li>Ficha de Consentimiento Informado</li>}
                              {!selectedPatientObj.medicalHistory && <li>Ficha Dermatofuncional (Historial)</li>}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Professional ── */}
                <div id="tour-calendar-drawer-specialist">
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-2">
                    <Circle className="w-3 h-3 text-primary" />
                    Especialista / Terapeuta
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {professionals.filter((p) => p.role !== "RECEPTIONIST").map((prof) => (
                      <button
                        key={prof.id}
                        type="button"
                        onClick={() => setSelectedProfessionalId(prof.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          selectedProfessionalId === prof.id
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/40 text-foreground"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          selectedProfessionalId === prof.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                        }`}>
                          {prof.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{prof.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{prof.specialty || prof.role}</p>
                        </div>
                        {selectedProfessionalId === prof.id && (
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </button>
                    ))}
                    {professionals.length === 0 && (
                      <p className="text-xs text-muted-foreground italic px-1">No hay profesionales disponibles.</p>
                    )}
                  </div>
                </div>

                {/* ── Cabin Selection ── */}
                <div id="tour-calendar-drawer-cabin">
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-2.5">
                    Cabina / Box
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CABINS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCabin(c)}
                        className={`px-4 py-2.5 text-xs font-bold rounded-lg border-2 transition-all cursor-pointer ${
                          cabin === c
                            ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                            : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Date ── */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-2">
                    <CalendarDays className="w-3 h-3 text-primary" />
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 text-sm border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-colors text-foreground bg-background"
                  />
                </div>

                {/* ── Time Picker ── */}
                <div id="tour-calendar-drawer-time">
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-2.5">
                    <Clock className="w-3 h-3 text-primary" />
                    Hora de la cita
                  </label>
                  {/* Quick chips */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTime(slot)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all cursor-pointer ${
                          time === slot
                            ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                            : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {/* Manual input */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="time"
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm border-2 border-primary rounded-xl focus:outline-none bg-primary/5 text-foreground font-bold"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold">hora exacta</span>
                  </div>
                </div>

                {/* ── Duration ── */}
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-2.5 block">
                    Duración estimada
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { val: 30, label: "30 min" },
                      { val: 45, label: "45 min" },
                      { val: 60, label: "1 hora" },
                      { val: 90, label: "1:30 h" },
                      { val: 120, label: "2 horas" },
                    ].map(({ val, label }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDuration(val)}
                        className={`px-4 py-2.5 text-xs font-bold rounded-lg border-2 transition-all cursor-pointer ${
                          duration === val
                            ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                            : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Notes ── */}
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-2 block">
                    Notas e indicaciones
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Indicaciones especiales, observaciones del paciente..."
                    className="w-full px-4 py-3 text-sm border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-muted-foreground bg-background"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0 bg-card">
                <button
                  type="button"
                  onClick={closeSlideOver}
                  className="flex-1 py-3 text-sm font-bold border-2 border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  id="tour-calendar-drawer-submit"
                  className="flex-1 py-3 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    editingAppointment ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                    ) : (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Agendando...</>
                    )
                  ) : (
                    editingAppointment ? (
                      <><Plus className="w-4 h-4" /> Guardar Cambios</>
                    ) : (
                      <><Plus className="w-4 h-4" /> Confirmar Cita</>
                    )
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ── Detail Modal ── */}
      {showDetailModal && selectedAppointment && (
        <>
          <div
            className="fixed inset-0 bg-popover/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={() => { setShowDetailModal(false); setSelectedAppointment(null); }}
          >
            <div
              className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-205"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Detalle de la Cita</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Bloom Skin · Gestión</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowDetailModal(false); setSelectedAppointment(null); }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] block mb-1">
                    Paciente
                  </span>
                  <span className="text-base font-bold text-foreground block">
                    {selectedAppointment.patient?.fullName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] block mb-1">
                      Especialista
                    </span>
                    <span className="text-sm font-semibold text-foreground block">
                      {selectedAppointment.professional?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] block mb-1">
                      Cabina / Box
                    </span>
                    <span className="text-sm font-semibold text-foreground block">
                      {selectedAppointment.cabin || "Ninguna"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] block mb-1">
                      Fecha y Hora
                    </span>
                    <span className="text-sm font-semibold text-foreground block">
                      {new Date(selectedAppointment.dateTime).toLocaleDateString("es-MX", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      -{" "}
                      {new Date(selectedAppointment.dateTime).toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] block mb-1">
                      Duración y Estado
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-foreground">
                        {selectedAppointment.duration} min
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          (STATUS_STYLE[selectedAppointment.status] || STATUS_STYLE.PENDIENTE).bg
                        } ${(STATUS_STYLE[selectedAppointment.status] || STATUS_STYLE.PENDIENTE).border} ${
                          (STATUS_STYLE[selectedAppointment.status] || STATUS_STYLE.PENDIENTE).text
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            (STATUS_STYLE[selectedAppointment.status] || STATUS_STYLE.PENDIENTE).dot
                          }`}
                        />
                        {selectedAppointment.status}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] block mb-1">
                      Notas / Indicaciones
                    </span>
                    <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-xl border border-border/60">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] block mb-1">
                    Tratamiento / Servicio
                  </span>
                  <span className="text-sm font-bold text-secondary block">
                    {selectedAppointment.service?.name || "Consulta General"}
                  </span>
                </div>

                {(!selectedAppointment.patient?.consentSigned || !selectedAppointment.patient?.medicalHistory) && (
                  <div className="p-3.5 bg-warning/10 border border-warning/20 rounded-xl text-warning space-y-1.5 animate-pulse">
                    <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                      <span>Documentación Pendiente</span>
                    </div>
                    <ul className="text-[10px] font-semibold list-disc list-inside space-y-0.5 pl-1.5 opacity-90">
                      {!selectedAppointment.patient?.consentSigned && <li>Ficha de Consentimiento Informado</li>}
                      {!selectedAppointment.patient?.medicalHistory && <li>Ficha Dermatofuncional (Historial)</li>}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-border flex gap-2 flex-wrap flex-shrink-0 bg-card justify-end">
                {(!selectedAppointment.patient?.consentSigned || !selectedAppointment.patient?.medicalHistory) && (
                  <button
                    onClick={() => {
                      if (onSelectPatient) {
                        setShowDetailModal(false);
                        onSelectPatient(selectedAppointment.patientId);
                      }
                    }}
                    className="px-4 py-2.5 text-xs font-bold bg-warning text-foreground hover:bg-warning/90 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-warning/20"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Completar Expediente / Firma
                  </button>
                )}
                {selectedAppointment.status !== "NO_ASISTIO" && selectedAppointment.status !== "COMPLETADA" && (
                  <button
                    onClick={() => handleMarkNoShow(selectedAppointment.id)}
                    className="px-4 py-2.5 text-xs font-bold bg-error/10 text-error hover:bg-error/20 border border-error/20 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Marcar Inasistencia
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingAppointment(selectedAppointment);
                    setSelectedPatientId(selectedAppointment.patientId);
                    setSearchQuery(selectedAppointment.patient?.fullName || "");
                    setSelectedProfessionalId(selectedAppointment.professionalId);
                    setDate(new Date(selectedAppointment.dateTime).toISOString().slice(0, 10));
                    setTime(
                      new Date(selectedAppointment.dateTime)
                        .toLocaleTimeString("es-MX", { hour12: false })
                        .slice(0, 5)
                    );
                    setDuration(selectedAppointment.duration);
                    setNotes(selectedAppointment.notes || "");
                    setCabin(selectedAppointment.cabin || "Ninguna");
                    setError(null);
                    setShowDetailModal(false);
                    setShowSlideOver(true);
                  }}
                  className="px-4 py-2.5 text-xs font-bold border-2 border-border rounded-xl hover:bg-muted text-muted-foreground transition-all cursor-pointer"
                >
                  Editar Cita
                </button>
                <button
                  onClick={() => { setShowDetailModal(false); setSelectedAppointment(null); }}
                  className="px-4 py-2.5 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Quick Register Modal */}
      {showQuickRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowQuickRegister(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-foreground mb-4">Registro Rápido de Paciente</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={searchQuery}
                  disabled
                  className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-xl bg-muted text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">Número de Teléfono (Requerido)</label>
                <input
                  type="tel"
                  placeholder="Ej: +54 9 11 5555-1234"
                  value={quickPhone}
                  onChange={(e) => setQuickPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickRegister(false)}
                  className="px-4 py-2 text-xs font-bold border-2 border-border rounded-xl hover:bg-muted text-muted-foreground transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!quickPhone.trim()) {
                      toast.error("El número de teléfono es obligatorio.");
                      return;
                    }
                    try {
                      const newPat = await api.post<Patient>("/patients", {
                        fullName: searchQuery,
                        phone: quickPhone.trim()
                      });
                      setSelectedPatientId(newPat.id);
                      setSearchQuery(newPat.fullName);
                      setPatients([]);
                      setShowQuickRegister(false);
                      toast.success(`Paciente "${newPat.fullName}" registrado y seleccionado.`);
                    } catch (err) {
                      toast.error("Error al registrar el paciente.");
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Registrar y Seleccionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
