import { TourStep } from "../types";

export const posTour: TourStep[] = [
  {
    selector: "#tour-pos-terminal",
    title: "Terminal de Venta (POS)",
    content: "Añade servicios y productos comerciales al carrito. Recuerda asociar el paciente usando el buscador superior del POS.",
    position: "bottom"
  },
  {
    selector: "#tour-pos-coupons",
    title: "Cupones y Descuentos",
    content: "Aplica cupones promocionales de campañas activas, introduce descuentos manuales y define si es comprobante de control interno o factura fiscal.",
    position: "left"
  },
  {
    selector: "#tour-pos-cash",
    title: "Control de Caja Chica",
    content: "Abre la caja chica con el saldo inicial del día. Registra salidas rápidas de efectivo para gastos menores y efectúa el arqueo de cierre.",
    position: "top"
  },
  {
    selector: "#tour-pos-payroll",
    title: "Liquidación de Nóminas",
    content: "Calcula el sueldo base más las comisiones automáticas del 10% ganadas por el personal por tratamientos completados.",
    position: "top"
  }
];
