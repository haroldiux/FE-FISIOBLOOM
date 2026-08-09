import { TourStep } from "../types";

export const calendarTour: TourStep[] = [
  {
    selector: "#tour-calendar-cabins",
    title: "Filtro de Vista y Cabinas",
    content: "Cambia entre Vista Semanal y Vista Diaria por Cabinas. Te permite ver qué salas físicas (boxes) o equipos láser están ocupados u ociosos. Este recorrido te muestra cómo crear una cita nueva de punta a punta.",
    position: "bottom"
  },
  {
    selector: "#tour-calendar-create-btn",
    title: "Nueva Cita Rápida",
    content: "Tocá acá para abrir el formulario lateral y crear una cita manualmente.",
    position: "left",
    mode: "interactive",
    advanceOn: { event: "click", selector: "#tour-calendar-create-btn" }
  },
  {
    selector: "#tour-calendar-drawer-patient",
    title: "Buscar Paciente",
    content: "Escribí el nombre del paciente en el buscador y seleccionalo de los resultados. Si es nuevo, podés darlo de alta rápido sin salir de este formulario.",
    position: "left"
  },
  {
    selector: "#tour-calendar-drawer-specialist",
    title: "Asignar Profesional",
    content: "Seleccioná al terapeuta o esteticista que va a realizar el tratamiento. El sistema calcula su comisión automáticamente según su esquema de contrato.",
    position: "left"
  },
  {
    selector: "#tour-calendar-drawer-cabin",
    title: "Reservar Cabina",
    content: "Asigná la cabina o box físico para esta cita. Esto evita que dos citas se solapen usando el mismo espacio o equipo láser al mismo tiempo.",
    position: "left"
  },
  {
    selector: "#tour-calendar-drawer-time",
    title: "Horario y Duración",
    content: "Elegí un horario disponible entre los chips rápidos. Los tachados ya están ocupados por otra cita de ese profesional, o ya pasaron si elegiste el día de hoy.",
    position: "left"
  },
  {
    selector: "#tour-calendar-drawer-submit",
    title: "Confirmar Agenda",
    content: "Tocá 'Guardar'. El sistema valida que no haya colisiones de agenda antes de crear la cita definitivamente.",
    position: "top",
    mode: "interactive",
    advanceOn: { event: "click", selector: "#tour-calendar-drawer-submit" }
  },
  {
    selector: "#tour-calendar-grid",
    title: "Cuadrícula Agenda",
    content: "Muestra los bloques de citas. Podés hacer doble clic en un slot vacío para reservar, o arrastrar una cita existente para reprogramarla.",
    position: "top"
  },
  {
    selector: ".rbc-event",
    title: "Detalle de Cita",
    content: "Hacé un solo clic sobre cualquier cita en la cuadrícula para ver detalles, cambiar el estado (Pendiente, Confirmada, Completada) o abrir el cobro en POS.",
    position: "bottom"
  }
];
