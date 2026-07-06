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
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ScreenGuide {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

interface RoleGuide {
  roleName: string;
  roleKey: string;
  description: string;
  colorClass: string;
  actions: string[];
  example: string;
}

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScreen: string;
  onStartTour: (screenKey: string) => void;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const SCREEN_GUIDES: ScreenGuide[] = [
  {
    key: "dashboard",
    title: "Dashboard Principal",
    description: "Indicadores clave, facturación diaria y ocupación en tiempo real.",
    icon: LayoutDashboard,
  },
  {
    key: "calendar",
    title: "Calendario y Citas",
    description: "Agenda citas, asigna profesionales, controla cabinas y evita solapamientos.",
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
    description: "Control de stock, alertas de stock mínimo y registro de mermas.",
    icon: Package,
  },
  {
    key: "services",
    title: "Servicios y Bonos",
    description: "Catálogo de tratamientos, bonos multisesión e insumos vinculados.",
    icon: Sparkles,
  },
  {
    key: "reports",
    title: "Reportes y Analíticas",
    description: "Exportación contable, balances financieros y KPIs avanzados.",
    icon: BarChart3,
  },
];

const ROLE_GUIDES: RoleGuide[] = [
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
];

const FAQ_ITEMS: FAQItem[] = [
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
];

// ── Components ────────────────────────────────────────────────────────────────

function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200/60 dark:border-slate-800/40 rounded-2xl overflow-hidden bg-slate-50/30 dark:bg-slate-900/30 hover:border-slate-350 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-all duration-300">
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
          <div className="p-5 pt-0 text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100/50 dark:border-slate-800/50 mt-1">
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HelpCenterModal({
  isOpen,
  onClose,
  activeScreen,
  onStartTour,
}: HelpCenterModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"guides" | "roles" | "sync" | "faqs">("guides");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("guides");
      setSearchQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const query = searchQuery.trim().toLowerCase();

  // Global search filtering
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

  const isSearching = query.length > 0;
  const hasResults = filteredGuides.length > 0 || filteredFAQs.length > 0 || filteredRoles.length > 0;

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
                Centro de Inducción y Ayuda
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Conoce las herramientas y flujos del centro clínico adaptados a cada rol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-650"
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
              placeholder="Buscar en el centro de inducción (comisiones, offline, caja, roles, insumos, reportes...)"
              className="w-full pl-11 pr-10 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/85 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/45"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation (Visible when not actively searching) */}
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
              onClick={() => setActiveTab("roles")}
              className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "roles"
                  ? "bg-primary/10 text-primary"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Manual de Roles</span>
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
              <span>Modo Offline y Sincronización</span>
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
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Resultados de búsqueda para "{searchQuery}"
              </h3>

              {!hasResults ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 mb-3 border border-slate-100 dark:border-slate-850">
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350">
                    No encontramos coincidencias
                  </h4>
                  <p className="text-xs text-slate-450 dark:text-slate-500 max-w-xs mt-1 leading-relaxed">
                    Prueba buscando términos como "comisiones", "caja", "offline", "citas" o "administrador".
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
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
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center flex-shrink-0">
                                <guide.icon className="w-4.5 h-4.5" />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">{guide.title}</h5>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">{guide.description}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => onStartTour(guide.key)}
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

                  {filteredRoles.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded-full bg-purple-500" />
                        Manuales de Roles
                      </h4>
                      <div className="space-y-3">
                        {filteredRoles.map((role) => (
                          <div key={role.roleKey} className="p-5 rounded-2xl border border-slate-150 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/10 space-y-3">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">{role.roleName}</h5>
                            <p className="text-xs text-slate-550 dark:text-slate-450">{role.description}</p>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/50 p-3 rounded-xl">
                              <strong className="text-slate-700 dark:text-slate-350 block mb-1">Ejemplo práctico de flujo:</strong>
                              {role.example}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredFAQs.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded-full bg-cyan-500" />
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
                                <h4 className="text-base font-black text-slate-800 dark:text-slate-105">
                                  {currentGuide.title}
                                </h4>
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                                  Recomendado para tu Vista Actual
                                </span>
                              </div>
                              <p className="text-xs text-slate-450 dark:text-slate-500 leading-relaxed mt-1.5 max-w-xl font-medium">
                                {currentGuide.description} Esta guía interactiva te llevará paso a paso explicándote cada componente, botón y sección para que domines este módulo.
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => onStartTour(currentGuide.key)}
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
                                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-bold">
                                    {guide.title}
                                  </h4>
                                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mt-1 font-medium">
                                    {guide.description}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => onStartTour(guide.key)}
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

              {/* TAB 2: ROLE MANUALS */}
              {activeTab === "roles" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-5 rounded-full bg-purple-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                      Manual de Roles e Inducción
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-2xl leading-relaxed">
                    BLOOM SKIN adapta sus módulos de trabajo según las responsabilidades asignadas en la clínica. A continuación se desglosan las principales acciones asignadas a cada perfil:
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
                          <p className="text-xs text-slate-550 dark:text-slate-400 font-medium">
                            {role.description}
                          </p>

                          <div className="space-y-2">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                              Acciones Clave en el Sistema:
                            </span>
                            <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-355 font-medium pl-1">
                              {role.actions.map((act, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="p-3 bg-white/70 dark:bg-slate-950/70 border border-slate-200/40 dark:border-slate-800/40 rounded-xl text-[11px] text-slate-500 dark:text-slate-400">
                          <strong className="text-slate-700 dark:text-slate-300 block mb-0.5">Ejemplo práctico de uso:</strong>
                          {role.example}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: OFFLINE SYSTEM */}
              {activeTab === "sync" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-5 rounded-full bg-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                      Funcionamiento del Modo Offline
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2 items-stretch">
                    {/* Explicación Técnica */}
                    <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3.5">
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          BLOOM SKIN cuenta con una arquitectura de bases de datos resiliente al corte de red de internet. Su funcionamiento se basa en la sincronización diferida y almacenamiento local:
                        </p>
                        
                        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-850 space-y-3">
                          <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2">
                            <Database className="w-4 h-4 text-emerald-500" />
                            Base de Datos Local Buffer
                          </h4>
                          <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed">
                            Si el navegador detecta una interrupción en la señal web (net::ERR_CONNECTION_REFUSED / net::ERR_EMPTY_RESPONSE), las llamadas del backend no se pierden. El sistema almacena en caché estructurada local las firmas de consentimiento, fotos de la galería (en base64) y las citas registradas en el POS.
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-850 space-y-3">
                          <h4 className="text-xs font-bold text-slate-855 dark:text-slate-200 flex items-center gap-2">
                            <CloudLightning className="w-4 h-4 text-amber-500 animate-pulse" />
                            Sincronización Automática
                          </h4>
                          <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed">
                            Tan pronto como tu dispositivo recupere conexión estable a internet, el gestor en red `SyncManager` detectará el estado en línea, transmitirá la cola de operaciones acumuladas hacia el servidor PostgreSQL y refrescará la agenda en segundo plano de manera transparente.
                          </p>
                        </div>
                      </div>

                      {/* Callout Indicator */}
                      <div className="p-4 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/20 flex gap-3 text-emerald-600">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-slate-850 dark:text-slate-200">¿Cómo verificar el estado de red?</h5>
                          <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-0.5 leading-relaxed">
                            Observa el indicador de red en la parte superior derecha del header (Topbar). Verás el estado de **"Sincronizado"** en verde si estás en línea, o **"Trabajando localmente"** en color naranja si la red está caída.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Línea de Proceso Gráfica */}
                    <div className="lg:col-span-5 border border-slate-150 dark:border-slate-850 rounded-3xl p-5 bg-slate-50/20 dark:bg-slate-900/5 flex flex-col justify-center space-y-5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Flujo de Operación Offline
                      </span>

                      <div className="space-y-4">
                        <div className="flex gap-3.5 items-start">
                          <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 dark:bg-red-950/45 dark:text-red-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-805 dark:text-slate-200">Pérdida de Conexión</h5>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Se corta internet, se activa el buffer local.</p>
                          </div>
                        </div>

                        <div className="w-0.5 h-4 bg-slate-200 dark:bg-slate-800 ml-3" />

                        <div className="flex gap-3.5 items-start">
                          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/45 dark:text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-805 dark:text-slate-200">Trabajo en Buffer</h5>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">El usuario registra datos y fotos con normalidad.</p>
                          </div>
                        </div>

                        <div className="w-0.5 h-4 bg-slate-200 dark:bg-slate-800 ml-3" />

                        <div className="flex gap-3.5 items-start">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/45 dark:text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-805 dark:text-slate-200">Reconexión y Enlace</h5>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Se detecta red y se encolan las peticiones pendientes.</p>
                          </div>
                        </div>

                        <div className="w-0.5 h-4 bg-slate-200 dark:bg-slate-800 ml-3" />

                        <div className="flex gap-3.5 items-start">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/45 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-805 dark:text-slate-200">Sincronización Exitosa</h5>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Los datos se guardan en la nube, interfaz en línea.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: FAQS */}
              {activeTab === "faqs" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-5 rounded-full bg-cyan-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                      Preguntas Frecuentes de la Clínica
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-2xl leading-relaxed">
                    Encuentra respuestas rápidas para resolver bloqueos de operación diaria sin requerir soporte de TI técnico:
                  </p>

                  <div className="space-y-3 mt-3">
                    {FAQ_ITEMS.map((item) => (
                      <FAQAccordionItem key={item.question} item={item} />
                    ))}
                  </div>

                  {/* Direct Support Callout */}
                  <div className="p-5 rounded-2xl bg-cyan-500/[0.03] border border-cyan-500/20 flex gap-4 mt-6">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-600 flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        ¿Requieres asistencia sobre impuestos complejos?
                      </h5>
                      <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-1 leading-normal">
                        Si tienes inconvenientes con el cálculo del desglose de impuestos especiales o requieres agregar un nuevo adaptador tributario fiscal, contacta con tu departamento contable para que el administrador de base de datos configure el perfil correspondiente.
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
