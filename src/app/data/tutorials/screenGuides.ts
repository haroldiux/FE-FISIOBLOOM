import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Receipt,
  Package,
  Sparkles,
  BarChart3,
  Settings,
  ShieldAlert,
  LogIn,
  Globe,
} from "lucide-react";
import { ScreenGuide } from "./types";

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
