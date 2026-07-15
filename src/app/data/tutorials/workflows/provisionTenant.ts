import { TourStep } from "../types";

export const provisionTenantWorkflow: TourStep[] = [
  {
    selector: "#tour-saas-tenant-list",
    title: "Paso 1: Lista de Inquilinos",
    content: "Accede al listado de inquilinos en el panel de control de SuperAdmin.",
    position: "bottom"
  },
  {
    selector: "#tour-saas-create-tenant-btn",
    title: "Paso 2: Registrar Nuevo Centro",
    content: "Haz clic en 'Provisionar Nueva Clínica' para desplegar un entorno aislado.",
    position: "bottom"
  },
  {
    selector: "#tour-tenant-form-slug",
    title: "Paso 3: Slug Único y Datos",
    content: "Ingresa el slug (URL de acceso) y el nombre legal del nuevo centro clínico.",
    position: "bottom"
  },
  {
    selector: "#tour-tenant-form-plan",
    title: "Paso 4: Configurar Suscripción",
    content: "Selecciona el plan mensual contratado (Básico o Premium) para habilitar módulos.",
    position: "bottom"
  },
  {
    selector: "#tour-tenant-form-submit",
    title: "Paso 5: Inicializar Base de Datos",
    content: "Presiona para activar e inicializar de forma aislada la base de datos de la nueva clínica.",
    position: "top"
  }
];
