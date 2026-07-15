import { TourStep } from "../types";

export const patientsTour: TourStep[] = [
  {
    selector: "#tour-patients-list",
    title: "Listado de Pacientes",
    content: "Busca y selecciona un paciente de la lista para cargar su ficha técnica completa en el panel derecho.",
    position: "right"
  },
  {
    selector: "#tour-patients-register-btn",
    title: "Crear Nueva Ficha",
    content: "Haz clic aquí para dar de alta un nuevo expediente clínico en la base de datos de la clínica.",
    position: "bottom"
  },
  {
    selector: "#tour-tab-historial",
    title: "Antecedentes Médicos",
    content: "Ficha clínica inicial donde registras alergias, patologías previas, contraindicaciones y anamnesis del paciente.",
    position: "bottom"
  },
  {
    selector: "#tour-tab-evolucion",
    title: "Bitácora de Evolución",
    content: "Registra el avance sesión por sesión. Permite anotar observaciones clínicas, peso, perímetros corporales y parámetros láser.",
    position: "bottom"
  },
  {
    selector: "#tour-tab-consentimiento",
    title: "Consentimientos Firmados",
    content: "Visualiza los contratos legales firmados por el paciente para tratamientos específicos o captura una nueva firma en la tableta.",
    position: "bottom"
  },
  {
    selector: "#tour-tab-galeria",
    title: "Galería de Fotos",
    content: "Sube y organiza fotos del paciente en categorías de 'Antes' (Control Inicial) y 'Después' (Evolución) para evaluar resultados.",
    position: "bottom"
  },
  {
    selector: "#tour-tab-facturacion",
    title: "Historial Financiero",
    content: "Consulta las facturas pagadas por el paciente y el balance de sus bonos multisesión contratados.",
    position: "bottom"
  }
];
