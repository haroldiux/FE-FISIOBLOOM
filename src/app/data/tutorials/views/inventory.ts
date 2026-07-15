import { TourStep } from "../types";

export const inventoryTour: TourStep[] = [
  {
    selector: "#tour-inventory-catalog",
    title: "Catálogo de Materiales y Productos",
    content: "Controla las existencias en tiempo real de insumos (geles, viales) y productos para reventa. Los círculos rojos indican stock bajo.",
    position: "top"
  },
  {
    selector: "#tour-inventory-wastes",
    title: "Bitácora de Consumos y Mermas",
    content: "Registra entradas por compras a proveedores o mermas manuales debidas a daños, roturas o caducidad del material.",
    position: "top"
  }
];
