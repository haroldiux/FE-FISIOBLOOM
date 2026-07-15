import { TourStep } from "../types";

export const createProductWorkflow: TourStep[] = [
  {
    selector: "#tour-inventory-add-product-btn",
    title: "Paso 1: Nuevo Producto",
    content: "Haz clic en 'Nuevo Producto' para registrar un insumo o producto de venta comercial.",
    position: "bottom"
  },
  {
    selector: "#tour-product-form-name",
    title: "Paso 2: Nombre y Detalles",
    content: "Ingresa el nombre, código SKU e indica la marca o proveedor del producto.",
    position: "top"
  },
  {
    selector: "#tour-product-form-min-stock",
    title: "Paso 3: Umbral de Stock Mínimo",
    content: "Establece el nivel mínimo de stock para activar alertas visuales cuando el insumo esté próximo a agotarse.",
    position: "top"
  },
  {
    selector: "#tour-product-form-submit",
    title: "Paso 4: Guardar Producto",
    content: "Confirma el alta. El producto quedará ingresado en el catálogo de almacén de inmediato.",
    position: "top"
  }
];
