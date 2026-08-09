import { TourStep } from "../types";

export const manualSyncOfflineWorkflow: TourStep[] = [
  {
    selector: "#tour-topbar-sync",
    title: "Indicador de Sincronización",
    content: "Este ícono muestra el estado de tu conexión: verde significa que todo está sincronizado con la nube, amarillo que estás trabajando sin conexión (tus cambios se guardan en el dispositivo), y girando indica que se está sincronizando en este momento. No hace falta ninguna acción manual: apenas vuelve la conexión, todo lo pendiente se sube solo.",
    position: "bottom"
  }
];
