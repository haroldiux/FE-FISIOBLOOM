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
    <div className="border border-slate-200/60 dark:border-slate-800/40 rounded-2xl overflow-hidden bg-slate-50/30 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-800 dark:text-slate-100 hover:text-primary dark:hover:text-primary transition-colors duration-200 cursor-pointer"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        <span className="pr-4 text-sm md:text-base">{item.question}</span>
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-primary/10 transition-colors">
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
          <div className="p-5 pt-0 text-xs md:text-sm text-slate-650 dark:text-slate-400 leading-relaxed border-t border-slate-100/50 dark:border-slate-800/50 mt-1">
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
}

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

  // Filter content
  const filteredGuides = SCREEN_GUIDES.filter(
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

  const filteredRoles = ROLE_GUIDES.filter(
    (r) =>
      r.roleName.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.actions.some((a) => a.toLowerCase().includes(query)) ||
      r.example.toLowerCase().includes(query)
  );

  // Filter workflows
  const workflowKeys = Object.keys(WORKFLOW_TOURS);
  const filteredWorkflows = workflowKeys.filter((key) => {
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
      "create-service": "Crear Servicio y Cargar Consumos"
    };
    return mapping[key] || key.replace("-", " ");
  };

  const currentRole = user?.role || "ADMIN";
  const userHasSeenOnboarding = seenOnboardings.includes(currentRole);

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300">
      {/* Modal Container */}
      <div
        className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 w-full max-w-5xl shadow-2xl flex flex-col h-[85vh] max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center animate-pulse">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Centro de Inducción y Ayuda Interactiva
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Conoce las herramientas y flujos del centro clínico adaptados a tu rol
              </p>
            </div>
          </div>
          <button
            onClick={closeHelpCenter}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por comisiones, caja, offline, consentimientos, pacientes, reportes..."
              className="w-full pl-11 pr-10 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/85 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-250"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        {!isSearching && (
          <div className="flex border-b border-slate-100 dark:border-slate-800/85 bg-slate-50/20 dark:bg-slate-950 px-6 py-2.5 gap-2 overflow-x-auto flex-shrink-0 scrollbar-none">
            <button
              onClick={() => setActiveTab("guides")}
              className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "guides"
                  ? "bg-primary/10 text-primary"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200"
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
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200"
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
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200"
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
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200"
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
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>FAQs</span>
            </button>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-950 [&::-webkit-scrollbar]:hidden">
          {isSearching ? (
            // Search Results Layout
            <div className="space-y-6 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Resultados de búsqueda para "{searchQuery}"
              </h3>

              {!hasResults ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 mb-3 border border-slate-100 dark:border-slate-850">
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    No encontramos coincidencias
                  </h4>
                  <p className="text-xs text-slate-450 dark:text-slate-500 max-w-xs mt-1 leading-relaxed">
                    Prueba buscando términos como "comisiones", "caja", "offline", "citas" o "consentimientos".
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Guides Results */}
                  {filteredGuides.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded-full bg-primary" />
                        Guías de Interfaz
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredGuides.map((guide) => (
                          <div key={guide.key} className="p-4 rounded-2xl border border-slate-150 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-900/30 flex justify-between items-start gap-4">
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-550 flex items-center justify-center flex-shrink-0">
                                <guide.icon className="w-4.5 h-4.5" />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">{guide.title}</h5>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">{guide.description}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => startViewTour(guide.key)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-primary hover:text-white dark:bg-slate-800 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1"
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
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded-full bg-cyan-500" />
                        Flujos CRUD
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredWorkflows.map((key) => (
                          <div key={key} className="p-4 rounded-2xl border border-slate-150 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-900/30 flex justify-between items-start gap-4">
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-550 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-cyan-500" />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">{getWorkflowFriendlyName(key)}</h5>
                                <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-1 leading-relaxed">
                                  Sigue este tutorial interactivo paso a paso sobre cómo realizar este registro.
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => startWorkflowTour(key)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-cyan-550 hover:text-white dark:bg-slate-800 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1"
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
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded-full bg-purple-500" />
                        Manuales de Roles
                      </h4>
                      <div className="space-y-3">
                        {filteredRoles.map((role) => (
                          <div key={role.roleKey} className="p-5 rounded-2xl border border-slate-150 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/10 space-y-3">
                            <h5 className="text-xs font-bold text-slate-805 dark:text-slate-100">{role.roleName}</h5>
                            <p className="text-xs text-slate-550 dark:text-slate-450">{role.description}</p>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/50 p-3 rounded-xl">
                              <strong className="text-slate-705 dark:text-slate-350 block mb-1">Ejemplo práctico de flujo:</strong>
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
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded-full bg-amber-500" />
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
                const currentGuide = SCREEN_GUIDES.find((g) => g.key === activeScreen);
                const otherGuides = SCREEN_GUIDES.filter((g) => g.key !== activeScreen);

                return (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-5 rounded-full bg-primary" />
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                        Guías Visuales por Sección
                      </h3>
                    </div>

                    {/* Featured Active Screen Guide */}
                    {currentGuide && (() => {
                      const Icon = currentGuide.icon;
                      return (
                        <div className="p-6 rounded-2xl border-2 border-primary bg-primary/[0.02] dark:bg-primary/[0.01] shadow-md shadow-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-5 animate-in zoom-in-95 duration-200">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary text-white shadow-lg shadow-primary/25 flex items-center justify-center flex-shrink-0 animate-pulse">
                              <Icon className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base font-black text-slate-850 dark:text-slate-100">
                                  {currentGuide.title}
                                </h4>
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                                  Recomendado para tu Vista Actual
                                </span>
                              </div>
                              <p className="text-xs text-slate-450 dark:text-slate-500 leading-relaxed mt-1.5 max-w-xl font-medium">
                                {currentGuide.description} Sigue este tutorial interactivo para aprender paso a paso a usar este módulo del sistema.
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => startViewTour(currentGuide.key)}
                            className="px-5 py-3 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-primary/20 hover:scale-[1.02] hover:shadow-primary/30 transition-all flex items-center gap-2 self-start md:self-center flex-shrink-0"
                          >
                            <span>Iniciar Guía de Vista</span>
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      );
                    })()}

                    {/* Other Guides list */}
                    <div className="space-y-3.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Otras Guías del Sistema
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {otherGuides.map((guide) => {
                          const Icon = guide.icon;
                          return (
                            <div
                              key={guide.key}
                              className="group p-5 rounded-2xl border bg-slate-50/20 dark:bg-slate-900/10 border-slate-150 dark:border-slate-850 hover:border-slate-250 dark:hover:border-slate-700 hover:bg-slate-50/40 dark:hover:bg-slate-900/25 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="flex items-start gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                    {guide.title}
                                  </h4>
                                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mt-1 font-medium">
                                    {guide.description}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => startViewTour(guide.key)}
                                className="sm:self-center flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
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
                    <span className="w-1.5 h-5 rounded-full bg-cyan-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                      Tutoriales de Procesos Clínicos y Operaciones (CRUD)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-450 dark:text-slate-500 max-w-2xl leading-relaxed">
                    Aprende a realizar registros específicos del día a día, como crear citas de forma segura, registrar consentimientos informados de pacientes o cobrar un servicio en el terminal de venta.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {workflowKeys.map((key) => (
                      <div
                        key={key}
                        className="group p-5 rounded-2xl border bg-slate-50/20 dark:bg-slate-900/10 border-slate-150 dark:border-slate-850 hover:border-slate-250 dark:hover:border-slate-700 hover:bg-slate-50/40 dark:hover:bg-slate-900/25 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                              {getWorkflowFriendlyName(key)}
                            </h4>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mt-1 font-medium">
                              Proceso interactivo y dinámico de {WORKFLOW_TOURS[key].length} pasos.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => startWorkflowTour(key)}
                          className="sm:self-center flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all cursor-pointer"
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
                      <div className="p-6 rounded-2xl border-2 border-purple-500 bg-purple-500/[0.02] shadow-md shadow-purple-500/5 flex flex-col md:flex-row md:items-center justify-between gap-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/25 flex items-center justify-center flex-shrink-0">
                            <UserCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-black text-slate-800 dark:text-slate-100">
                                Tour de Onboarding para {currentRole}
                              </h4>
                              {userHasSeenOnboarding ? (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-450 border border-slate-200 dark:border-slate-700">
                                  Ya completado
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/45 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50 animate-pulse">
                                  Pendiente por ver
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-450 dark:text-slate-500 leading-relaxed mt-1.5 max-w-xl font-medium">
                              Este tour te guiará de manera automatizada a través de las pantallas y herramientas clave que corresponden a tus funciones diarias en la clínica.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => startRoleOnboarding(currentRole)}
                          className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-purple-550/20 hover:scale-[1.02] transition-all flex items-center gap-2 self-start md:self-center flex-shrink-0"
                        >
                          <span>Iniciar Onboarding</span>
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    );
                  })()}

                  <div className="flex items-center gap-2 mt-8">
                    <span className="w-1.5 h-5 rounded-full bg-purple-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                      Manual de Roles e Inducción Completa
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-2xl leading-relaxed">
                    BLOOM SKIN adapta su comportamiento y menús según el rol de seguridad asignado. A continuación puedes consultar el manual para cada perfil e iniciar sus tours de inducción:
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                    {ROLE_GUIDES.map((role) => (
                      <div
                        key={role.roleKey}
                        className={`p-5 rounded-2xl border bg-gradient-to-br ${role.colorClass} flex flex-col justify-between h-full space-y-4`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                              {role.roleName}
                            </h4>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-white/60 dark:bg-slate-900/60 rounded-full border border-slate-200/50 dark:border-slate-800/50">
                              {role.roleKey}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                            {role.description}
                          </p>

                          <div className="space-y-2">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                              Acciones principales en el software:
                            </span>
                            <ul className="text-xs space-y-1.5 text-slate-650 dark:text-slate-350 font-medium pl-1">
                              {role.actions.map((act, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="p-3 bg-white/70 dark:bg-slate-950/70 border border-slate-200/40 dark:border-slate-800/40 rounded-xl text-[11px] text-slate-500 dark:text-slate-450">
                          <strong className="text-slate-700 dark:text-slate-300 block mb-0.5">Caso de uso clínico:</strong>
                          {role.example}
                        </div>

                        {ROLE_ONBOARDING_TOURS[role.roleKey] && (
                          <button
                            onClick={() => startRoleOnboarding(role.roleKey)}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-white/80 dark:bg-slate-900/80 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300 transition-all cursor-pointer border border-slate-200/50 dark:border-slate-800/50 shadow-sm"
                          >
                            <span>Iniciar Inducción de {role.roleKey}</span>
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: OFFLINE SYSTEM */}
              {activeTab === "sync" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-5 rounded-full bg-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                      Resiliencia y Modo Offline (Sin Internet)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2 items-stretch">
                    <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3.5">
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          BLOOM SKIN está desarrollado para trabajar sin pausas, incluso si hay un apagón de red en tu local clínico. Utiliza bases de datos relacionales en caché para encriptar los datos:
                        </p>
                        
                        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-850 space-y-3">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Database className="w-4 h-4 text-emerald-500" />
                            Buffer Local y Seguridad
                          </h4>
                          <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed">
                            Si se corta internet, tus datos clínicos (consentimientos, fotos, evoluciones y cobros) se guardan localmente en tu navegador de forma segura. El software no emitirá alertas de error y te permitirá operar normalmente.
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-850 space-y-3">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <CloudLightning className="w-4 h-4 text-amber-500 animate-pulse" />
                            Sincronización Transparente
                          </h4>
                          <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed">
                            Una vez que se restablezca internet, el sistema lo detectará automáticamente. El gestor `SyncManager` subirá a la nube todas las facturas y consentimientos acumulados en segundo plano sin interrumpir tu trabajo.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/20 flex gap-3 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">¿Cómo monitorear el estado de red?</h5>
                          <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-0.5 leading-relaxed">
                            En la barra superior (Topbar) de la aplicación, verás un indicador: **"Sincronizado"** (círculo verde) si estás en línea, o **"Trabajando localmente"** (círculo naranja) si estás en modo offline.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5 border border-slate-150 dark:border-slate-850 rounded-3xl p-5 bg-slate-50/20 dark:bg-slate-900/5 flex flex-col justify-center space-y-5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Flujo de Operación Offline
                      </span>

                      <div className="space-y-4">
                        <div className="flex gap-3.5 items-start">
                          <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 dark:bg-red-950/45 dark:text-red-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Corte de Red</h5>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Se desconecta internet, se activa el buffer local.</p>
                          </div>
                        </div>

                        <div className="w-0.5 h-4 bg-slate-200 dark:bg-slate-800 ml-3" />

                        <div className="flex gap-3.5 items-start">
                          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/45 dark:text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Operación Local</h5>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Registras citas, fotos y cobros normalmente.</p>
                          </div>
                        </div>

                        <div className="w-0.5 h-4 bg-slate-200 dark:bg-slate-800 ml-3" />

                        <div className="flex gap-3.5 items-start">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/45 dark:text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-805 dark:text-slate-200">Reconexión</h5>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">El sistema detecta red en línea y prepara la cola.</p>
                          </div>
                        </div>

                        <div className="w-0.5 h-4 bg-slate-200 dark:bg-slate-800 ml-3" />

                        <div className="flex gap-3.5 items-start">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/45 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Datos Sincronizados</h5>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Se actualiza Postgres en la nube, todo seguro.</p>
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
                    <span className="w-1.5 h-5 rounded-full bg-amber-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                      Preguntas Frecuentes (FAQs) del Negocio
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-2xl leading-relaxed">
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
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        ¿Necesitas soporte para integraciones fiscales o de red?
                      </h5>
                      <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-1 leading-normal">
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
