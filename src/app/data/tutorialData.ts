import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Receipt,
  Package,
  Sparkles,
  BarChart3,
  Settings,
  UserCheck,
  HelpCircle,
  ShieldAlert,
  LogIn,
  Globe,
} from "lucide-react";
import React from "react";

export interface TourStep {
  selector: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  mode?: "view" | "interactive";
  advanceOn?: { event: string; selector: string };
}

export interface ScreenGuide {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

export interface RoleGuide {
  roleName: string;
  roleKey: string;
  description: string;
  colorClass: string;
  actions: string[];
  example: string;
}

export interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

// ==========================================
// 1. TOURS POR VISTA (VIEW_TOURS)
// ==========================================
export const VIEW_TOURS: Record<string, TourStep[]> = {
  dashboard: [
    {
      selector: "#tour-dashboard-branch",
      title: "Selector de Sucursal",
      content: "Si tienes el rol de Administrador, puedes alternar entre las sucursales de tu clínica. Todas las estadísticas y agendas se filtrarán al instante.",
      position: "bottom"
    },
    {
      selector: "#tour-sidebar",
      title: "Navegación Principal",
      content: "Usa el menú lateral para moverte entre las diferentes secciones: Agenda, Pacientes, POS, Inventario, Servicios y Reportes.",
      position: "right"
    },
    {
      selector: "#tour-dashboard-kpi",
      title: "Métricas Clave del Día",
      content: "Aquí ves la facturación acumulada, citas del día, total de pacientes y alertas activas de stock bajo o vencimientos.",
      position: "bottom"
    },
    {
      selector: "#tour-dashboard-chart",
      title: "Gráfico de Facturación",
      content: "Visualiza la tendencia diaria de ventas netas de la semana en curso para evaluar el rendimiento comercial.",
      position: "top"
    },
    {
      selector: "#tour-dashboard-appointments",
      title: "Citas Programadas de Hoy",
      content: "Accede rápidamente a las citas de hoy. Muestra el estado de confirmación, profesional y cabina asignada.",
      position: "top"
    },
    {
      selector: "#tour-dashboard-retouches",
      title: "Alertas de Retoques Obligatorios",
      content: "Para tratamientos con retoque programado (como toxina), el sistema te avisa aquí si venció o si está próximo para llamar al paciente.",
      position: "top"
    },
    {
      selector: "#tour-topbar-bell",
      title: "Buzón de Notificaciones",
      content: "Notifica sobre materiales próximos a agotarse, paquetes que van a expirar o retoques. Haz clic para ir al módulo afectado.",
      position: "bottom"
    },
    {
      selector: "#tour-topbar-search",
      title: "Buscador Global de Pacientes",
      content: "Escribe al menos dos letras del nombre del paciente para encontrar y abrir su expediente clínico desde cualquier pantalla.",
      position: "bottom"
    },
    {
      selector: "#tour-topbar-tutorial",
      title: "Asistente del Módulo",
      content: "Haz clic en este botón cuando quieras repetir el tour interactivo de la vista que estás visualizando.",
      position: "bottom"
    },
    {
      selector: "#tour-user-footer",
      title: "Tu Perfil de Usuario",
      content: "Muestra tu avatar, nombre y rol de seguridad. Haz clic aquí para ir a tus ajustes personales de cuenta.",
      position: "top"
    }
  ],
  calendar: [
    {
      selector: "#tour-calendar-cabins",
      title: "Filtro de Vista y Cabinas",
      content: "Cambia entre Vista Semanal y Vista Diaria por Cabinas. Te permite ver qué salas físicas (boxes) o equipos láser están ocupados u ociosos.",
      position: "bottom"
    },
    {
      selector: "#tour-calendar-create-btn",
      title: "Nueva Cita Rápida",
      content: "Haz clic para abrir el formulario lateral y crear una cita manualmente ingresando paciente, servicio y hora.",
      position: "left"
    },
    {
      selector: "#tour-calendar-grid",
      title: "Cuadrícula Agenda",
      content: "Muestra los bloques de citas. Puedes hacer doble clic en un slot vacío para reservar, o arrastrar una cita existente para reprogramarla.",
      position: "top"
    },
    {
      selector: ".rbc-event", // Clases del calendario react
      title: "Detalle de Cita",
      content: "Haz un solo clic sobre cualquier cita en la cuadrícula para ver detalles, cambiar el estado (Pendiente, Confirmada, Completada) o abrir el cobro en POS.",
      position: "bottom"
    }
  ],
  patients: [
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
  ],
  pos: [
    {
      selector: "#tour-pos-terminal",
      title: "Terminal de Venta (POS)",
      content: "Añade servicios y productos comerciales al carrito. Recuerda asociar el paciente usando el buscador superior del POS.",
      position: "bottom"
    },
    {
      selector: "#tour-pos-coupons",
      title: "Cupones y Descuentos",
      content: "Aplica cupones promocionales de campañas activas, introduce descuentos manuales y define si es comprobante de control interno o factura fiscal.",
      position: "left"
    },
    {
      selector: "#tour-pos-cash",
      title: "Control de Caja Chica",
      content: "Abre la caja chica con el saldo inicial del día. Registra salidas rápidas de efectivo para gastos menores y efectúa el arqueo de cierre.",
      position: "top"
    },
    {
      selector: "#tour-pos-payroll",
      title: "Liquidación de Nóminas",
      content: "Calcula el sueldo base más las comisiones automáticas del 10% ganadas por el personal por tratamientos completados.",
      position: "top"
    }
  ],
  inventory: [
    {
      selector: "#tour-inventory-catalog",
      title: "Catálogo de Materiales y Productos",
      content: "Controla las existencias en tiempo real de insumos (geles, viales) y productos para reventa. Los círculos rojos indican stock bajo.",
      position: "top"
    },
    {
      selector: "#tour-inventory-wastes",
      title: "Bitácora de Consumos y Mermas",
      content: "Registra entradas por compras a proveedores o mermas manuales debidas a daños, roturas o caducidad del material.",
      position: "top"
    }
  ],
  services: [
    {
      selector: "#tour-services-supplies",
      title: "Catálogo de Servicios Clínicos",
      content: "Define precios, tiempos de cabina y vincula los materiales consumidos automáticamente por sesión para descontarlos de stock.",
      position: "top"
    },
    {
      selector: "#tour-services-packages",
      title: "Paquetes Multisesión (Bonos)",
      content: "Crea paquetes de múltiples sesiones con descuento (ej. Bono de 10 Cavitaciones) para incentivar compras anticipadas.",
      position: "top"
    }
  ],
  reports: [
    {
      selector: "#tour-reports-kpi",
      title: "KPIs Contables",
      content: "Visualiza los ingresos netos cobrados, los gastos en efectivo de caja chica, comisiones devengadas y la valorización de tu stock en almacén.",
      position: "bottom"
    },
    {
      selector: "#tour-reports-charts",
      title: "Distribución de Finanzas",
      content: "Gráficos de facturación por sucursal, categorías de servicios con más demanda y desgloses por métodos de pago.",
      position: "top"
    },
    {
      selector: "#tour-reports-export",
      title: "Descarga de Auditoría",
      content: "Genera y descarga un reporte en formato CSV compatible con Excel para tu contabilidad o declaración fiscal mensual.",
      position: "top"
    }
  ],
  config: [
    {
      selector: "#tour-config-tabs",
      title: "Pestañas de Ajustes",
      content: "Navega entre la gestión de Profesionales, Datos de la Clínica, Sucursales y el Canal de notificaciones por WhatsApp.",
      position: "bottom"
    },
    {
      selector: "#tour-config-professionals-list",
      title: "Personal y Horarios",
      content: "Registra terapeutas, esteticistas y recepcionistas. Define sus perfiles, sueldos base, tasas de comisión y horarios de trabajo por día.",
      position: "top"
    },
    {
      selector: "#tour-config-clinic-form",
      title: "Configuración de la Sucursal",
      content: "Establece el nombre comercial, dirección, datos fiscales y activa o desactiva módulos avanzados como el inventario.",
      position: "top"
    },
    {
      selector: "#tour-config-whatsapp-form",
      title: "Integración de WhatsApp",
      content: "Conecta tu API de WhatsApp para enviar confirmaciones de citas automáticas, recordatorios 24 horas antes y alertas de retoque.",
      position: "top"
    }
  ],
  saas: [
    {
      selector: "#tour-saas-tenant-list",
      title: "Consola Multitenant",
      content: "Como Super Administrador global, aquí controlas todos los inquilinos (clínicas) registrados en el software SaaS.",
      position: "bottom"
    },
    {
      selector: "#tour-saas-create-tenant-btn",
      title: "Alta de Nuevo Centro",
      content: "Registra una nueva clínica en la plataforma. Define su base de datos aislada, su slug único de acceso y el plan contratado.",
      position: "bottom"
    },
    {
      selector: "#tour-saas-stats",
      title: "Métricas Globales SaaS",
      content: "Supervisa la cantidad de clínicas activas, total de citas procesadas en la plataforma y volumen de ingresos consolidados.",
      position: "top"
    }
  ],
  login: [
    {
      selector: "#tour-login-email",
      title: "Correo Electrónico",
      content: "Ingresa tu email institucional configurado por el administrador del centro clínico.",
      position: "bottom"
    },
    {
      selector: "#tour-login-password",
      title: "Contraseña de Acceso",
      content: "Introduce tu clave secreta de seguridad. Si la olvidaste, por favor solicita un blanqueo al administrador.",
      position: "bottom"
    },
    {
      selector: "#tour-login-submit",
      title: "Ingresar al Panel",
      content: "Haz clic para autenticarte. El sistema cargará el dashboard y tus permisos específicos de rol.",
      position: "top"
    }
  ],
  portal: [
    {
      selector: ".portal-services-grid",
      title: "Paso 1: Elige tu Tratamiento",
      content: "Selecciona el servicio clínico o estético que deseas agendar desde nuestro catálogo público en línea.",
      position: "bottom"
    },
    {
      selector: ".portal-slots-calendar",
      title: "Paso 2: Fecha y Profesional",
      content: "Elige al especialista de tu preferencia y visualiza los horarios y días disponibles en tiempo real.",
      position: "top"
    },
    {
      selector: ".portal-submit-booking",
      title: "Paso 3: Reserva Web",
      content: "Completa tus datos de contacto y confirma la cita. Se agendará en la consola del centro clínico automáticamente.",
      position: "top"
    }
  ]
};

// ==========================================
// 2. TOURS DE WORKFLOWS CRUD (WORKFLOW_TOURS)
// ==========================================
export const WORKFLOW_TOURS: Record<string, TourStep[]> = {
  "create-appointment": [
    {
      selector: "#tour-calendar-create-btn",
      title: "Paso 1: Abrir Formulario",
      content: "Haz clic en 'Nueva Cita' para desplegar la barra lateral de creación.",
      position: "left"
    },
    {
      selector: "#tour-calendar-drawer-patient",
      title: "Paso 2: Buscar Paciente",
      content: "Escribe el nombre del paciente en el buscador y selecciónalo. Si es nuevo, puedes darlo de alta rápido desde aquí.",
      position: "left"
    },
    {
      selector: "#tour-calendar-drawer-specialist",
      title: "Paso 3: Asignar Profesional",
      content: "Selecciona al terapeuta o esteticista que realizará el tratamiento. El sistema calculará su comisión automáticamente.",
      position: "left"
    },
    {
      selector: "#tour-calendar-drawer-cabin",
      title: "Paso 4: Reservar Cabina",
      content: "Asigna la cabina o box físico. Esto asegura que la sala y aparatología láser estén disponibles sin colisiones.",
      position: "left"
    },
    {
      selector: "#tour-calendar-drawer-time",
      title: "Paso 5: Horario y Duración",
      content: "Define la fecha, hora de inicio y duración del tratamiento en minutos.",
      position: "left"
    },
    {
      selector: "#tour-calendar-drawer-submit",
      title: "Paso 6: Confirmar Agenda",
      content: "Haz clic en 'Guardar'. El sistema validará que no haya colisiones de agenda y creará la cita.",
      position: "top"
    }
  ],
  "register-patient": [
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
  ],
  "record-session": [
    {
      selector: "#tour-patients-list",
      title: "Paso 1: Buscar Paciente",
      content: "Selecciona al paciente del listado para abrir su ficha.",
      position: "right"
    },
    {
      selector: "#tour-tab-evolucion",
      title: "Paso 2: Ir a Evolución",
      content: "Haz clic en la pestaña de Evolución Clínica para ver el historial de sesiones.",
      position: "bottom"
    },
    {
      selector: "#tour-session-modal-trigger",
      title: "Paso 3: Abrir Registro",
      content: "Haz clic en 'Registrar Sesión' para abrir la hoja evolutiva del día.",
      position: "bottom"
    },
    {
      selector: "#tour-session-modal-notes",
      title: "Paso 4: Notas Clínicas",
      content: "Describe el progreso del paciente, la tolerancia al tratamiento y cualquier observación técnica.",
      position: "top"
    },
    {
      selector: "#tour-session-modal-measurements",
      title: "Paso 5: Medidas y Peso",
      content: "Si es un tratamiento reductor, introduce peso (kg), perímetro de cintura y cadera.",
      position: "top"
    },
    {
      selector: "#tour-session-modal-laser",
      title: "Paso 6: Parámetros Láser",
      content: "En caso de depilación láser, anota los Joules de energía (fluencia), spot y total de disparos.",
      position: "top"
    },
    {
      selector: "#tour-session-modal-submit",
      title: "Paso 7: Confirmar Sesión",
      content: "Guarda el registro. Se añadirá cronológicamente a la ficha y restará una sesión de su bono.",
      position: "top"
    }
  ],
  "sign-consent": [
    {
      selector: "#tour-tab-consentimiento",
      title: "Paso 1: pestaña Consentimiento",
      content: "Abre la sección legal dentro del perfil del paciente.",
      position: "bottom"
    },
    {
      selector: "#tour-patients-consent-service-select",
      title: "Paso 2: Elegir Tratamiento",
      content: "Selecciona el servicio clínico que requiere la firma digital informada.",
      position: "bottom"
    },
    {
      selector: "#tour-patients-consent-canvas",
      title: "Paso 3: Canvas de Firma",
      content: "Pídele al paciente que estampe su firma manuscrita digitalizada usando el mouse o pantalla táctil.",
      position: "top"
    },
    {
      selector: "#tour-patients-consent-submit",
      title: "Paso 4: Archivar Contrato",
      content: "Haz clic en 'Guardar Firma'. El documento se guardará como PDF / Imagen inmutable en su expediente.",
      position: "top"
    }
  ],
  "upload-gallery": [
    {
      selector: "#tour-tab-galeria",
      title: "Paso 1: Galería Fotográfica",
      content: "Abre la pestaña de fotos dentro de la ficha del paciente.",
      position: "bottom"
    },
    {
      selector: "#tour-gallery-file-input",
      title: "Paso 2: Cargar Archivo",
      content: "Haz clic para seleccionar la fotografía tomada con el dispositivo o cámara de la clínica.",
      position: "top"
    },
    {
      selector: "#tour-gallery-type-select",
      title: "Paso 3: Categorizar Control",
      content: "Selecciona si corresponde a un control 'Antes' (Pre-tratamiento) o 'Después' (Post-tratamiento).",
      position: "top"
    },
    {
      selector: "#tour-gallery-submit",
      title: "Paso 4: Subir Foto",
      content: "Guarda la imagen. Se organizará en el muro fotográfico con su respectiva fecha y notas.",
      position: "top"
    }
  ],
  "pos-sale": [
    {
      selector: "#tour-pos-terminal",
      title: "Paso 1: Carrito de Cobro",
      content: "Agrega los tratamientos realizados hoy o productos de reventa comercial al carrito del POS.",
      position: "bottom"
    },
    {
      selector: "#tour-pos-patient-search",
      title: "Paso 2: Vincular Paciente",
      content: "Busca y asocia el paciente para que el ticket de venta quede guardado en su historial.",
      position: "bottom"
    },
    {
      selector: "#tour-pos-payment-method",
      title: "Paso 3: Forma de Pago",
      content: "Selecciona si el cobro se realiza en Efectivo, Tarjeta de Crédito/Débito, Transferencia o QR.",
      position: "top"
    },
    {
      selector: "#tour-pos-invoice-type",
      title: "Paso 4: Ticket o Factura",
      content: "Elige 'Ticket Interno' para fines de control, o activa 'Factura Fiscal' para desglose automático de impuestos.",
      position: "top"
    },
    {
      selector: "#tour-pos-submit-sale",
      title: "Paso 5: Registrar Venta",
      content: "Confirma el pago. Se actualizará la caja del día, se restará el stock de insumos y se liquidará la comisión del personal.",
      position: "top"
    }
  ],
  "cash-register": [
    {
      selector: "#tour-pos-cash",
      title: "Paso 1: Abrir Módulo Caja",
      content: "Dirígete a la sección de Arqueo y Caja Chica en el módulo de Finanzas.",
      position: "top"
    },
    {
      selector: "#tour-cash-initial-balance",
      title: "Paso 2: Apertura de Turno",
      content: "Al iniciar el turno de recepción, abre la caja registrando el dinero físico inicial para cambios.",
      position: "top"
    },
    {
      selector: "#tour-cash-expense-btn",
      title: "Paso 3: Gastos Menores",
      content: "Usa este botón para registrar si se retira dinero en efectivo para compras rápidas de insumos.",
      position: "top"
    },
    {
      selector: "#tour-cash-close-btn",
      title: "Paso 4: Arqueo y Cierre",
      content: "Al final del día, cuenta el efectivo físico, contrástalo con el esperado en sistema y registra el balance de cierre.",
      position: "top"
    }
  ],
  "create-service": [
    {
      selector: "#tour-services-supplies",
      title: "Paso 1: Nuevo Servicio",
      content: "Haz clic en 'Nuevo Servicio' dentro del catálogo de tratamientos.",
      position: "top"
    },
    {
      selector: "#tour-service-form-name",
      title: "Paso 2: Datos Básicos",
      content: "Define nombre del tratamiento, categoría clínica, duración en cabina y precio al público.",
      position: "top"
    },
    {
      selector: "#tour-service-form-consumables",
      title: "Paso 3: Consumo Automático",
      content: "Vincular productos de almacén (ej. 15ml de crema) que el sistema descontará de stock por cada sesión.",
      position: "top"
    },
    {
      selector: "#tour-service-form-submit",
      title: "Paso 4: Guardar Servicio",
      content: "Guarda el tratamiento. Quedará disponible en la agenda del calendario y en el terminal POS.",
      position: "top"
    }
  ]
};

// ==========================================
// 3. TOURS DE ONBOARDING POR ROL (ROLE_ONBOARDING_TOURS)
// ==========================================
export const ROLE_ONBOARDING_TOURS: Record<string, TourStep[]> = {
  ADMIN: [
    {
      selector: "#tour-dashboard-kpi",
      title: "Bienvenido, Administrador",
      content: "Este es tu panel táctico. Desde aquí controlas el rendimiento diario de facturación, volumen de citas y alertas de insumos de tu centro.",
      position: "bottom"
    },
    {
      selector: "#tour-dashboard-branch",
      title: "Control Multi-Sucursal",
      content: "Si tu clínica cuenta con varios locales físicos, usa este botón para alternar las bases de datos al instante.",
      position: "bottom"
    },
    {
      selector: "#tour-sidebar-config",
      title: "Configuración General",
      content: "Aquí registras a tus terapeutas, configuras sus comisiones fijas del 10%, defines plantillas de WhatsApp y detalles de facturación.",
      position: "right"
    },
    {
      selector: "#tour-sidebar-pos",
      title: "Consola Financiera",
      content: "Controla las ventas diarias, audita los arqueos de caja del personal y genera las nóminas acumuladas a fin de mes.",
      position: "right"
    },
    {
      selector: "#tour-sidebar-reports",
      title: "Auditoría Contable",
      content: "Revisa gráficos interactivos sobre tus métodos de pago y descarga archivos CSV para tu contador.",
      position: "right"
    }
  ],
  PHYSIO: [
    {
      selector: "#tour-dashboard-appointments",
      title: "Bienvenido, Fisioterapeuta",
      content: "Aquí ves tus pacientes agendados para hoy. Recuerda consultar tu cabina física de atención.",
      position: "top"
    },
    {
      selector: "#tour-sidebar-calendar",
      title: "Tu Agenda Semanal",
      content: "Visualiza tu cuadrícula horaria de trabajo para verificar tus bloques ocupados o agendar rehabilitaciones.",
      position: "right"
    },
    {
      selector: "#tour-sidebar-patients",
      title: "CRM y Expedientes Clínicos",
      content: "Navega a la ficha de tu paciente para registrar sus hojas de evolución clínica, dolor, peso e historial antropométrico.",
      position: "right"
    }
  ],
  AESTHETICIAN: [
    {
      selector: "#tour-dashboard-appointments",
      title: "Bienvenida, Esteticista",
      content: "Consulta la lista de citas estéticas de hoy, el tipo de aparatología láser a usar y la cabina asignada.",
      position: "top"
    },
    {
      selector: "#tour-sidebar-patients",
      title: "Fichas de Clientes",
      content: "Desde aquí puedes hacer firmar el consentimiento digital al paciente en pantalla y tomar fotos de control de evolución Antes/Después.",
      position: "right"
    }
  ],
  RECEPTIONIST: [
    {
      selector: "#tour-sidebar-calendar",
      title: "Bienvenida, Recepcionista",
      content: "Tu herramienta principal: el Calendario. Crea citas, asigna terapeutas disponibles y evita solapamientos horaria.",
      position: "right"
    },
    {
      selector: "#tour-sidebar-patients",
      title: "Registro de Expedientes",
      content: "Da de alta nuevos clientes que asistan a la clínica para poder agendarles tratamientos de forma rápida.",
      position: "right"
    },
    {
      selector: "#tour-sidebar-pos",
      title: "Terminal de Caja y POS",
      content: "Apertura la caja por la mañana con su saldo inicial, registra los cobros de servicios y productos, y realiza el arqueo de cierre al finalizar.",
      position: "right"
    }
  ],
  SUPER_ADMIN: [
    {
      selector: "#tour-saas-tenant-list",
      title: "Consola Global SaaS",
      content: "Bienvenido a la consola del desarrollador. Desde aquí monitoreas el estado operativo de todas las clínicas (inquilinos) de la plataforma.",
      position: "bottom"
    },
    {
      selector: "#tour-saas-create-tenant-btn",
      title: "Provisionar Nueva Clínica",
      content: "Registra un nuevo centro médico o spa en el software SaaS y configúrale su plan de cobro mensual (Basic o Premium).",
      position: "bottom"
    }
  ]
};

// ==========================================
// 4. SELECTORES DE INSPECCIÓN (INSPECT_DATABASE)
// ==========================================
export const INSPECT_DATABASE: Record<string, { title: string; content: string }> = {
  "#tour-sidebar-dashboard": {
    title: "Sidebar: Dashboard Principal",
    content: "Acceso directo a la pantalla de resumen. Aquí verás los KPIs generales de facturación, volumen de citas de hoy, y alertas operativas de stock bajo o retoques."
  },
  "#tour-sidebar-calendar": {
    title: "Sidebar: Calendario y Citas",
    content: "Acceso al módulo de agenda semanal interactiva y el control de ocupación física de cabinas o boxes clínicos."
  },
  "#tour-sidebar-patients": {
    title: "Sidebar: CRM de Pacientes",
    content: "Acceso al expediente clínico digital, notas de evolución corporal/facial, firma digital de consentimientos y galería fotográfica."
  },
  "#tour-sidebar-pos": {
    title: "Sidebar: Caja Chica y Facturación (POS)",
    content: "Acceso al terminal de cobros rápidos, control de ventas directas de insumos, comisiones al 10% y arqueos diarios."
  },
  "#tour-sidebar-inventory": {
    title: "Sidebar: Almacén e Inventario",
    content: "Acceso al catálogo de stock disponible y la bitácora de movimientos (entradas por proveedor y mermas por daño)."
  },
  "#tour-sidebar-services": {
    title: "Sidebar: Catálogo de Servicios",
    content: "Acceso al panel donde configuras precios de tratamientos clínicos, sesiones estimadas y bonos multisesión con descuento."
  },
  "#tour-sidebar-reports": {
    title: "Sidebar: Analíticas y Contabilidad",
    content: "Acceso a reportes contables del mes, gráficos de métodos de pago y exportación de archivos CSV para administración."
  },
  "#tour-sidebar-config": {
    title: "Sidebar: Configuración General",
    content: "Acceso al registro de profesionales del centro, configuración de sus horarios de atención, y personalización del sistema."
  },
  "#tour-config-tabs": {
    title: "Pestañas de Configuración",
    content: "Navega entre las diferentes opciones de configuración del sistema: Gestión de Profesionales, Datos de la Clínica y Conexión de WhatsApp."
  },
  "#tour-config-professionals-tab": {
    title: "Configuración: Profesionales y Staff",
    content: "Permite ver, agregar y editar el listado de terapeutas y personal de recepción, configurar sus horarios laborales y activar/desactivar sus perfiles."
  },
  "#tour-config-clinic-tab": {
    title: "Configuración: Datos del Centro",
    content: "Ajusta la información pública de tu sucursal activa, incluyendo dirección física, número de teléfono de contacto y nombre del establecimiento."
  },
  "#tour-config-whatsapp-tab": {
    title: "Configuración: Recordatorios de WhatsApp",
    content: "Conecta tu API de WhatsApp y define plantillas de mensajes personalizadas con etiquetas dinámicas para enviar confirmaciones y recordatorios a tus pacientes."
  },
  "#tour-services-tabs": {
    title: "Pestañas de Servicios y Paquetes",
    content: "Intercambia entre el Catálogo de Servicios individuales y la configuración de Paquetes de tratamientos pre-armados (bonos multi-sesión)."
  },
  "#tour-services-tab-services": {
    title: "Servicios Clínicos y Estéticos",
    content: "Lista de tratamientos ofrecidos por la clínica. Permite editar precios, vincular insumos consumibles automáticos y configurar alertas de retoques obligatorios."
  },
  "#tour-services-tab-packages": {
    title: "Paquetes Multisesión (Bonos)",
    content: "Lista de bonos de tratamiento (por ejemplo, 10 sesiones de cavitación) con un precio global preferencial y vigencia de expiración configurable."
  },
  "#tour-finance-tabs": {
    title: "Módulos de Finanzas y Operaciones",
    content: "Barra de navegación para alternar entre el Terminal POS de ventas, el Arqueo de Caja Chica, Horarios de Personal, Metas de Ventas, Liquidación de Nóminas y Gestión de Promociones."
  },
  "#tour-finance-pos-tab": {
    title: "Terminal POS de Caja",
    content: "Pantalla interactiva de facturación para realizar cobros rápidos de servicios y productos, aplicar cupones y registrar el método de pago del paciente."
  },
  "#tour-finance-caja-tab": {
    title: "Arqueo de Caja Chica",
    content: "Registro detallado de ingresos y egresos de efectivo del día. Permite aperturar la caja chica con saldo inicial y realizar el arqueo final para control contable."
  },
  "#tour-finance-schedules-tab": {
    title: "Control de Asistencia del Personal",
    content: "Verifica y edita las horas de entrada y salida reales trabajadas por cada miembro del staff para control de puntualidad."
  },
  "#tour-finance-performance-tab": {
    title: "Metas y Desempeño del Centro",
    content: "Define metas de facturación mensual y visualiza gráficas de rendimiento individual de los profesionales para evaluar su productividad."
  },
  "#tour-finance-payroll-tab": {
    title: "Cálculo de Nóminas y Comisiones",
    content: "Genera el reporte de pagos mensuales sumando el sueldo base y el cálculo automático de la comisión del 10% de las ventas cobradas por cada profesional."
  },
  "#tour-finance-promotions-tab": {
    title: "Campaña de Promociones y Descuentos",
    content: "Crea y administra promociones activas (descuento directo sobre servicios de forma temporal) y cupones de descuento manuales."
  },
  "#tour-topbar-search": {
    title: "Buscador Rápido de Pacientes",
    content: "Escribe el nombre o teléfono de un paciente para localizar su expediente de forma instantánea desde cualquier pantalla."
  },
  "#tour-topbar-sync": {
    title: "Estado de Sincronización en la Nube",
    content: "Verifica si el sistema está en red. Si se interrumpe la conexión, los datos se guardan de forma local en tu navegador y se sincronizan al volver a tener internet."
  },
  "#tour-topbar-tutorial": {
    title: "Lanzador de Tutorial Guiado",
    content: "Presiona para activar el asistente virtual interactivo que te enseñará el funcionamiento de la vista que estás usando en este momento."
  },
  "#tour-topbar-puntero": {
    title: "Puntero de Ayuda Contextual",
    content: "Toma el control del asistente. Úsalo para hacer clic en componentes individuales de la pantalla y resolver tus dudas de uso sin salir del flujo de trabajo."
  },
  "#tour-topbar-helpcenter": {
    title: "Centro de Ayuda y Soporte Offline",
    content: "Acceso a manuales estructurados, preguntas frecuentes (FAQs), y guías de uso paso a paso ordenadas de forma temática."
  },
  "#tour-topbar-bell": {
    title: "Buzón de Notificaciones del Sistema",
    content: "Alertas críticas sobre desabastecimiento de stock de insumos o recordatorios de vencimiento de tratamientos estéticos."
  },
  "#tour-dashboard-branch": {
    title: "Selector de Sucursal Activa",
    content: "Menú para cambiar entre las sucursales de la clínica. Toda la base de datos de citas, profesionales y facturación se filtrará para la sucursal seleccionada."
  },
  "#tour-sidebar": {
    title: "Menú de Navegación Lateral",
    content: "Permite desplazarse rápidamente entre todos los módulos operativos y administrativos del centro clínico."
  },
  "#tour-user-footer": {
    title: "Perfil de Usuario Conectado",
    content: "Muestra tu nombre, avatar y rol de seguridad en el sistema. Puedes acceder desde aquí a la configuración de tus datos personales."
  },
  "#tour-dashboard-kpi": {
    title: "Métricas Clave (KPIs)",
    content: "Panel de indicadores clave del día. Muestra las citas agendadas, facturación neta en tiempo real, total de pacientes y alertas de bajo stock en inventario."
  },
  "#tour-dashboard-chart": {
    title: "Gráfico de Facturación Semanal",
    content: "Gráfica evolutiva que muestra los ingresos diarios acumulados durante la semana corriente para detectar picos y tendencias."
  },
  "#tour-calendar-cabins": {
    title: "Filtro de Cabinas (Boxes)",
    content: "Selector para alternar entre vista semanal de agenda y vista por cabinas físicas diarias, facilitando la asignación de espacios de tratamiento."
  },
  "#tour-calendar-grid": {
    title: "Cuadrícula de la Agenda",
    content: "Línea de tiempo interactiva. Haz clic en espacios vacíos para crear citas o arrastra reservas existentes para reprogramar horas y evitar colisiones."
  },
  "#tour-calendar-create-btn": {
    title: "Botón Nueva Cita",
    content: "Abre el panel lateral (Slide-over) de Nueva Cita para registrar una reserva de forma rápida y manual."
  },
  "#tour-calendar-drawer-patient": {
    title: "Buscador de Paciente (Nueva Cita)",
    content: "Campo de búsqueda en tiempo real para buscar a un paciente por nombre o teléfono y asignarle la nueva cita."
  },
  "#tour-calendar-drawer-specialist": {
    title: "Selección de Especialista (Nueva Cita)",
    content: "Lista de profesionales disponibles para asignar la cita. Permite calcular la comisión del 10% de forma automatizada al finalizar."
  },
  "#tour-calendar-drawer-cabin": {
    title: "Asignación de Cabina (Nueva Cita)",
    content: "Reserva una sala física de tratamiento (box) para asegurar que el equipamiento o espacio esté disponible de forma exclusiva."
  },
  "#tour-calendar-drawer-time": {
    title: "Programación de Hora y Duración",
    content: "Permite seleccionar un slot de tiempo predeterminado o ingresar una hora exacta del tratamiento con su duración estimada."
  },
  "#tour-calendar-drawer-submit": {
    title: "Confirmar Nueva Cita",
    content: "Haz clic para validar el formulario. Si no hay colisión de cabina o profesional, la cita se agregará inmediatamente a la agenda."
  },
  "#tour-patients-list": {
    title: "Expedientes y CRM de Pacientes",
    content: "Listado interactivo de pacientes registrados. Permite buscar en tiempo real, verificar firmas de consentimiento y ver la ficha individual."
  },
  "#tour-patients-register-btn": {
    title: "Registrar Nueva Sesión",
    content: "Botón para abrir el formulario de sesión evolutiva. Permite descontar una sesión de bono e ingresar mediciones."
  },
  "#tour-tab-historial": {
    title: "Pestaña Historial Clínico",
    content: "Visualiza los antecedentes médicos, patologías previas y anamnesis inicial ingresada en la ficha del paciente."
  },
  "#tour-tab-evolucion": {
    title: "Pestaña de Evolución Clínica",
    content: "Bitácora cronológica con las notas de progreso de todas las sesiones realizadas, incluyendo peso, medidas corporales y parámetros láser."
  },
  "#tour-tab-consentimiento": {
    title: "Pestaña de Consentimiento Clínico",
    content: "Sección legal para redactar contratos informados de tratamientos estéticos y capturar la firma digital del paciente."
  },
  "#tour-tab-galeria": {
    title: "Pestaña de Galería Fotográfica",
    content: "Muro de control visual que ordena las fotos por 'Antes' (Control Inicial) y 'Después' (Control Evolutivo) con sus respectivas notas."
  },
  "#tour-tab-facturacion": {
    title: "Pestaña de Historial de Facturación",
    content: "Muestra las boletas de cobro emitidas y los paquetes de bonos multisesión contratados por el paciente."
  },
  "#tour-patients-consent-canvas": {
    title: "Lienzo de Firma Digital Autógrafa",
    content: "Rectángulo interactivo donde el paciente estampa su firma manuscrita digitalizada usando el mouse o una pantalla táctil."
  },
  "#tour-patients-consent-submit": {
    title: "Confirmar y Guardar Firma Legal",
    content: "Archiva el consentimiento con la firma digitalizada de forma inmutable y actualiza el estado de cumplimiento del expediente."
  },
  "#tour-session-modal": {
    title: "Formulario Registrar Sesión",
    content: "Panel modal para documentar el progreso de la sesión de hoy del paciente y descontar la unidad correspondiente de su bono."
  },
  "#tour-session-modal-notes": {
    title: "Notas de Evolución (Registrar Sesión)",
    content: "Escribe detalladamente las observaciones clínicas de la sesión, la tolerancia al tratamiento y el progreso del paciente."
  },
  "#tour-session-modal-measurements": {
    title: "Mediciones Antropométricas (Registrar Sesión)",
    content: "Registra el peso en kg, perímetro de cintura y cadera para el análisis evolutivo de tratamientos de reducción corporal."
  },
  "#tour-session-modal-laser": {
    title: "Parámetros de Láser (Registrar Sesión)",
    content: "Registra Joules de fluencia, spot y cantidad de disparos de aparatología láser para llevar el control de dosis técnica."
  },
  "#tour-session-modal-submit": {
    title: "Guardar y Descontar Sesión",
    content: "Guarda la bitácora evolutiva de la sesión en el expediente y descuenta automáticamente una sesión del bono de tratamientos."
  },
  "#tour-pos-terminal": {
    title: "Terminal de Venta (POS)",
    content: "Carrito de cobros reactivo. Agrega servicios del catálogo, productos en venta directa y selecciona el paciente para generar el ticket."
  },
  "#tour-pos-coupons": {
    title: "Selector de Impuestos y Cupones",
    content: "Aplica descuentos manuales, cupones promocionales y selecciona si el ticket es Comprobante Interno o Factura Fiscal SAT/AFIP."
  },
  "#tour-pos-cash": {
    title: "Arqueo de Caja Chica",
    content: "Control diario de efectivo y tarjetas. Permite realizar aperturas con fondos iniciales, ingresar egresos rápidos y efectuar conciliaciones."
  },
  "#tour-pos-payroll": {
    title: "Módulo de Nóminas y Comisiones",
    content: "Listado de liquidación salarial. Calcula el salario base más las comisiones automáticas del 10% ganadas por tratamientos ejecutados."
  },
  "#tour-inventory-catalog": {
    title: "Inventario de Almacén",
    content: "Catálogo de insumos clínicos y productos comerciales. Muestra stock disponible y emite alertas visuales si cae por debajo del mínimo."
  },
  "#tour-inventory-wastes": {
    title: "Historial de Consumos y Mermas",
    content: "Bitácora de movimientos. Registra entradas de proveedores, mermas manuales por daño y consumos automáticos en cabina."
  },
  "#tour-services-supplies": {
    title: "Administración de Tratamientos",
    content: "Catálogo de servicios clínicos. Permite configurar la duración del tratamiento, precio de lista y vincular insumos consumibles automáticos."
  },
  "#tour-services-packages": {
    title: "Configuración de Bonos",
    content: "Creador de paquetes multisesión (ej. 10 sesiones de depilación láser) con precios preferenciales para incentivar compras recurrentes."
  },
  "#tour-reports-kpi": {
    title: "Dashboard de Reportes Financieros",
    content: "Métricas de rentabilidad acumuladas. Muestra los ingresos netos, gastos totales, egresos de nómina y el valor contable de tu stock."
  },
  "#tour-reports-charts": {
    title: "Gráficos Estadísticos Dinámicos",
    content: "Representación visual del origen de ingresos por sucursal, categorías de servicios más demandados y distribución de métodos de pago."
  },
  "#tour-reports-export": {
    title: "Exportación de Datos Contables",
    content: "Generador de archivos CSV auditables con reportes de ventas generales, bitácora de caja y nóminas pagadas en el mes."
  },
  "aside": {
    title: "Barra Lateral de Navegación",
    content: "Permite cambiar rápidamente de módulo clínico (Dashboard, Agenda, Fichas de Pacientes, POS de Caja, Almacén, Servicios, Reportes)."
  },
  "header": {
    title: "Barra Superior de Control (Header)",
    content: "Muestra el estado de la conexión en red (offline/online), barra de búsqueda general de pacientes, notificaciones y botones de tutorial."
  }
};

// ==========================================
// 5. GUÍAS VISUALES POR SECCIÓN (SCREEN_GUIDES)
// ==========================================
export const SCREEN_GUIDES: ScreenGuide[] = [
  {
    key: "dashboard",
    title: "Dashboard Principal",
    description: "Indicadores clave, facturación diaria y ocupación en tiempo real de tu centro.",
    icon: LayoutDashboard,
  },
  {
    key: "calendar",
    title: "Calendario y Citas",
    description: "Agenda citas, asigna profesionales, controla cabinas y evita solapamientos horaria.",
    icon: CalendarDays,
  },
  {
    key: "patients",
    title: "Gestión de Pacientes",
    description: "Fichas de clientes, historial de evoluciones clínicas, carga de fotos antes/después y firmas de consentimiento.",
    icon: Users,
  },
  {
    key: "pos",
    title: "Caja y Terminal POS",
    description: "Venta de servicios y productos, control de arqueo y liquidación de nóminas/comisiones.",
    icon: Receipt,
  },
  {
    key: "inventory",
    title: "Inventario e Insumos",
    description: "Control de stock en almacén, alertas de stock mínimo y registro de mermas o roturas.",
    icon: Package,
  },
  {
    key: "services",
    title: "Servicios y Bonos",
    description: "Catálogo de tratamientos, bonos multisesión e insumos vinculados para deducción automática.",
    icon: Sparkles,
  },
  {
    key: "reports",
    title: "Reportes y Analíticas",
    description: "Exportación contable, balances financieros y KPIs avanzados para auditoría del negocio.",
    icon: BarChart3,
  },
  {
    key: "config",
    title: "Ajustes y Configuración",
    description: "Gestión de profesionales, horarios de trabajo de staff, datos de la clínica y templates de WhatsApp.",
    icon: Settings,
  },
  {
    key: "saas",
    title: "Consola de SuperAdmin",
    description: "Mantenimiento y supervisión global del entorno multi-tenant SaaS de clínicas asociadas.",
    icon: ShieldAlert,
  },
  {
    key: "login",
    title: "Login y Seguridad",
    description: "Procedimiento de autenticación segura de profesionales y roles al sistema.",
    icon: LogIn,
  },
  {
    key: "portal",
    title: "Portal de Pacientes",
    description: "Plataforma pública de autoservicio de reserva de turnos en línea.",
    icon: Globe,
  }
];

// ==========================================
// 6. MANUALES DE ROLES (ROLE_GUIDES)
// ==========================================
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

// ==========================================
// 7. PREGUNTAS FRECUENTES (FAQ_ITEMS)
// ==========================================
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
