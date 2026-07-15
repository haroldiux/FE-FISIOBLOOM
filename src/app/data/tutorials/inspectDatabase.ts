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
    content: "Acceso de reportes contables del mes, gráficos de métodos de pago y exportación de archivos CSV para administración."
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
    content: "Lista de bonos de tratamiento (por ejemplo, 10 sesiones de depilación láser) con un precio global preferencial y vigencia de expiración configurable."
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
    content: "Abre el modal del Centro de Ayuda con buscador contextual, guías de pantalla, flujos de trabajo por rol y preguntas frecuentes. Cuando la vista actual tiene un tour dedicado, también muestra el acceso directo 'Iniciar tutorial de esta pantalla'."
  },
  "#tour-helpcenter-guides-tab": {
    title: "Pestaña Guías de Pantalla",
    content: "Lista todas las vistas operativas del sistema (Dashboard, Calendario, Pacientes, POS, Inventario, Servicios, Reportes, Ajustes, Consola SaaS, Login, Portal de Pacientes) con su descripción funcional y, cuando hay tour disponible, el botón 'Iniciar'."
  },
  "#tour-helpcenter-search-input": {
    title: "Buscador Contextual del Centro de Ayuda",
    content: "Escribe dos o más caracteres para filtrar fuzzy entre guías, flujos de trabajo, manuales de rol y preguntas frecuentes en una sola lista unificada. Los flujos no permitidos para tu rol se ocultan automáticamente."
  },
  "#tour-helpcenter-launch-btn": {
    title: "Acceso Rápido al Tutorial de la Vista Actual",
    content: "Botón 'Iniciar tutorial de esta pantalla' que aparece en la parte superior del Centro de Ayuda solo cuando la vista actual tiene un tour dedicado. Lanza el spotlight de TourOrchestrator sobre los elementos clave sin tener que buscar el flujo en las pestañas."
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
    content: "Abre the panel lateral (Slide-over) de Nueva Cita para registrar una reserva de forma rápida y manual."
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
    content: "Guardar la bitácora evolutiva de la sesión en el expediente y descuenta automáticamente una sesión del bono de tratamientos."
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
