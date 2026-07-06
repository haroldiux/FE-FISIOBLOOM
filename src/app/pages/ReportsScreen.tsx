import { useState, useEffect } from "react";
import { api, API_URL } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Package,
  CalendarDays,
  Download,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  RefreshCw,
  Percent,
} from "lucide-react";

// ── Types ──
interface ReportData {
  kpis: {
    ingresosNetos: number;
    ingresosNetosDiff: number;
    egresos: number;
    egresosDiff: number;
    citasCompletadas: number;
    citasCompletadasDiff: number;
    valorAlmacen: number;
    valorAlmacenDiff: number;
  };
  dailyEvolution: { label: string; ingresos: number }[];
  paymentMethods: { method: string; amount: number; percentage: number; color: string }[];
  topTreatments: { name: string; count: number }[];
  topSupplies: { name: string; count: number }[];
  porSucursal?: Record<string, number>;
}

// ── Default Mock Datasets ──
const MOCK_ESTE_MES: ReportData = {
  kpis: {
    ingresosNetos: 24530,
    ingresosNetosDiff: 12.4,
    egresos: 4820,
    egresosDiff: -3.1,
    citasCompletadas: 142,
    citasCompletadasDiff: 8.2,
    valorAlmacen: 18740,
    valorAlmacenDiff: 1.5,
  },
  dailyEvolution: [
    { label: "1", ingresos: 450 },
    { label: "2", ingresos: 620 },
    { label: "3", ingresos: 780 },
    { label: "4", ingresos: 350 },
    { label: "5", ingresos: 900 },
    { label: "6", ingresos: 1200 },
    { label: "7", ingresos: 200 },
    { label: "8", ingresos: 580 },
    { label: "9", ingresos: 650 },
    { label: "10", ingresos: 820 },
    { label: "11", ingresos: 400 },
    { label: "12", ingresos: 950 },
    { label: "13", ingresos: 1100 },
    { label: "14", ingresos: 150 },
    { label: "15", ingresos: 610 },
    { label: "16", ingresos: 720 },
    { label: "17", ingresos: 890 },
    { label: "18", ingresos: 430 },
    { label: "19", ingresos: 1050 },
    { label: "20", ingresos: 1350 },
    { label: "21", ingresos: 250 },
    { label: "22", ingresos: 700 },
    { label: "23", ingresos: 750 },
    { label: "24", ingresos: 910 },
    { label: "25", ingresos: 480 },
    { label: "26", ingresos: 1150 },
    { label: "27", ingresos: 1450 },
    { label: "28", ingresos: 300 },
    { label: "29", ingresos: 820 },
    { label: "30", ingresos: 980 },
  ],
  paymentMethods: [
    { method: "Tarjeta", amount: 12265, percentage: 50, color: "#06b6d4" },
    { method: "Efectivo", amount: 6132.5, percentage: 25, color: "#14b8a6" },
    { method: "Transferencia", amount: 3679.5, percentage: 15, color: "#8b5cf6" },
    { method: "QR QR", amount: 2453, percentage: 10, color: "#f59e0b" },
  ],
  topTreatments: [
    { name: "Limpieza Facial Profunda", count: 42 },
    { name: "Masaje Terapéutico Relajante", count: 35 },
    { name: "Radiofrecuencia Rejuvenecedora", count: 28 },
    { name: "Peeling Químico Revitalizante", count: 20 },
    { name: "Depilación Láser Diodo Soprano", count: 17 },
  ],
  topSupplies: [
    { name: "Ampollas Ácido Hialurónico", count: 85 },
    { name: "Crema Hidratante Calmante", count: 64 },
    { name: "Gel Conductor Liporreductor", count: 48 },
    { name: "Mascarilla Alginato de Oro", count: 42 },
    { name: "Agujas de Microagujas Dermapen", count: 35 },
  ],
  porSucursal: {
    "Sede Norte (Aura)": 15944.50,
    "Sede Centro (Aura)": 8585.50
  },
};

const MOCK_MES_ANTERIOR: ReportData = {
  kpis: {
    ingresosNetos: 22180,
    ingresosNetosDiff: 8.7,
    egresos: 5110,
    egresosDiff: 1.4,
    citasCompletadas: 130,
    citasCompletadasDiff: 4.8,
    valorAlmacen: 18460,
    valorAlmacenDiff: 0.8,
  },
  dailyEvolution: [
    { label: "1", ingresos: 400 },
    { label: "2", ingresos: 580 },
    { label: "3", ingresos: 720 },
    { label: "4", ingresos: 300 },
    { label: "5", ingresos: 850 },
    { label: "6", ingresos: 1100 },
    { label: "7", ingresos: 180 },
    { label: "8", ingresos: 520 },
    { label: "9", ingresos: 600 },
    { label: "10", ingresos: 790 },
    { label: "11", ingresos: 380 },
    { label: "12", ingresos: 900 },
    { label: "13", ingresos: 1000 },
    { label: "14", ingresos: 130 },
    { label: "15", ingresos: 590 },
    { label: "16", ingresos: 680 },
    { label: "17", ingresos: 820 },
    { label: "18", ingresos: 400 },
    { label: "19", ingresos: 980 },
    { label: "20", ingresos: 1250 },
    { label: "21", ingresos: 210 },
    { label: "22", ingresos: 640 },
    { label: "23", ingresos: 700 },
    { label: "24", ingresos: 850 },
    { label: "25", ingresos: 420 },
    { label: "26", ingresos: 1080 },
    { label: "27", ingresos: 1380 },
    { label: "28", ingresos: 280 },
    { label: "29", ingresos: 790 },
    { label: "30", ingresos: 920 },
  ].filter((v, i, self) => self.findIndex(t => t.label === v.label) === i), // deduplicate typescript artifact
  paymentMethods: [
    { method: "Tarjeta", amount: 11090, percentage: 50, color: "#06b6d4" },
    { method: "Efectivo", amount: 5545, percentage: 25, color: "#14b8a6" },
    { method: "Transferencia", amount: 3327, percentage: 15, color: "#8b5cf6" },
    { method: "QR QR", amount: 2218, percentage: 10, color: "#f59e0b" },
  ],
  topTreatments: [
    { name: "Limpieza Facial Profunda", count: 38 },
    { name: "Masaje Terapéutico Relajante", count: 31 },
    { name: "Radiofrecuencia Rejuvenecedora", count: 25 },
    { name: "Peeling Químico Revitalizante", count: 18 },
    { name: "Depilación Láser Diodo Soprano", count: 15 },
  ],
  topSupplies: [
    { name: "Ampollas Ácido Hialurónico", count: 78 },
    { name: "Crema Hidratante Calmante", count: 59 },
    { name: "Gel Conductor Liporreductor", count: 43 },
    { name: "Mascarilla Alginato de Oro", count: 39 },
    { name: "Agujas de Microagujas Dermapen", count: 31 },
  ],
  porSucursal: {
    "Sede Norte (Aura)": 14417.00,
    "Sede Centro (Aura)": 7763.00
  },
};

const MOCK_ANIO_ACTUAL: ReportData = {
  kpis: {
    ingresosNetos: 264800,
    ingresosNetosDiff: 18.2,
    egresos: 58300,
    egresosDiff: -5.6,
    citasCompletadas: 1540,
    citasCompletadasDiff: 11.5,
    valorAlmacen: 18740,
    valorAlmacenDiff: 1.5,
  },
  dailyEvolution: [
    { label: "Ene", ingresos: 18500 },
    { label: "Feb", ingresos: 20200 },
    { label: "Mar", ingresos: 21800 },
    { label: "Abr", ingresos: 19500 },
    { label: "May", ingresos: 23000 },
    { label: "Jun", ingresos: 24800 },
    { label: "Jul", ingresos: 26500 },
    { label: "Ago", ingresos: 22100 },
    { label: "Sep", ingresos: 23900 },
    { label: "Oct", ingresos: 25400 },
    { label: "Nov", ingresos: 18900 },
    { label: "Dic", ingresos: 20200 },
  ],
  paymentMethods: [
    { method: "Tarjeta", amount: 132400, percentage: 50, color: "#06b6d4" },
    { method: "Efectivo", amount: 66200, percentage: 25, color: "#14b8a6" },
    { method: "Transferencia", amount: 39720, percentage: 15, color: "#8b5cf6" },
    { method: "QR QR", amount: 26480, percentage: 10, color: "#f59e0b" },
  ],
  topTreatments: [
    { name: "Limpieza Facial Profunda", count: 450 },
    { name: "Masaje Terapéutico Relajante", count: 390 },
    { name: "Radiofrecuencia Rejuvenecedora", count: 320 },
    { name: "Peeling Químico Revitalizante", count: 210 },
    { name: "Depilación Láser Diodo Soprano", count: 170 },
  ],
  topSupplies: [
    { name: "Ampollas Ácido Hialurónico", count: 920 },
    { name: "Crema Hidratante Calmante", count: 710 },
    { name: "Gel Conductor Liporreductor", count: 550 },
    { name: "Mascarilla Alginato de Oro", count: 480 },
    { name: "Agujas de Microagujas Dermapen", count: 390 },
  ],
  porSucursal: {
    "Sede Norte (Aura)": 172120.00,
    "Sede Centro (Aura)": 92680.00
  },
};

export default function ReportsScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  // State
  const [range, setRange] = useState<DateRange>("este_mes");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [data, setData] = useState<ReportData>(MOCK_ESTE_MES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hover states for interactive SVGs
  const [hoveredLineIdx, setHoveredLineIdx] = useState<number | null>(null);
  const [hoveredDonutIdx, setHoveredDonutIdx] = useState<number | null>(null);

  // Accounting Export State
  const [exportType, setExportType] = useState<"Ventas" | "Gastos" | "Nóminas">("Ventas");
  const [exportStart, setExportStart] = useState("");
  const [exportEnd, setExportEnd] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Set default dates for Custom Range & Exporter
  useEffect(() => {
    const today = new Date();
    const startStr = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
    const endStr = today.toISOString().split("T")[0];
    setCustomStart(startStr);
    setCustomEnd(endStr);
    setExportStart(startStr);
    setExportEnd(endStr);
  }, []);

  // Load reports data when range/dates change
  useEffect(() => {
    fetchReportData();
  }, [range, customStart, customEnd]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/reports?range=${range}`;
      if (range === "personalizado") {
        url += `&startDate=${customStart}&endDate=${customEnd}`;
      }

      const response = await api.get<ReportData>(url);
      setData(response);

      // Save successfully fetched data to LocalStorage
      localStorage.setItem(`bloom_skin_report_${range}`, JSON.stringify(response));
    } catch (e: any) {
      console.warn("Backend API not configured or failed. Using cached local storage if available.");

      const localData = localStorage.getItem(`bloom_skin_report_${range}`);
      if (localData) {
        setData(JSON.parse(localData));
      } else {
        if (range === "personalizado") {
          const diffTime = Math.abs(new Date(customEnd).getTime() - new Date(customStart).getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 30;
          setData(generatePersonalizedMock(diffDays));
        } else {
          setError("Error al cargar las métricas desde el servidor y no hay caché local disponible.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalizedMock = (days: number): ReportData => {
    const dailyPoints = [];
    const step = days <= 15 ? 1 : days <= 60 ? 2 : Math.ceil(days / 15);

    for (let i = 1; i <= days; i += step) {
      dailyPoints.push({
        label: `${i}`,
        ingresos: Math.floor(300 + Math.random() * 900 + (i % 7 === 0 || i % 7 === 6 ? -200 : 200)),
      });
    }

    const net = dailyPoints.reduce((acc, p) => acc + p.ingresos, 0);
    const exp = Math.floor(net * 0.22);
    const appointments = Math.floor(days * 4.5);

    return {
      kpis: {
        ingresosNetos: net,
        ingresosNetosDiff: 5.4,
        egresos: exp,
        egresosDiff: -1.2,
        citasCompletadas: appointments,
        citasCompletadasDiff: 3.8,
        valorAlmacen: 18740,
        valorAlmacenDiff: 1.5,
      },
      dailyEvolution: dailyPoints,
      paymentMethods: [
        { method: "Tarjeta", amount: Math.floor(net * 0.5), percentage: 50, color: "#06b6d4" },
        { method: "Efectivo", amount: Math.floor(net * 0.25), percentage: 25, color: "#14b8a6" },
        { method: "Transferencia", amount: Math.floor(net * 0.15), percentage: 15, color: "#8b5cf6" },
        { method: "QR QR", amount: Math.floor(net * 0.1), percentage: 10, color: "#f59e0b" },
      ],
      topTreatments: [
        { name: "Limpieza Facial Profunda", count: Math.ceil(appointments * 0.3) },
        { name: "Masaje Terapéutico Relajante", count: Math.ceil(appointments * 0.25) },
        { name: "Radiofrecuencia Rejuvenecedora", count: Math.ceil(appointments * 0.2) },
        { name: "Peeling Químico Revitalizante", count: Math.ceil(appointments * 0.15) },
        { name: "Depilación Láser Diodo Soprano", count: Math.ceil(appointments * 0.1) },
      ],
      topSupplies: [
        { name: "Ampollas Ácido Hialurónico", count: Math.ceil(appointments * 0.6) },
        { name: "Crema Hidratante Calmante", count: Math.ceil(appointments * 0.45) },
        { name: "Gel Conductor Liporreductor", count: Math.ceil(appointments * 0.35) },
        { name: "Mascarilla Alginato de Oro", count: Math.ceil(appointments * 0.3) },
        { name: "Agujas de Microagujas Dermapen", count: Math.ceil(appointments * 0.25) },
      ],
      porSucursal: {
        "Sede Norte (Aura)": Math.round(net * 0.65),
        "Sede Centro (Aura)": Math.round(net * 0.35)
      },
    };
  };

  // ── CSV Exporter Handler ──
  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      const queryParams = new URLSearchParams({
        type: exportType,
        startDate: exportStart,
        endDate: exportEnd,
      }).toString();

      // Attempt to hit the backend route
      // Attempt to hit the backend route
      const response = await fetch(`${API_URL}/reports/export?${queryParams}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
          "X-Tenant-ID": localStorage.getItem("tenantId") || "",
        }
      });

      if (!response.ok) {
        throw new Error("El endpoint del backend respondió con error o no existe.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_${exportType.toLowerCase()}_${exportStart}_a_${exportEnd}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setExportSuccess(true);
      toast.success("Métricas exportadas correctamente.");
    } catch (err: any) {
      console.error("Backend API export failed:", err);
      toast.error("La exportación falló debido a problemas de comunicación con el servidor.");
    } finally {
      setExporting(false);
    }
  };

  // ── Calculation Helpers for Line Chart ──
  const lineValues = data.dailyEvolution.map((d) => d.ingresos);
  const maxLineVal = Math.max(...lineValues, 100) * 1.1; // 10% headroom
  const minLineVal = 0;

  const svgWidth = 600;
  const svgHeight = 220;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = data.dailyEvolution.map((item, idx) => {
    const x = paddingLeft + (idx / Math.max(1, data.dailyEvolution.length - 1)) * chartWidth;
    const y = svgHeight - paddingBottom - ((item.ingresos - minLineVal) / (maxLineVal - minLineVal)) * chartHeight;
    return { x, y, label: item.label, value: item.ingresos };
  });

  const linePathD = points.length > 0
    ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
    : "";

  const areaPathD = points.length > 0
    ? `${linePathD} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`
    : "";

  // ── Donut Chart Parameters ──
  const donutCx = 100;
  const donutCy = 100;
  const donutR = 65;
  const donutCircumference = 2 * Math.PI * donutR;

  let donutAccumulatedPercent = 0;
  const donutSlices = data.paymentMethods.map((pm) => {
    const percent = pm.percentage / 100;
    const strokeDasharray = `${percent * donutCircumference} ${donutCircumference}`;
    const strokeDashoffset = -donutAccumulatedPercent * donutCircumference;
    donutAccumulatedPercent += percent;
    return {
      ...pm,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header and Date Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Reportes e Indicadores
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Analiza el desempeño contable, tratamientos y stock en tiempo real
          </p>
        </div>

        {/* Range Selector & PDF Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-muted p-1 rounded-xl flex gap-1 border border-border/50 no-print">
            {(["este_mes", "mes_anterior", "anio_actual", "personalizado"] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  range === r
                    ? "bg-card text-foreground shadow-sm font-bold border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "este_mes" && "Este Mes"}
                {r === "mes_anterior" && "Mes Anterior"}
                {r === "anio_actual" && "Año Actual"}
                {r === "personalizado" && "Personalizado"}
              </button>
            ))}
          </div>

          {range === "personalizado" && (
            <div className="flex items-center gap-1.5 animate-fadeIn no-print">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2 py-1.5 text-xs bg-input-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
              <span className="text-[10px] text-muted-foreground font-bold uppercase">A</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2 py-1.5 text-xs bg-input-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>
          )}

          <button
            onClick={() => window.print()}
            className="no-print flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/10 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div id="tour-reports-kpi" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Ingresos Netos */}
        <div className="bg-card rounded-2xl border border-border p-5 relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-cyan-600" />
            </div>
            <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
              data.kpis.ingresosNetosDiff >= 0
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                : "bg-red-500/15 text-red-400 border border-red-500/25"
            }`}>
              {data.kpis.ingresosNetosDiff >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(data.kpis.ingresosNetosDiff)}%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Ingresos Netos
            </h3>
            <p className="text-2xl font-black text-foreground mt-2 font-sans">
              ${data.kpis.ingresosNetos.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">
              Ingreso total por servicios facturados
            </p>
          </div>
        </div>

        {/* KPI 2: Egresos */}
        <div className="bg-card rounded-2xl border border-border p-5 relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-rose-600" />
            </div>
            <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
              data.kpis.egresosDiff <= 0
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                : "bg-red-500/15 text-red-400 border border-red-500/25"
            }`}>
              {data.kpis.egresosDiff <= 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
              {Math.abs(data.kpis.egresosDiff)}%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Gastos y Egresos
            </h3>
            <p className="text-2xl font-black text-foreground mt-2 font-sans">
              ${data.kpis.egresos.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">
              Insumos, nómina y costos fijos
            </p>
          </div>
        </div>

        {/* KPI 3: Citas Completadas */}
        <div className="bg-card rounded-2xl border border-border p-5 relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-violet-600" />
            </div>
            <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
              data.kpis.citasCompletadasDiff >= 0
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-red-50 text-red-600 border border-red-100"
            }`}>
              {data.kpis.citasCompletadasDiff >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(data.kpis.citasCompletadasDiff)}%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Citas Completadas
            </h3>
            <p className="text-2xl font-black text-foreground mt-2 font-sans">
              {data.kpis.citasCompletadas}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">
              Tratamientos finalizados con éxito
            </p>
          </div>
        </div>

        {/* KPI 4: Valor de Almacén */}
        <div className="bg-card rounded-2xl border border-border p-5 relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <span className="flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Activo
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Valor de Almacén
            </h3>
            <p className="text-2xl font-black text-foreground mt-2 font-sans">
              ${data.kpis.valorAlmacen.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">
              Costo acumulado de insumos en stock
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Evolution (Line area chart) */}
        <div id="tour-reports-charts" className="bg-card rounded-2xl border border-border p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-600" />
              Evolución Diaria de Ingresos
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fluctuación de facturación a lo largo del periodo seleccionado
            </p>
          </div>

          <div className="relative mt-6 flex-1 flex items-center justify-center min-h-[220px]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-card/60">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="w-full relative">
                {/* Inline SVG Chart */}
                <svg width="100%" height="220" viewBox="0 0 600 220" preserveAspectRatio="none" className="overflow-visible">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                    const y = paddingTop + ratio * chartHeight;
                    const val = maxLineVal - ratio * (maxLineVal - minLineVal);
                    return (
                      <g key={index} className="opacity-40">
                        <line
                          x1={paddingLeft}
                          y1={y}
                          x2={svgWidth - paddingRight}
                          y2={y}
                          stroke="rgba(148, 163, 184, 0.15)"
                          strokeWidth="1"
                        />
                        <text
                          x={paddingLeft - 8}
                          y={y + 4}
                          textAnchor="end"
                          className="text-[9px] fill-muted-foreground font-bold font-sans"
                        >
                          ${Math.round(val).toLocaleString("es-MX")}
                        </text>
                      </g>
                    );
                  })}

                  {/* Shaded Area Under Line */}
                  {areaPathD && (
                    <path d={areaPathD} fill="url(#chartGradient)" />
                  )}

                  {/* Line Curve */}
                  {linePathD && (
                    <path
                      d={linePathD}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* X Axis Labels */}
                  {points.map((p, idx) => {
                    // Show sparse labels to prevent overlap
                    const interval = Math.max(1, Math.ceil(points.length / 10));
                    if (idx % interval !== 0 && idx !== points.length - 1) return null;
                    return (
                      <text
                        key={idx}
                        x={p.x}
                        y={svgHeight - paddingBottom + 16}
                        textAnchor="middle"
                        className="text-[9px] fill-muted-foreground font-bold font-sans"
                      >
                        {p.label}
                      </text>
                    );
                  })}

                  {/* Interactive vertical hover indicator line */}
                  {hoveredLineIdx !== null && points[hoveredLineIdx] && (
                    <g>
                      <line
                        x1={points[hoveredLineIdx].x}
                        y1={paddingTop}
                        x2={points[hoveredLineIdx].x}
                        y2={svgHeight - paddingBottom}
                        stroke="rgba(6, 182, 212, 0.3)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <circle
                        cx={points[hoveredLineIdx].x}
                        cy={points[hoveredLineIdx].y}
                        r="6"
                        fill="#06b6d4"
                        stroke="white"
                        strokeWidth="2"
                      />
                    </g>
                  )}

                  {/* Invisible hover zones for each data point */}
                  {points.map((p, idx) => {
                    const widthZone = chartWidth / Math.max(1, points.length - 1);
                    return (
                      <rect
                        key={idx}
                        x={p.x - widthZone / 2}
                        y={paddingTop}
                        width={widthZone}
                        height={chartHeight}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredLineIdx(idx)}
                        onMouseLeave={() => setHoveredLineIdx(null)}
                      />
                    );
                  })}
                </svg>

                {/* Floating CSS Tooltip relative to the SVG container */}
                {hoveredLineIdx !== null && points[hoveredLineIdx] && (
                  <div
                    className="absolute bg-slate-900/95 text-white px-3 py-2 rounded-xl text-xs shadow-xl pointer-events-none flex flex-col gap-0.5 border border-white/10 z-10 animate-fadeIn"
                    style={{
                      left: `${((points[hoveredLineIdx].x) / svgWidth) * 100}%`,
                      top: `${((points[hoveredLineIdx].y) / svgHeight) * 100 - 18}%`,
                      transform: "translate(-50%, -100%)",
                    }}
                  >
                    <span className="font-semibold text-slate-400">
                      Día/Mes: {points[hoveredLineIdx].label}
                    </span>
                    <span className="text-sm font-bold text-cyan-400 font-sans">
                      ${points[hoveredLineIdx].value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods (Donut/Rosquilla chart) */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-600" />
              Métodos de Pago
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Participación de cobro por canal financiero
            </p>
          </div>

          <div className="relative flex items-center justify-center py-6">
            <svg width="180" height="180" viewBox="0 0 200 200" className="overflow-visible">
              {donutSlices.map((slice, idx) => (
                <circle
                  key={idx}
                  cx={donutCx}
                  cy={donutCy}
                  r={donutR}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={hoveredDonutIdx === idx ? "26" : "20"}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  transform="rotate(-90 100 100)"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredDonutIdx(idx)}
                  onMouseLeave={() => setHoveredDonutIdx(null)}
                />
              ))}

              {/* Central Hole cutout circle */}
              <circle cx={donutCx} cy={donutCy} r="50" fill="var(--card)" />

              {/* Text overlays in the center */}
              <g transform="translate(100, 100)" textAnchor="middle">
                <text y="-5" className="text-xl font-black fill-slate-800 font-sans leading-none">
                  {hoveredDonutIdx !== null
                    ? `${data.paymentMethods[hoveredDonutIdx].percentage}%`
                    : "100%"}
                </text>
                <text y="15" className="text-[9px] font-bold fill-muted-foreground uppercase tracking-widest">
                  {hoveredDonutIdx !== null
                    ? data.paymentMethods[hoveredDonutIdx].method
                    : "Distribución"}
                </text>
              </g>
            </svg>
          </div>

          {/* Donut Legend */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {data.paymentMethods.map((pm, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-xl border flex flex-col gap-1 transition-all ${
                  hoveredDonutIdx === idx
                    ? "bg-slate-50 border-slate-300"
                    : "bg-background/40 border-border/65"
                }`}
                onMouseEnter={() => setHoveredDonutIdx(idx)}
                onMouseLeave={() => setHoveredDonutIdx(null)}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: pm.color }}
                  />
                  <span className="text-[11px] font-bold text-foreground truncate leading-none">
                    {pm.method}
                  </span>
                </div>
                <span className="text-xs font-bold text-foreground font-sans pl-4">
                  ${pm.amount.toLocaleString("es-MX")} ({pm.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Most Requested Treatments, Insumos & Sucursales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Treatments Requested */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Percent className="w-4 h-4 text-cyan-600" />
              Tratamientos Más Solicitados
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Servicios preferidos por cantidad de citas
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {data.topTreatments.map((t, idx) => {
              const maxCount = Math.max(...data.topTreatments.map((x) => x.count), 1);
              const percent = (t.count / maxCount) * 100;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-foreground truncate max-w-[80%] flex gap-1.5 items-center">
                      <span className="text-[10px] w-5 h-5 rounded-full bg-white/5 flex items-center justify-center font-bold text-muted-foreground border border-white/5">
                        {idx + 1}
                      </span>
                      {t.name}
                    </span>
                    <span className="text-foreground font-bold font-sans">
                      {t.count} citas
                    </span>
                  </div>
                  {/* SVG Horizontal Bar */}
                  <svg width="100%" height="8" className="overflow-visible">
                    <rect width="100%" height="8" rx="4" fill="rgba(148, 163, 184, 0.1)" />
                    <rect
                      width={`${percent}%`}
                      height="8"
                      rx="4"
                      fill="url(#treatmentBarGradient)"
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient id="treatmentBarGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Supplies Consumed */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-violet-600" />
              Insumos Más Consumidos
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Productos y materiales con mayor tasa de consumo
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {data.topSupplies.map((s, idx) => {
              const maxCount = Math.max(...data.topSupplies.map((x) => x.count), 1);
              const percent = (s.count / maxCount) * 100;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-foreground truncate max-w-[80%] flex gap-1.5 items-center">
                      <span className="text-[10px] w-5 h-5 rounded-full bg-white/5 flex items-center justify-center font-bold text-muted-foreground border border-white/5">
                        {idx + 1}
                      </span>
                      {s.name}
                    </span>
                    <span className="text-foreground font-bold font-sans">
                      {s.count} uds
                    </span>
                  </div>
                  {/* SVG Horizontal Bar */}
                  <svg width="100%" height="8" className="overflow-visible">
                    <rect width="100%" height="8" rx="4" fill="rgba(148, 163, 184, 0.1)" />
                    <rect
                      width={`${percent}%`}
                      height="8"
                      rx="4"
                      fill="url(#supplyBarGradient)"
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient id="supplyBarGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              );
            })}
          </div>
        </div>

        {/* Branch Income Breakdown */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Ingresos por Sucursal
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Distribución de facturación por sede física
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {data.porSucursal && Object.keys(data.porSucursal).length > 0 ? (
              Object.entries(data.porSucursal).map(([branchName, amount], idx) => {
                const totalIncome = Object.values(data.porSucursal || {}).reduce((a, b) => a + b, 0);
                const percent = totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-foreground truncate max-w-[70%] flex gap-1.5 items-center">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-emerald-500" />
                        {branchName}
                      </span>
                      <span className="text-foreground font-bold font-sans">
                        ${amount.toLocaleString("es-MX")} ({percent}%)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground">No hay información de sucursales en este periodo.</p>
            )}
          </div>
        </div>
      </div>

      {/* Accounting Export Panel */}
      <div id="tour-reports-export" className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <div className="border-b border-border pb-4 mb-5">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Exportar Información Contable
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Descarga cierres de caja, egresos de almacén e informes de comisiones en formato CSV para contabilidad
          </p>
        </div>

        <form onSubmit={handleExport} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Report Type */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              Tipo de Reporte Contable
            </label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as any)}
              className="w-full px-3 py-2.5 text-xs border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background font-semibold"
            >
              <option value="Ventas">Reporte de Ventas (Facturas/Ingresos)</option>
              <option value="Gastos">Reporte de Gastos (Egresos/Compras)</option>
              <option value="Nóminas">Reporte de Nóminas (Comisiones/Haberes)</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              Fecha de Inicio
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                value={exportStart}
                onChange={(e) => setExportStart(e.target.value)}
                className="pl-9 pr-3 py-2.5 w-full text-xs border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background font-semibold"
                required
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              Fecha de Fin
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                value={exportEnd}
                onChange={(e) => setExportEnd(e.target.value)}
                className="pl-9 pr-3 py-2.5 w-full text-xs border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background font-semibold"
                required
              />
            </div>
          </div>

          {/* Download Button */}
          <div>
            <button
              type="submit"
              disabled={exporting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-60"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Descargar Reporte CSV
                </>
              )}
            </button>
          </div>
        </form>

        {/* Status Messages */}
        {exportSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <span>¡Descarga iniciada con éxito!</span>
          </div>
        )}
        {exportError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{exportError}</span>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Ocultar barra lateral de navegación, pie de página, botones y exportadores */
          aside, nav, .no-print, button, form, select, input, .bg-muted, header {
            display: none !important;
          }
          .p-6 {
            padding: 0 !important;
          }
          .max-w-7xl {
            max-w: 100% !important;
            width: 100% !important;
          }
          .bg-card {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          svg {
            page-break-inside: avoid;
          }
          .grid {
            display: grid !important;
          }
        }
      `}} />
    </div>
  );
}
