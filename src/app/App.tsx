import { useState, useEffect, useRef, useCallback } from "react";
import { animate } from "animejs";
import { useAuth } from "./context/AuthContext";
import { api } from "./services/api";
import LoginScreen from "./components/LoginScreen";
import CalendarScreen from "./pages/CalendarScreen";
import PatientScreen from "./pages/PatientScreen";
import DashboardScreen from "./pages/DashboardScreen";
import FinanceScreen from "./pages/FinanceScreen";
import InventoryScreen from "./pages/InventoryScreen";
import ServicesScreen from "./pages/ServicesScreen";
import ConfigScreen from "./pages/ConfigScreen";
import ReportsScreen from "./pages/ReportsScreen";
import SuperAdminScreen from "./pages/SuperAdminScreen";
import PatientPortalScreen from "./pages/PatientPortalScreen";
import { useTenantSettings } from "./context/TenantSettingsContext";
import { useSyncManager, SyncState } from "./hooks/useSyncManager";
import { TutorialProvider, useTutorial } from "./context/TutorialContext";
import TutorialTour from "./components/TutorialTour";
import HelpCenterModal from "./components/HelpCenterModal";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Receipt,
  Package,
  Bell,
  Search,
  AlertTriangle,
  Settings,
  Activity,
  Sparkles,
  ChevronDown,
  BarChart3,
  Cloud,
  CloudOff,
  Loader2,
  HelpCircle,
  MousePointerClick,
  X,
  PackageX,
  Syringe,
  ShoppingCart,
  MapPin,
  Sun,
  Moon,
} from "lucide-react";

// ── Notification Types ────────────────────────────────────────────────────────

interface SystemNotification {
  id: string;
  type: 'low_stock' | 'expiring_package' | 'overdue_retouch' | 'upcoming_retouch';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  entityId?: string;
  entityName?: string;
  createdAt: string;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Screen =
  | "dashboard"
  | "calendar"
  | "patients"
  | "pos"
  | "inventory"
  | "services"
  | "config"
  | "reports"
  | "saas"
  | "error-404"
  | "error-500";

// ── Branch Selector ───────────────────────────────────────────────────────────

interface Branch {
  id: string;
  name: string;
}

function BranchSelectorButton() {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchBranches() {
      try {
        const data = await api.get<Branch[]>("/branches");
        setBranches(data);
      } catch (err) {
        console.error("Error fetching branches:", err);
      }
    }
    if (user) {
      fetchBranches();
    }
  }, [user]);

  useEffect(() => {
    const savedBranch = localStorage.getItem("branchId") || "";
    setSelectedBranchId(savedBranch);
  }, []);

  const handleSelect = (id: string) => {
    setSelectedBranchId(id);
    if (id) {
      localStorage.setItem("branchId", id);
    } else {
      localStorage.removeItem("branchId");
    }
    window.location.reload();
  };

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div id="tour-dashboard-branch" className="relative group/branch">
      <button
        onClick={() => setOpen(!open)}
        className="w-16 py-2 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 text-white/50 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-300 spring-hover cursor-pointer"
      >
        <MapPin className="w-5 h-5 flex-shrink-0" />
        <span className="text-[9px] font-black tracking-widest text-center transition-colors duration-300 uppercase text-white/40 group-hover/branch:text-white">
          Centros
        </span>
        <div className="absolute left-20 bg-[#160d22]/95 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover/branch:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-white/5 z-50">
          Centros / Sucursales
        </div>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-20 top-0 w-56 glass-panel rounded-2xl p-2 z-50 border border-white/10 shadow-2xl flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 duration-150">
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-2.5 py-1.5 border-b border-white/5 mb-1">
              Sucursal Activa
            </p>
            <button
              onClick={() => { handleSelect(""); setOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                !selectedBranchId ? "bg-primary/20 text-primary" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              Todas las Sucursales
            </button>
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => { handleSelect(b.id); setOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                  selectedBranchId === b.id ? "bg-primary/20 text-primary" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ active, setActive }: { active: Screen; setActive: (s: Screen) => void }) {
  const { user } = useAuth();
  const { settings } = useTenantSettings();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const mainNav: { id: Screen; label: string; Icon: React.ComponentType<any> }[] = isSuperAdmin ? [
    { id: "dashboard", label: "Inicio", Icon: LayoutDashboard },
    { id: "saas", label: "SaaS", Icon: Settings },
  ] : [
    { id: "dashboard", label: "Inicio", Icon: LayoutDashboard },
    { id: "calendar", label: "Citas", Icon: CalendarDays },
    { id: "patients", label: "Pacientes", Icon: Users },
    { id: "pos", label: "Facturas", Icon: Receipt },
    ...(settings.features.inventory ? [{ id: "inventory", label: "Almacén", Icon: Package }] : []),
    { id: "services", label: "Servicios", Icon: Sparkles },
    { id: "reports", label: "Reportes", Icon: BarChart3 },
  ];

  const systemNav: { id: Screen; label: string; Icon: React.ComponentType<any> }[] = isSuperAdmin ? [] : [
    { id: "config", label: "Ajustes", Icon: Settings },
  ];

  const NavButton = ({ id, label, Icon }: { id: Screen; label: string; Icon: React.ComponentType<any> }) => {
    const isActive = active === id;
    return (
      <button
        onClick={() => setActive(id)}
        id={`tour-sidebar-${id}`}
        className={`w-16 py-2 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 spring-hover border relative group cursor-pointer ${
          isActive
            ? "bg-primary/20 text-primary dark:text-primary-foreground border-primary/30 shadow-[0_4px_16px_rgba(232,121,249,0.15)]"
            : "text-foreground/50 border-transparent hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5"
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className={`text-[9px] font-black tracking-widest text-center transition-colors duration-300 uppercase leading-none ${
          isActive ? "text-primary dark:text-primary-foreground" : "text-white/40 group-hover:text-white"
        }`}>
          {label}
        </span>
        {/* Spatial visionOS Floating Label Tooltip */}
        <div className="absolute left-20 bg-[#160d22]/95 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-white/5 z-50">
          {label}
        </div>
        {isActive && (
          <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-3 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
        )}
      </button>
    );
  };

  return (
    <aside id="tour-sidebar" className="fixed left-6 top-1/2 -translate-y-1/2 h-fit max-h-[95vh] w-20 glass-capsule rounded-3xl flex flex-col items-center py-6 gap-4 z-50 select-none">
      {/* Brand Logo */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-fuchsia-600 flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0 spring-hover mb-1">
        <Sparkles className="w-5 h-5 text-white" />
      </div>

      {/* Branch Selector Capsule Button */}
      <BranchSelectorButton />

      <div className="w-8 h-[1px] bg-white/10 flex-shrink-0" />

      {/* Nav */}
      <nav className="flex flex-col gap-3 overflow-y-auto [&::-webkit-scrollbar]:hidden py-1">
        {mainNav.map((item) => <NavButton key={item.id} {...item} />)}
        {systemNav.length > 0 && (
          <>
            <div className="w-8 h-[1px] bg-white/10 my-1 self-center flex-shrink-0" />
            {systemNav.map((item) => <NavButton key={item.id} {...item} />)}
          </>
        )}
      </nav>

      {/* User footer avatar button */}
      <UserFooterButton setActive={setActive} />
    </aside>
  );
}

function UserFooterButton({ setActive }: { setActive: (s: Screen) => void }) {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "A";
  return (
    <div id="tour-user-footer" className="mt-auto flex-shrink-0 group/user">
      <button
        onClick={() => setActive("config")}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
      >
        {initials}
        <div className="absolute left-20 bg-[#160d22]/95 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover/user:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-white/5 z-50">
          {user?.name || "Administrador"} ({user?.role || "ADMIN"})
        </div>
      </button>
    </div>
  );
}

// ── Connection Indicator ──────────────────────────────────────────────────────

function ConnectionIndicator({ state }: { state: SyncState }) {
  if (state === "syncing") {
    return (
      <div id="tour-topbar-sync" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold shadow-sm border border-blue-100 transition-all duration-300">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Sincronizando...</span>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div id="tour-topbar-sync" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold shadow-sm border border-amber-100 transition-all duration-300">
        <CloudOff className="w-3.5 h-3.5 animate-pulse" />
        <span>Trabajando localmente</span>
      </div>
    );
  }

  return (
    <div id="tour-topbar-sync" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold shadow-sm border border-emerald-100 transition-all duration-300" title="Todo sincronizado con la nube">
      <Cloud className="w-3.5 h-3.5" />
      <span>Sincronizado</span>
    </div>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────

function Topbar({
  title,
  subtitle,
  syncState,
  notifications,
  notifPanelOpen,
  onToggleNotifPanel,
  onCloseNotifPanel,
  onNavigate,
  onSelectPatient,
  theme,
  onToggleTheme,
  onOpenHelpCenter,
}: {
  title: string;
  subtitle: string;
  syncState: SyncState;
  notifications: SystemNotification[];
  notifPanelOpen: boolean;
  onToggleNotifPanel: () => void;
  onCloseNotifPanel: () => void;
  onNavigate: (screen: string) => void;
  onSelectPatient: (patientId: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenHelpCenter: () => void;
}) {
  const { user, logout } = useAuth();
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Autocomplete search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; fullName: string; phone: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch search results on query change
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const data = await api.get<any[]>(`/patients?search=${searchQuery}`);
        if (Array.isArray(data)) {
          setSearchResults(data.map(d => ({
            id: d.id,
            fullName: d.fullName,
            phone: d.phone
          })));
        }
      } catch (e) {
        console.error("Error en búsqueda:", e);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Close panel on outside click
  useEffect(() => {
    if (!notifPanelOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target as Node)) {
        onCloseNotifPanel();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifPanelOpen, onCloseNotifPanel]);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <header className="h-16 glass-panel rounded-2xl flex items-center justify-between px-6 flex-shrink-0 z-40 border border-white/10 dark:border-white/5">
      <div className="leading-tight">
        <h1 className="text-base font-bold text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <ConnectionIndicator state={syncState} />
        <div id="tour-topbar-search" className="relative" ref={searchContainerRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            placeholder="Buscar paciente por nombre..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-xl w-60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/45 transition-all placeholder:text-muted-foreground"
          />
          {showResults && (searchQuery.trim().length >= 2) && (
            <div className="absolute left-0 mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl z-[9000] overflow-hidden max-h-60 overflow-y-auto">
              <div className="p-2 border-b border-border bg-muted/30 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                {searching ? "Buscando..." : `Pacientes (${searchResults.length})`}
              </div>
              {searchResults.length === 0 && !searching && (
                <div className="p-4 text-xs font-semibold text-center text-muted-foreground">
                  No se encontraron pacientes.
                </div>
              )}
              {searchResults.map((pat) => (
                <div
                  key={pat.id}
                  onClick={() => {
                    onSelectPatient(pat.id);
                    setShowResults(false);
                    setSearchQuery("");
                  }}
                  className="p-3 hover:bg-muted/50 cursor-pointer border-b border-border last:border-b-0 transition-colors flex flex-col gap-0.5"
                >
                  <span className="text-xs font-black text-foreground">{pat.fullName}</span>
                  <span className="text-[10px] text-muted-foreground">📞 {pat.phone}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help/Tutorial Launcher Button */}
        <button
          id="tour-topbar-tutorial"
          onClick={onOpenHelpCenter}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-all spring-hover cursor-pointer text-muted-foreground"
          title="Ayuda y Tutoriales Interactivos"
        >
          <HelpCircle className="w-4 h-4 text-primary animate-pulse" />
        </button>

        {/* Theme Switcher Button */}
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-all spring-hover cursor-pointer text-muted-foreground"
          title={theme === "dark" ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Bell with Panel */}
        <div className="relative" ref={notifPanelRef}>
          <button
            id="tour-topbar-bell"
            onClick={onToggleNotifPanel}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
            title="Ver notificaciones del sistema"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] rounded-full bg-red-500 border-2 border-card text-white text-[8px] font-bold flex items-center justify-center leading-none px-0.5">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>

          {notifPanelOpen && (
            <div className="absolute right-0 top-12 w-96 rounded-2xl border border-border/80 bg-[#181223] shadow-2xl z-[9000] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-foreground" />
                  <span className="text-sm font-bold text-foreground">Notificaciones</span>
                  {notifications.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">{notifications.length}</span>
                  )}
                </div>
                <button onClick={onCloseNotifPanel} className="w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center transition-colors cursor-pointer">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-[420px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                      <Bell className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">¡Todo en orden!</p>
                    <p className="text-xs text-muted-foreground mt-1">No hay alertas pendientes del sistema.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notif) => {
                      const Icon = notif.type === 'low_stock' ? PackageX
                        : notif.type === 'expiring_package' ? ShoppingCart
                        : Syringe;
                      const iconBg = notif.severity === 'critical' ? 'bg-red-500/10 text-red-500 border border-red-500/10'
                        : notif.severity === 'warning' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                        : 'bg-blue-500/10 text-blue-500 border border-blue-500/10';
                      const badgeBg = notif.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : notif.severity === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
                      const targetScreen = notif.type === 'low_stock' ? 'inventory'
                        : notif.type === 'expiring_package' ? 'patients'
                        : 'dashboard';

                      return (
                        <div
                          key={notif.id}
                          role="button"
                          onClick={() => {
                            if (notif.patientId) {
                              onSelectPatient(notif.patientId);
                            } else {
                              onNavigate(targetScreen);
                            }
                            onCloseNotifPanel();
                          }}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left cursor-pointer bg-transparent"
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${iconBg}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${badgeBg}`}>
                                {notif.severity === 'critical' ? '⚠ Crítico' : notif.severity === 'warning' ? '• Alerta' : 'Info'}
                              </span>
                              <span className="text-[10px] font-bold text-foreground truncate">{notif.title}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{notif.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-border bg-muted/20">
                  <p className="text-[10px] text-muted-foreground text-center font-semibold">Haz clic en una alerta para ir al módulo correspondiente</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 ml-2 border-l pl-4 border-border">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-foreground leading-none">{user?.name || "Administrador"}</p>
            <p className="text-[9px] text-muted-foreground font-bold leading-none mt-1 uppercase tracking-widest">
              {user?.role || "ADMIN"}
            </p>
          </div>
          <button
            onClick={logout}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer shadow-sm hover:opacity-90 transition-opacity"
            title="Cerrar sesión"
          >
            {initials}
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Error 404 ─────────────────────────────────────────────────────────────────

function Error404Screen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const numberRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (numberRef.current) {
      animate(numberRef.current, {
        opacity: [0, 1],
        scale: [0.5, 1.1, 1],
        duration: 800,
        easing: "easeOutElastic(1, .5)",
      });
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div ref={numberRef} className="text-8xl font-black text-primary" style={{ fontFamily: "'Outfit', sans-serif", opacity: 0 }}>
        404
      </div>
      <h2 className="text-2xl font-bold mt-4 text-foreground">Página No Encontrada</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        El tratamiento que buscas no existe en nuestro catálogo. Puede que haya sido removido o la URL sea incorrecta.
      </p>
      <div className="flex gap-4 mt-8 justify-center">
        <button
          onClick={() => onNavigate("dashboard")}
          className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          <LayoutDashboard className="w-4 h-4" />
          Volver al Dashboard
        </button>
      </div>
    </div>
  );
}

// ── Error 500 ─────────────────────────────────────────────────────────────────

function Error500Screen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (iconRef.current) {
      animate(iconRef.current, {
        scale: [0.8, 1.1, 1],
        rotate: "1turn",
        opacity: [0, 1],
        duration: 1500,
        easing: "easeOutElastic(1, .5)",
      });
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div ref={iconRef} className="text-red-500 flex items-center justify-center" style={{ opacity: 0 }}>
        <AlertTriangle className="w-24 h-24" />
      </div>
      <div className="text-8xl font-black text-red-500 mt-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
        500
      </div>
      <h2 className="text-2xl font-bold mt-4 text-foreground">Error de Servidor</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        ¡Vaya! Algo salió mal en nuestros servidores. Ya estamos aplicando presoterapia y masajes para restablecer el sistema.
      </p>
      <div className="flex gap-4 mt-8 justify-center">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          Reintentar Cargar
        </button>
        <button
          onClick={() => onNavigate("dashboard")}
          className="px-6 py-3 border border-border text-muted-foreground font-semibold rounded-xl hover:bg-muted/50 transition-all"
        >
          Volver al Dashboard
        </button>
      </div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────

const TOUR_STEPS: Record<string, TourStep[]> = {
  dashboard: [
    {
      selector: "#tour-dashboard-branch",
      title: "1. Selector de Sucursal Activa",
      content: "Utiliza este menú para cambiar entre tus diferentes locales. El dashboard filtrará todas las métricas, citas de hoy y alertas para la sucursal elegida.",
      position: "bottom"
    },
    {
      selector: "#tour-sidebar",
      title: "2. Menú Lateral de Navegación",
      content: "Navega rápidamente entre todas las secciones de administración: Citas, Fichas de Pacientes, Terminal POS, Almacén, Servicios y Reportes.",
      position: "right"
    },
    {
      selector: "#tour-dashboard-kpi",
      title: "3. Tarjetas de Indicadores (KPIs)",
      content: "Revisa la facturación neta acumulada de hoy, total de pacientes con tratamientos activos, y alertas críticas de stock mínimo.",
      position: "bottom"
    },
    {
      selector: "#tour-dashboard-chart",
      title: "4. Evolutivo de Ventas",
      content: "Gráfica semanal de ingresos diarios para auditar las ventas y los picos de facturación de forma visual.",
      position: "top"
    },
    {
      selector: "#tour-dashboard-appointments",
      title: "5. Agenda Diaria Corta",
      content: "Listado con las citas programadas para hoy, detallando paciente, profesional a cargo, tratamiento y estado de confirmación.",
      position: "top"
    },
    {
      selector: "#tour-dashboard-retouches",
      title: "6. Alertas de Retoques Médicos",
      content: "Seguimiento clínico de pacientes que requieren retoques obligatorios (ej. toxina o láser). El sistema emite alertas de vencimiento para contactarlos.",
      position: "top"
    },
    {
      selector: "#tour-user-footer",
      title: "7. Tu Perfil e Identidad",
      content: "Muestra tu usuario y rol activo. Recuerda que las funcionalidades operativas se adaptan automáticamente a tus permisos.",
      position: "top"
    }
  ],
  calendar: [
    {
      selector: "#tour-calendar-cabins",
      title: "1. Vistas de la Agenda",
      content: "Alterna entre la Vista Semanal tradicional y la Vista por Cabinas (Boxes) diarias. Útil para verificar qué salas físicas están desocupadas.",
      position: "bottom"
    },
    {
      selector: "#tour-calendar-create-btn",
      title: "2. Botón Nueva Cita",
      content: "Abre el panel lateral (Slide-over) de Nueva Cita para registrar una reserva de forma rápida y manual.",
      position: "left"
    },
    {
      selector: "#tour-calendar-grid",
      title: "3. Cuadrícula Horaria Interactiva",
      content: "Muestra la agenda del día o semana. Puedes hacer doble clic en cualquier celda para crear una cita en ese horario, o arrastrar una cita existente para reprogramarla.",
      position: "top"
    }
  ],
  patients: [
    {
      selector: "#tour-patients-list",
      title: "1. Filtra y Busca un Expediente",
      content: "Escribe el nombre del paciente en esta barra. Haz clic sobre él para abrir sus fichas, galería de fotos Antes/Después y ver si firmó sus consentimientos.",
      position: "right"
    },
    {
      selector: "#tour-tab-historial",
      title: "2. Pestaña de Historial Clínico",
      content: "Visualiza los antecedentes médicos, patologías previas y anamnesis inicial ingresada en la ficha del paciente.",
      position: "bottom"
    },
    {
      selector: "#tour-tab-evolucion",
      title: "3. Pestaña de Evolución Clínica",
      content: "Bitácora cronológica con las notas de progreso de todas las sesiones realizadas, incluyendo peso, medidas corporales y parámetros láser.",
      position: "bottom"
    },
    {
      selector: "#tour-tab-consentimiento",
      title: "4. Pestaña de Consentimiento Clínico",
      content: "Sección legal para redactar contratos informados de tratamientos estéticos y capturar la firma digital del paciente.",
      position: "bottom"
    },
    {
      selector: "#tour-tab-galeria",
      title: "5. Pestaña de Galería Fotográfica",
      content: "Muro de control visual que ordena las fotos por 'Antes' (Control Inicial) y 'Después' (Control Evolutivo) con sus respectivas notas.",
      position: "bottom"
    },
    {
      selector: "#tour-tab-facturacion",
      title: "6. Pestaña de Historial de Facturación",
      content: "Muestra las boletas de cobro emitidas y los paquetes de bonos multisesión contratados por el paciente.",
      position: "bottom"
    }
  ],
  inventory: [
    {
      selector: "#tour-inventory-catalog",
      title: "1. Controla el Stock de Insumos",
      content: "Revisa la lista de materiales. Si el círculo está en rojo (alerta de stock mínimo), haz clic en el insumo y edita para reponer existencias.",
      position: "top"
    },
    {
      selector: "#tour-inventory-wastes",
      title: "2. Registra una Merma Manual",
      content: "Si un producto se rompe, vence o se derrama, haz clic en registrar movimiento, selecciona Merma e indica la cantidad para descontarlo del stock.",
      position: "top"
    }
  ],
  services: [
    {
      selector: "#tour-services-supplies",
      title: "1. Vincula Insumos a tus Tratamientos",
      content: "Edita un servicio e indica qué insumo consume en cabina (ej. 10ml de gel por sesión). Así, al cobrar la cita, se restará del stock automáticamente.",
      position: "top"
    },
    {
      selector: "#tour-services-packages",
      title: "2. Crea Bonos Multisesión",
      content: "Presiona Crear Bono para armar un paquete de tratamientos (ej. Paquete de 5 Masajes) con descuento. El cliente podrá consumirlo sesión a sesión.",
      position: "top"
    }
  ],
  pos: [
    {
      selector: "#tour-pos-terminal",
      title: "1. Agrega Servicios y Productos",
      content: "Haz clic en los servicios o productos del catálogo para añadirlos al carrito, y asócialos a un paciente buscando su nombre arriba.",
      position: "bottom"
    },
    {
      selector: "#tour-pos-coupons",
      title: "2. Configura Descuentos e Impuestos",
      content: "Aplica cupones promocionales o descuentos manuales. Elige si emitirás un Ticket de control interno o Factura fiscal (con IVA).",
      position: "left"
    },
    {
      selector: "#tour-pos-cash",
      title: "3. Apertura y Cierre de Caja",
      content: "Haz clic aquí para abrir turno con el dinero inicial en efectivo. Registra egresos para compras rápidas y genera el arqueo de cierre al terminar.",
      position: "top"
    },
    {
      selector: "#tour-pos-payroll",
      title: "4. Calcula Comisiones y Nómina",
      content: "Consulta las comisiones del 10% acumuladas por cada profesional clínico y haz clic en liquidar para registrar el pago salarial del mes.",
      position: "top"
    }
  ],
  reports: [
    {
      selector: "#tour-reports-kpi",
      title: "1. Consulta los Totales Financieros",
      content: "Mira los ingresos netos acumulados, comisiones pagadas a terapeutas y el valor contable de los insumos que tienes guardados en tu almacén.",
      position: "bottom"
    },
    {
      selector: "#tour-reports-charts",
      title: "2. Analiza los Métodos de Pago",
      content: "Aquí verás gráficos que muestran qué porcentaje de clientes pagan en efectivo, transferencia o tarjeta para facilitar tu conciliación bancaria.",
      position: "top"
    },
    {
      selector: "#tour-reports-export",
      title: "3. Descarga Reportes Contables",
      content: "Haz clic en exportar para bajar un archivo Excel/CSV con el arqueo de caja y las comisiones pagadas. Envíaselo a tu contador cada fin de mes.",
      position: "top"
    }
  ]
};

// ── INSPECT MODE DATA AND HELPERS ─────────────────────────────────────────────

const INSPECT_DATABASE: Record<string, { title: string; content: string }> = {
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

function getRoleScenariosForSelector(selector: string): { role: string; text: string }[] {
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

interface InspectDetailModalProps {
  item: { title: string; content: string; selector: string } | null;
  onClose: () => void;
}

function InspectDetailModal({ item, onClose }: InspectDetailModalProps) {
  if (!item) return null;

  const rolesScenarios = getRoleScenariosForSelector(item.selector);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300">
      <div
        className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 w-full max-w-xl shadow-2xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200 font-sans"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <MousePointerClick className="w-4.5 h-4.5" />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-white">
              {item.title}
            </h4>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-150/70 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs md:text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
          <p>{item.content}</p>

          <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Uso práctico según tu perfil:
            </span>
            <div className="space-y-3">
              {rolesScenarios.map((sc, index) => (
                <div key={index} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-150/45 dark:border-slate-850/50 flex items-start gap-2.5">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase mt-0.5 flex-shrink-0">
                    {sc.role}
                  </span>
                  <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-normal">
                    {sc.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-850 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl cursor-pointer shadow-md hover:bg-primary/95 transition-all"
          >
            Entendido, continuar
          </button>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const { openHelpCenter } = useTutorial();
  const [screen, setScreen] = useState<Screen>("dashboard");
  const mainRef = useRef<HTMLElement>(null);

  // Theme state and toggle initialization
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  
  const [isPortal] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("portal") === "true";
  });

  const [searchSelectedPatientId, setSearchSelectedPatientId] = useState<string | null>(null);
  const [presetAppointmentData, setPresetAppointmentData] = useState<{ patientId: string; patientName: string; date?: string } | null>(null);
  
  // Dynamically resolve tour steps based on active DOM elements / drawers / active tabs
  // Tour steps removed — will be rebuilt
  // const getActiveSteps = () => [];


  const { syncState, forceSync } = useSyncManager();

  // Notifications State
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.get<{ notifications: SystemNotification[] }>("/notifications");
      setNotifications(data.notifications || []);
    } catch {
      // Silently fail — notifications are non-critical
    }
  }, []);

  // Poll notifications every 60 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);





  useEffect(() => {
    if (isAuthenticated) {
      forceSync();
    }
  }, [isAuthenticated, forceSync]);

  useEffect(() => {
    if (mainRef.current) {
      animate(mainRef.current, {
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 400,
        easing: "easeOutCubic",
      });
    }
  }, [screen]);

  // Onboarding Tour Auto-trigger Logic deactivated per user request (tours are now manually triggered via the Help Center)

  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const todayCapital = today.charAt(0).toUpperCase() + today.slice(1);

  const meta: Record<Screen, { title: string; subtitle: string }> = {
    dashboard: { title: "Dashboard", subtitle: todayCapital },
    calendar: { title: "Calendario de Citas", subtitle: "Vista semanal" },
    patients: { title: "Pacientes", subtitle: "Historial y evolución clínica" },
    pos: { title: "Facturación y Caja", subtitle: "Terminal POS" },
    inventory: { title: "Inventario", subtitle: "Catálogo de productos y tratamientos" },
    services: { title: "Servicios", subtitle: "Catálogo y administración de combos" },
    config: { title: "Configuración", subtitle: "Profesionales, horarios y datos del centro" },
    reports: { title: "Reportes y Analíticas", subtitle: "KPIs, evolución diaria e informes contables" },
    saas: { title: "Consola SaaS Global", subtitle: "Administración global de inquilinos y planes" },
    "error-404": { title: "Página No Encontrada", subtitle: "Recurso no encontrado" },
    "error-500": { title: "Error de Servidor", subtitle: "Error interno del sistema" },
  };

  if (isPortal) {
    return <PatientPortalScreen />;
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-4 animate-bounce">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-semibold text-slate-500 tracking-wider uppercase animate-pulse">
          Cargando Sistema...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden relative p-4 gap-4" style={{ background: 'transparent' }}>
      <Sidebar active={screen} setActive={setScreen} />
      <div className="flex-1 flex flex-col ml-28 min-w-0 overflow-hidden gap-4 h-[calc(100vh-32px)]">
        <Topbar
          {...meta[screen]}
          syncState={syncState}
          notifications={notifications}
          notifPanelOpen={notifPanelOpen}
          onToggleNotifPanel={() => setNotifPanelOpen((prev) => !prev)}
          onCloseNotifPanel={() => setNotifPanelOpen(false)}
          onNavigate={(s) => setScreen(s as Screen)}
          onSelectPatient={(patientId) => {
            setSearchSelectedPatientId(patientId);
            setScreen("patients");
          }}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenHelpCenter={openHelpCenter}
        />
        <main ref={mainRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden glass-panel rounded-3xl p-6 border border-white/10 dark:border-white/5 relative">
          {screen === "dashboard" && (
            <DashboardScreen 
              onNavigate={(s) => setScreen(s as Screen)}
              onScheduleAppointment={(patientId, patientName, date) => {
                setPresetAppointmentData({ patientId, patientName, date });
                setScreen("calendar");
              }}
            />
          )}
          {screen === "calendar" && (
            <CalendarScreen 
              presetAppointmentData={presetAppointmentData}
              clearPresetAppointmentData={() => setPresetAppointmentData(null)}
              onNavigate={(s) => setScreen(s as Screen)}
              onSelectPatient={(patientId) => {
                setSearchSelectedPatientId(patientId);
                setScreen("patients");
              }}
            />
          )}
          {screen === "patients" && (
            <PatientScreen 
              searchSelectedPatientId={searchSelectedPatientId} 
              clearSearchSelectedPatientId={() => setSearchSelectedPatientId(null)} 
            />
          )}
          {screen === "pos" && <FinanceScreen />}
          {screen === "inventory" && <InventoryScreen />}
           {screen === "services" && <ServicesScreen />}
          {screen === "config" && <ConfigScreen />}
          {screen === "reports" && <ReportsScreen />}
          {screen === "saas" && <SuperAdminScreen />}
          {screen === "error-404" && <Error404Screen onNavigate={setScreen} />}
          {screen === "error-500" && <Error500Screen onNavigate={setScreen} />}
        </main>
      </div>

      {/* Help Center, Tutorial Tour, and Puntero de Ayuda */}
      <TutorialTour onNavigate={(s) => setScreen(s as Screen)} />
      <HelpCenterModal />
    </div>
  );
}

export default function App() {
  return (
    <TutorialProvider>
      <AppContent />
    </TutorialProvider>
  );
}
