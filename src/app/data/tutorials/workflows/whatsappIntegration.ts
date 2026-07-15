import { TourStep } from "../types";

export const whatsappIntegrationWorkflow: TourStep[] = [
  {
    selector: "#tour-config-tabs",
    title: "Paso 1: Pestañas de Ajustes",
    content: "Abre el menú de configuración y selecciona la pestaña de WhatsApp.",
    position: "bottom"
  },
  {
    selector: "#tour-config-whatsapp-form",
    title: "Paso 2: Credenciales de WhatsApp",
    content: "Escribe tu API Token y número emisor de Meta. Esto habilitará el daemon de recordatorios y confirmación automática.",
    position: "top"
  },
  {
    selector: "#tour-config-whatsapp-form button[type='submit']",
    title: "Paso 3: Guardar y Activar Webhook",
    content: "Presiona 'Guardar' para conectar el webhook. Si el paciente responde '1' (Confirmar) o '2' (Cancelar), la cita se actualizará automáticamente en tu agenda.",
    position: "top"
  }
];
