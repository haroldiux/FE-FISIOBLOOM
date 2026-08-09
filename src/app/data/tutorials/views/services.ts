import { TourStep } from "../types";

export const servicesTour: TourStep[] = [
  {
    selector: "#tour-services-tabs",
    title: "Servicios vs. Paquetes",
    content: "Esta pantalla tiene dos catálogos: 'Catálogo de Servicios' son los tratamientos individuales (con su precio y duración), y 'Paquetes' son bonos de varias sesiones combinadas con descuento.",
    position: "bottom",
    targetTab: "SERVICES"
  },
  {
    selector: "#tour-services-supplies",
    title: "Catálogo de Servicios Clínicos",
    content: "Define precios, tiempos de cabina y vincula los materiales consumidos automáticamente por sesión para descontarlos de stock. Usá el buscador y los filtros de categoría de arriba para encontrar un tratamiento puntual.",
    position: "top",
    targetTab: "SERVICES"
  },
  {
    selector: "#tour-catalog-create-btn",
    title: "Crear un Nuevo Servicio",
    content: "Tocá acá para dar de alta un tratamiento: nombre, categoría clínica, duración de cabina, precio al público y qué insumos de almacén se descuentan automáticamente por cada sesión completada.",
    position: "bottom",
    targetTab: "SERVICES"
  },
  {
    selector: "#tour-services-tab-packages",
    title: "Ver los Paquetes Multisesión",
    content: "Tocá esta pestaña para ver los bonos ya armados, cada uno con sus tratamientos incluidos, sesiones totales y precio combo.",
    position: "bottom",
    targetTab: "PACKAGES"
  },
  {
    selector: "#tour-services-packages",
    title: "Paquetes Multisesión (Bonos)",
    content: "Cada tarjeta es un bono (ej. 10 Cavitaciones) con su precio de descuento frente al precio de lista. Cuando un paciente compra uno desde su ficha, el sistema va restando sesiones automáticamente cada vez que se registra una.",
    position: "top",
    targetTab: "PACKAGES"
  },
  {
    selector: "#tour-catalog-create-btn",
    title: "Crear un Nuevo Paquete",
    content: "Con la pestaña Paquetes activa, el mismo botón sirve para armar un bono nuevo: nombre, descripción, vigencia en días, precio combo y los servicios con su cantidad de sesiones incluidas.",
    position: "bottom",
    targetTab: "PACKAGES"
  }
];
