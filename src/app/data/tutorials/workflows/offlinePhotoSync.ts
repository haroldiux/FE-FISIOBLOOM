import { TourStep } from "../types";

export const offlinePhotoSyncWorkflow: TourStep[] = [
  {
    selector: "#tour-tab-galeria",
    title: "Paso 1: Muro de Evolución",
    content: "Dirígete a la pestaña de Galería de Fotos dentro de la ficha del paciente.",
    position: "bottom"
  },
  {
    selector: "#tour-patients-gallery-sync-banner",
    title: "Paso 2: Cola de Fotos Offline",
    content: "Si subiste imágenes sin conexión, aparecerá este aviso informando que se encuentran guardadas localmente en el navegador.",
    position: "bottom"
  },
  {
    selector: "#tour-patients-gallery-sync-btn",
    title: "Paso 3: Sincronizar Galería",
    content: "Haz clic en 'Sincronizar ahora'. El sistema subirá las fotos en cola al servidor y las anexará permanentemente a la ficha.",
    position: "left"
  }
];
