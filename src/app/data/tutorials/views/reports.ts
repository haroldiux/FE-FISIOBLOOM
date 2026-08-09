import { TourStep } from "../types";

export const reportsTour: TourStep[] = [
  {
    selector: "#tour-reports-range",
    title: "Elegí el Período a Analizar",
    content: "Todos los números de esta pantalla (KPIs, gráficos y el PDF exportado) cambian según el rango elegido acá: Hoy, Esta Semana, Este Mes, Mes Anterior, Año Actual, o un rango Personalizado con fecha de inicio y fin.",
    position: "bottom"
  },
  {
    selector: "#tour-reports-kpi",
    title: "KPIs Contables",
    content: "Cinco indicadores del período seleccionado: Ingresos Netos cobrados, Egresos (gastos, nómina, insumos y mermas), Ganancia Real, Citas Completadas y el Valor de tu Almacén. El porcentaje debajo de cada uno compara contra el período anterior equivalente.",
    position: "bottom"
  },
  {
    selector: "#tour-reports-charts",
    title: "Evolución Diaria de Ingresos",
    content: "Gráfico de línea con la facturación día por día dentro del período elegido. Pasá el mouse sobre cualquier punto para ver el monto exacto de ese día.",
    position: "top"
  },
  {
    selector: "#tour-reports-payment-methods",
    title: "Métodos de Pago",
    content: "Rosquilla con la participación de cada canal de cobro (efectivo, tarjeta, transferencia, QR) sobre el total facturado en el período.",
    position: "left"
  },
  {
    selector: "#tour-reports-breakdown",
    title: "Tratamientos, Insumos y Sucursales",
    content: "Ranking de los tratamientos más solicitados, los insumos que más se consumieron del almacén, y (si tenés más de una sucursal) el desglose de facturación por sede.",
    position: "top"
  },
  {
    selector: "#tour-reports-export",
    title: "Descarga de Auditoría",
    content: "Genera y descarga un reporte en formato PDF con el detalle del período seleccionado, listo para tu contabilidad o declaración fiscal mensual.",
    position: "top"
  }
];
