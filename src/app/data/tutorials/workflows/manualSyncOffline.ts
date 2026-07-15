import { TourStep } from "../types";

export const manualSyncOfflineWorkflow: TourStep[] = [
  {
    selector: "#tour-topbar-sync",
    title: "Paso 1: Estado de Sincronización",
    content: "Haz clic en el indicador de red en la parte superior derecha de la pantalla.",
    position: "bottom"
  },
  {
    selector: "#tour-sync-status",
    title: "Paso 2: Cola de Acciones locales",
    content: "Visualiza la cantidad de registros locales (citas, fotos, ventas) pendientes por subir.",
    position: "bottom"
  },
  {
    selector: "#tour-sync-force-btn",
    title: "Paso 3: Forzar Carga Directa",
    content: "Haz clic en 'Sincronizar Ahora' para enviar de forma prioritaria los datos a la nube.",
    position: "bottom"
  }
];
