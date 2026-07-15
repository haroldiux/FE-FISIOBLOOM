import { TourStep } from "../types";

export const saasTour: TourStep[] = [
  {
    selector: "#tour-saas-tenant-list",
    title: "Consola Multitenant",
    content: "Como Super Administrador global, aquí controlas todos los inquilinos (clínicas) registrados en el software SaaS.",
    position: "bottom"
  },
  {
    selector: "#tour-saas-create-tenant-btn",
    title: "Alta de Nuevo Centro",
    content: "Registra una nueva clínica en la plataforma. Define su base de datos aislada, su slug único de acceso y el plan contratado.",
    position: "bottom"
  },
  {
    selector: "#tour-saas-stats",
    title: "Métricas Globales SaaS",
    content: "Supervisa la cantidad de clínicas activas, total de citas procesadas en la plataforma y volumen de ingresos consolidados.",
    position: "top"
  }
];
