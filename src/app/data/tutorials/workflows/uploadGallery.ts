import { TourStep } from "../types";

export const uploadGalleryWorkflow: TourStep[] = [
  {
    selector: "#tour-patients-list",
    title: "Paso 1: Seleccionar Paciente",
    content: "Haz clic en cualquier paciente del listado de la izquierda para cargar su ficha clínica y fotos.",
    position: "right",
    mode: "interactive",
    advanceOn: { event: "click", selector: "#tour-patients-list" }
  },
  {
    selector: "#tour-tab-galeria",
    title: "Paso 2: Galería Fotográfica",
    content: "Abre la pestaña de fotos dentro de la ficha del paciente.",
    position: "bottom"
  },
  {
    selector: "#tour-gallery-file-input",
    title: "Paso 3: Cargar Archivo",
    content: "Haz clic para seleccionar la fotografía tomada con el dispositivo o cámara de la clínica.",
    position: "top"
  },
  {
    selector: "#tour-gallery-type-select",
    title: "Paso 4: Categorizar Control",
    content: "Selecciona si corresponde a un control 'Antes' (Pre-tratamiento) o 'Después' (Post-tratamiento).",
    position: "top"
  },
  {
    selector: "#tour-gallery-submit",
    title: "Paso 5: Subir Foto",
    content: "Guarda la imagen. Se organizará en el muro fotográfico con su respectiva fecha y notas.",
    position: "top"
  }
];
