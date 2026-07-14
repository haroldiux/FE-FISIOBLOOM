import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Receipt,
  Package,
  Sparkles,
  BarChart3,
  Search,
  X,
  ChevronDown,
  Play,
  HelpCircle,
  ShieldAlert,
  UserCheck,
  CloudLightning,
  CheckCircle,
  Database,
  ArrowRight,
  User,
  Settings,
  GitBranch,
  Shield,
  BookOpen,
} from "lucide-react";
import { useTutorial } from "../context/TutorialContext";
import { useAuth } from "../context/AuthContext";
import {
  SCREEN_GUIDES,
  ROLE_GUIDES,
  FAQ_ITEMS,
  WORKFLOW_TOURS,
  ROLE_ONBOARDING_TOURS,
  FAQItem,
  ScreenGuide,
  RoleGuide
} from "../data/tutorialData";

interface HelpCenterModalProps {
  activeScreen: string;
}

function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-muted/30 hover:border-primary hover:bg-muted/70 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left font-semibold text-foreground hover:text-primary transition-colors duration-200 cursor-pointer"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        <span className="pr-4 text-sm md:text-base">{item.question}</span>
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 transition-colors">
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${
              isOpen ? "rotate-180 text-primary" : ""
            }`}
          />
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-5 pt-0 text-xs md:text-sm text-muted-foreground leading-relaxed border-t border-border mt-1">
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PlaybookTask {
  title: string;
  description: string;
  actionText: string;
  tourType: "workflow" | "view";
  tourKey: string;
}

interface RolePlaybook {
  roleName: string;
  roleKey: "ADMIN" | "RECEPTIONIST" | "PHYSIO" | "AESTHETICIAN";
  description: string;
  colorClass: string;
  icon: React.ComponentType<any>;
  tasks: PlaybookTask[];
}

const PLAYBOOKS: Record<string, RolePlaybook> = {
  ADMIN: {
    roleName: "Administrador / Director Médico",
    roleKey: "ADMIN",
    description: "Controla la configuración clínica global, stock de insumos, nóminas de comisiones y métricas estratégicas.",
    colorClass: "from-fuchsia-500/10 to-pink-500/10 border-fuchsia-500/20 hover:border-fuchsia-500/50 text-fuchsia-500",
    icon: Shield,
    tasks: [
      {
        title: "1. Registrar Profesionales y Staff",
        description: "Dar de alta nuevos terapeutas o esteticistas y configurar sus horarios laborales y comisiones.",
        actionText: "Ver cómo configurar profesionales",
        tourType: "view",
        tourKey: "config"
      },
      {
        title: "2. Gestión de Almacén e Inventario",
        description: "Supervisar niveles de stock, registrar mermas manuales e ingresar facturas de proveedores.",
        actionText: "Ver cómo gestionar stock",
        tourType: "view",
        tourKey: "inventory"
      },
      {
        title: "3. Crear Servicios y Recetas de Consumos",
        description: "Dar de alta tratamientos y vincular los productos de stock que se restan automáticamente en cabina.",
        actionText: "Ver cómo crear consumos",
        tourType: "workflow",
        tourKey: "create-service"
      },
      {
        title: "4. Liquidar Nóminas y Comisiones",
        description: "Revisar comisiones acumuladas del 10% y liquidar sueldos del staff.",
        actionText: "Ver cómo liquidar nóminas",
        tourType: "workflow",
        tourKey: "payroll-settlement"
      },
      {
        title: "5. Activar Daemon de WhatsApp Meta",
        description: "Conectar credenciales de WhatsApp Business y habilitar webhooks para confirmación automática.",
        actionText: "Ver cómo conectar WhatsApp",
        tourType: "workflow",
        tourKey: "whatsapp-integration"
      }
    ]
  },
  RECEPTIONIST: {
    roleName: "Recepcionista / Front Desk",
    roleKey: "RECEPTIONIST",
    description: "Administra el calendario de reservas, la recepción de clientes, cobros de POS y arqueo de caja chica.",
    colorClass: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 hover:border-blue-500/50 text-blue-500",
    icon: Users,
    tasks: [
      {
        title: "1. Agendar y Reprogramar Citas",
        description: "Crear citas asignando especialistas, cabinas físicas y resolviendo colisiones horarias en la agenda.",
        actionText: "Ver cómo agendar citas",
        tourType: "workflow",
        tourKey: "create-appointment"
      },
      {
        title: "2. Registrar Nuevos Pacientes (CRM)",
        description: "Dar de alta expedientes de pacientes recopilando datos de contacto y antecedentes médicos.",
        actionText: "Ver cómo registrar pacientes",
        tourType: "workflow",
        tourKey: "register-patient"
      },
      {
        title: "3. Cobrar Ventas y Bonos en POS",
        description: "Procesar cobros rápidos de productos y tratamientos, y aplicar descuentos o cupones.",
        actionText: "Ver cómo cobrar en POS",
        tourType: "workflow",
        tourKey: "pos-sale"
      },
      {
        title: "4. Apertura y Arqueo de Caja Chica",
        description: "Abrir caja con saldo inicial, registrar salidas por gastos menudos y procesar arqueo de cierre.",
        actionText: "Ver cómo arquear la caja",
        tourType: "workflow",
        tourKey: "cash-register"
      }
    ]
  },
  PHYSIO: {
    roleName: "Fisioterapeuta / Clínico",
    roleKey: "PHYSIO",
    description: "Registra evoluciones clínicas de sesiones de tratamiento, historial clínico y notas de evolución física.",
    colorClass: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-emerald-500/50 text-emerald-500",
    icon: UserCheck,
    tasks: [
      {
        title: "1. Registrar Nota de Evolución Clínica",
        description: "Crear una nueva entrada evolutiva del día, descontar sesiones de bonos e ingresar mediciones antropométricas.",
        actionText: "Ver cómo registrar evolución",
        tourType: "workflow",
        tourKey: "record-session"
      },
      {
        title: "2. Navegar y Filtrar Expedientes",
        description: "Consultar la ficha, buscar pacientes y verificar antecedentes clínicos de forma rápida.",
        actionText: "Ver cómo explorar fichas",
        tourType: "view",
        tourKey: "patients"
      }
    ]
  },
  AESTHETICIAN: {
    roleName: "Esteticista / Especialista Láser",
    roleKey: "AESTHETICIAN",
    description: "Operar aparatología, gestionar el consentimiento informado legal y realizar el registro visual Antes/Después.",
    colorClass: "from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/50 text-amber-500",
    icon: Sparkles,
    tasks: [
      {
        title: "1. Capturar Firma de Consentimiento Legal",
        description: "Redactar contratos de tratamientos y recolectar la firma digitalizada manuscrita del paciente.",
        actionText: "Ver cómo firmar consentimiento",
        tourType: "workflow",
        tourKey: "sign-consent"
      },
      {
        title: "2. Cargar Fotos del Cambio (Evolución Visual)",
        description: "Subir fotografías Antes / Después a la galería ordenadas cronológicamente para documentar el progreso.",
        actionText: "Ver cómo gestionar galería",
        tourType: "workflow",
        tourKey: "upload-gallery"
      },
      {
        title: "3. Sincronizar Galería Offline",
        description: "Resolver la subida de fotos guardadas localmente en caché si se interrumpió la red en cabina.",
        actionText: "Ver cómo sincronizar fotos offline",
        tourType: "workflow",
        tourKey: "offline-photo-sync"
      }
    ]
  }
};

const ROLE_ALLOWED_SCREENS: Record<string, string[]> = {
  SUPER_ADMIN: ["dashboard", "saas"],
  ADMIN: ["dashboard", "calendar", "patients", "consents", "pos", "inventory", "services", "reports", "config"],
  RECEPTIONIST: ["dashboard", "calendar", "patients", "consents", "pos"],
  PHYSIO: ["dashboard", "calendar", "patients", "consents"],
  AESTHETICIAN: ["dashboard", "calendar", "patients", "consents"],
};

const WORKFLOW_TARGET_SCREENS: Record<string, string> = {
  "create-appointment": "calendar",
  "register-patient": "patients",
  "record-session": "patients",
  "sign-consent": "consents",
  "upload-gallery": "patients",
  "pos-sale": "pos",
  "cash-register": "pos",
  "staff-attendance": "pos",
  "payroll-calc": "pos",
  "promotion-setup": "pos",
  "inventory-depletion": "inventory",
  "service-setup": "services",
  "whatsapp-setup": "config",
  "offline-photo-sync": "patients",
};

export default function HelpCenterModal({ activeScreen }: HelpCenterModalProps) {
  const {
    isHelpCenterOpen,
    closeHelpCenter,
    startViewTour,
    startWorkflowTour,
    startRoleOnboarding,
    seenOnboardings
  } = useTutorial();

  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"guides" | "workflows" | "roles" | "sync" | "faqs">("guides");
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "RECEPTIONIST" | "PHYSIO" | "AESTHETICIAN">("ADMIN");

  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role === "SUPER_ADMIN" ? "ADMIN" : user.role as any);
    }
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeHelpCenter();
      }
    };
    if (isHelpCenterOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isHelpCenterOpen, closeHelpCenter]);

  // Reset tab when modal opens
  useEffect(() => {
    if (isHelpCenterOpen) {
      setActiveTab("guides");
      setSearchQuery("");
    }
  }, [isHelpCenterOpen]);

  if (!isHelpCenterOpen) return null;

  const query = searchQuery.trim().toLowerCase();

  // Role-based filtering constraints
  const allowedScreenKeys = user 
    ? [...(ROLE_ALLOWED_SCREENS[user.role] || ["dashboard"]), "login", "portal"]
    : ["dashboard", "login", "portal"];

  const userScreenGuides = SCREEN_GUIDES.filter((g) => allowedScreenKeys.includes(g.key));

  const userWorkflowKeys = Object.keys(WORKFLOW_TOURS).filter((key) => {
    const targetScreen = WORKFLOW_TARGET_SCREENS[key];
    return !targetScreen || allowedScreenKeys.includes(targetScreen);
  });

  const userRoleGuides = (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN")
    ? ROLE_GUIDES
    : ROLE_GUIDES.filter((r) => r.roleKey === user?.role);

  // Filter content using the restricted lists
  const filteredGuides = userScreenGuides.filter(
    (g) =>
      g.title.toLowerCase().includes(query) ||
      g.description.toLowerCase().includes(query)
  );

  const filteredFAQs = FAQ_ITEMS.filter(
    (f) =>
      f.question.toLowerCase().includes(query) ||
      f.answer.toLowerCase().includes(query) ||
      f.category.toLowerCase().includes(query)
  );

  const filteredRoles = userRoleGuides.filter(
    (r) =>
      r.roleName.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.actions.some((a) => a.toLowerCase().includes(query)) ||
      r.example.toLowerCase().includes(query)
  );

  // Filter workflows using restricted keys
  const filteredWorkflows = userWorkflowKeys.filter((key) => {
    const friendlyName = key.replace("-", " ");
    return friendlyName.toLowerCase().includes(query) || key.toLowerCase().includes(query);
  });

  const isSearching = query.length > 0;
  const hasResults =
    filteredGuides.length > 0 ||
    filteredFAQs.length > 0 ||
    filteredRoles.length > 0 ||
    filteredWorkflows.length > 0;

  // Friendly names for workflows
  const getWorkflowFriendlyName = (key: string): string => {
    const mapping: Record<string, string> = {
      "create-appointment": "Crear Cita en Calendario",
      "register-patient": "Registrar Nuevo Paciente (CRM)",
      "record-session": "Registrar Sesión de Evolución Clínica",
      "sign-consent": "Firmar Consentimiento Informado",
      "upload-gallery": "Cargar Fotos Antes/Después",
      "pos-sale": "Cobrar Tratamiento o Venta en POS",
      "cash-register": "Apertura, Gastos y Cierre de Caja",
      "create-service": "Crear Servicio y Cargar Consumos",
      "offline-photo-sync": "Sincronización Offline de Fotos de Evolución",
      "whatsapp-integration": "Integración y Webhooks de WhatsApp",
      "payroll-settlement": "Cálculo y Liquidación de Nóminas/Comisiones"
    };
    return mapping[key] || key.replace("-", " ");
  };

  const currentRole = user?.role || "ADMIN";
  const userHasSeenOnboarding = seenOnboardings.includes(currentRole);

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-card/60 backdrop-blur-md transition-opacity duration-300">
      {/* Modal Container */}
      <div
        className="bg-card rounded-3xl border border-border w-full max-w-5xl shadow-2xl flex flex-col h-[85vh] max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between flex-shrink-0 bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center animate-pulse">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Centro de Inducción y Ayuda Interactiva
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Conoce las herramientas y flujos del centro clínico adaptados a tu rol
              </p>
            </div>
          </div>
          <button
            onClick={closeHelpCenter}
            className="w-9 h-9 rounded-full bg-muted hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-transparent hover:border-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-border bg-card flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por comisiones, caja, offline, consentimientos, pacientes, reportes..."
              className="w-full pl-11 pr-10 py-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground text-foreground transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        {!isSearching && (
          <div className="flex border-b border-border bg-muted/20 px-6 py-2.5 gap-2 overflow-x-auto flex-shrink-0 scrollbar-none">
            <button
              onClick={() => setActiveTab("guides")}
              className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "guides"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Guías por Vista</span>
            </button>
            <button
              onClick={() => setActiveTab("workflows")}
              className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "workflows"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Flujos CRUD</span>
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "roles"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Manual y Onboarding</span>
            </button>
            <button
              onClick={() => setActiveTab("sync")}
              className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "sync"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <CloudLightning className="w-4 h-4" />
              <span>Modo Offline</span>
            </button>
            <button
              onClick={() => setActiveTab("faqs")}
              className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "faqs"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>FAQs</span>
            </button>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-card [&::-webkit-scrollbar]:hidden">
          {isSearching ? (
            // Search Results Layout
            <div className="space-y-6 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Resultados de búsqueda para "{searchQuery}"
              </h3>

              {!hasResults ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3 border border-border">
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">
                    No encontramos coincidencias
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">
                    Prueba buscando términos como "comisiones", "caja", "offline", "citas" o "consentimientos".
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Guides Results */}
                  {filteredGuides.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded-full bg-primary" />
                        Guías de Interfaz
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredGuides.map((guide) => (
                          <div key={guide.key} className="p-4 rounded-2xl border border-border bg-muted/30 flex justify-between items-start gap-4">
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                                <guide.icon className="w-4.5 h-4.5" />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-foreground">{guide.title}</h5>
                                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{guide.description}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => startViewTour(guide.key)}
                              className="px-3 py-1.5 bg-muted hover:bg-primary hover:text-primary-foreground text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1"
                            >
                              <span>Iniciar</span>
                              <Play className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Workflows Results */}
                  {filteredWorkflows.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded-full bg-primary" />
                        Flujos CRUD
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredWorkflows.map((key) => (
                          <div key={key} className="p-4 rounded-2xl border border-border bg-muted/30 flex justify-between items-start gap-4">
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-foreground">{getWorkflowFriendlyName(key)}</h5>
                                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                                  Sigue este tutorial interactivo paso a paso sobre cómo realizar este registro.
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => startWorkflowTour(key)}
                              className="px-3 py-1.5 bg-muted hover:bg-primary hover:text-primary-foreground text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1"
                            >
                              <span>Iniciar</span>
                              <Play className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Roles Results */}
                  {filteredRoles.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded-full bg-secondary" />
                        Manuales de Roles
                      </h4>
                      <div className="space-y-3">
                        {filteredRoles.map((role) => (
                          <div key={role.roleKey} className="p-5 rounded-2xl border border-border bg-muted/20 space-y-3">
                            <h5 className="text-xs font-bold text-foreground">{role.roleName}</h5>
                            <p className="text-xs text-muted-foreground">{role.description}</p>
                            <div className="text-[11px] text-muted-foreground bg-muted/50 p-3 rounded-xl">
                              <strong className="text-foreground block mb-1">Ejemplo práctico de flujo:</strong>
                              {role.example}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FAQs Results */}
                  {filteredFAQs.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded-full bg-warning" />
                        Preguntas Frecuentes
                      </h4>
                      <div className="space-y-3">
                        {filteredFAQs.map((faq) => (
                          <FAQAccordionItem key={faq.question} item={faq} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Tabs Layout
            <div className="h-full">
              {/* TAB 1: SCREEN GUIDES */}
              {activeTab === "guides" && (() => {
                const currentGuide = userScreenGuides.find((g) => g.key === activeScreen);
                const otherGuides = userScreenGuides.filter((g) => g.key !== activeScreen);

                return (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-5 rounded-full bg-primary" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        Guías Visuales por Sección
                      </h3>
                    </div>

                    {/* Featured Active Screen Guide */}
                    {currentGuide && (() => {
                      const Icon = currentGuide.icon;
                      return (
                        <div className="p-6 rounded-2xl border-2 border-primary bg-primary/[0.02] shadow-md shadow-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-5 animate-in zoom-in-95 duration-200">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center flex-shrink-0 animate-pulse">
                              <Icon className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base font-black text-foreground">
                                  {currentGuide.title}
                                </h4>
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                                  Recomendado para tu Vista Actual
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 max-w-xl font-medium">
                                {currentGuide.description} Sigue este tutorial interactivo para aprender paso a paso a usar este módulo del sistema.
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => startViewTour(currentGuide.key)}
                            className="px-5 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-primary/20 hover:scale-[1.02] hover:shadow-primary/30 transition-all flex items-center gap-2 self-start md:self-center flex-shrink-0"
                          >
                            <span>Iniciar Guía de Vista</span>
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      );
                    })()}

                    {/* Other Guides list */}
                    <div className="space-y-3.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                        Otras Guías del Sistema
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {otherGuides.map((guide) => {
                          const Icon = guide.icon;
                          return (
                            <div
                              key={guide.key}
                              className="group p-5 rounded-2xl border bg-muted/20 border-border hover:border-primary hover:bg-muted/40 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="flex items-start gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-foreground">
                                    {guide.title}
                                  </h4>
                                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 font-medium">
                                    {guide.description}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => startViewTour(guide.key)}
                                className="sm:self-center flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-muted hover:bg-accent text-foreground transition-all cursor-pointer"
                              >
                                <span>Iniciar Guía</span>
                                <Play className="w-3 h-3 fill-current" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 2: WORKFLOWS */}
              {activeTab === "workflows" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-5 rounded-full bg-primary" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                      Tutoriales de Procesos Clínicos y Operaciones (CRUD)
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                    Aprende a realizar registros específicos del día a día, como crear citas de forma segura, registrar consentimientos informados de pacientes o cobrar un servicio en el terminal de venta.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {userWorkflowKeys.map((key) => (
                      <div
                        key={key}
                        className="group p-5 rounded-2xl border bg-muted/20 border-border hover:border-primary hover:bg-muted/40 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground">
                              {getWorkflowFriendlyName(key)}
                            </h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 font-medium">
                              Proceso interactivo y dinámico de {WORKFLOW_TOURS[key].length} pasos.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => startWorkflowTour(key)}
                          className="sm:self-center flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                        >
                          <span>Iniciar Flujo</span>
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ROLE MANUALS & ONBOARDINGS */}
              {activeTab === "roles" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Recomendar Onboarding para su rol actual */}
                  {(() => {
                    const onboardingTour = ROLE_ONBOARDING_TOURS[currentRole];
                    if (!onboardingTour) return null;
                    return (
                      <div className="p-6 rounded-2xl border-2 border-secondary bg-secondary/[0.02] shadow-md shadow-secondary/5 flex flex-col md:flex-row md:items-center justify-between gap-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-secondary text-primary-foreground shadow-lg shadow-secondary/25 flex items-center justify-center flex-shrink-0">
                            <UserCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-black text-foreground">
                                Tour de Onboarding para {currentRole}
                              </h4>
                              {userHasSeenOnboarding ? (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                                  Ya completado
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 animate-pulse">
                                  Pendiente por ver
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 max-w-xl font-medium">
                              Este tour te guiará de manera automatizada a través de las pantallas y herramientas clave que corresponden a tus funciones diarias en la clínica.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => startRoleOnboarding(currentRole)}
                          className="px-5 py-3 bg-secondary hover:bg-secondary/90 text-primary-foreground text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-secondary/20 hover:scale-[1.02] transition-all flex items-center gap-2 self-start md:self-center flex-shrink-0"
                        >
                          <span>Iniciar Onboarding</span>
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    );
                  })()}

                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-1.5 h-5 rounded-full bg-primary" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                      Playbook Operativo de Tareas por Rol
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                    Selecciona tu perfil a continuación para conocer tus responsabilidades operativas diarias y ejecutar las guías paso a paso para cada tarea clínica en el software:
                  </p>

                  {/* Role Selector Bento Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {(() => {
                      const visibleRoles = (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN")
                        ? (Object.keys(PLAYBOOKS) as Array<keyof typeof PLAYBOOKS>)
                        : [(user?.role || "ADMIN") as keyof typeof PLAYBOOKS];

                      return visibleRoles.map((roleKey) => {
                        const playbook = PLAYBOOKS[roleKey];
                        const Icon = playbook.icon;
                        const isSelected = selectedRole === roleKey;
                        
                        return (
                          <button
                            key={roleKey}
                            onClick={() => setSelectedRole(roleKey)}
                            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center text-center gap-2.5 ${
                              isSelected
                                ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5 scale-[1.02]"
                                : "bg-muted/40 border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-primary/20 text-primary' : 'bg-card border border-border text-muted-foreground'}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-xs font-bold block">{playbook.roleName.split(" / ")[0]}</span>
                              <span className="text-[9px] uppercase font-black tracking-wider opacity-60 block mt-0.5">{roleKey}</span>
                            </div>
                          </button>
                        );
                      });
                    })()}
                  </div>

                  {/* Active Playbook Content Card */}
                  {(() => {
                    const activePlaybook = PLAYBOOKS[selectedRole];
                    const RoleIcon = activePlaybook.icon;
                    return (
                      <div className="mt-6 border border-border rounded-3xl bg-muted/20 overflow-hidden flex flex-col animate-in fade-in duration-300">
                        {/* Playbook Header */}
                        <div className="p-5 border-b border-border bg-muted/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                              <RoleIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-foreground">{activePlaybook.roleName}</h4>
                              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{activePlaybook.description}</p>
                            </div>
                          </div>
                          
                          {/* Complete onboarding launcher */}
                          {ROLE_ONBOARDING_TOURS[selectedRole] && (
                            <button
                              onClick={() => {
                                closeHelpCenter();
                                startRoleOnboarding(selectedRole);
                              }}
                              className="flex-shrink-0 flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
                            >
                              <span>Iniciar Inducción Completa</span>
                              <Play className="w-3 h-3 fill-current" />
                            </button>
                          )}
                        </div>

                        {/* Playbook Tasks List */}
                        <div className="p-6 space-y-4">
                          <span className="text-[10px] uppercase font-black text-muted-foreground tracking-wider block">
                            Tareas Clínicas Clave & Guías Paso a Paso:
                          </span>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activePlaybook.tasks.map((task, idx) => (
                              <div
                                key={idx}
                                className="p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300 flex flex-col justify-between gap-4 shadow-sm"
                              >
                                <div className="space-y-1.5">
                                  <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    {task.title}
                                  </h5>
                                  <p className="text-[11px] text-muted-foreground leading-normal font-medium pl-3">
                                    {task.description}
                                  </p>
                                </div>
                                
                                <button
                                  onClick={() => {
                                    closeHelpCenter();
                                    if (task.tourType === "workflow") {
                                      startWorkflowTour(task.tourKey);
                                    } else {
                                      startViewTour(task.tourKey);
                                    }
                                  }}
                                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold bg-muted hover:bg-primary/10 hover:text-primary text-foreground transition-all cursor-pointer border border-border shadow-xs"
                                >
                                  <span>{task.actionText}</span>
                                  <Play className="w-2.5 h-2.5 fill-current" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 4: OFFLINE SYSTEM */}
              {activeTab === "sync" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-5 rounded-full bg-success" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                      Resiliencia y Modo Offline (Sin Internet)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2 items-stretch">
                    <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3.5">
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                          BLOOM SKIN está desarrollado para trabajar sin pausas, incluso si hay un apagón de red en tu local clínico. Utiliza bases de datos relacionales en caché para encriptar los datos:
                        </p>
                        
                        <div className="p-4 rounded-xl bg-muted/70 border border-border space-y-3">
                          <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                            <Database className="w-4 h-4 text-success" />
                            Buffer Local y Seguridad
                          </h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Si se corta internet, tus datos clínicos (consentimientos, fotos, evoluciones y cobros) se guardan localmente en tu navegador de forma segura. El software no emitirá alertas de error y te permitirá operar normalmente.
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/70 border border-border space-y-3">
                          <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                            <CloudLightning className="w-4 h-4 text-warning animate-pulse" />
                            Sincronización Transparente
                          </h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Una vez que se restablezca internet, el sistema lo detectará automáticamente. El gestor `SyncManager` subirá a la nube todas las facturas y consentimientos acumulados en segundo plano sin interrumpir tu trabajo.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-success/[0.03] border border-success/20 flex gap-3 text-success">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-foreground">¿Cómo monitorear el estado de red?</h5>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            En la barra superior (Topbar) de la aplicación, verás un indicador: **"Sincronizado"** (círculo verde) si estás en línea, o **"Trabajando localmente"** (círculo naranja) si estás en modo offline.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5 border border-border rounded-3xl p-5 bg-muted/20 flex flex-col justify-center space-y-5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        Flujo de Operación Offline
                      </span>

                      <div className="space-y-4">
                        <div className="flex gap-3.5 items-start">
                          <div className="w-6 h-6 rounded-full bg-error/10 text-error flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                          <div>
                            <h5 className="text-xs font-bold text-foreground">Corte de Red</h5>
                            <p className="text-[10px] text-muted-foreground">Se desconecta internet, se activa el buffer local.</p>
                          </div>
                        </div>

                        <div className="w-0.5 h-4 bg-border ml-3" />

                        <div className="flex gap-3.5 items-start">
                          <div className="w-6 h-6 rounded-full bg-warning/10 text-warning flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                          <div>
                            <h5 className="text-xs font-bold text-foreground">Operación Local</h5>
                            <p className="text-[10px] text-muted-foreground">Registras citas, fotos y cobros normalmente.</p>
                          </div>
                        </div>

                        <div className="w-0.5 h-4 bg-border ml-3" />

                        <div className="flex gap-3.5 items-start">
                          <div className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                          <div>
                            <h5 className="text-xs font-bold text-foreground">Reconexión</h5>
                            <p className="text-[10px] text-muted-foreground">El sistema detecta red en línea y prepara la cola.</p>
                          </div>
                        </div>

                        <div className="w-0.5 h-4 bg-border ml-3" />

                        <div className="flex gap-3.5 items-start">
                          <div className="w-6 h-6 rounded-full bg-success/10 text-success flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
                          <div>
                            <h5 className="text-xs font-bold text-foreground">Datos Sincronizados</h5>
                            <p className="text-[10px] text-muted-foreground">Se actualiza Postgres en la nube, todo seguro.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: FAQS */}
              {activeTab === "faqs" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-5 rounded-full bg-warning" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                      Preguntas Frecuentes (FAQs) del Negocio
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                    Encuentra respuestas rápidas para resolver dudas sobre el cálculo de comisiones, colisiones de cabinas, mermas de almacén, WhatsApp y más:
                  </p>

                  <div className="space-y-3 mt-3">
                    {FAQ_ITEMS.map((item) => (
                      <FAQAccordionItem key={item.question} item={item} />
                    ))}
                  </div>

                  {/* Direct Support Callout */}
                  <div className="p-5 rounded-2xl bg-primary/[0.02] border border-primary/25 flex gap-4 mt-6">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-foreground">
                        ¿Necesitas soporte para integraciones fiscales o de red?
                      </h5>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-normal">
                        Si requieres cambiar tu adaptador fiscal tributario (SAT/AFIP) o configurar un nuevo canal de WhatsApp Business oficial, por favor contacta con el administrador del sistema para la edición directa de la consola global de SaaS.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
