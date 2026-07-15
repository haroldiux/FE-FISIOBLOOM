import { TourStep } from "../types";

export const calendarTour: TourStep[] = [
  {
    selector: "#tour-calendar-cabins",
    title: "Filtro de Vista y Cabinas",
    content: "Cambia entre Vista Semanal y Vista Diaria por Cabinas. Te permite ver qué salas físicas (boxes) o equipos láser están ocupados u ociosos.",
    position: "bottom"
  },
  {
    selector: "#tour-calendar-create-btn",
    title: "Nueva Cita Rápida",
    content: "Haz clic para abrir el formulario lateral y crear una cita manualmente ingresando paciente, servicio y hora.",
    position: "left"
  },
  {
    selector: "#tour-calendar-grid",
    title: "Cuadrícula Agenda",
    content: "Muestra los bloques de citas. Puedes hacer doble clic en un slot vacío para reservar, o arrastrar una cita existente para reprogramarla.",
    position: "top"
  },
  {
    selector: ".rbc-event",
    title: "Detalle de Cita",
    content: "Haz un solo clic sobre cualquier cita en la cuadrícula para ver detalles, cambiar el estado (Pendiente, Confirmada, Completada) o abrir el cobro en POS.",
    position: "bottom"
  }
];
