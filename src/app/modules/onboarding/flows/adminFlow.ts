export interface OnboardingStep {
  id: string;
  targetId: string; // matches data-onboarding="..." attribute
  title: string;
  description: string;
  screen: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  action?: any; // optional action to dispatch when step becomes active
}

export interface OnboardingPhase {
  id: string;
  title: string;
  icon: string;
  screen: string;
  steps: OnboardingStep[];
}

export const adminFlow: OnboardingPhase[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: '📊',
    screen: 'dashboard',
    steps: [
      {
        id: 'dashboard-kpis',
        targetId: 'dashboard-kpis',
        title: 'KPIs del Día',
        description: 'Acá encontrás un resumen en tiempo real: citas agendadas, facturación neta, pacientes activos y alertas de stock.',
        screen: 'dashboard',
        placement: 'bottom',
      },
      {
        id: 'dashboard-chart-revenue',
        targetId: 'dashboard-chart-revenue',
        title: 'Gráfico de Ingresos',
        description: 'Visualizá la evolución de ingresos del mes comparada con el objetivo. Te permite identificar picos y caídas en la facturación.',
        screen: 'dashboard',
        placement: 'bottom',
      },
      {
        id: 'dashboard-chart-touchups',
        targetId: 'dashboard-chart-touchups',
        title: 'Alertas de Retoques',
        description: 'Listado de pacientes que están próximos a su retoque obligatorio según el tratamiento. Hacé clic para contactarlos y agendar.',
        screen: 'dashboard',
        placement: 'bottom',
      },
      {
        id: 'dashboard-appointments',
        targetId: 'dashboard-today-appointments',
        title: 'Citas de Hoy',
        description: 'Listado de todas las citas del día con su estado. Hacé clic en una para ver los detalles o reprogramarla.',
        screen: 'dashboard',
        placement: 'bottom',
      },
    ],
  },
  {
    id: 'calendar',
    title: 'Calendario',
    icon: '📅',
    screen: 'calendar',
    steps: [
      {
        id: 'calendar-cabins',
        targetId: 'tour-calendar-cabins',
        title: 'Selector de Cabinas',
        description: 'Filtrá la vista por cabina o sala. Útil cuando la clínica tiene varias salas de atención y necesitás ver la disponibilidad de cada una.',
        screen: 'calendar',
        placement: 'bottom',
      },
      {
        id: 'calendar-grid',
        targetId: 'calendar-grid',
        title: 'Vista del Calendario',
        description: 'La cuadrícula muestra los bloques horarios por profesional y cabina. Podés hacer clic en un espacio vacío para crear una cita rápida, o arrastrar para mover una existente.',
        screen: 'calendar',
        placement: 'bottom',
      },
      {
        id: 'calendar-new-appointment',
        targetId: 'calendar-new-appointment',
        title: '+ Nueva Cita',
        description: 'Presioná este botón para abrir el panel de creación de cita con paciente, servicio, profesional, cabina y horario.',
        screen: 'calendar',
        placement: 'left',
      },
      {
        id: 'calendar-drawer-patient',
        targetId: 'tour-calendar-drawer-patient',
        title: 'Seleccionar Paciente',
        description: 'Buscá al paciente por nombre, teléfono o DNI. Si aún no existe, podés crearlo desde acá mismo.',
        screen: 'calendar',
        placement: 'right',
      },
      {
        id: 'calendar-drawer-specialist',
        targetId: 'tour-calendar-drawer-specialist',
        title: 'Asignar Profesional',
        description: 'Elegí el profesional que realizará el tratamiento. El sistema mostrará su disponibilidad real en el bloque horario.',
        screen: 'calendar',
        placement: 'right',
      },
      {
        id: 'calendar-drawer-cabin',
        targetId: 'tour-calendar-drawer-cabin',
        title: 'Asignar Cabina',
        description: 'Seleccioná la sala o cabina donde se atenderá al paciente. Esto ayuda a evitar superposiciones de equipos y espacios.',
        screen: 'calendar',
        placement: 'right',
      },
      {
        id: 'calendar-drawer-time',
        targetId: 'tour-calendar-drawer-time',
        title: 'Fecha y Hora',
        description: 'Confirmá la fecha, hora de inicio y duración estimada. El sistema validará que no haya choques con otras citas.',
        screen: 'calendar',
        placement: 'right',
      },
      {
        id: 'calendar-drawer-submit',
        targetId: 'tour-calendar-drawer-submit',
        title: 'Confirmar Cita',
        description: 'Una vez completados todos los campos, presioná este botón para guardar la cita. Se enviará un recordatorio automático al paciente si WhatsApp está activo.',
        screen: 'calendar',
        placement: 'top',
      },
    ],
  },
  {
    id: 'patients',
    title: 'Pacientes (CRM)',
    icon: '👥',
    screen: 'patients',
    steps: [
      {
        id: 'patient-search',
        targetId: 'patient-search-input',
        title: 'Búsqueda de Pacientes',
        description: 'Filtrá por nombre, teléfono, DNI o email para encontrar rápidamente a cualquier paciente registrado.',
        screen: 'patients',
        placement: 'bottom',
      },
      {
        id: 'patient-new',
        targetId: 'patient-new-patient',
        title: '+ Nuevo Paciente',
        description: 'Registrá un nuevo paciente con sus datos personales completos y antecedentes médicos relevantes.',
        screen: 'patients',
        placement: 'left',
      },
      {
        id: 'patient-select-mock',
        targetId: 'tour-patients-list',
        title: 'Seleccionar Paciente (Demo)',
        description: 'Se cargará un paciente de prueba para que puedas explorar el expediente clínico completo con datos realistas.',
        screen: 'patients',
        placement: 'right',
        action: { type: 'mock-patient' }
      },
      {
        id: 'patient-historial',
        targetId: 'patient-tab-historial',
        title: 'Historial Clínico',
        description: 'Consultá y editá los antecedentes médicos completos del paciente: alergias, medicación, cirugías previas y observaciones generales.',
        screen: 'patients',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'historial' }
      },
      {
        id: 'patient-evolution',
        targetId: 'tour-patients-history',
        title: 'Evolución Clínica',
        description: 'Visualizá el historial de sesiones y registrá el avance del paciente. Hacé clic en "Registrar Sesión" para añadir notas clínicas, evolución de medidas, fotos y parámetros de equipos (ej. Láser).',
        screen: 'patients',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'evolucion' }
      },
      {
        id: 'patient-consent',
        targetId: 'tour-patients-consent',
        title: 'Consentimiento Informado',
        description: 'Selecciona el servicio clínico, hacé que el paciente lea el documento y firme directamente en pantalla o tablet. El consentimiento quedará guardado inmutablemente con su firma.',
        screen: 'patients',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'consentimiento' }
      },
      {
        id: 'patient-galeria',
        targetId: 'patient-tab-galeria',
        title: 'Galería de Fotos',
        description: 'Subí imágenes de antes y después, y compará la evolución visual del tratamiento. Las fotos se sincronizan automáticamente con la galería general.',
        screen: 'patients',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'galeria' }
      },
      {
        id: 'patient-facturacion',
        targetId: 'patient-tab-facturacion',
        title: 'Facturación del Paciente',
        description: 'Consultá el historial completo de pagos, compras, bonos aplicados y saldo a favor disponible para este paciente.',
        screen: 'patients',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'facturacion' }
      },
    ],
  },
  {
    id: 'pos',
    title: 'Facturación y Caja',
    icon: '💰',
    screen: 'pos',
    steps: [
      {
        id: 'pos-cart',
        targetId: 'pos-cart-area',
        title: 'Punto de Venta (POS)',
        description: 'Desde aquí procesás todas las ventas de tratamientos, bonos y productos a los pacientes.',
        screen: 'pos',
        placement: 'right',
        action: { type: 'switch-tab', tab: 'pos' }
      },
      {
        id: 'pos-terminal',
        targetId: 'tour-pos-terminal',
        title: 'Terminal de Venta',
        description: 'La columna izquierda es el catálogo y la derecha el carrito. Seleccioná paciente, agregá servicios, configurá el pago y finalizá la venta.',
        screen: 'pos',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'pos' }
      },
      {
        id: 'pos-cart-add',
        targetId: 'tour-pos-add-service',
        title: 'Agregar Tratamientos y Productos',
        description: 'Buscá en el catálogo el tratamiento clínico, bono de sesiones o producto físico que deseás vender, y hacé clic para sumarlo al carrito.',
        screen: 'pos',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'pos' }
      },
      {
        id: 'pos-patient-search',
        targetId: 'tour-pos-patient-search',
        title: 'Vincular Paciente',
        description: 'Asociá la venta al paciente. Esto permite llevar el historial clínico, calcular comisiones del profesional y registrar la trazabilidad clínica.',
        screen: 'pos',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'pos' }
      },
      {
        id: 'pos-cart-payment',
        targetId: 'tour-pos-payment-method',
        title: 'Método de Pago',
        description: 'Elegí el método: efectivo, tarjeta, transferencia o billetera virtual. Para pagos electrónicos ingresá el número de referencia.',
        screen: 'pos',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'pos' }
      },
      {
        id: 'pos-invoice-type',
        targetId: 'tour-pos-invoice-type',
        title: 'Tipo de Comprobante',
        description: 'Definí si emitís ticket interno (control interno) o factura fiscal (requiere datos del paciente/empresa).',
        screen: 'pos',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'pos' }
      },
      {
        id: 'pos-reference',
        targetId: 'tour-pos-reference',
        title: 'Referencia de Pago',
        description: 'Para pagos con tarjeta o transferencia, ingresá aquí el número de operación o referencia del comprobante.',
        screen: 'pos',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'pos' }
      },
      {
        id: 'pos-coupons',
        targetId: 'tour-pos-coupons',
        title: 'Cupones y Descuentos',
        description: 'Aplicá cupones de campañas activas o asigná un descuento manual con autorización. El sistema validará la vigencia y condiciones del cupón.',
        screen: 'pos',
        placement: 'left',
        action: { type: 'switch-tab', tab: 'pos' }
      },
      {
        id: 'pos-submit-sale',
        targetId: 'tour-pos-submit-sale',
        title: 'Finalizar Venta',
        description: 'Confirmá la venta para generar el comprobante, registrar el movimiento en caja y acreditar las comisiones al profesional.',
        screen: 'pos',
        placement: 'top',
        action: { type: 'switch-tab', tab: 'pos' }
      },
      {
        id: 'pos-cash-open',
        targetId: 'tour-finance-caja-tab',
        title: 'Caja (Flujo Diario)',
        description: 'Accedé acá para abrir la caja al inicio de tu turno y ver todos los movimientos de efectivo del día.',
        screen: 'pos',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'caja' }
      },
      {
        id: 'pos-cash-initial-balance',
        targetId: 'tour-cash-initial-balance',
        title: 'Apertura con Fondo Inicial',
        description: 'Al comenzar el día, ingresá el monto de efectivo con el que abrís la caja. Este será el punto de partida para el arqueo.',
        screen: 'pos',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'caja' }
      },
      {
        id: 'pos-cash-expense',
        targetId: 'tour-cash-expense-btn',
        title: 'Registrar Egresos o Gastos',
        description: 'Si tenés que comprar insumos, pagar a proveedores u otros gastos menores, registralo acá para descontarlo del total de la caja.',
        screen: 'pos',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'caja' }
      },
      {
        id: 'pos-cash-close',
        targetId: 'tour-cash-close-btn',
        title: 'Cerrar y Arquear Caja',
        description: 'Al final del día, contá el dinero físico, ingresalo acá y el sistema te dirá si sobra o falta dinero (descuadre).',
        screen: 'pos',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'caja' }
      },
      {
        id: 'pos-schedules',
        targetId: 'tour-finance-schedules-tab',
        title: 'Horarios de Staff',
        description: 'Configurá los turnos, horarios laborales y días libres de cada profesional de la clínica.',
        screen: 'pos',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'schedules' }
      },
      {
        id: 'pos-performance',
        targetId: 'tour-finance-performance-tab',
        title: 'Desempeño y Metas',
        description: 'Monitoreá las ventas de cada empleado, fijá metas mensuales y calculá las comisiones de manera automática.',
        screen: 'pos',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'performance' }
      },
      {
        id: 'pos-payroll',
        targetId: 'tour-finance-payroll-tab',
        title: 'Nóminas y Liquidación',
        description: 'Calculá y registrá el pago de salarios y comisiones del staff en fechas de pago.',
        screen: 'pos',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'payroll' }
      },
      {
        id: 'pos-attendance',
        targetId: 'tour-finance-attendance-tab',
        title: 'Asistencia y Reloj',
        description: 'Revisá los fichajes de entrada, salidas y descansos de cada empleado.',
        screen: 'pos',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'attendance' }
      },
      {
        id: 'pos-promotions',
        targetId: 'tour-finance-promotions-tab',
        title: 'Promociones y Marketing',
        description: 'Creá y gestioná campañas de descuento temporal, paquetes especiales y cupones promocionales.',
        screen: 'pos',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'promotions' }
      },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventario',
    icon: '📦',
    screen: 'inventory',
    steps: [
      {
        id: 'inventory-catalog',
        targetId: 'inventory-product-table',
        title: 'Catálogo de Productos',
        description: 'Todos los insumos y productos con stock actual, mínimo y precio. Los productos bajos se resaltan en rojo para reponerlos a tiempo.',
        screen: 'inventory',
        placement: 'top',
      },
      {
        id: 'inventory-new',
        targetId: 'inventory-new-product',
        title: '+ Nuevo Producto',
        description: 'Agregá un insumo o producto comercial con nombre, categoría, stock inicial y precios de compra/venta.',
        screen: 'inventory',
        placement: 'left',
      },
      {
        id: 'inventory-wastes',
        targetId: 'tour-inventory-wastes',
        title: 'Mermas y Desperdicios',
        description: 'Registrá los productos vencidos, dañados o desperdiciados. Esto impacta en el stock real y en los reportes de costos.',
        screen: 'inventory',
        placement: 'top',
      },
    ],
  },
  {
    id: 'services',
    title: 'Servicios y Paquetes',
    icon: '✨',
    screen: 'services',
    steps: [
      {
        id: 'services-tab-services',
        targetId: 'services-tab-services',
        title: 'Pestaña de Servicios',
        description: 'Listado principal de tratamientos individuales que ofrece la clínica.',
        screen: 'services',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'services' }
      },
      {
        id: 'services-list',
        targetId: 'services-list',
        title: 'Catálogo de Servicios',
        description: 'Todos los tratamientos con precio, duración y categoría. Podés vincular insumos que se descuentan automáticamente al venderse.',
        screen: 'services',
        placement: 'top',
        action: { type: 'switch-tab', tab: 'services' }
      },
      {
        id: 'services-new',
        targetId: 'services-new-service',
        title: '+ Nuevo Servicio',
        description: 'Creá un tratamiento: sesión única, multi-sesión o retocable (con días y cantidad máxima de retoques).',
        screen: 'services',
        placement: 'left',
        action: { type: 'switch-tab', tab: 'services' }
      },
      {
        id: 'service-form-name',
        targetId: 'tour-service-form-name',
        title: 'Datos del Servicio',
        description: 'Completá nombre, categoría, duración y precio base del tratamiento. Estos datos se muestran en la agenda y el POS.',
        screen: 'services',
        placement: 'right',
        action: { type: 'switch-tab', tab: 'services' }
      },
      {
        id: 'service-form-consumables',
        targetId: 'tour-service-form-consumables',
        title: 'Insumos Consumidos',
        description: 'Vinculá los productos de inventario que se consumen al realizar este tratamiento. El stock se descontará automáticamente.',
        screen: 'services',
        placement: 'right',
        action: { type: 'switch-tab', tab: 'services' }
      },
      {
        id: 'services-tab-packages',
        targetId: 'services-tab-packages',
        title: 'Paquetes / Bonos',
        description: 'Creá paquetes de múltiples sesiones con precio preferencial y fecha de vencimiento. Ideales para fidelizar pacientes.',
        screen: 'services',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'packages' }
      },
    ],
  },
  {
    id: 'reports',
    title: 'Reportes',
    icon: '📈',
    screen: 'reports',
    steps: [
      {
        id: 'reports-kpis',
        targetId: 'reports-kpis',
        title: 'KPIs Financieros',
        description: 'Ingresos netos, gastos, nóminas y valor del stock para el período seleccionado.',
        screen: 'reports',
        placement: 'bottom',
      },
      {
        id: 'reports-charts',
        targetId: 'tour-reports-charts',
        title: 'Gráficos Detallados',
        description: 'Visualizá la tendencia de ventas, servicios más vendidos y rendimiento por profesional. Compará períodos para identificar oportunidades.',
        screen: 'reports',
        placement: 'top',
      },
      {
        id: 'reports-export',
        targetId: 'reports-export',
        title: 'Exportar Datos',
        description: 'Exportá ventas detalladas, bitácora de caja y nóminas en formato CSV/Excel para tu contabilidad o auditoría.',
        screen: 'reports',
        placement: 'left',
      },
    ],
  },
  {
    id: 'consents',
    title: 'Consentimientos',
    icon: '📝',
    screen: 'consents',
    steps: [
      {
        id: 'consent-quick-sign',
        targetId: 'tour-consent-quick-sign',
        title: 'Firma Rápida',
        description: 'Abrí este botón cuando un paciente deba firmar un consentimiento en el momento. Se desplegará un modal con todos los pasos.',
        screen: 'consents',
        placement: 'bottom',
      },
      {
        id: 'consent-patient-search',
        targetId: 'tour-consent-patient-search',
        title: 'Buscar Paciente',
        description: 'En el modal, buscá y seleccioná al paciente que está firmando. Solo se permiten pacientes con ficha clínica activa.',
        screen: 'consents',
        placement: 'right',
      },
      {
        id: 'consent-service-select',
        targetId: 'tour-consent-service-select',
        title: 'Seleccionar Servicio',
        description: 'Elegí el servicio al que se asocia el consentimiento. El sistema cargará la plantilla correspondiente automáticamente.',
        screen: 'consents',
        placement: 'right',
      },
      {
        id: 'consent-method-file',
        targetId: 'tour-consent-method-file',
        title: 'Método: Subir Archivo',
        description: 'Si el paciente firmó en papel, elegí esta opción para subir el documento escaneado en PDF o imagen.',
        screen: 'consents',
        placement: 'left',
      },
      {
        id: 'consent-canvas',
        targetId: 'tour-consent-canvas',
        title: 'Firma Digital en Pantalla',
        description: 'Hacé que el paciente firme con el dedo, stylus o mouse sobre el canvas. La firma queda registrada con timestamp y datos del dispositivo.',
        screen: 'consents',
        placement: 'top',
      },
      {
        id: 'consent-file-input',
        targetId: 'tour-consent-file-input',
        title: 'Cargar Documento Firmado',
        description: 'Adjuntá el PDF o imagen del consentimiento firmado en papel. Soporta múltiples formatos y queda asociado al paciente.',
        screen: 'consents',
        placement: 'left',
      },
      {
        id: 'consent-submit',
        targetId: 'tour-consent-submit',
        title: 'Guardar Consentimiento',
        description: 'Confirmá el registro. El consentimiento queda almacenado de forma inmutable, vinculado al paciente y al servicio realizado.',
        screen: 'consents',
        placement: 'top',
      },
    ],
  },
  {
    id: 'config',
    title: 'Configuración',
    icon: '⚙️',
    screen: 'config',
    steps: [
      {
        id: 'config-professionals-tab',
        targetId: 'config-tab-professionals',
        title: 'Gestión de Profesionales',
        description: 'En esta pestaña podés administrar a todos los médicos, fisioterapeutas y esteticistas de tu clínica.',
        screen: 'config',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'professionals' }
      },
      {
        id: 'config-professionals-add',
        targetId: 'config-add-professional-btn',
        title: 'Agregar Profesional',
        description: 'Hacé clic acá para dar de alta a un nuevo empleado. Podrás asignarle un rol, correo y color para el calendario.',
        screen: 'config',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'professionals' }
      },
      {
        id: 'config-professionals-list',
        targetId: 'config-professionals-list',
        title: 'Lista de Equipo',
        description: 'Acá verás a todos tus profesionales registrados. Podés editar su información o darlos de baja en cualquier momento.',
        screen: 'config',
        placement: 'top',
        action: { type: 'switch-tab', tab: 'professionals' }
      },
      {
        id: 'config-clinic-tab',
        targetId: 'config-tab-clinic',
        title: 'Datos del Centro',
        description: 'Pasemos a configurar la información pública de tu centro médico.',
        screen: 'config',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'clinic' }
      },
      {
        id: 'config-clinic-form',
        targetId: 'config-clinic-form',
        title: 'Información General',
        description: 'Completá o actualizá el nombre comercial, dirección, teléfono y logo. Estos datos aparecerán en los reportes y facturas.',
        screen: 'config',
        placement: 'right',
        action: { type: 'switch-tab', tab: 'clinic' }
      },
      {
        id: 'config-features',
        targetId: 'config-features-toggles',
        title: 'Módulos Activos',
        description: 'Activá o desactivá módulos según las necesidades de tu clínica. Por ejemplo, si no vendés productos, podés desactivar el Punto de Venta.',
        screen: 'config',
        placement: 'top',
        action: { type: 'switch-tab', tab: 'clinic' }
      },
      {
        id: 'config-palette',
        targetId: 'config-palette-selector',
        title: 'Identidad Visual',
        description: 'Elegí los colores que mejor representen tu marca. Toda la interfaz se adaptará instantáneamente a la paleta seleccionada.',
        screen: 'config',
        placement: 'top',
        action: { type: 'switch-tab', tab: 'clinic' }
      },
      {
        id: 'config-branches-tab',
        targetId: 'config-tab-branches',
        title: 'Múltiples Sucursales',
        description: 'Si tu clínica tiene más de una sede, este es el lugar para administrarlas.',
        screen: 'config',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'branches' }
      },
      {
        id: 'config-branches-add',
        targetId: 'config-add-branch-btn',
        title: 'Agregar Sucursal',
        description: 'Creá nuevas sucursales para poder filtrar las citas y finanzas por sede de forma independiente.',
        screen: 'config',
        placement: 'left',
        action: { type: 'switch-tab', tab: 'branches' }
      },
      {
        id: 'config-whatsapp-tab',
        targetId: 'config-tab-whatsapp',
        title: 'Recordatorios Automáticos',
        description: 'Aumentá la asistencia de tus pacientes configurando recordatorios por WhatsApp.',
        screen: 'config',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'whatsapp' }
      },
      {
        id: 'config-whatsapp-form',
        targetId: 'config-whatsapp-form',
        title: 'Configurar Mensajes',
        description: 'Activá los recordatorios, definí con cuántas horas de anticipación enviarlos y personalizá el texto del mensaje.',
        screen: 'config',
        placement: 'right',
        action: { type: 'switch-tab', tab: 'whatsapp' }
      },
      {
        id: 'config-whatsapp-logs',
        targetId: 'config-whatsapp-logs',
        title: 'Registro de Envíos',
        description: 'Llevá un control de todos los mensajes enviados automáticamente a tus pacientes para confirmar sus citas.',
        screen: 'config',
        placement: 'top',
        action: { type: 'switch-tab', tab: 'whatsapp' }
      }
    ],
  },
];
