import { TourStep } from "../types";

export const posSaleWorkflow: TourStep[] = [
  {
    selector: "#tour-pos-terminal",
    title: "Paso 1: Carrito de Cobro",
    content: "Agrega los tratamientos realizados hoy o productos de reventa comercial al carrito del POS.",
    position: "bottom"
  },
  {
    selector: "#tour-pos-patient-search",
    title: "Paso 2: Vincular Paciente",
    content: "Busca y asocia el paciente para que el ticket de venta quede guardado en su historial.",
    position: "bottom"
  },
  {
    selector: "#tour-pos-payment-method",
    title: "Paso 3: Forma de Pago",
    content: "Selecciona si el cobro se realiza en Efectivo, Tarjeta de Crédito/Débito, Transferencia o QR.",
    position: "top"
  },
  {
    selector: "#tour-pos-invoice-type",
    title: "Paso 4: Ticket o Factura",
    content: "Elige 'Ticket Interno' para fines de control, o activa 'Factura Fiscal' para desglose automático de impuestos.",
    position: "top"
  },
  {
    selector: "#tour-pos-submit-sale",
    title: "Paso 5: Registrar Venta",
    content: "Confirma el pago. Se actualizará la caja del día, se restará el stock de insumos y se liquidará la comisión del personal.",
    position: "top"
  }
];
