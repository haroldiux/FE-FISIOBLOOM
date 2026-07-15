import { TourStep } from "../types";

export const portalTour: TourStep[] = [
  {
    selector: "#tour-portal-services",
    title: "Paso 1: Elige tu Tratamiento",
    content: "Selecciona el servicio clínico o estético que deseas agendar desde nuestro catálogo público en línea.",
    position: "bottom"
  },
  {
    selector: "#tour-portal-date",
    title: "Paso 2: Fecha y Profesional",
    content: "Elige al especialista de tu preferencia, selecciona un día y visualiza los horarios disponibles en tiempo real.",
    position: "top"
  },
  {
    selector: "#tour-portal-submit",
    title: "Paso 3: Reserva Web",
    content: "Completa tus datos de contacto en el formulario y confirma la cita. Se agendará en la consola del centro clínico automáticamente.",
    position: "top"
  }
];
