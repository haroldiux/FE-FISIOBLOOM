import { TourStep } from "../types";

export const payrollSettlementWorkflow: TourStep[] = [
  {
    selector: "#tour-finance-tabs",
    title: "Paso 1: Barra de Finanzas",
    content: "Navega a la sección de Finanzas en la barra superior.",
    position: "bottom"
  },
  {
    selector: "#tour-finance-payroll-tab",
    title: "Paso 2: Módulo de Nóminas",
    content: "Selecciona la pestaña de Nóminas en el panel de control.",
    position: "bottom"
  },
  {
    selector: "#tour-pos-payroll",
    title: "Paso 3: Liquidar Comisiones",
    content: "Revisa las comisiones automáticas del 10% acumuladas por citas completadas. Selecciona el período y presiona 'Liquidar' para archivar el pago.",
    position: "top"
  }
];
