import { TourStep } from "../types";

export const createPromotionWorkflow: TourStep[] = [
  {
    selector: "#tour-finance-promotions-tab",
    title: "Paso 1: Pestaña de Promociones",
    content: "Haz clic en la pestaña de Gestión de Promociones dentro del módulo de Finanzas.",
    position: "bottom"
  },
  {
    selector: "#tour-promotions-create-btn",
    title: "Paso 2: Crear Promoción",
    content: "Haz clic para crear un descuento temporal o código de cupón.",
    position: "bottom"
  },
  {
    selector: "#tour-promotion-form-discount",
    title: "Paso 3: Definir Descuento",
    content: "Introduce el porcentaje de descuento a aplicar y el rango de fechas de validez.",
    position: "top"
  },
  {
    selector: "#tour-promotion-form-rules",
    title: "Paso 4: Reglas y Restricciones",
    content: "Configura qué servicios aplican y si es acumulable con otras ofertas.",
    position: "top"
  },
  {
    selector: "#tour-promotion-form-submit",
    title: "Paso 5: Activar Campaña",
    content: "Presiona 'Guardar' para publicar la promoción y aplicarla en el POS.",
    position: "top"
  }
];
