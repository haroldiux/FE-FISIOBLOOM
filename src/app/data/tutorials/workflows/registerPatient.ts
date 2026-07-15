import { TourStep } from "../types";

export const registerPatientWorkflow: TourStep[] = [
  {
    selector: "#tour-patients-register-btn",
    title: "Paso 1: Alta de Paciente",
    content: "Presiona 'Nuevo Paciente' para abrir la ficha de alta.",
    position: "bottom"
  },
  {
    selector: "#tour-patient-form-name",
    title: "Paso 2: Datos Personales",
    content: "Escribe el nombre completo, teléfono móvil de WhatsApp y dirección de email.",
    position: "top"
  },
  {
    selector: "#tour-patient-form-history",
    title: "Paso 3: Anamnesis Inicial",
    content: "Registra patologías previas, cirugías, alergias o si se encuentra en periodo de gestación.",
    position: "top"
  },
  {
    selector: "#tour-patient-form-submit",
    title: "Paso 4: Guardar Ficha",
    content: "Confirma el alta. El paciente aparecerá en el CRM de inmediato listo para agendar citas.",
    position: "top"
  }
];
