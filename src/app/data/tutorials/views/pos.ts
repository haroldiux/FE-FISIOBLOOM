import { TourStep } from "../types";

export const posTour: TourStep[] = [
  {
    selector: "#tour-pos-terminal",
    title: "Terminal de Venta (POS)",
    content: "Añade servicios y productos comerciales al carrito. Recuerda asociar el paciente usando el buscador superior del POS.",
    position: "bottom",
    targetTab: "pos"
  },
  {
    selector: "#tour-pos-add-service",
    title: "Agregar Servicios y Productos",
    content: "Elegí tratamientos o productos comerciales para sumarlos al carrito. Cada línea muestra cantidad, precio unitario y subtotal antes de impuestos.",
    position: "right",
    targetTab: "pos"
  },
  {
    selector: "#tour-pos-patient-search",
    title: "Vincular Paciente",
    content: "Buscá y vinculá al paciente que recibe el tratamiento. El vínculo es necesario para llevar el historial clínico y calcular comisiones.",
    position: "bottom",
    targetTab: "pos"
  },
  {
    selector: "#tour-pos-coupons",
    title: "Cupones y Descuentos",
    content: "Aplicá cupones promocionales de campañas activas, agregá descuentos manuales y elegí si es un comprobante de control interno o una factura fiscal.",
    position: "left",
    targetTab: "pos"
  },
  {
    selector: "#tour-pos-payment-method",
    title: "Método de Pago",
    content: "Elegí cómo paga el cliente: EFECTIVO, TARJETA, TRANSFERENCIA o BILLETERA VIRTUAL. Agregá un número de referencia cuando corresponda.",
    position: "top",
    targetTab: "pos"
  },
  {
    selector: "#tour-pos-submit-sale",
    title: "Generar Comprobante",
    content: "Confirmá la venta para generar el comprobante. La operación queda registrada en la caja activa y genera la comisión del profesional responsable.",
    position: "top",
    targetTab: "pos"
  },
  {
    selector: "#tour-pos-cash",
    title: "Caja Diaria",
    content: "Abrí la caja con el saldo inicial del día. Registrá egresos rápidos por gastos menores y hacé el arqueo de cierre al final de la jornada.",
    position: "top",
    targetTab: "caja"
  },
  {
    selector: "#tour-cash-initial-balance",
    title: "Abrir Caja",
    content: "Definí el saldo inicial del día. El sistema registra cada ingreso y egreso para que el efectivo esperado coincida con el conteo al cerrar.",
    position: "bottom",
    targetTab: "caja"
  },
  {
    selector: "#tour-cash-expense-btn",
    title: "Registrar Egresos",
    content: "Anotá salidas de efectivo con descripción, monto y comprobante opcional. Todos los movimientos quedan en el historial de la caja.",
    position: "left",
    targetTab: "caja"
  },
  {
    selector: "#tour-cash-close-btn",
    title: "Cerrar con Arqueo",
    content: "Contá el efectivo físico, ingresá el total contado y cerrá la caja. Si hay una diferencia con el saldo esperado, queda marcada para revisar.",
    position: "left",
    targetTab: "caja"
  },
  {
    selector: "#tour-pos-schedules",
    title: "Horarios de Staff",
    content: "Elegí un profesional, marcá los días que trabaja y definí la hora de entrada y salida de cada turno. Guardá para publicar su disponibilidad semanal.",
    position: "bottom",
    targetTab: "schedules"
  },
  {
    selector: "#tour-pos-performance",
    title: "Desempeño y Metas",
    content: "Revisá las comisiones del staff, recalculá lo devengado y definí metas de venta mensuales junto con la tasa de comisión por categoría de servicio.",
    position: "top",
    targetTab: "performance"
  },
  {
    selector: "#tour-pos-payroll",
    title: "Nóminas y Liquidación",
    content: "Generá una liquidación que combina el salario base más las comisiones ganadas, menos descuentos y más bonos. Confirmá el pago para cerrar el período.",
    position: "top",
    targetTab: "payroll"
  },
  {
    selector: "#tour-pos-promotions",
    title: "Promociones y Cupones",
    content: "Creá campañas con nombre, servicio objetivo, porcentaje de descuento y fechas de vigencia. Emití cupones con código, tipo, vencimiento, stock de usos y compra mínima.",
    position: "top",
    targetTab: "promotions"
  },
  {
    selector: "#tour-pos-attendance",
    title: "Control de Asistencia",
    content: "Consultá el historial de asistencia: los fichajes de entrada y salida de cada miembro del staff en el período seleccionado.",
    position: "top",
    targetTab: "attendance"
  }
];
