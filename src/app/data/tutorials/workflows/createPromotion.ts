import { TourStep } from "../types";

export const createPromotionWorkflow: TourStep[] = [
  {
    selector: "#tour-finance-promotions-tab",
    title: "Paso 1: Pestaña de Promociones",
    content: "Haz clic en la pestaña de Gestión de Promociones dentro del módulo de Finanzas.",
    position: "bottom",
    targetTab: "promotions"
  },
  {
    selector: "#tour-promotions-create-btn",
    title: "Paso 2: Nueva Campaña",
    content: "Haz clic en 'Nueva Campaña' para crear un descuento temporal sobre un tratamiento específico.",
    position: "bottom",
    mode: "interactive",
    advanceOn: { event: "click", selector: "#tour-promotions-create-btn" }
  },
  {
    selector: "#tour-promotion-form-discount",
    title: "Paso 3: Definir Descuento",
    content: "Elige si el descuento es un porcentaje o un monto fijo, e introduce el valor a aplicar.",
    position: "top"
  },
  {
    selector: "#tour-promotion-form-rules",
    title: "Paso 4: Vigencia de la Campaña",
    content: "Define la fecha de inicio y de fin. Fuera de ese rango, el descuento deja de aplicarse automáticamente.",
    position: "top"
  },
  {
    selector: "#tour-promotion-form-submit",
    title: "Paso 5: Activar Campaña",
    content: "Presiona 'Guardar' para publicar la promoción y aplicarla en el POS.",
    position: "top"
  }
];
