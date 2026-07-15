import { TourStep } from "../types";

export const cashRegisterWorkflow: TourStep[] = [
  {
    selector: "#tour-pos-cash",
    title: "Paso 1: Abrir Módulo Caja",
    content: "Dirígete a la sección de Arqueo y Caja Chica en el módulo de Finanzas.",
    position: "top"
  },
  {
    selector: "#tour-cash-initial-balance",
    title: "Paso 2: Apertura de Turno",
    content: "Al iniciar el turno de recepción, abre la caja registrando el dinero físico inicial para cambios.",
    position: "top"
  },
  {
    selector: "#tour-cash-expense-btn",
    title: "Paso 3: Gastos Menores",
    content: "Usa este botón para registrar si se retira dinero en efectivo para compras rápidas de insumos.",
    position: "top"
  },
  {
    selector: "#tour-cash-close-btn",
    title: "Paso 4: Arqueo y Cierre",
    content: "Al final del día, cuenta el efectivo físico, contrástalo con el esperado en sistema y registra el balance de cierre.",
    position: "top"
  }
];
