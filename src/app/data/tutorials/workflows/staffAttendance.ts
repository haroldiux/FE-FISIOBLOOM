import { TourStep } from "../types";

export const staffAttendanceWorkflow: TourStep[] = [
  {
    selector: "#tour-topbar-attendance",
    title: "Paso 1: Fichar Entrada o Salida",
    content: "Este botón está siempre visible en la barra superior. Un solo clic registra el inicio de tu turno; volvé a hacer clic al terminar para fichar la salida.",
    position: "bottom",
    mode: "interactive",
    advanceOn: { event: "click", selector: "#tour-topbar-attendance" }
  },
  {
    selector: "#tour-finance-attendance-tab",
    title: "Paso 2: Historial de Asistencia (Administradores)",
    content: "Si sos Administrador, podés revisar las entradas y salidas de todo el personal desde Finanzas → Asistencia, filtrando por día, semana, mes o rol.",
    position: "bottom",
    targetScreen: "pos",
    targetTab: "attendance"
  }
];
