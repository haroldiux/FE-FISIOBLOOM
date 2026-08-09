import { TourStep } from "../types";

export const createProductWorkflow: TourStep[] = [
  {
    selector: "#tour-inventory-add-product-btn",
    title: "Paso 1: Nuevo Producto",
    content: "Haz clic en 'Nuevo Producto' para registrar un insumo o producto de venta comercial.",
    position: "bottom",
    mode: "interactive",
    advanceOn: { event: "click", selector: "#tour-inventory-add-product-btn" }
  },
  {
    selector: "#tour-product-form-name",
    title: "Paso 2: Nombre y Detalles",
    content: "Ingresa el nombre, código SKU e indica la marca o proveedor del producto.",
    position: "top"
  },
  {
    selector: "#tour-product-form-min-stock",
    title: "Paso 3: Stock Inicial",
    content: "Indica cuántas unidades tenés disponibles ahora mismo. El sistema te avisará automáticamente cuando el stock caiga por debajo de 5 unidades.",
    position: "top"
  },
  {
    selector: "#tour-product-form-submit",
    title: "Paso 4: Guardar Producto",
    content: "Confirma el alta. El producto quedará ingresado en el catálogo de almacén de inmediato.",
    position: "top"
  }
];
