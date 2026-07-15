import { TourStep } from "../types";

export const helpcenterTourWorkflow: TourStep[] = [
  {
    selector: "#tour-topbar-helpcenter",
    title: "Paso 1: Registrar Asistencia", // Matching selector's step description title
    content: "Haz clic en el botón de interrogación en la barra superior derecha para abrir el panel modal.",
    position: "bottom"
  },
  {
    selector: "#tour-helpcenter-guides-tab",
    title: "Paso 2: Navegar Ayuda",
    content: "Intercambia entre las pestañas de Guías de Vista, Flujos CRUD, Manual de Roles y FAQs.",
    position: "bottom"
  },
  {
    selector: "#tour-helpcenter-search-input",
    title: "Paso 3: Buscador Contextual",
    content: "Escribe tu duda o palabra clave para filtrar artículos y FAQs en tiempo real.",
    position: "bottom"
  },
  {
    selector: "#tour-helpcenter-launch-btn",
    title: "Paso 4: Lanzar Tutorial",
    content: "Selecciona cualquier flujo o guía recomendada y presiona 'Iniciar' para ver el spotlight dinámico.",
    position: "bottom"
  }
];
