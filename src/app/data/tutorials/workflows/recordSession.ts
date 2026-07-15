import { TourStep } from "../types";

export const recordSessionWorkflow: TourStep[] = [
  {
    selector: "#tour-patients-list",
    title: "Paso 1: Buscar Paciente",
    content: "Haz clic en cualquier paciente del listado de la izquierda para cargar su ficha clínica.",
    position: "right",
    mode: "interactive",
    advanceOn: { event: "click", selector: "#tour-patients-list" }
  },
  {
    selector: "#tour-tab-evolucion",
    title: "Paso 2: Ir a Evolución",
    content: "Haz clic en la pestaña de Evolución Clínica para ver el historial de sesiones.",
    position: "bottom"
  },
  {
    selector: "#tour-session-modal-trigger",
    title: "Paso 3: Abrir Registro",
    content: "Haz clic en 'Registrar Sesión' para abrir la hoja evolutiva del día.",
    position: "bottom"
  },
  {
    selector: "#tour-session-modal-notes",
    title: "Paso 4: Notas Clínicas",
    content: "Describe el progreso del paciente, la tolerancia al tratamiento y cualquier observación técnica.",
    position: "top"
  },
  {
    selector: "#tour-session-modal-measurements",
    title: "Paso 5: Medidas y Peso",
    content: "Si es un tratamiento reductor, introduce peso (kg), perímetro de cintura y cadera.",
    position: "top"
  },
  {
    selector: "#tour-session-modal-laser",
    title: "Paso 6: Parámetros Láser",
    content: "En caso de depilación láser, anota los Joules de energía (fluencia), spot y total de disparos.",
    position: "top"
  },
  {
    selector: "#tour-session-modal-submit",
    title: "Paso 7: Confirmar Sesión",
    content: "Guarda el registro. Se añadirá cronológicamente a la ficha y restará una sesión de su bono.",
    position: "top"
  }
];
