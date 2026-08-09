import { TourStep } from "../types";

export const inventoryTour: TourStep[] = [
  {
    selector: "#tour-inventory-stock-tab",
    title: "Catálogo de Stock vs. Historial",
    content: "Esta pantalla tiene dos vistas: 'Catálogo de Stock' muestra las existencias actuales de cada producto, y 'Historial de Movimientos' muestra el registro de todo lo que entró o salió del almacén.",
    position: "bottom",
    targetTab: "STOCK"
  },
  {
    selector: "#tour-inventory-valuation",
    title: "Valorización Financiera del Almacén",
    content: "Cuatro indicadores clave: cuánto invertiste en el stock actual (Costo), cuánto ganarías si lo vendieras todo (PVP), la valorización total del catálogo, y las pérdidas acumuladas por mermas o productos vencidos.",
    position: "bottom"
  },
  {
    selector: "#tour-inventory-catalog",
    title: "Catálogo de Materiales y Productos",
    content: "Controla las existencias en tiempo real de insumos (geles, viales) y productos para reventa. Los productos con menos de 5 unidades aparecen marcados como stock bajo con una alerta arriba de esta lista. Usá el buscador y las categorías para filtrar rápido.",
    position: "top"
  },
  {
    selector: "#tour-inventory-add-product-btn",
    title: "Registrar un Nuevo Producto",
    content: "Solo visible para Administradores. Tocá acá para dar de alta un insumo o producto de reventa: nombre, categoría, unidad de medida, precio de venta, costo interno y stock inicial.",
    position: "bottom"
  },
  {
    selector: "#tour-inventory-movements-tab",
    title: "Ver el Historial de Movimientos",
    content: "Tocá esta pestaña para ver todas las entradas, salidas, ajustes y consumos automáticos por citas completadas, ordenados cronológicamente.",
    position: "bottom",
    targetTab: "MOVEMENTS"
  },
  {
    selector: "#tour-inventory-wastes",
    title: "Bitácora de Consumos y Mermas",
    content: "Cada fila es un movimiento: entradas por compras a proveedores, mermas manuales por daño, rotura o caducidad, y descuentos automáticos de stock cuando se completa una sesión que consume ese insumo. Usá los filtros de arriba (Entradas, Ajustes, Consumo por Cita) para encontrar un movimiento puntual.",
    position: "top",
    targetTab: "MOVEMENTS"
  }
];
