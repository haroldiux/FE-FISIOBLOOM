import { TourStep } from "../types";

export const staffAttendanceWorkflow: TourStep[] = [
  {
    selector: "#tour-finance-schedules-tab",
    title: "Paso 1: Control de Asistencia",
    content: "Navega a la pestaña de Horarios de Personal en el módulo operativo.",
    position: "bottom"
  },
  {
    selector: "#tour-attendance-clock-btn",
    title: "Paso 2: Registrar Marca",
    content: "Haz clic para marcar el inicio o fin de tu jornada laboral.",
    position: "bottom"
  },
  {
    selector: "#tour-attendance-pin",
    title: "Paso 3: PIN de Identidad",
    content: "Ingresa tu PIN de empleado de 4 dígitos para verificar la marca.",
    position: "bottom"
  },
  {
    selector: "#tour-attendance-submit",
    title: "Paso 4: Confirmar Registro",
    content: "Haz clic para guardar tu registro de asistencia. El sistema registrará la fecha y hora exacta.",
    position: "top"
  }
];
