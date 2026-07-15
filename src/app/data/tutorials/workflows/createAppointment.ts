import { TourStep } from "../types";

export const createAppointmentWorkflow: TourStep[] = [
  {
    selector: "#tour-calendar-create-btn",
    title: "Paso 1: Abrir Formulario",
    content: "Haz clic en 'Nueva Cita' para desplegar la barra lateral de creación.",
    position: "left",
    mode: "interactive",
    advanceOn: { event: "click", selector: "#tour-calendar-create-btn" }
  },
  {
    selector: "#tour-calendar-drawer-patient",
    title: "Paso 2: Buscar Paciente",
    content: "Escribe el nombre del paciente en el buscador y selecciónalo. Si es nuevo, puedes darlo de alta rápido desde aquí.",
    position: "left"
  },
  {
    selector: "#tour-calendar-drawer-specialist",
    title: "Paso 3: Asignar Profesional",
    content: "Selecciona al terapeuta o esteticista que realizará el tratamiento. El sistema calculará su comisión automáticamente.",
    position: "left"
  },
  {
    selector: "#tour-calendar-drawer-cabin",
    title: "Paso 4: Reservar Cabina",
    content: "Asigna la cabina o box físico. Esto asegura que la sala y aparatología láser estén disponibles sin colisiones.",
    position: "left"
  },
  {
    selector: "#tour-calendar-drawer-time",
    title: "Paso 5: Horario y Duración",
    content: "Define la fecha, hora de inicio y duración del tratamiento en minutos.",
    position: "left"
  },
  {
    selector: "#tour-calendar-drawer-submit",
    title: "Paso 6: Confirmar Agenda",
    content: "Haz clic en 'Guardar'. El sistema validará que no haya colisiones de agenda y creará la cita.",
    position: "top",
    mode: "interactive",
    advanceOn: { event: "click", selector: "#tour-calendar-drawer-submit" }
  }
];
