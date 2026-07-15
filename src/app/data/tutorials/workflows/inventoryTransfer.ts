import { TourStep } from "../types";

export const inventoryTransferWorkflow: TourStep[] = [
  {
    selector: "#tour-inventory-transfer-btn",
    title: "Paso 1: Iniciar Transferencia",
    content: "Haz clic en 'Transferir Stock' para abrir el formulario de transferencia de materiales entre sucursales.",
    position: "bottom"
  },
  {
    selector: "#tour-transfer-origin",
    title: "Paso 2: Sucursal Origen",
    content: "Selecciona la sucursal que posee el stock actual que deseas enviar.",
    position: "bottom"
  },
  {
    selector: "#tour-transfer-destination",
    title: "Paso 3: Sucursal Destino",
    content: "Selecciona qué sucursal recibirá el stock transferido.",
    position: "bottom"
  },
  {
    selector: "#tour-transfer-product-select",
    title: "Paso 4: Seleccionar Insumos",
    content: "Busca y agrega los insumos y productos que deseas transferir.",
    position: "bottom"
  },
  {
    selector: "#tour-transfer-quantity",
    title: "Paso 5: Definir Cantidades",
    content: "Especifica las unidades a enviar. El sistema validará la disponibilidad en la sucursal de origen.",
    position: "bottom"
  },
  {
    selector: "#tour-transfer-submit",
    title: "Paso 6: Confirmar Transferencia",
    content: "Haz clic en 'Guardar'. El sistema actualizará el inventario de origen y destino de forma síncrona.",
    position: "top"
  }
];
