import { TourStep } from "../types";

export const configTour: TourStep[] = [
  {
    selector: "#tour-config-tabs",
    title: "Pestañas de Ajustes",
    content: "Navega entre la gestión de Profesionales, Datos de la Clínica, Sucursales y el Canal de notificaciones por WhatsApp.",
    position: "bottom"
  },
  {
    selector: "#tour-config-professionals-list",
    title: "Personal y Horarios",
    content: "Registra terapeutas, esteticistas y recepcionistas. Define sus perfiles, sueldos base, tasas de comisión y horarios de trabajo por día.",
    position: "top"
  },
  {
    selector: '[data-tour="staff-contract-type"]',
    title: "Esquema de Contrato y Salarios",
    content: "Configura el tipo de contrato del profesional (Sueldo Fijo, Comisión o Híbrido), junto con el salario base y comisión correspondientes de cada profesional.",
    position: "top"
  },
  {
    selector: "#tour-config-clinic-form",
    title: "Configuración de la Sucursal",
    content: "Establece el nombre comercial, dirección, datos fiscales y activa o desactiva módulos avanzados como el inventario.",
    position: "top"
  },
  {
    selector: "#tour-config-whatsapp-form",
    title: "Integración de WhatsApp",
    content: "Conecta tu API de WhatsApp para enviar confirmaciones de citas automáticas, recordatorios 24 horas antes y alertas de retoque.",
    position: "top"
  }
];
