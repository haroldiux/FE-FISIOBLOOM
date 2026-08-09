import { TourStep } from "../types";

export const patientsTour: TourStep[] = [
  {
    selector: "#tour-patients-list",
    title: "Listado de Pacientes",
    content: "Busca y selecciona un paciente de la lista para cargar su ficha técnica completa en el panel derecho. Este recorrido te muestra cómo dar de alta uno nuevo desde cero y después explora su ficha completa.",
    position: "right"
  },
  {
    selector: "#tour-patients-register-btn",
    title: "Crear Nueva Ficha",
    content: "Tocá 'Nuevo Paciente' para dar de alta un expediente clínico nuevo en la base de datos de la clínica.",
    position: "bottom",
    mode: "interactive",
    advanceOn: { event: "click", selector: "#tour-patients-register-btn" }
  },
  {
    selector: "#tour-patient-form-name",
    title: "Datos de Contacto",
    content: "Nombre completo y teléfono son obligatorios. El teléfono debe tener exactamente 8 dígitos (sin código de país). El email es opcional, pero si lo cargás tiene que terminar en @gmail.com.",
    position: "top"
  },
  {
    selector: "#tour-patient-form-history",
    title: "Anamnesis Inicial",
    content: "Registrá acá alergias, cirugías previas, patologías o contraindicaciones que el profesional deba conocer antes de atenderlo. Este campo queda guardado como antecedente inicial y podés seguir ampliándolo después desde la pestaña 'Historial Clínico'.",
    position: "top"
  },
  {
    selector: "#tour-patient-form-submit",
    title: "Guardar la Ficha",
    content: "Si el paciente va a firmar el consentimiento general ahora mismo, activá la casilla de firma antes de guardar para hacerlo en el mismo paso. Al confirmar, la ficha se crea y se abre automáticamente para que sigas explorándola.",
    position: "top",
    mode: "interactive",
    advanceOn: { event: "click", selector: "#tour-patient-form-submit" }
  },
  {
    selector: "#tour-tab-historial",
    title: "Antecedentes Médicos",
    content: "Ficha clínica inicial donde registras alergias, patologías previas, contraindicaciones y anamnesis del paciente.",
    position: "bottom",
    targetTab: "historial"
  },
  {
    selector: "#tour-tab-evolucion",
    title: "Bitácora de Evolución",
    content: "Registra el avance sesión por sesión. Permite anotar observaciones clínicas, peso, perímetros corporales y parámetros láser.",
    position: "bottom",
    targetTab: "evolucion"
  },
  {
    selector: "#tour-tab-consentimiento",
    title: "Consentimientos Firmados",
    content: "Visualiza los contratos legales firmados por el paciente para tratamientos específicos o captura una nueva firma en la tableta.",
    position: "bottom",
    targetTab: "consentimiento"
  },
  {
    selector: "#tour-tab-galeria",
    title: "Galería de Fotos",
    content: "Sube y organiza fotos del paciente en categorías de 'Antes' (Control Inicial) y 'Después' (Evolución) para evaluar resultados.",
    position: "bottom",
    targetTab: "galeria"
  },
  {
    selector: "#tour-tab-facturacion",
    title: "Historial Financiero",
    content: "Consulta las facturas pagadas por el paciente y el balance de sus bonos multisesión contratados.",
    position: "bottom",
    targetTab: "facturacion"
  }
];
