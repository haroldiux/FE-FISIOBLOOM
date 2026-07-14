import { useState, useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import {
  CalendarDays,
  DollarSign,
  Users,
  Package,
  Clock,
  TrendingUp,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Timer,
  XCircle,
  Activity,
  MessageCircle,
  CalendarPlus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "../services/api";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DashboardData {
  todayAppointments: number;
  todayRevenue: number;
  activePatients: number;
  packagesExpiringSoon: number;
  weeklyRevenue: { day: string; ingresos: number }[];
  todayAppointmentsList: {
    time: string;
    patient: string;
    treatment: string;
    professional: string;
    status: string;
  }[];
}

interface RetouchAlert {
  id: string;
  patientId: string;
  patient: { id: string; fullName: string; phone: string };
  serviceId: string;
  service: { id: string; name: string };
  originalAppointment: { dateTime: string };
  scheduledDate: string;
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "EXPIRED" | "WAIVED";
  notes?: string;
}

interface StaffPerformance {
  professionalId: string;
  name: string;
  role: string;
  month: string;
  salesTarget: number;
  actualSales: number;
  servicesSales: number;
  productsSales: number;
  commissionRate: number;
  commissionEarned: number;
  servicesCount: number;
  productsCount: number;
}

// Empty initial state data
const EMPTY_DATA: DashboardData = {
  todayAppointments: 0,
  todayRevenue: 0,
  activePatients: 0,
  packagesExpiringSoon: 0,
  weeklyRevenue: [
    { day: "Lun", ingresos: 0 },
    { day: "Mar", ingresos: 0 },
    { day: "Mié", ingresos: 0 },
    { day: "Jue", ingresos: 0 },
    { day: "Vie", ingresos: 0 },
    { day: "Sáb", ingresos: 0 },
    { day: "Dom", ingresos: 0 },
  ],
  todayAppointmentsList: [],
};


// ── Status config ─────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; cls: string; Icon: React.ComponentType<any> }> = {
  CONFIRMADA: { label: "Confirmada", cls: "bg-success/10 text-success border border-success/20", Icon: CheckCircle2 },
  PENDIENTE: { label: "En Espera", cls: "bg-warning/10 text-warning border border-warning/20", Icon: Timer },
  COMPLETADA: { label: "Completada", cls: "bg-secondary/10 text-secondary border border-secondary/20", Icon: Activity },
  CANCELADA_CON_CARGO: { label: "Cancelada", cls: "bg-error/10 text-error border border-error/20", Icon: XCircle },
  CANCELADA_SIN_CARGO: { label: "Cancelada S/C", cls: "bg-muted text-muted-foreground border border-border", Icon: XCircle },
};

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KPICard({
  title,
  value,
  subtitle,
  Icon,
  colorClass,
  delay,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  Icon: React.ComponentType<any>;
  colorClass: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animate(ref.current, {
      opacity: [0, 1],
      translateY: [12, 0],
      delay: delay * 0.4,
      duration: 280,
      easing: "easeOutQuad",
    });
  }, [delay]);

  return (
    <div
      ref={ref}
      className="glass-panel spring-hover rounded-2xl border border-border p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-lg"
      style={{ opacity: 0 }}
    >
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-wider truncate">{title}</p>
        <p
          className="text-xl sm:text-2xl font-black text-foreground mt-1 tabular-nums leading-none"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {value}
        </p>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-semibold mt-1 truncate">{subtitle}</p>
      </div>
    </div>
  );
}

// ── Main DashboardScreen ──────────────────────────────────────────────────────

export default function DashboardScreen({
  onNavigate,
  onScheduleAppointment,
}: {
  onNavigate?: (screen: string) => void;
  onScheduleAppointment?: (patientId: string, patientName: string, date?: string) => void;
}) {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [retouchAlerts, setRetouchAlerts] = useState<RetouchAlert[]>([]);
  const [performances, setPerformances] = useState<StaffPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [retouchToDismiss, setRetouchToDismiss] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!loading && tableRef.current) {
      const rows = tableRef.current.querySelectorAll("tr.appt-row");
      animate(Array.from(rows), {
        opacity: [0, 1],
        translateX: [-10, 0],
        delay: stagger(25),
        duration: 260,
        easing: "easeOutQuad",
      });
    }
  }, [loading]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [result, retouches, perfData] = await Promise.all([
        api.get<DashboardData>("/dashboard"),
        api.get<RetouchAlert[]>("/appointments/alerts/retouches"),
        api.get<StaffPerformance[]>("/finance/staff/commissions").catch(() => []),
      ]);

      if (result && typeof result === "object") {
        setData({
          todayAppointments: result.todayAppointments ?? 0,
          todayRevenue: result.todayRevenue ?? 0,
          activePatients: result.activePatients ?? 0,
          packagesExpiringSoon: result.packagesExpiringSoon ?? 0,
          weeklyRevenue: result.weeklyRevenue ?? [],
          todayAppointmentsList: result.todayAppointmentsList ?? [],
        });
      }

      if (retouches && Array.isArray(retouches)) {
        setRetouchAlerts(retouches);
      }

      if (perfData && Array.isArray(perfData)) {
        setPerformances(perfData);
      }
    } catch {
      toast.error("Error al cargar el dashboard. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleDismissRetouch = async (id: string) => {
    setDismissingId(id);
    try {
      await api.put(`/appointments/retouches/${id}`, { status: "WAIVED" });
      setRetouchAlerts(retouchAlerts.filter(r => r.id !== id));
      setRetouchToDismiss(null);
    } catch (err: any) {
      toast.error("Error al descartar retoque: " + (err.response?.data?.message || err.message));
    } finally {
      setDismissingId(null);
    }
  };

  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Bento KPI cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="animate-pulse bg-card/40 rounded-2xl border border-border p-5 flex items-center gap-4 shadow-lg min-h-[96px]">
              <div className="w-12 h-12 rounded-xl bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-2.5 bg-muted rounded-full w-20" />
                <div className="h-6 bg-muted-foreground/20 rounded-full w-12" />
                <div className="h-2 bg-muted rounded-full w-24" />
              </div>
            </div>
          </div>
          <div>
            <div className="animate-pulse bg-card/40 rounded-2xl border border-border p-5 flex items-center gap-4 shadow-lg min-h-[96px]">
              <div className="w-12 h-12 rounded-xl bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-2.5 bg-muted rounded-full w-28" />
                <div className="h-6 bg-muted-foreground/20 rounded-full w-24" />
                <div className="h-2 bg-muted rounded-full w-36" />
              </div>
            </div>
          </div>
          <div>
            <div className="animate-pulse bg-card/40 rounded-2xl border border-border p-5 flex items-center gap-4 shadow-lg min-h-[96px]">
              <div className="w-12 h-12 rounded-xl bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-2.5 bg-muted rounded-full w-16" />
                <div className="h-6 bg-muted-foreground/20 rounded-full w-10" />
                <div className="h-2 bg-muted rounded-full w-20" />
              </div>
            </div>
          </div>
          <div>
            <div className="animate-pulse bg-card/40 rounded-2xl border border-border p-5 flex items-center gap-4 shadow-lg min-h-[96px]">
              <div className="w-12 h-12 rounded-xl bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-2.5 bg-muted rounded-full w-24" />
                <div className="h-6 bg-muted-foreground/20 rounded-full w-8" />
                <div className="h-2 bg-muted rounded-full w-16" />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Chart + Retouch Alerts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Chart Skeleton */}
          <div className="col-span-12 lg:col-span-5 bg-card/40 rounded-2xl border border-border p-5 space-y-4 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-3.5 bg-muted-foreground/20 rounded-full w-32" />
                <div className="h-2.5 bg-muted rounded-full w-16" />
              </div>
              <div className="w-8 h-8 rounded-xl bg-muted-foreground/20" />
            </div>
            <div className="h-[180px] bg-foreground/5 rounded-2xl flex items-end p-4 gap-3">
              <div className="h-[40%] bg-muted w-full rounded-t-lg" />
              <div className="h-[60%] bg-muted-foreground/20 w-full rounded-t-lg" />
              <div className="h-[50%] bg-muted w-full rounded-t-lg" />
              <div className="h-[80%] bg-muted-foreground/20 w-full rounded-t-lg" />
              <div className="h-[90%] bg-muted-foreground/20 w-full rounded-t-lg" />
              <div className="h-[70%] bg-muted w-full rounded-t-lg" />
              <div className="h-[30%] bg-muted w-full rounded-t-lg" />
            </div>
          </div>

          {/* Today's Appointments Skeleton */}
          <div className="col-span-12 lg:col-span-7 bg-card/40 rounded-2xl border border-border p-5 space-y-4 animate-pulse">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div className="space-y-2">
                <div className="h-3.5 bg-muted-foreground/20 rounded-full w-24" />
                <div className="h-2.5 bg-muted rounded-full w-20" />
              </div>
              <div className="w-8 h-8 rounded-xl bg-muted-foreground/20" />
            </div>
            <div className="space-y-3.5 pt-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="h-3 bg-muted-foreground/20 rounded-full w-12" />
                  <div className="h-3.5 bg-muted-foreground/20 rounded-full w-28" />
                  <div className="h-3 bg-muted rounded-full w-32" />
                  <div className="h-5 bg-muted-foreground/20 rounded-full w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Bento KPI cards Grid */}
      <div id="tour-dashboard-kpi" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <KPICard
            title="Citas Hoy"
            value={data.todayAppointments}
            subtitle={`${today}`}
            Icon={CalendarDays}
            colorClass="bg-primary/10 text-primary border border-primary/20"
            delay={0}
          />
        </div>
        <div>
          <KPICard
            title="Ingresos del Día"
            value={`$${data.todayRevenue.toLocaleString()}`}
            subtitle="Ingresos netos facturados hoy"
            Icon={DollarSign}
            colorClass="bg-success/10 text-success border border-success/20"
            delay={80}
          />
        </div>
        <div>
          <KPICard
            title="Pacientes Activos"
            value={data.activePatients}
            subtitle="Fichas vigentes"
            Icon={Users}
            colorClass="bg-secondary/10 text-secondary border border-secondary/20"
            delay={160}
          />
        </div>
        <div>
          <KPICard
            title="Paquetes por Vencer"
            value={data.packagesExpiringSoon}
            subtitle="Vencen pronto"
            Icon={Package}
            colorClass="bg-warning/10 text-warning border border-warning/20"
            delay={240}
          />
        </div>
      </div>

      {/* Progreso de Metas Mensuales Premium Card */}
      {(() => {
        const totalSalesTarget = performances.reduce((sum, p) => sum + (p.salesTarget || 0), 0);
        const totalActualSales = performances.reduce((sum, p) => sum + (p.actualSales || 0), 0);
        const userPerf = performances.find(p => p.professionalId === user?.id);

        const hasPersonalTarget = userPerf && userPerf.salesTarget > 0;
        const targetName = hasPersonalTarget ? "Tu Meta Personal" : "Meta Global del Equipo";
        const salesTarget = hasPersonalTarget ? userPerf.salesTarget : totalSalesTarget;
        const actualSales = hasPersonalTarget ? userPerf.actualSales : totalActualSales;
        const progressPercent = salesTarget > 0 ? Math.min(100, Math.round((actualSales / salesTarget) * 100)) : 0;

        // Don't render the card if the calculated target is 0 to avoid cluttering if not configured
        if (salesTarget <= 0) return null;

        return (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-md overflow-hidden relative animate-fade-in">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest block">
                  Desempeño del Mes
                </span>
                <h3 className="text-sm font-bold text-foreground">
                  Progreso de Metas Mensuales — {targetName}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Ventas acumuladas frente a la meta asignada para este período
                </p>
              </div>
              <div className="text-left md:text-right">
                <span className="text-2xl font-black text-foreground">
                  {progressPercent}%
                </span>
                <span className="text-[10px] text-muted-foreground block font-medium">
                  ${actualSales.toLocaleString("es-MX")} de ${salesTarget.toLocaleString("es-MX")}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden border border-border">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground mt-2">
                <span>0%</span>
                {progressPercent > 0 && <span className="text-primary">{progressPercent}% completado</span>}
                <span>100% Meta</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Row 2: Chart + Retouch Alerts Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Weekly revenue chart */}
        <div id="tour-dashboard-chart" className="col-span-12 lg:col-span-5 bg-card rounded-2xl border border-border p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Ingresos Semanales</h3>
              <p className="text-xs text-muted-foreground font-medium">Esta semana</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyRevenue} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Ingresos"]}
                  cursor={{ fill: "var(--muted)", radius: 8 }}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1.5px solid var(--glass-border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "var(--foreground)",
                  }}
                />
                <Bar dataKey="ingresos" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Retouch alerts tracker */}
        <div id="tour-dashboard-retouches" className="col-span-12 lg:col-span-7 bg-card rounded-2xl border border-border p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground">Seguimiento de Retoques Pendientes</h3>
              <p className="text-xs text-muted-foreground font-medium">Tratamientos estéticos que requieren sesión de retoque</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Timer className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[220px] [&::-webkit-scrollbar]:hidden">
            {retouchAlerts.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-10">No hay alertas de retoques clínicos pendientes.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {retouchAlerts.map((retouch) => {
                  const targetDate = new Date(retouch.scheduledDate);
                  const daysDiff = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  
                  let badgeColor = "bg-secondary/10 text-secondary border border-secondary/20";
                  let textDays = `Faltan ${daysDiff} días`;
                  if (daysDiff < 0) {
                    badgeColor = "bg-error/10 text-error border border-error/20 animate-pulse";
                    textDays = `Vencido hace ${Math.abs(daysDiff)} días`;
                  } else if (daysDiff <= 5) {
                    badgeColor = "bg-warning/10 text-warning border border-warning/20";
                    textDays = `Próximo (en ${daysDiff} días)`;
                  }

                  return (
                    <div
                      key={retouch.id}
                      className="p-3.5 border border-border rounded-2xl flex flex-col justify-between gap-3 hover:border-primary/25 transition-all bg-muted hover:bg-muted/80 spring-hover shadow-md"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-foreground truncate">{retouch.patient.fullName}</h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeColor} whitespace-nowrap`}>
                            {textDays}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-primary mt-1 truncate">{retouch.service.name}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          Procedimiento: {new Date(retouch.originalAppointment.dateTime).toLocaleDateString("es-MX")}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 pt-1 flex-wrap">
                        <button
                          onClick={() => setRetouchToDismiss(retouch.id)}
                          className="flex-1 text-[10px] font-bold py-1.5 border border-border text-muted-foreground rounded-lg hover:bg-error/20 hover:text-error transition-all min-w-[70px]"
                          title="Desestimar retoque"
                        >
                          Desestimar
                        </button>
                        <a
                          href={`https://wa.me/${retouch.patient.phone.replace(/[^0-9+]/g, "")}?text=${encodeURIComponent(
                            `Hola ${retouch.patient.fullName}, te escribimos de Bloom Skin. Te recordamos que ya está disponible tu sesión de retoque para el servicio de "${retouch.service.name}" (fecha sugerida: ${new Date(retouch.scheduledDate).toLocaleDateString("es-MX")}). ¿Te gustaría confirmar para reservar tu horario?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1.5 bg-success hover:bg-success/80 text-white rounded-lg transition-all flex items-center justify-center gap-1 shadow-sm text-[10px] font-bold"
                          title="Enviar recordatorio de retoque por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">WhatsApp</span>
                        </a>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (onScheduleAppointment) {
                              onScheduleAppointment(
                                retouch.patientId,
                                retouch.patient.fullName,
                                retouch.scheduledDate.slice(0, 10)
                              );
                            } else {
                              toast.info("Redirigiendo a Citas para agendar a: " + retouch.patient.fullName);
                            }
                          }}
                          className="px-2 py-1.5 bg-primary hover:bg-primary/95 text-white rounded-lg transition-all flex items-center justify-center gap-1 shadow-sm text-[10px] font-bold"
                          title="Agendar cita de retoque"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">Agendar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Today's Appointments (Data-rich Wide Widget) */}
      <div id="tour-dashboard-appointments" className="bg-card rounded-2xl border border-border overflow-hidden p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-foreground">Citas de Hoy</h3>
            <p className="text-xs text-muted-foreground font-medium">{data.todayAppointments} agendadas para el día de hoy</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary" />
          </div>
        </div>
        
        <div ref={tableRef} className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/85">
                <th className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-24">Hora</th>
                <th className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Paciente</th>
                <th className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tratamiento / Servicio</th>
                <th className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Profesional Asignado</th>
                <th className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-36">Estado de la Cita</th>
              </tr>
            </thead>
            <tbody>
              {data.todayAppointmentsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-xs text-muted-foreground italic">
                    No hay citas registradas para el día de hoy.
                  </td>
                </tr>
              ) : (
                data.todayAppointmentsList.map((appt, i) => {
                  const sc = statusConfig[appt.status] || {
                    label: appt.status,
                    cls: "bg-muted text-muted-foreground",
                    Icon: Clock,
                  };
                  return (
                    <tr
                      key={i}
                      className="appt-row border-b border-border/40 hover:bg-muted transition-colors"
                      style={{ opacity: 0 }}
                    >
                      <td className="px-5 py-4">
                        <span
                          className="text-sm font-black text-foreground tabular-nums tracking-wide"
                          style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                          {appt.time}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-foreground">{appt.patient}</p>
                      </td>
                      <td className="px-5 py-4">
                          <span className="text-sm text-muted-foreground font-semibold bg-muted px-3 py-1 rounded-xl border border-border">
                          {appt.treatment}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-muted-foreground font-medium">{appt.professional}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl ${sc.cls}`}>
                          <sc.Icon className="w-3.5 h-3.5" />
                          {sc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Confirmación Desestimar Retoque */}
      {retouchToDismiss && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-sm border border-border rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-warning">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">¿Desestimar Retoque?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
              Esta acción marcará el retoque clínico sugerido como desestimado (WAIVED) y ya no se mostrará en el seguimiento diario.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                disabled={dismissingId !== null}
                onClick={() => setRetouchToDismiss(null)}
                className="text-[11px] font-bold px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted transition-all spring-hover"
              >
                Cancelar
              </button>
              <button
                disabled={dismissingId !== null}
                onClick={() => handleDismissRetouch(retouchToDismiss)}
                className="text-[11px] font-bold px-4 py-2 bg-destructive hover:bg-destructive/90 text-white rounded-lg transition-all flex items-center gap-1 shadow-sm"
              >
                {dismissingId ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Desestimando...</span>
                  </>
                ) : (
                  <span>Confirmar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
