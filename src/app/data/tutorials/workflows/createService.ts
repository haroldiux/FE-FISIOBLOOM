import { TourStep } from "../types";

export const createServiceWorkflow: TourStep[] = [
  {
    selector: "#tour-services-supplies",
    title: "Paso 1: Nuevo Servicio",
    content: "Haz clic en 'Nuevo Servicio' dentro del catálogo de tratamientos.",
    position: "top"
  },
  {
    selector: "#tour-service-form-name",
    title: "Paso 2: Datos Básicos",
    content: "Define nombre del tratamiento, categoría clínica, duración en cabina y precio al público.",
    position: "top"
  },
  {
    selector: "#tour-service-form-consumables",
    title: "Paso 3: Consumo Automático",
    content: "Vincular productos de almacén (ej. 15ml de crema) que el sistema descontará de stock por cada sesión.",
    position: "top"
  },
  {
    selector: "#tour-service-form-submit",
    title: "Paso 4: Guardar Servicio",
    content: "Guarda el tratamiento. Quedará disponible en la agenda del calendario y en el terminal POS.",
    position: "top"
  }
];
