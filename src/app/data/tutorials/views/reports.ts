import { TourStep } from "../types";

export const reportsTour: TourStep[] = [
  {
    selector: "#tour-reports-kpi",
    title: "KPIs Contables",
    content: "Visualiza los ingresos netos cobrados, los gastos en efectivo de caja chica, comisiones devengadas y la valorización de tu stock en almacén.",
    position: "bottom"
  },
  {
    selector: "#tour-reports-charts",
    title: "Distribución de Finanzas",
    content: "Gráficos de facturación por sucursal, categorías de servicios con más demanda y desgloses por métodos de pago.",
    position: "top"
  },
  {
    selector: "#tour-reports-export",
    title: "Descarga de Auditoría",
    content: "Genera y descarga un reporte en formato CSV compatible con Excel para tu contabilidad o declaración fiscal mensual.",
    position: "top"
  }
];
