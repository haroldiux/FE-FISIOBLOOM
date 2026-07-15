import type { OnboardingPhase } from './adminFlow';

export const superAdminFlow: OnboardingPhase[] = [
  {
    id: 'dashboard',
    title: 'Vista Global',
    icon: '📊',
    screen: 'dashboard',
    steps: [
      {
        id: 'dashboard-overview',
        targetId: 'dashboard-kpis',
        title: 'Vista Global',
        description: 'Como Super Admin tenés acceso al panel de gestión con la visión consolidada de todas las clínicas de la plataforma.',
        screen: 'dashboard',
        placement: 'bottom',
      },
      {
        id: 'dashboard-appointments',
        targetId: 'dashboard-today-appointments',
        title: 'Citas Consolidadas',
        description: 'Acá ves las citas del día a través de todas las clínicas inquilinas. Útil para detectar problemas operativos a nivel plataforma.',
        screen: 'dashboard',
        placement: 'bottom',
      },
    ],
  },
  {
    id: 'saas',
    title: 'Consola SaaS',
    icon: '🏢',
    screen: 'saas',
    steps: [
      {
        id: 'saas-stats',
        targetId: 'tour-saas-stats',
        title: 'Estadísticas de Plataforma',
        description: 'Resumen de clínicas activas, inactivas, MRR y crecimiento mensual. Estos KPIs te permiten tomar decisiones de negocio.',
        screen: 'saas',
        placement: 'bottom',
      },
      {
        id: 'saas-tenants',
        targetId: 'tour-saas-tenant-list',
        title: 'Panel de Inquilinos',
        description: 'Listado de todas las clínicas registradas con su estado operativo, plan de suscripción y consumo de recursos. Hacé clic en una para ver detalles.',
        screen: 'saas',
        placement: 'top',
      },
      {
        id: 'saas-new-tenant',
        targetId: 'tour-saas-create-tenant-btn',
        title: 'Provisionar Nueva Clínica',
        description: 'Creá una nueva clínica en la plataforma. El sistema generará una base de datos aislada, configurará el subdominio y enviará las credenciales al administrador.',
        screen: 'saas',
        placement: 'left',
      },
      {
        id: 'saas-tenant-detail',
        targetId: 'tour-saas-tenant-list',
        title: 'Detalle de Inquilino',
        description: 'Al hacer clic en una clínica, accedés a su panel de control con métricas individuales, planes contratados y acciones administrativas (suspender, transferir, eliminar).',
        screen: 'saas',
        placement: 'top',
      },
    ],
  },
  {
    id: 'config',
    title: 'Configuración Global',
    icon: '⚙️',
    screen: 'config',
    steps: [
      {
        id: 'config-clinic-tab',
        targetId: 'config-tab-clinic',
        title: 'Parámetros Globales',
        description: 'Desde acá configurás los parámetros por defecto que se aplican a todas las clínicas nuevas: país, moneda, idioma, formato de fecha y módulos habilitados.',
        screen: 'config',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'clinic' }
      },
      {
        id: 'config-features',
        targetId: 'config-features-toggles',
        title: 'Módulos por Plan',
        description: 'Activá o desactivá módulos (POS, inventario, multi-sucursal, WhatsApp) según el plan contratado por cada tipo de suscripción.',
        screen: 'config',
        placement: 'top',
        action: { type: 'switch-tab', tab: 'clinic' }
      },
      {
        id: 'config-whatsapp-tab',
        targetId: 'config-tab-whatsapp',
        title: 'Mensajería Masiva',
        description: 'Configurá las plantillas de WhatsApp Business que estarán disponibles para todas las clínicas. Incluye mensajes de bienvenida, recordatorios y encuestas.',
        screen: 'config',
        placement: 'bottom',
        action: { type: 'switch-tab', tab: 'whatsapp' }
      },
    ],
  },
  {
    id: 'reports',
    title: 'Reportes Consolidados',
    icon: '📈',
    screen: 'reports',
    steps: [
      {
        id: 'reports-kpis',
        targetId: 'reports-kpis',
        title: 'KPIs Cross-Tenant',
        description: 'Indicadores financieros consolidados de toda la plataforma: MRR, churn, ticket promedio y crecimiento neto.',
        screen: 'reports',
        placement: 'bottom',
      },
      {
        id: 'reports-charts',
        targetId: 'tour-reports-charts',
        title: 'Gráficos de Tendencia',
        description: 'Visualizá la evolución temporal de los indicadores clave. Compará períodos para identificar tendencias y tomar decisiones estratégicas.',
        screen: 'reports',
        placement: 'top',
      },
      {
        id: 'reports-export',
        targetId: 'reports-export',
        title: 'Exportar a Contabilidad',
        description: 'Descargá reportes detallados en CSV/Excel para tu contabilidad, auditoría o análisis externo. Incluyen detalle por clínica.',
        screen: 'reports',
        placement: 'left',
      },
    ],
  },
];
