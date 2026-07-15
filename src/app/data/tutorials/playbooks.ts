import { TourStep, RoleGuide } from "./types";

export const ROLE_GUIDES: RoleGuide[] = [
  {
    roleName: "Administrador (ADMIN)",
    roleKey: "ADMIN",
    description: "Control total y estratégico del negocio multi-sucursal y finanzas.",
    colorClass: "from-purple-500/10 to-indigo-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400",
    actions: [
      "Configuración de parámetros globales, cabinas y catálogo de servicios.",
      "Alta y administración de múltiples sucursales.",
      "Cálculo automatizado de nóminas del personal y comisiones fijas del 10%.",
      "Auditoría global de arqueos de caja y exportaciones contables consolidadas.",
    ],
    example: "Usa el selector de sucursal activa en la barra lateral para analizar los KPIs individuales de cada clínica, y ve al módulo de Analíticas para exportar los reportes en CSV para tu contador.",
  },
  {
    roleName: "Fisioterapeuta (PHYSIO)",
    roleKey: "PHYSIO",
    description: "Foco en la atención de rehabilitación del paciente y registro clínico.",
    colorClass: "from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400",
    actions: [
      "Consulta de agenda de citas individuales asignadas.",
      "Control y actualización del estado de las sesiones.",
      "Registro de la hoja de evolución del paciente (notas médicas, dolor, peso, medidas corporales).",
    ],
    example: "Al finalizar un tratamiento, abre la sección de Pacientes, busca la ficha de tu cliente y, en la pestaña de Historial Clínico, registra los detalles y notas evolutivas de la sesión.",
  },
  {
    roleName: "Esteticista (AESTHETICIAN)",
    roleKey: "AESTHETICIAN",
    description: "Tratamientos estéticos corporales y faciales con seguimiento gráfico.",
    colorClass: "from-pink-500/10 to-rose-500/10 border-pink-500/30 text-pink-600 dark:text-pink-400",
    actions: [
      "Agenda de citas y visualización de cabinas estéticas asignadas.",
      "Carga de fotos de evolución del paciente para contrastar Antes / Después.",
      "Captura de firmas digitales del paciente en consentimientos informados de tratamiento.",
    ],
    example: "Antes de realizar un tratamiento de Cavitación, haz firmar el consentimiento digital mediante el Canvas Pad en la vista de Pacientes y toma las fotos de control para agregarlas a la Galería.",
  },
  {
    roleName: "Recepcionista (RECEPTIONIST)",
    roleKey: "RECEPTIONIST",
    description: "Atención al cliente, facturación y operaciones diarias de entrada y salida.",
    colorClass: "from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
    actions: [
      "Alta rápida de nuevos pacientes y asignación de citas en el Calendario.",
      "Apertura de caja y arqueo diario de caja chica registrando efectivo y tarjetas.",
      "Cobros en la terminal POS emitiendo boletas internas o facturas fiscales (SAT/AFIP) desglosando IVA.",
    ],
    example: "Al iniciar tu turno en Caja y POS, abre la caja con el saldo inicial. Al cobrar a un cliente, pregúntale si requiere factura fiscal SAT/AFIP para capturar sus datos de impuestos correspondientes.",
  },
  {
    roleName: "Super Administrador (SUPER_ADMIN)",
    roleKey: "SUPER_ADMIN",
    description: "Gestión global de la infraestructura multi-sucursal y SaaS.",
    colorClass: "from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
    actions: [
      "Monitoreo del estado y actividad de todos los inquilinos (clínicas).",
      "Alta de nuevos inquilinos en el entorno de producción.",
      "Configuración y ajuste de planes mensuales de cada centro registrado.",
      "Auditoría global de rendimiento e infraestructura."
    ],
    example: "Al firmar un contrato con un nuevo centro, abre la pestaña de SaaS y presiona 'Crear Tenant' para asignarle su base de datos aislada."
  }
];

export const ROLE_ONBOARDING_TOURS: Record<string, TourStep[]> = {
  ADMIN: [
    {
      selector: "#tour-dashboard-kpi",
      title: "Bienvenido, Administrador",
      content: "Este es tu panel táctico. Desde aquí controlas el rendimiento diario de facturación, volumen de citas y alertas de insumos de tu centro.",
      position: "bottom",
      targetScreen: "dashboard"
    },
    {
      selector: "#tour-dashboard-chart",
      title: "Gráfico de Facturación",
      content: "Visualiza la tendencia diaria de ventas netas de la semana en curso para evaluar el rendimiento comercial.",
      position: "top",
      targetScreen: "dashboard"
    },
    {
      selector: "#tour-dashboard-retouches",
      title: "Alertas de Retoques Obligatorios",
      content: "Para tratamientos con retoque programado (como toxina), el sistema te avisa aquí si venció o si está próximo para llamar al paciente.",
      position: "top",
      targetScreen: "dashboard"
    },
    {
      selector: "#tour-dashboard-appointments",
      title: "Citas Programadas de Hoy",
      content: "Accede rápidamente a las citas de hoy. Muestra el estado de confirmación, profesional y cabina asignada.",
      position: "top",
      targetScreen: "dashboard"
    },
    {
      selector: "#tour-dashboard-branch",
      title: "Control Multi-Sucursal",
      content: "Si tu clínica cuenta con varios locales físicos, usa este botón para alternar las bases de datos al instante.",
      position: "bottom",
      targetScreen: "dashboard"
    },
    {
      selector: "#tour-sidebar-calendar",
      title: "Navegación al Calendario",
      content: "Usa el menú lateral para acceder a la agenda de citas, donde puedes programar y reprogramar turnos.",
      position: "right",
      targetScreen: "calendar"
    },
    {
      selector: "#tour-calendar-cabins",
      title: "Filtro de Vista y Cabinas",
      content: "Cambia entre Vista Semanal y Vista Diaria por Cabinas. Te permite ver qué salas físicas (boxes) o equipos láser están ocupados u ociosos.",
      position: "bottom",
      targetScreen: "calendar"
    },
    {
      selector: "#tour-calendar-create-btn",
      title: "Nueva Cita Rápida",
      content: "Haz clic para abrir el formulario lateral y crear una cita manualmente ingresando paciente, servicio y hora.",
      position: "left",
      targetScreen: "calendar"
    },
    {
      selector: "#tour-sidebar-patients",
      title: "CRM y Expedientes Clínicos",
      content: "Navega al CRM para buscar pacientes, gestionar su historial, evoluciones, consentimientos y galería.",
      position: "right",
      targetScreen: "patients"
    },
    {
      selector: "#tour-tab-historial",
      title: "Antecedentes Médicos",
      content: "Ficha clínica inicial donde registras alergias, patologías previas, contraindicaciones y anamnesis del paciente.",
      position: "bottom",
      targetScreen: "patients",
      targetTab: "historial"
    },
    {
      selector: "#tour-tab-evolucion",
      title: "Bitácora de Evolución",
      content: "Registra el avance sesión por sesión. Permite anotar observaciones clínicas, peso, perímetros corporales y parámetros láser.",
      position: "bottom",
      targetScreen: "patients",
      targetTab: "evolucion"
    },
    {
      selector: "#tour-sidebar-pos",
      title: "Módulo Financiero y POS",
      content: "Controla las ventas diarias, audita los arqueos de caja del personal y genera las nóminas acumuladas a fin de mes.",
      position: "right",
      targetScreen: "pos"
    },
    {
      selector: "#tour-pos-cash",
      title: "Control de Caja Chica",
      content: "Abre la caja chica con el saldo inicial del día. Registra salidas rápidas de efectivo para gastos menores y efectúa el arqueo de cierre.",
      position: "top",
      targetScreen: "pos",
      targetTab: "caja"
    },
    {
      selector: "#tour-sidebar-config",
      title: "Configuración General",
      content: "Aquí registras a tus terapeutas, configuras sus comisiones fijas del 10%, defines plantillas de WhatsApp y detalles de la clínica.",
      position: "right",
      targetScreen: "config",
      targetTab: "professionals"
    }
  ],
  RECEPTIONIST: [
    {
      selector: "#tour-sidebar-calendar",
      title: "Bienvenida, Recepcionista",
      content: "Tu herramienta principal: el Calendario. Crea citas, asigna terapeutas disponibles y evita solapamientos horaria.",
      position: "right",
      targetScreen: "calendar"
    },
    {
      selector: "#tour-calendar-create-btn",
      title: "Nueva Cita Rápida",
      content: "Haz clic para abrir el formulario lateral y crear una cita manualmente ingresando paciente, servicio y hora.",
      position: "left",
      targetScreen: "calendar"
    },
    {
      selector: "#tour-sidebar-patients",
      title: "Registro de Expedientes",
      content: "Da de alta nuevos clientes que asistan a la clínica para poder agendarles tratamientos de forma rápida.",
      position: "right",
      targetScreen: "patients"
    },
    {
      selector: "#tour-patients-register-btn",
      title: "Registrar Nuevo Paciente",
      content: "Presiona 'Nuevo Paciente' para abrir la ficha de alta e introducir sus datos en el sistema.",
      position: "bottom",
      targetScreen: "patients"
    },
    {
      selector: "#tour-sidebar-pos",
      title: "Terminal de Caja y POS",
      content: "Apertura la caja por la mañana con su saldo inicial, registra los cobros de servicios y productos, y realiza el arqueo de cierre al finalizar.",
      position: "right",
      targetScreen: "pos"
    },
    {
      selector: "#tour-pos-terminal",
      title: "Terminal de Venta (POS)",
      content: "Añade servicios y productos comerciales al carrito. Recuerda asociar el paciente usando el buscador superior del POS.",
      position: "bottom",
      targetScreen: "pos",
      targetTab: "pos"
    }
  ],
  PHYSIO: [
    {
      selector: "#tour-dashboard-appointments",
      title: "Bienvenido, Fisioterapeuta",
      content: "Aquí ves tus pacientes agendados para hoy. Recuerda consultar tu cabina física de atención.",
      position: "top",
      targetScreen: "dashboard"
    },
    {
      selector: "#tour-sidebar-calendar",
      title: "Tu Agenda Semanal",
      content: "Visualiza tu cuadrícula horaria de trabajo para verificar tus bloques ocupados o agendar rehabilitaciones.",
      position: "right",
      targetScreen: "calendar"
    },
    {
      selector: "#tour-sidebar-patients",
      title: "CRM y Expedientes Clínicos",
      content: "Navega a la ficha de tu paciente para registrar sus hojas de evolución clínica, dolor, peso e historial antropométrico.",
      position: "right",
      targetScreen: "patients"
    },
    {
      selector: "#tour-tab-evolucion",
      title: "Bitácora de Evolución",
      content: "Registra el avance sesión por sesión. Permite anotar observaciones clínicas, peso, perímetros corporales y parámetros láser.",
      position: "bottom",
      targetScreen: "patients",
      targetTab: "evolucion"
    }
  ],
  AESTHETICIAN: [
    {
      selector: "#tour-dashboard-appointments",
      title: "Bienvenida, Esteticista",
      content: "Consulta la lista de citas estéticas de hoy, el tipo de aparatología láser a usar y la cabina asignada.",
      position: "top",
      targetScreen: "dashboard"
    },
    {
      selector: "#tour-sidebar-patients",
      title: "Fichas de Clientes",
      content: "Desde aquí puedes hacer firmar el consentimiento digital al paciente en pantalla y tomar fotos de control de evolución Antes/Después.",
      position: "right",
      targetScreen: "patients"
    },
    {
      selector: "#tour-tab-consentimiento",
      title: "Ficha de Consentimiento",
      content: "Visualiza los contratos legales firmados por el paciente para tratamientos específicos o captura una nueva firma en la tableta.",
      position: "bottom",
      targetScreen: "patients",
      targetTab: "consentimiento"
    },
    {
      selector: "#tour-tab-galeria",
      title: "Galería de Fotos",
      content: "Sube y organiza fotos del paciente en categorías de 'Antes' (Control Inicial) y 'Después' (Evolución) para evaluar resultados.",
      position: "bottom",
      targetScreen: "patients",
      targetTab: "galeria"
    }
  ],
  SUPER_ADMIN: [
    {
      selector: "#tour-saas-tenant-list",
      title: "Consola Global SaaS",
      content: "Bienvenido a la consola del desarrollador. Desde aquí monitoreas el estado operativo de todas las clínicas (inquilinos) de la plataforma.",
      position: "bottom",
      targetScreen: "saas"
    },
    {
      selector: "#tour-saas-create-tenant-btn",
      title: "Provisionar Nueva Clínica",
      content: "Registra un nuevo centro médico o spa en el software SaaS y configúrale su plan de cobro mensual (Basic o Premium).",
      position: "bottom",
      targetScreen: "saas"
    }
  ]
};

export function getRoleScenariosForSelector(selector: string): { role: string; text: string }[] {
  if (selector.includes("payroll")) {
    return [
      { role: "ADMIN", text: "Audita las comisiones acumuladas del 10% de cada empleado y procesa la liquidación de nóminas al final del período." },
      { role: "RECEPTIONIST", text: "Informa al administrador sobre el cumplimiento de horarios o incidencias para registrar bonificaciones o deducciones manuales." }
    ];
  }
  if (selector.includes("pos") || selector.includes("cash")) {
    return [
      { role: "RECEPTIONIST", text: "Abre la caja chica con el saldo inicial, realiza cobros en el terminal POS (eligiendo boleta interna o factura fiscal SAT/AFIP), registra salidas de efectivo rápido para insumos y hace el arqueo de cierre de caja." },
      { role: "ADMIN", text: "Audita los arqueos realizados por el staff y valida que no existan discrepancias significativas entre lo cobrado y el dinero físico." }
    ];
  }
  if (selector.includes("patients") || selector.includes("history") || selector.includes("consent")) {
    return [
      { role: "PHYSIO", text: "Registra detalladamente las hojas de evolución clínica, notas de progreso del paciente y actualiza los perímetros corporales o peso." },
      { role: "AESTHETICIAN", text: "Carga fotos de control en la galería (categorizando Antes / Después) y recopila firmas digitales para los consentimientos informados de tratamiento." },
      { role: "RECEPTIONIST", text: "Registra nuevos expedientes de pacientes en el CRM de la clínica y valida que sus datos de contacto estén completos." }
    ];
  }
  if (selector.includes("calendar")) {
    return [
      { role: "RECEPTIONIST", text: "Asigna citas, selecciona al profesional clínico disponible, reserva las cabinas físicas (boxes) y reprograma horas arrastrando bloques." },
      { role: "PHYSIO & AESTHETICIAN", text: "Consultan su agenda diaria asignada para ver a qué paciente deben atender y en qué cabina física se realizará el servicio." }
    ];
  }
  if (selector.includes("inventory") || selector.includes("services")) {
    return [
      { role: "ADMIN", text: "Gestiona el catálogo de servicios, asocia qué dosis de insumos (ej. gel conductor) se consumen automáticamente y audita el valor del stock." },
      { role: "RECEPTIONIST", text: "Ingresa entradas de stock por compras a proveedores y registra mermas de insumos rotos o vencidos." },
      { role: "PHYSIO & AESTHETICIAN", text: "Al completar un tratamiento, el sistema descuenta automáticamente la cantidad pre-configurada del insumo asociado." }
    ];
  }
  if (selector.includes("reports") || selector.includes("chart") || selector.includes("kpi")) {
    return [
      { role: "ADMIN", text: "Visualiza curvas evolutivas de ingresos, evalúa comisiones del mes y descarga reportes de auditoría contable en formato CSV." }
    ];
  }
  return [
    { role: "TODOS LOS ROLES", text: "Este componente optimiza la coordinación diaria entre la administración de la clínica y el personal operativo." }
  ];
}
