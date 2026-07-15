import { TourStep } from "../types";

export const signConsentWorkflow: TourStep[] = [
  {
    selector: "#tour-sidebar-consents",
    title: "Paso 1: Módulo de Firmas",
    content: "Haz clic en el menú 'Firmas' del panel lateral para abrir la vista dedicada.",
    position: "right",
    mode: "interactive",
    advanceOn: { event: "click", selector: "#tour-sidebar-consents" }
  },
  {
    selector: "#tour-consent-quick-sign",
    title: "Paso 2: Registrar Nueva Firma",
    content: "Haz clic en el botón 'Firma Rápida' para abrir el canvas táctil de consentimientos.",
    position: "bottom",
    mode: "interactive",
    advanceOn: { event: "click", selector: "#tour-consent-quick-sign" }
  },
  {
    selector: "#tour-consent-patient-search",
    title: "Paso 3: Buscar Paciente",
    content: "Escribe el nombre del paciente a firmar y selecciónalo de los resultados.",
    position: "bottom"
  },
  {
    selector: "#tour-consent-service-select",
    title: "Paso 4: Elegir Tratamiento",
    content: "Selecciona el tratamiento clínico correspondiente (o Consentimiento General de la clínica).",
    position: "bottom"
  },
  {
    selector: "#tour-consent-canvas",
    title: "Paso 5: Canvas de Firma",
    content: "Pídele al paciente que estampe su firma manuscrita digitalizada usando el mouse o pantalla táctil.",
    position: "top"
  },
  {
    selector: "#tour-consent-submit",
    title: "Paso 6: Archivar Contrato",
    content: "Haz clic en 'Archivar Firma' para guardar legalmente el consentimiento en su ficha.",
    position: "top"
  }
];
