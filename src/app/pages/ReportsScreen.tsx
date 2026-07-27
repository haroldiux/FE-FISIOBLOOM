import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart3,
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
    gananciaReal: number;
    gananciaRealDiff: number;
    citasCompletadas: number;
    citasCompletadasDiff: number;
    valorAlmacen: number;
    valorAlmacenDiff: number;
  };
  egresosBreakdown: {
    gastosManuales: number;
    nomina: number;
    insumosConsumidos: number;
    productosVendidos: number;
    mermas: number;
  };
  dailyEvolution: { label: string; ingresos: number }[];
  paymentMethods: { method: string; amount: number; percentage: number; color: string }[];
  topTreatments: { name: string; count: number }[];
  topSupplies: { name: string; count: number }[];
  porSucursal?: Record<string, number>;
  staffBreakdown: { name: string; role: string; citasAtendidas: number; ingresos: number; costoInsumos: number }[];
  almacenDetalle: { name: string; stock: number; costPrice: number; price: number; valorCosto: number; valorVenta: number }[];
  nominaDetalle: { name: string; role: string; status: string; periodStart: string; periodEnd: string; baseSalary: number; commissionsAmount: number; totalPaid: number; paidAt: string | null }[];
  insumosDetalle: { name: string; profesional: string; cantidad: number; costoUnitario: number; costoTotal: number }[];
  productosVendidosDetalle: { name: string; cantidad: number; ingresoTotal: number; costoTotal: number }[];
  mermasDetalle: { name: string; cantidad: number; costoUnitario: number; costoTotal: number; motivo: string; fecha: string }[];
  gastosManualesDetalle: { fecha: string; descripcion: string; registradoPor: string; monto: number }[];
  ingresosServiciosDetalle: { fecha: string; folio: string; cliente: string; servicio: string; profesional: string; monto: number }[];
  ingresosProductosDetalle: { fecha: string; producto: string; cantidad: number; precioUnitario: number; ingresoTotal: number; vendidoPor: string }[];
  otrosIngresosDetalle: { concepto: string; monto: number }[];
  ingresosBreakdown: {
    subtotalServicios: number;
    subtotalProductos: number;
    otrosIngresos: number;
    totalDescuentos: number;
    totalImpuestos: number;
  };
  auditChecks: { label: string; expected: number; actual: number; ok: boolean }[];
}

const EMPTY_REPORT_DATA: ReportData = {
  kpis: {
    ingresosNetos: 0,
    ingresosNetosDiff: 0,
    egresos: 0,
    egresosDiff: 0,
    gananciaReal: 0,
    gananciaRealDiff: 0,
    citasCompletadas: 0,
    citasCompletadasDiff: 0,
    valorAlmacen: 0,
    valorAlmacenDiff: 0,
  },
  egresosBreakdown: {
    gastosManuales: 0,
    nomina: 0,
    insumosConsumidos: 0,
    productosVendidos: 0,
    mermas: 0,
  },
  dailyEvolution: [],
  paymentMethods: [],
  topTreatments: [],
  topSupplies: [],
  porSucursal: {},
  staffBreakdown: [],
  almacenDetalle: [],
  nominaDetalle: [],
  insumosDetalle: [],
  productosVendidosDetalle: [],
  mermasDetalle: [],
  gastosManualesDetalle: [],
  ingresosServiciosDetalle: [],
  ingresosProductosDetalle: [],
  otrosIngresosDetalle: [],
  ingresosBreakdown: {
    subtotalServicios: 0,
    subtotalProductos: 0,
    otrosIngresos: 0,
    totalDescuentos: 0,
    totalImpuestos: 0,
  },
  auditChecks: [],
};

export default function ReportsScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  // State
  const [range, setRange] = useState<DateRange>("este_mes");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [data, setData] = useState<ReportData>(EMPTY_REPORT_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hover states for interactive SVGs
  const [hoveredLineIdx, setHoveredLineIdx] = useState<number | null>(null);
  const [hoveredDonutIdx, setHoveredDonutIdx] = useState<number | null>(null);

  // Set default dates for Custom Range
  useEffect(() => {
    const today = new Date();
    const startStr = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
    const endStr = today.toISOString().split("T")[0];
    setCustomStart(startStr);
    setCustomEnd(endStr);
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
        toast.warning("Sin conexión. Mostrando datos contables históricos guardados localmente.");
      } else {
        setData(EMPTY_REPORT_DATA);
        setError("Error de comunicación con el servidor. No se pudieron cargar los reportes.");
        toast.error("La conexión con el servidor falló.");
      }
    } finally {
      setLoading(false);
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

  // ── Reporte de auditoría (para impresión / PDF) ──
  const rangeLabel = {
    hoy: "Hoy",
    esta_semana: "Esta Semana",
    este_mes: "Este Mes",
    mes_anterior: "Mes Anterior",
    anio_actual: "Año Actual",
    personalizado: `Personalizado (${customStart} a ${customEnd})`,
  }[range];

  const roleLabel: Record<string, string> = {
    ADMIN: "Administrador/a",
    PHYSIO: "Fisioterapeuta",
    AESTHETICIAN: "Esteticista",
    RECEPTIONIST: "Recepcionista",
    SUPER_ADMIN: "Súper Admin",
  };

  const fmt = (n: number) => `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  // ── Generar y descargar el PDF de auditoría (archivo real, no diálogo de impresión) ──
  const handleExportPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte de Auditoría de Bloom Skin", pageWidth / 2, y, { align: "center" });
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Período: ${rangeLabel}`, 14, y);
    y += 5;
    doc.text(`Generado el: ${new Date().toLocaleString("es-MX")}`, 14, y);
    y += 8;

    const section = (title: string) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(title, 14, y);
      y += 2;
    };
    const subsection = (title: string) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(title, 14, y);
      y += 2;
    };
    // Evita que un título de sección quede pegado al pie de la página, sin
    // su tabla — si no hay espacio suficiente, salta de página antes.
    const ensureSpace = (minSpace: number) => {
      if (y > 297 - minSpace) { doc.addPage(); y = 15; }
    };

    // ── 1. Resumen General ──────────────────────────────────────────────
    section("1. Resumen General");
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 9 },
      body: [
        ["Ingresos Netos", fmt(data.kpis.ingresosNetos)],
        ["Gastos y Egresos", fmt(data.kpis.egresos)],
        ["Ganancia Real", fmt(data.kpis.gananciaReal)],
        ["Citas Completadas", String(data.kpis.citasCompletadas)],
        ["Valor de Almacén (costo)", fmt(data.kpis.valorAlmacen)],
      ],
    });
    y = (doc as any).lastAutoTable.finalY + 6;

    // Si alguna verificación de cuadre no dio exacta, se muestra acá mismo,
    // justo después del resumen — nunca se oculta un error de auditoría.
    const failedChecks = data.auditChecks.filter((c) => !c.ok);
    if (failedChecks.length > 0) {
      ensureSpace(20 + failedChecks.length * 6);
      const boxHeight = 10 + failedChecks.length * 6;
      doc.setFillColor(254, 226, 226);
      doc.setDrawColor(220, 38, 38);
      doc.rect(14, y, pageWidth - 28, boxHeight, "FD");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(185, 28, 28);
      doc.text("⚠ DISCREPANCIA DETECTADA — revisar antes de usar este reporte", 17, y + 6);
      let checkY = y + 12;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      failedChecks.forEach((c) => {
        doc.text(`- ${c.label}: esperado ${fmt(c.expected)}, calculado ${fmt(c.actual)} (dif. ${fmt(c.actual - c.expected)})`, 17, checkY);
        checkY += 6;
      });
      doc.setTextColor(0);
      y += boxHeight + 6;
      console.error("Discrepancias detectadas en el reporte de auditoría:", failedChecks);
    }

    // ── 2. Desglose de Ingresos ──────────────────────────────────────────
    ensureSpace(50);
    section("2. Desglose de Ingresos");
    y += 2;

    subsection("2.1 Ingresos por Servicios / Citas");
    y += 2;
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 7 },
      head: [["Fecha", "Folio", "Cliente", "Servicio", "Profesional", "Monto"]],
      body: data.ingresosServiciosDetalle.length > 0
        ? data.ingresosServiciosDetalle.map((r) => [
            new Date(r.fecha).toLocaleDateString("es-MX"),
            r.folio,
            r.cliente,
            r.servicio,
            r.profesional,
            fmt(r.monto),
          ])
        : [["Sin ingresos por servicios en este período", "-", "-", "-", "-", "-"]],
      foot: [["", "", "", "", "Subtotal Servicios", fmt(data.ingresosBreakdown.subtotalServicios)]],
      footStyles: { fontStyle: "bold" },
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    ensureSpace(50);
    subsection("2.2 Ingresos por Venta de Productos (Terminal POS)");
    y += 2;
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8 },
      head: [["Fecha", "Producto", "Cantidad", "Precio Unit.", "Ingreso Total", "Vendido por"]],
      body: data.ingresosProductosDetalle.length > 0
        ? data.ingresosProductosDetalle.map((r) => [
            new Date(r.fecha).toLocaleDateString("es-MX"),
            r.producto,
            String(r.cantidad),
            fmt(r.precioUnitario),
            fmt(r.ingresoTotal),
            r.vendidoPor,
          ])
        : [["Sin ventas de productos en este período", "-", "-", "-", "-", "-"]],
      foot: [["", "", "", "", "Subtotal Productos", fmt(data.ingresosBreakdown.subtotalProductos)]],
      footStyles: { fontStyle: "bold" },
    });
    y = (doc as any).lastAutoTable.finalY + 6;

    ensureSpace(30);
    subsection("2.3 Otros Ingresos");
    y += 2;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("El sistema no registra actualmente anticipos, propinas ni venta de paquetes como un ingreso", 14, y);
    y += 4;
    doc.text("independiente de servicios/productos — por eso esta subsección no tiene datos que mostrar.", 14, y);
    y += 8;

    ensureSpace(45);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Total de Ingresos", 14, y);
    y += 2;
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 9 },
      body: [
        ["Servicios (2.1)", fmt(data.ingresosBreakdown.subtotalServicios)],
        ["Productos POS (2.2)", fmt(data.ingresosBreakdown.subtotalProductos)],
        ["Otros Ingresos (2.3)", fmt(data.ingresosBreakdown.otrosIngresos)],
        ["Descuentos Aplicados", `-${fmt(data.ingresosBreakdown.totalDescuentos)}`],
        ["Impuestos", fmt(data.ingresosBreakdown.totalImpuestos)],
        ["= Ingresos Netos", fmt(data.kpis.ingresosNetos)],
      ],
    });
    y = (doc as any).lastAutoTable.finalY + 6;

    // ── 3. Ingresos por Método de Pago ──────────────────────────────────
    ensureSpace(40);
    section("3. Ingresos por Método de Pago");
    y += 2;
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 9 },
      head: [["Método", "Monto", "% del Total"]],
      body: data.paymentMethods.length > 0
        ? data.paymentMethods.map((pm) => [pm.method, fmt(pm.amount), `${pm.percentage}%`])
        : [["Sin facturas pagadas en este período", "-", "-"]],
    });
    y = (doc as any).lastAutoTable.finalY + 6;

    // ── 4. Desglose de Gastos y Egresos ─────────────────────────────────
    ensureSpace(40);
    section("4. Desglose de Gastos y Egresos");
    y += 2;
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 9 },
      body: [
        ["Gastos manuales (Caja Diaria)", fmt(data.egresosBreakdown.gastosManuales)],
        ["Nómina pagada", fmt(data.egresosBreakdown.nomina)],
        ["Insumos consumidos en sesiones (costo)", fmt(data.egresosBreakdown.insumosConsumidos)],
        ["Productos vendidos por POS (costo)", fmt(data.egresosBreakdown.productosVendidos)],
        ["Mermas (dañado/vencido/perdido, a costo)", fmt(data.egresosBreakdown.mermas)],
        ["Total Gastos y Egresos", fmt(data.kpis.egresos)],
      ],
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    ensureSpace(40);
    subsection("4.1 Gastos manuales (Caja Diaria)");
    y += 2;
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8 },
      head: [["Fecha", "Descripción / Concepto", "Registrado por", "Monto"]],
      body: data.gastosManualesDetalle.length > 0
        ? data.gastosManualesDetalle.map((g) => [
            new Date(g.fecha).toLocaleDateString("es-MX"), g.descripcion, g.registradoPor, fmt(g.monto),
          ])
        : [["Sin gastos manuales registrados en este período", "-", "-", "-"]],
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    ensureSpace(40);
    subsection("4.2 Nómina — a quién se le pagó y quién sigue pendiente");
    y += 2;
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8 },
      head: [["Trabajador", "Rol", "Estado", "Período", "Sueldo Base", "Comisiones", "Total"]],
      body: data.nominaDetalle.length > 0
        ? data.nominaDetalle.map((n) => [
            n.name,
            roleLabel[n.role] || n.role,
            n.status,
            `${new Date(n.periodStart).toLocaleDateString("es-MX")} - ${new Date(n.periodEnd).toLocaleDateString("es-MX")}`,
            fmt(n.baseSalary),
            fmt(n.commissionsAmount),
            fmt(n.totalPaid),
          ])
        : [["Sin nóminas generadas para este período", "-", "-", "-", "-", "-", "-"]],
    });
    y = (doc as any).lastAutoTable.finalY + 6;

    ensureSpace(40);
    subsection("4.3 Insumos consumidos en sesión (por profesional)");
    y += 2;
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8 },
      head: [["Insumo", "Profesional", "Cantidad", "Costo Unit.", "Costo Total"]],
      body: data.insumosDetalle.length > 0
        ? data.insumosDetalle.map((i) => [i.name, i.profesional, String(i.cantidad), fmt(i.costoUnitario), fmt(i.costoTotal)])
        : [["Sin insumos consumidos en este período", "-", "-", "-", "-"]],
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    ensureSpace(40);
    subsection("4.4 Costo de Productos vendidos por Terminal POS");
    y += 2;
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8 },
      head: [["Producto", "Cantidad", "Costo Total"]],
      body: data.productosVendidosDetalle.length > 0
        ? data.productosVendidosDetalle.map((p) => [p.name, String(p.cantidad), fmt(p.costoTotal)])
        : [["Sin ventas de productos en este período", "-", "-"]],
    });
    y = (doc as any).lastAutoTable.finalY + 8;

    ensureSpace(40);
    subsection("4.5 Mermas (pérdidas de stock)");
    y += 2;
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8 },
      head: [["Producto", "Cantidad", "Costo Total", "Motivo", "Fecha"]],
      body: data.mermasDetalle.length > 0
        ? data.mermasDetalle.map((m) => [m.name, String(m.cantidad), fmt(m.costoTotal), m.motivo, new Date(m.fecha).toLocaleDateString("es-MX")])
        : [["Sin mermas registradas en este período", "-", "-", "-", "-"]],
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // ── 5. Desglose por Profesional ─────────────────────────────────────
    ensureSpace(40);
    section("5. Desglose por Profesional");
    y += 2;
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 9 },
      head: [["Profesional", "Rol", "Citas Atendidas", "Ingresos Generados", "Costo de Insumos"]],
      body: data.staffBreakdown.length > 0
        ? data.staffBreakdown.map((s) => [s.name, roleLabel[s.role] || s.role, String(s.citasAtendidas), fmt(s.ingresos), fmt(s.costoInsumos)])
        : [["Sin citas completadas en este período", "-", "-", "-", "-"]],
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // ── 6. Valorización de Almacén ──────────────────────────────────────
    doc.addPage();
    y = 15;
    section("6. Valorización de Almacén (stock actual)");
    y += 2;
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8 },
      head: [["Producto", "Stock", "Costo Unit.", "Venta Unit.", "Valor Costo", "Valor Venta"]],
      body: data.almacenDetalle.map((p) => [p.name, String(p.stock), fmt(p.costPrice), fmt(p.price), fmt(p.valorCosto), fmt(p.valorVenta)]),
      foot: [[
        "Total", "", "", "",
        fmt(data.kpis.valorAlmacen),
        fmt(data.almacenDetalle.reduce((s, p) => s + p.valorVenta, 0)),
      ]],
      footStyles: { fontStyle: "bold" },
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 30, 290);
    }

    doc.save(`reporte_auditoria_${range}_${new Date().toISOString().split("T")[0]}.pdf`);
    if (failedChecks.length > 0) {
      toast.error(`Reporte descargado, pero con ${failedChecks.length} discrepancia(s) detectada(s) — revisá el PDF.`, { duration: 8000 });
    } else {
      toast.success("Reporte PDF descargado correctamente.");
    }
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
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
          <div className="bg-muted p-1 rounded-xl flex flex-wrap gap-1 border border-border/50 no-print">
            {(["hoy", "esta_semana", "este_mes", "mes_anterior", "anio_actual", "personalizado"] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  range === r
                    ? "bg-card text-foreground shadow-sm font-bold border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "hoy" && "Hoy"}
                {r === "esta_semana" && "Esta Semana"}
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
            onClick={handleExportPdf}
            className="no-print flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/10 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div id="tour-reports-kpi" data-onboarding="reports-kpis" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* KPI 1: Ingresos Netos */}
        <div className="bg-card rounded-2xl border border-border p-5 relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-secondary" />
            </div>
            <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
              data.kpis.ingresosNetosDiff >= 0
                ? "bg-success/15 text-success border border-success/25"
                : "bg-error/15 text-error border border-error/25"
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
            <div className="w-10 h-10 rounded-xl bg-error/15 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-error" />
            </div>
            <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
              data.kpis.egresosDiff <= 0
                ? "bg-success/15 text-success border border-success/25"
                : "bg-error/15 text-error border border-error/25"
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
              Insumos, mermas, nómina y costos fijos
            </p>
          </div>
        </div>

        {/* KPI 3: Citas Completadas */}
        <div className="bg-card rounded-2xl border border-border p-5 relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-secondary" />
            </div>
            <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
              data.kpis.citasCompletadasDiff >= 0
                ? "bg-success/10 text-success border border-success/20"
                : "bg-error/10 text-error border border-error/20"
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

        {/* KPI: Ganancia Real */}
        <div className="bg-card rounded-2xl border border-border p-5 relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
              data.kpis.gananciaRealDiff >= 0
                ? "bg-success/15 text-success border border-success/25"
                : "bg-error/15 text-error border border-error/25"
            }`}>
              {data.kpis.gananciaRealDiff >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(data.kpis.gananciaRealDiff)}%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Ganancia Real
            </h3>
            <p className={`text-2xl font-black mt-2 font-sans ${data.kpis.gananciaReal >= 0 ? "text-foreground" : "text-error"}`}>
              ${data.kpis.gananciaReal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">
              Ingresos menos gastos e insumos usados
            </p>
          </div>
        </div>

        {/* KPI 4: Valor de Almacén */}
        <div className="bg-card rounded-2xl border border-border p-5 relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-warning" />
            </div>
            <span className="flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
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
              <TrendingUp className="w-4 h-4 text-secondary" />
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
              <div className="w-full overflow-x-auto scrollbar-hide">
                <div className="min-w-[600px] w-full relative">
                  {/* Inline SVG Chart */}
                  <svg width="100%" height="220" viewBox="0 0 600 220" preserveAspectRatio="none" className="overflow-visible w-full min-w-[600px]">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.00" />
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
                          stroke="var(--border)"
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
                      stroke="var(--secondary)"
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
                        stroke="var(--secondary)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity="0.5"
                      />
                      <circle
                        cx={points[hoveredLineIdx].x}
                        cy={points[hoveredLineIdx].y}
                        r="6"
                        fill="var(--secondary)"
                        stroke="var(--card-foreground)"
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

                {/* Floating CSS Tooltip relative to the SVG container. El
                    contenedor scrollea horizontal (overflow-x-auto), lo que
                    por espec de CSS también recorta el overflow vertical —
                    así que si el punto está muy arriba (picos altos), el
                    tooltip se dibuja hacia ABAJO en vez de hacia arriba para
                    no quedar cortado y desaparecer. */}
                {hoveredLineIdx !== null && points[hoveredLineIdx] && (
                  <div
                    className="absolute bg-popover text-popover-foreground px-3 py-2 rounded-xl text-xs shadow-xl pointer-events-none flex flex-col gap-0.5 border border-border z-10 animate-fadeIn"
                    style={{
                      left: `${((points[hoveredLineIdx].x) / svgWidth) * 100}%`,
                      top: `${((points[hoveredLineIdx].y) / svgHeight) * 100}%`,
                      transform: points[hoveredLineIdx].y < 50
                        ? "translate(-50%, 14px)"
                        : "translate(-50%, calc(-100% - 14px))",
                    }}
                  >
                    <span className="font-semibold text-muted-foreground">
                      Día/Mes: {points[hoveredLineIdx].label}
                    </span>
                    <span className="text-sm font-bold text-secondary font-sans">
                      ${points[hoveredLineIdx].value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods (Donut/Rosquilla chart) */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-secondary" />
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
                <text y="-5" className="text-xl font-black fill-foreground font-sans leading-none">
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
                    ? "bg-muted border-border"
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
              <Percent className="w-4 h-4 text-secondary" />
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
                      <span className="text-[10px] w-5 h-5 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground border border-border">
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
                    <rect width="100%" height="8" rx="4" fill="var(--muted)" />
                    <rect
                      width={`${percent}%`}
                      height="8"
                      rx="4"
                      fill="url(#treatmentBarGradient)"
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient id="treatmentBarGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--secondary)" />
                        <stop offset="100%" stopColor="var(--success)" />
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
              <Package className="w-4 h-4 text-secondary" />
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
                      <span className="text-[10px] w-5 h-5 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground border border-border">
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
                    <rect width="100%" height="8" rx="4" fill="var(--muted)" />
                    <rect
                      width={`${percent}%`}
                      height="8"
                      rx="4"
                      fill="url(#supplyBarGradient)"
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient id="supplyBarGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--secondary)" />
                        <stop offset="100%" stopColor="var(--primary)" />
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
              <TrendingUp className="w-4 h-4 text-success" />
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
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-success" />
                        {branchName}
                      </span>
                      <span className="text-foreground font-bold font-sans">
                        ${amount.toLocaleString("es-MX")} ({percent}%)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-success h-full rounded-full transition-all duration-500"
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
            max-width: 100% !important;
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
