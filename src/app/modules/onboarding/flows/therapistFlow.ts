import type { OnboardingPhase } from './adminFlow';

export const therapistFlow: OnboardingPhase[] = [
  {
    id: 'dashboard',
    title: 'Panel de Especialista',
    icon: 'LayoutDashboard',
    screen: 'dashboard',
    steps: [
      {
        id: 'dashboard-intro',
        targetId: 'dashboard-kpis',
        title: 'Tu Agenda del Día',
        description: 'Revisá las citas programadas para hoy, cuántos pacientes atenderás y si tenés retos pendientes.',
        screen: 'dashboard',
        placement: 'bottom',
      },
      {
        id: 'dashboard-appointments',
        targetId: 'dashboard-today-appointments',
        title: 'Citas de Hoy',
        description: 'Acá ves tu itinerario detallado. Desde acá podés acceder directamente al perfil de cada paciente para atenderlo.',
        screen: 'dashboard',
        placement: 'bottom',
      },
      {
        id: 'dashboard-retouches',
        targetId: 'dashboard-chart-touchups',
        title: 'Alertas de Retoque',
        description: 'Pacientes próximos a su retoque que atendiste anteriormente. Contactalos para coordinar el seguimiento del tratamiento.',
        screen: 'dashboard',
        placement: 'bottom',
      },
    ],
  },
  {
    id: 'calendar',
    title: 'Calendario y Citas',
    icon: 'Calendar',
    screen: 'calendar',
    steps: [
      {
        id: 'calendar-cabins',
        targetId: 'tour-calendar-cabins',
        title: 'Selector de Cabinas',
        description: 'Filtrá la agenda por cabina para ver rápidamente la disponibilidad y organización de tus espacios de trabajo.',
        screen: 'calendar',
        placement: 'bottom',
      },
      {
        id: 'calendar-grid',
        targetId: 'calendar-grid',
        title: 'Tus Citas Semanales',
        description: 'Visualizá tus horarios de trabajo y citas agendadas. Podés filtrar por día, semana o mes.',
        screen: 'calendar',
        placement: 'bottom',
      },
      {
        id: 'calendar-new-appointment',
        targetId: 'calendar-new-appointment',
        title: 'Agendar Cita Rápida',
        description: 'Si un paciente solicita un turno directamente con vos, podés usar este botón para registrarlo en tu agenda.',
        screen: 'calendar',
        placement: 'left',
      },
      {
        id: 'calendar-drawer-patient',
        targetId: 'tour-calendar-drawer-patient',
        title: 'Asignar Paciente',
        description: 'Buscá al paciente por nombre, DNI o teléfono. Confirmá la fecha, hora y duración antes de guardar.',
        screen: 'calendar',
        placement: 'right',
      },
    ],
  },
  {
    id: 'patients',
    title: 'Atención al Paciente',
    icon: 'Users',
    screen: 'patients',
    steps: [
      {
        id: 'patient-search',
        targetId: 'patient-search-input',
        title: 'Buscador',
        description: 'Encontrá la ficha clínica del paciente que estás por atender. Es el primer paso antes de cualquier procedimiento.',
        screen: 'patients',
        placement: 'bottom',
      },
      {
        id: 'patient-select-mock',
        targetId: 'tour-patients-list',
        title: 'Expediente Clínico',
        description: 'Hacé clic en un paciente para abrir su expediente. Te cargaremos uno de prueba para que explores todas las pestañas.',
        screen: 'patients',
        placement: 'right',
        action: { type: 'mock-patient' }
      },
      {
        id: 'patient-historial',
        targetId: 'patient-tab-historial',
        title: 'Antecedentes del Paciente',
        description: 'Revisá alergias, medicación actual, cirugías previas y observaciones clínicas antes de iniciar el tratamiento.',
        screen: 'patients',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'historial' }
      },
      {
        id: 'patient-consent',
        targetId: 'tour-patients-consent',
        title: 'Consentimiento Informado',
        description: 'Antes de iniciar cualquier procedimiento, verificá que el paciente firme su consentimiento en este apartado. Podés hacer que firme en la tablet o computadora.',
        screen: 'patients',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'consentimiento' }
      },
      {
        id: 'patient-consent-canvas',
        targetId: 'tour-patients-consent-canvas',
        title: 'Firma Digital',
        description: 'Una vez leído el documento, el paciente firma directamente en pantalla. La firma queda registrada con fecha, hora y dispositivo.',
        screen: 'patients',
        placement: 'top',
        action: { type: 'switch-tab', tab: 'consentimiento' }
      },
      {
        id: 'patient-evolution',
        targetId: 'tour-patients-history',
        title: 'Evolución y Notas Clínicas',
        description: 'Acá verás el historial de sesiones. Hacé clic en "Registrar Sesión" para escribir tus notas, medidas y parámetros (ej. láser) usados hoy.',
        screen: 'patients',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'evolucion' }
      },
      {
        id: 'session-modal-trigger',
        targetId: 'tour-session-modal-trigger',
        title: 'Registrar Nueva Sesión',
        description: 'Hacé clic acá para abrir el modal de registro de sesión. Vas a poder cargar notas, parámetros de láser, medidas y fotos.',
        screen: 'patients',
        placement: 'top',
        action: { type: 'switch-tab', tab: 'evolucion' }
      },
      {
        id: 'patient-photos',
        targetId: 'patient-tab-galeria',
        title: 'Galería de Evolución',
        description: 'Subí fotografías del antes y después para documentar gráficamente los resultados del tratamiento. Podés usar el modo de comparación.',
        screen: 'patients',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'galeria' }
      },
      {
        id: 'gallery-upload',
        targetId: 'tour-gallery-submit',
        title: 'Subir Fotos de Sesión',
        description: 'Adjuntá las imágenes del antes/después. Podés categorizarlas por tipo (frente, perfil, zona tratada) para organizar la evolución.',
        screen: 'patients',
        placement: 'top',
        action: { type: 'switch-tab', tab: 'galeria' }
      },
    ],
  },
  {
    id: 'pos',
    title: 'Punto de Venta',
    icon: 'CreditCard',
    screen: 'pos',
    steps: [
      {
        id: 'pos-tab-pos',
        targetId: 'pos-cart-area',
        title: 'Cobro de Servicios',
        description: 'Si necesitás registrar el cobro de un servicio que realizaste, ingresá al Punto de Venta. Seleccioná al paciente y los servicios completados.',
        screen: 'pos',
        placement: 'right',
        action: { type: 'switch-tab', tab: 'pos' }
      },
      {
        id: 'pos-cart-add',
        targetId: 'tour-pos-add-service',
        title: 'Agregar Servicios Realizados',
        description: 'Buscá en el catálogo el tratamiento que acabás de realizar y sumalo al carrito para que recepción procese el cobro.',
        screen: 'pos',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'pos' }
      },
      {
        id: 'pos-cart-payment',
        targetId: 'tour-pos-payment-method',
        title: 'Método de Pago',
        description: 'Indicá cómo abonó el paciente: efectivo, tarjeta, transferencia o billetera virtual. Esto te asegura la acreditación correcta de tu comisión.',
        screen: 'pos',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'pos' }
      },
    ],
  },
  {
    id: 'consents',
    title: 'Consentimientos',
    icon: 'FileSignature',
    screen: 'consents',
    steps: [
      {
        id: 'consent-quick-sign',
        targetId: 'tour-consent-quick-sign',
        title: 'Firma Rápida',
        description: 'Cuando un paciente deba firmar un consentimiento antes del procedimiento, abrí este botón. Se desplegará el modal con todos los pasos.',
        screen: 'consents',
        placement: 'bottom',
      },
      {
        id: 'consent-patient-search',
        targetId: 'tour-consent-patient-search',
        title: 'Buscar Paciente',
        description: 'En el modal, buscá al paciente que va a firmar. Solo aparecerán pacientes con ficha clínica activa.',
        screen: 'consents',
        placement: 'right',
      },
      {
        id: 'consent-service-select',
        targetId: 'tour-consent-service-select',
        title: 'Servicio a Realizar',
        description: 'Elegí el servicio clínico al que se asocia el consentimiento. El sistema cargará la plantilla específica para ese tratamiento.',
        screen: 'consents',
        placement: 'right',
      },
      {
        id: 'consent-canvas',
        targetId: 'tour-consent-canvas',
        title: 'Capturar Firma',
        description: 'Hacé que el paciente firme en la pantalla o tablet. Verificá que la firma sea legible antes de guardar.',
        screen: 'consents',
        placement: 'top',
      },
    ],
  },
];
