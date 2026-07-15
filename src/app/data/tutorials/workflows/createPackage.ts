import { TourStep } from "../types";

export const createPackageWorkflow: TourStep[] = [
  {
    selector: "#tour-services-tab-packages",
    title: "Paso 1: Pestaña de Bonos/Paquetes",
    content: "Selecciona la pestaña de Paquetes dentro del catálogo de Servicios.",
    position: "bottom"
  },
  {
    selector: "#tour-packages-create-btn",
    title: "Paso 2: Crear Paquete",
    content: "Presiona este botón para iniciar la creación de un nuevo bono multisesión.",
    position: "bottom"
  },
  {
    selector: "#tour-package-form-name",
    title: "Paso 3: Nombre y Precio",
    content: "Define el nombre del paquete, la descripción comercial y el precio total con descuento.",
    position: "top"
  },
  {
    selector: "#tour-package-form-services",
    title: "Paso 4: Vincular Tratamientos",
    content: "Busca y añade los servicios y la cantidad de sesiones incluidas (ej. 10 sesiones de depilación láser).",
    position: "top"
  },
  {
    selector: "#tour-package-form-submit",
    title: "Paso 5: Guardar Bono",
    content: "Presiona 'Guardar'. El bono estará listo para ser vendido a los pacientes desde el POS.",
    position: "top"
  }
];
