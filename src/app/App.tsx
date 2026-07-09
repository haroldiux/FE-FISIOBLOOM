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
import { applyPalette } from "./lib/palettes";
import TutorialTour from "./components/TutorialTour";
import HelpCenterModal from "./components/HelpCenterModal";
import { toast } from "sonner";
import { INSPECT_DATABASE, getRoleScenariosForSelector } from "./data/tutorialData";
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
  Clock,
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
        className="w-16 py-2 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border transition-all duration-300 spring-hover cursor-pointer"
      >
        <MapPin className="w-5 h-5 flex-shrink-0" />
        <span className="text-[9px] font-black tracking-widest text-center transition-colors duration-300 uppercase text-muted-foreground group-hover/branch:text-foreground">
          Centros
        </span>
        <div className="absolute left-20 bg-popover text-popover-foreground text-[10px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover/branch:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-border z-50">
          Centros / Sucursales
        </div>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-20 top-0 w-56 glass-panel rounded-2xl p-2 z-50 border border-border shadow-2xl flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 duration-150">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-2.5 py-1.5 border-b border-border mb-1">
              Sucursal Activa
            </p>
            <button
              onClick={() => { handleSelect(""); setOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                !selectedBranchId ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              Todas las Sucursales
            </button>
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => { handleSelect(b.id); setOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                  selectedBranchId === b.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
    { id: "pos", label: "Finanzas", Icon: Receipt },
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
            : "text-foreground/50 border-transparent hover:text-foreground hover:bg-accent dark:hover:bg-accent/50"
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className={`text-[9px] font-black tracking-widest text-center transition-colors duration-300 uppercase leading-none ${
          isActive ? "text-primary dark:text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
        }`}>
          {label}
        </span>
        {/* Spatial visionOS Floating Label Tooltip */}
        <div className="absolute left-20 bg-popover text-popover-foreground text-[10px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-border z-50">
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
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0 spring-hover mb-1">
        <Sparkles className="w-5 h-5 text-primary-foreground" />
      </div>

      {/* Branch Selector Capsule Button */}
      <BranchSelectorButton />

      <div className="w-8 h-[1px] bg-border flex-shrink-0" />

      {/* Nav */}
      <nav className="flex flex-col gap-3 overflow-y-auto [&::-webkit-scrollbar]:hidden py-1">
        {mainNav.map((item) => <NavButton key={item.id} {...item} />)}
        {systemNav.length > 0 && (
          <>
            <div className="w-8 h-[1px] bg-border my-1 self-center flex-shrink-0" />
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
        className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
      >
        {initials}
        <div className="absolute left-20 bg-popover text-popover-foreground text-[10px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover/user:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-border z-50">
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
      <div id="tour-topbar-sync" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold shadow-sm border border-border transition-all duration-300">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Sincronizando...</span>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div id="tour-topbar-sync" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10 text-warning text-xs font-semibold shadow-sm border border-warning/20 transition-all duration-300">
        <CloudOff className="w-3.5 h-3.5 animate-pulse" />
        <span>Trabajando localmente</span>
      </div>
    );
  }

  return (
    <div id="tour-topbar-sync" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-semibold shadow-sm border border-success/20 transition-all duration-300" title="Todo sincronizado con la nube">
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

  // Attendance checking state in Topbar
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN") {
      fetchAttendanceStatus();
    }
  }, [user]);

  const fetchAttendanceStatus = async () => {
    try {
      const data = await api.get<{ hasCheckedIn: boolean }>("/attendance/status");
      setHasCheckedIn(data.hasCheckedIn);
    } catch (err) {
      console.error("Error al obtener estado de asistencia:", err);
    }
  };

  const handleToggleAttendance = async () => {
    try {
      setAttendanceLoading(true);
      if (hasCheckedIn) {
        await api.post("/attendance/check-out");
        setHasCheckedIn(false);
        toast.success("Turno finalizado: Salida registrada.");
      } else {
        await api.post("/attendance/check-in");
        setHasCheckedIn(true);
        toast.success("Turno iniciado: Entrada registrada.");
      }
    } catch (err: any) {
      toast.error(err.message || err.error || "Error al registrar la asistencia.");
    } finally {
      setAttendanceLoading(false);
    }
  };

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
    <header className="h-16 glass-panel rounded-2xl flex items-center justify-between px-6 flex-shrink-0 z-40 border border-border">
      <div className="leading-tight">
        <h1 className="text-base font-bold text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <ConnectionIndicator state={syncState} />
        {user && user.role !== "SUPER_ADMIN" && (
          <button
            onClick={handleToggleAttendance}
            disabled={attendanceLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black rounded-xl border transition-all duration-300 spring-hover shadow-sm cursor-pointer ${
              hasCheckedIn
                ? "bg-error/10 border-error/30 text-error hover:bg-error/20"
                : "bg-success/10 border-success/30 text-success hover:bg-success/20"
            }`}
          >
            <Clock className={`w-3 h-3 ${attendanceLoading ? "animate-spin" : ""}`} />
            {hasCheckedIn ? "FICHAR SALIDA" : "FICHAR ENTRADA"}
          </button>
        )}
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
          {theme === "dark" ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4" />}
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
              <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] rounded-full bg-destructive border-2 border-card text-destructive-foreground text-[8px] font-bold flex items-center justify-center leading-none px-0.5">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>

          {notifPanelOpen && (
            <div className="absolute right-0 top-12 w-96 rounded-2xl border border-border bg-popover shadow-2xl z-[9000] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-foreground" />
                  <span className="text-sm font-bold text-foreground">Notificaciones</span>
                  {notifications.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">{notifications.length}</span>
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
                    <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mb-3">
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
                      const iconBg = notif.severity === 'critical' ? 'bg-destructive/10 text-destructive border border-destructive/10'
                        : notif.severity === 'warning' ? 'bg-warning/10 text-warning border border-warning/10'
                        : 'bg-muted text-muted-foreground border border-border';
                      const badgeBg = notif.severity === 'critical' ? 'bg-destructive/20 text-destructive border border-destructive/30'
                        : notif.severity === 'warning' ? 'bg-warning/20 text-warning border border-warning/30'
                        : 'bg-muted text-muted-foreground border border-border';
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
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xs font-bold cursor-pointer shadow-sm hover:opacity-90 transition-opacity"
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
          className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2"
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
      <div ref={iconRef} className="text-destructive flex items-center justify-center" style={{ opacity: 0 }}>
        <AlertTriangle className="w-24 h-24" />
      </div>
      <div className="text-8xl font-black text-destructive mt-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
        500
      </div>
      <h2 className="text-2xl font-bold mt-4 text-foreground">Error de Servidor</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        ¡Vaya! Algo salió mal en nuestros servidores. Ya estamos aplicando presoterapia y masajes para restablecer el sistema.
      </p>
      <div className="flex gap-4 mt-8 justify-center">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-destructive text-destructive-foreground font-semibold rounded-xl hover:bg-destructive/90 transition-all flex items-center gap-2"
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

// ── HELPER DATA DELEGATED TO TUTORIALDATA.TS ──────────────

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const { openHelpCenter } = useTutorial();
  const { settings: tenantSettings } = useTenantSettings();
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

  // Keep the palette class on <html> in sync with the active tenant.
  // TenantSettingsContext already injects the class on mount/load, but we
  // re-apply here so that anyone who manipulates the DOM directly (e.g.
  // browser dev tools) cannot desync the theme from the application state.
  useEffect(() => {
    applyPalette(tenantSettings.branding.palette);
  }, [tenantSettings.branding.palette]);

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
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-4 animate-bounce">
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </div>
        <p className="text-sm font-semibold text-muted-foreground tracking-wider uppercase animate-pulse">
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
        <main ref={mainRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden glass-panel rounded-3xl p-6 border border-border relative">
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

      {/* Help Center and Tutorial Tour */}
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
