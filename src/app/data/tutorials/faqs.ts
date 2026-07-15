import { FAQItem } from "./types";

export const FAQ_ITEMS: FAQItem[] = [
  {
    category: "Comisiones",
    question: "¿Cómo se calculan y liquidan las comisiones de los profesionales?",
    answer: "El sistema liquida comisiones automáticamente en la sección de Caja y POS > Nóminas. Aplica la tasa configurada (ej. 10%) en el StaffProfile del profesional sobre el subtotal neto de cada cita cobrada en el POS. Al final de la quincena o mes, consolida las comisiones junto con el salario base para generar el recibo de nómina.",
  },
  {
    category: "Sobreventa de Cabinas",
    question: "¿Cómo evita el sistema las colisiones de cabinas o boxes?",
    answer: "El motor de reserva valida en tiempo real la disponibilidad de la cabina física y de los equipos tecnológicos asignados. Si intentas registrar dos tratamientos coincidentes a la misma hora en la misma cabina, el Calendario te mostrará una alerta visual roja de colisión. Puedes reordenar la agenda arrastrando la cita a otra cabina disponible.",
  },
  {
    category: "Facturación Mixta",
    question: "¿Cómo funciona el selector de Facturación Interna vs. Fiscal?",
    answer: "En el terminal POS, al habilitar 'Factura Fiscal', el sistema activa el Adaptador Fiscal correspondiente (SAT para México aplicando 16% de IVA y devolviendo un UUID; AFIP para Argentina aplicando 21% de IVA y devolviendo un CAE). Si está desactivado, emite un Comprobante Interno libre de impuestos que no se registra ante entes tributarios oficiales.",
  },
  {
    category: "Inventario",
    question: "¿Cómo funciona el descuento automático de insumos en cabina?",
    answer: "Cada servicio en el catálogo clínico se puede vincular con dosis específicas de insumos de tu almacén (geles, viales, etc.). Tan pronto como marques una cita de ese servicio como 'COMPLETADA' en el Calendario, el sistema restará las cantidades asociadas del inventario automáticamente. Cualquier pérdida o daño extra se puede ingresar manualmente en el módulo de Inventario.",
  },
  {
    category: "Modo Offline",
    question: "¿Qué pasa si se corta la conexión a internet en la clínica?",
    answer: "El sistema tiene un buffer local automático. Puedes seguir registrando pacientes, firmas de consentimiento, subiendo fotos y registrando cobros. Las peticiones se guardan localmente encriptadas y, en cuanto se restablece la conexión, el 'SyncState' se pone verde y sube los datos a la nube sin perder nada."
  },
  {
    category: "WhatsApp",
    question: "¿Cuándo se envían los recordatorios de WhatsApp?",
    answer: "El sistema encolará recordatorios automatizados de confirmación de cita (al crearse) y recordatorios preventivos con anticipación programada (habitualmente 24h antes). Si el tratamiento es retouchable, también enviará un recordatorio automático cuando venza la fecha calculada."
  },
  {
    category: "Consentimiento",
    question: "¿Tienen validez legal las firmas de consentimiento digital?",
    answer: "Sí, el lienzo captura las coordenadas vectoriales de la firma autógrafa y se asocia de forma inmutable con el ID del paciente, la fecha, hora y las contraindicaciones del tratamiento específico aceptado. Se almacena en la ficha para protección del centro."
  },
  {
    category: "Cambios de Sucursal",
    question: "¿Por qué no veo a todos los pacientes al cambiar de sucursal?",
    answer: "Para clínicas configuradas con aislamiento multi-sucursal activo, los pacientes, cobros y agendas se aíslan localmente para evitar fugas de información o sobreventas físicas. Un administrador de nivel global puede consultar todas las sucursales desde la barra lateral."
  },
  {
    category: "Mermas",
    question: "¿Qué diferencia hay entre consumo en cabina y merma?",
    answer: "El consumo en cabina se calcula automáticamente al completarse la cita y es proporcional al tratamiento. La merma es un ajuste manual por merma de stock (ej. si se rompe una ampolla o se vence un producto). Se registra manualmente en Inventario > Bitácora."
  },
  {
    category: "Nóminas",
    question: "¿Puedo modificar el sueldo o la tasa de comisión de un profesional?",
    answer: "Sí, en la sección de Caja y POS > Nóminas > pestaña Horarios o Metas, o bien desde Configuración > Profesionales. Puedes definir un salario base fijo por profesional y una tasa de comisión variable sobre tratamientos."
  }
];
