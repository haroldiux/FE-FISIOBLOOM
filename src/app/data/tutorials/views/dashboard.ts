import { TourStep } from "../types";

export const dashboardTour: TourStep[] = [
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
    selector: "#tour-topbar-helpcenter",
    title: "Asistente del Módulo",
    content: "Haz clic en este botón cuando quieras repetir el tour interactivo de la vista que estás visualizando.",
    position: "bottom"
  },
  {
    selector: '[data-tour="profile-menu"]',
    title: "Menú de Perfil de Usuario",
    content: "Haz clic en tu avatar en la barra superior para desplegar tu menú de perfil. Aquí podrás modificar tus datos personales en 'Mi Perfil' o cerrar sesión.",
    position: "bottom"
  }
];
