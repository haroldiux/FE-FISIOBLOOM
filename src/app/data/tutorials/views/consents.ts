import { TourStep } from "../types";

export const consentTour: TourStep[] = [
  {
    selector: "#tour-consent-stats",
    title: "Resumen de Firmas",
    content: "Total de documentos firmados y cuántos pacientes firmaron hoy. Usa este panel para ver de un vistazo el cumplimiento de la clínica.",
    position: "bottom"
  },
  {
    selector: "#tour-consent-search",
    title: "Buscar Consentimientos",
    content: "Filtra la lista por nombre del paciente o por el tratamiento asociado al documento firmado.",
    position: "bottom"
  },
  {
    selector: "#tour-consent-quick-sign",
    title: "Firma Rápida",
    content: "Tocá este botón para abrir el modal de firma y registrar un nuevo consentimiento informado al instante.",
    position: "bottom",
    advanceOn: { selector: "#tour-consent-quick-sign", event: "click" }
  },
  {
    selector: "#tour-consent-patient-search",
    title: "Elegir Paciente",
    content: "Buscá y seleccioná el paciente que va a firmar. Solo se pueden vincular pacientes que ya tengan una ficha clínica creada.",
    position: "right"
  },
  {
    selector: "#tour-consent-service-select",
    title: "Tratamiento o Documento Legal",
    content: "Elegí a qué cubre este consentimiento: el general para la ficha de ingreso, o el de depilación láser para tratamientos con láser.",
    position: "right"
  },
  {
    selector: "#tour-consent-canvas",
    title: "Firma en Pantalla",
    content: "Leé el texto del consentimiento y firmá en el lienzo con el dedo, un lápiz óptico o el mouse. Usá 'Limpiar Lienzo' para volver a empezar si hace falta.",
    position: "top"
  },
  {
    selector: "#tour-consent-method-file",
    title: "Alternativa: Subir Escaneado",
    content: "Si el paciente ya firmó en papel, tocá 'Subir Escaneado' para cargar una foto o PDF del documento en vez de firmar en pantalla.",
    position: "left"
  },
  {
    selector: "#tour-consent-submit",
    title: "Guardar Consentimiento",
    content: "Confirmá los datos y guardá el documento firmado. Queda archivado en la ficha del paciente, marcado como consentimiento vigente.",
    position: "top"
  }
];
