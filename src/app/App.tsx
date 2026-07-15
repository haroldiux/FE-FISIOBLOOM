import { useState, useEffect, useRef, useCallback } from "react";
import { animate } from "animejs";
import { useAuth } from "./context/AuthContext";
import { api } from "./services/api";
import LoginScreen from "./components/LoginScreen";
import CalendarScreen from "./pages/CalendarScreen";
import PatientScreen from "./pages/PatientScreen";
import ConsentScreen from "./pages/ConsentScreen";
import DashboardScreen from "./pages/DashboardScreen";
import FinanceScreen from "./pages/FinanceScreen";
import InventoryScreen from "./pages/InventoryScreen";
import ServicesScreen from "./pages/ServicesScreen";
import ConfigScreen from "./pages/ConfigScreen";
import ReportsScreen from "./pages/ReportsScreen";
import SuperAdminScreen from "./pages/SuperAdminScreen";
import PatientPortalScreen from "./pages/PatientPortalScreen";
import {
  OnboardingProvider,
  OnboardingOrchestrator,
  OnboardingChecklist,
  useOnboarding,
} from "./modules/onboarding";
import {
  HelpCenterModal,
  TourOrchestrator,
} from "./components/help-center";
import { VIEW_TOURS } from "./data/tutorials";
import type { TourStep } from "./data/tutorials";
import { useTenantSettings } from "./context/TenantSettingsContext";
import { useSyncManager, SyncState } from "./hooks/useSyncManager";
import { applyPalette } from "./lib/palettes";
import { toast } from "sonner";
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
  FileText,
  Save,
} from "lucide-react";

// ── Notification Types ────────────────────────────────────────────────────────

interface SystemNotification {
  id: string;
  type: 'low_stock' | 'expiring_package' | 'overdue_retouch' | 'upcoming_retouch' | 'inactive_package';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  entityId?: string;
  entityName?: string;
  createdAt: string;
  patientId?: string;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Screen =
  | "dashboard"
  | "calendar"
  | "patients"
  | "consents"
  | "pos"
  | "inventory"
  | "services"
  | "config"
  | "reports"
  | "saas"
  | "error-404"
  | "error-500";

const SCREEN_PERMISSIONS: Record<string, Screen[]> = {
  SUPER_ADMIN: ["dashboard", "saas"],
  ADMIN: ["dashboard", "calendar", "patients", "consents", "pos", "inventory", "services", "reports", "config"],
  RECEPTIONIST: ["dashboard", "calendar", "patients", "consents", "pos"],
  PHYSIO: ["dashboard", "calendar", "patients", "consents"],
  AESTHETICIAN: ["dashboard", "calendar", "patients", "consents"],
};

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
    { id: "consents", label: "Firmas", Icon: FileText },
    { id: "pos", label: "Finanzas", Icon: Receipt },
    ...(settings.features.inventory ? [{ id: "inventory", label: "Almacén", Icon: Package }] : []),
    { id: "services", label: "Servicios", Icon: Sparkles },
    { id: "reports", label: "Reportes", Icon: BarChart3 },
  ];

  const systemNav: { id: Screen; label: string; Icon: React.ComponentType<any> }[] = isSuperAdmin ? [] : [
    { id: "config", label: "Ajustes", Icon: Settings },
  ];

  const allowedScreens = user ? SCREEN_PERMISSIONS[user.role] || ["dashboard"] : ["dashboard"];
  const filteredMainNav = mainNav.filter(item => allowedScreens.includes(item.id));
  const filteredSystemNav = systemNav.filter(item => allowedScreens.includes(item.id));

  const NavButton = ({ id, label, Icon }: { id: Screen; label: string; Icon: React.ComponentType<any> }) => {
    const isActive = active === id;
    return (
      <button
        onClick={() => setActive(id)}
        id={`tour-sidebar-${id}`}
        className={`w-14 sm:w-16 py-1.5 md:py-2 px-0.5 md:px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 spring-hover border relative group cursor-pointer ${
          isActive
            ? "bg-primary/20 text-primary dark:text-primary-foreground border-primary/30 shadow-[0_4px_16px_rgba(232,121,249,0.15)]"
            : "text-foreground/50 border-transparent hover:text-foreground hover:bg-accent dark:hover:bg-accent/50"
        }`}
      >
        <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
        <span className={`text-[8px] sm:text-[9px] font-black tracking-widest text-center transition-colors duration-300 uppercase leading-none ${
          isActive ? "text-primary dark:text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
        }`}>
          {label}
        </span>
        {/* Spatial visionOS Floating Label Tooltip */}
        <div className="absolute left-20 bg-popover text-popover-foreground text-[10px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-border z-50 hidden md:block">
          {label}
        </div>
        {isActive && (
          <span className="absolute md:right-1 md:top-1/2 md:-translate-y-1/2 md:w-1 md:h-3 bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
        )}
      </button>
    );
  };

  return (
    <aside id="tour-sidebar" className="fixed z-50 select-none md:left-6 md:top-1/2 md:-translate-y-1/2 md:h-fit md:max-h-[95vh] md:w-20 md:flex-col md:py-6 md:px-0 md:gap-4 md:rounded-3xl glass-capsule bottom-0 left-0 right-0 h-16 w-full flex flex-row items-center justify-between px-4 gap-1 rounded-none border-t border-border bg-card/95 md:bg-transparent backdrop-blur-md">
      {/* Brand Logo */}
      <div className="hidden md:flex w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0 spring-hover mb-1">
        <Sparkles className="w-5 h-5 text-primary-foreground" />
      </div>

      {/* Branch Selector Capsule Button */}
      <div className="hidden md:block">
        <BranchSelectorButton />
      </div>

      <div className="hidden md:block w-8 h-[1px] bg-border flex-shrink-0" />

      {/* Nav */}
      <nav className="flex flex-row md:flex-col gap-1 md:gap-3 overflow-x-auto md:overflow-y-auto [&::-webkit-scrollbar]:hidden py-1 w-full justify-around md:justify-start">
        {filteredMainNav.map((item) => <NavButton key={item.id} {...item} />)}
        {filteredSystemNav.length > 0 && (
          <>
            <div className="hidden md:block w-8 h-[1px] bg-border my-1 self-center flex-shrink-0" />
            {filteredSystemNav.map((item) => <NavButton key={item.id} {...item} />)}
          </>
        )}
      </nav>

      {/* User footer avatar button */}
      <div className="hidden md:block">
        <UserFooterButton setActive={setActive} />
      </div>
    </aside>
  );
}

function UserFooterButton({ setActive }: { setActive: (s: Screen) => void }) {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "A";
  const hasConfigAccess = user ? SCREEN_PERMISSIONS[user.role]?.includes("config") : false;

  return (
    <div id="tour-user-footer" className="mt-auto flex-shrink-0 group/user">
      <button
        onClick={() => {
          if (hasConfigAccess) {
            setActive("config");
          }
        }}
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
  onOpenProfileModal,
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
  onOpenHelpCenter?: () => void;
  onOpenProfileModal: () => void;
}) {
  const { user, logout } = useAuth();
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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
    <header className="h-16 glass-panel rounded-2xl flex items-center justify-between px-3 md:px-6 flex-shrink-0 z-40 border border-border gap-2">
      <div className="leading-tight flex-shrink-0">
        <h1 className="text-sm md:text-base font-bold text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground font-medium hidden sm:block">{subtitle}</p>
      </div>
      <div className="flex items-center gap-1.5 md:gap-3 ml-auto">
        <ConnectionIndicator state={syncState} />
        {user && user.role !== "SUPER_ADMIN" && (
          <button
            onClick={handleToggleAttendance}
            disabled={attendanceLoading}
            className={`hidden sm:flex items-center gap-1.5 px-2 md:px-3 py-1.5 text-[10px] font-black rounded-xl border transition-all duration-300 spring-hover shadow-sm cursor-pointer ${
              hasCheckedIn
                ? "bg-error/10 border-error/30 text-error hover:bg-error/20"
                : "bg-success/10 border-success/30 text-success hover:bg-success/20"
            }`}
          >
            <Clock className={`w-3 h-3 ${attendanceLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{hasCheckedIn ? "FICHAR SALIDA" : "FICHAR ENTRADA"}</span>
          </button>
        )}
        <div id="tour-topbar-search" className="relative w-28 xs:w-36 sm:w-48 md:w-60" ref={searchContainerRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            placeholder="Buscar paciente..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/45 transition-all placeholder:text-muted-foreground"
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

        {/* Theme Switcher Button */}
        <button
          onClick={onToggleTheme}
          className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl hover:bg-muted transition-all spring-hover cursor-pointer text-muted-foreground"
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
            <div className="absolute right-0 top-12 w-96 rounded-2xl border border-border bg-popover shadow-2xl z-[9000] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 notifications-panel">
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
                        : notif.type === 'inactive_package' ? AlertTriangle
                        : Syringe;
                      const iconBg = notif.severity === 'critical' ? 'bg-destructive/10 text-destructive border border-destructive/10'
                        : notif.severity === 'warning' ? 'bg-warning/10 text-warning border border-warning/10'
                        : 'bg-muted text-muted-foreground border border-border';
                      const badgeBg = notif.severity === 'critical' ? 'bg-destructive/20 text-destructive border border-destructive/30'
                        : notif.severity === 'warning' ? 'bg-warning/20 text-warning border border-warning/30'
                        : 'bg-muted text-muted-foreground border border-border';
                      const targetScreen = notif.type === 'low_stock' ? 'inventory'
                        : notif.type === 'expiring_package' || notif.type === 'inactive_package' ? 'patients'
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

        {/* Help / Onboarding checklist button */}
        <button
          id="tour-topbar-helpcenter"
          onClick={onOpenHelpCenter}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground"
          title="Ayuda y onboarding"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3 sm:ml-2 sm:border-l sm:pl-4 border-border relative">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-foreground leading-none">{user?.name || "Administrador"}</p>
            <p className="text-[9px] text-muted-foreground font-bold leading-none mt-1 uppercase tracking-widest">
              {user?.role || "ADMIN"}
            </p>
          </div>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            data-tour="profile-menu"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xs font-bold cursor-pointer shadow-sm hover:opacity-90 transition-opacity"
            title="Ver opciones de perfil"
          >
            {initials}
          </button>
          
          {profileMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
              <div className="absolute right-0 top-11 w-48 glass-panel rounded-2xl p-2 z-50 border border-border shadow-2xl flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onOpenProfileModal();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-accent hover:text-foreground transition-all cursor-pointer"
                >
                  Mi Perfil
                </button>
                {user && user.role !== "SUPER_ADMIN" && (
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleToggleAttendance();
                    }}
                    className="sm:hidden w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-accent hover:text-foreground transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>{hasCheckedIn ? "Fichar Salida" : "Fichar Entrada"}</span>
                    <Clock className="w-3.5 h-3.5 text-primary" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onToggleTheme();
                  }}
                  className="sm:hidden w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-accent hover:text-foreground transition-all cursor-pointer flex items-center justify-between"
                >
                  <span>Tema: {theme === "dark" ? "Claro" : "Oscuro"}</span>
                  {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-warning" /> : <Moon className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                <div className="w-full h-[1px] bg-border my-1" />
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-error hover:bg-error/10 transition-all cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </div>
            </>
          )}
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

// ── Profile Settings Modal ────────────────────────────────────────────────────

interface ProfileSettingsModalProps {
  onClose: () => void;
}

function ProfileSettingsModal({ onClose }: ProfileSettingsModalProps) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!email.trim()) {
      setError("El correo electrónico es obligatorio.");
      return;
    }
    if (password) {
      if (password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      const response = await api.post<{ message: string; user: any }>("/auth/profile", {
        name,
        email,
        password: password || undefined,
      });

      // Update auth context state
      updateUser({
        name: response.user.name,
        email: response.user.email,
      });

      toast.success("Perfil actualizado con éxito.");
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-full max-w-md mx-4 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">Configuración de Perfil</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-xs text-error">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Nombre *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Correo Electrónico *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Nueva Contraseña (Opcional)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
            />
          </div>

          {password && (
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                required
              />
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold border border-border rounded-xl hover:bg-muted/50 text-foreground transition-all cursor-pointer bg-transparent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── HELPER DATA DELEGATED TO TUTORIALDATA.TS ──────────────

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();
  const { settings: tenantSettings } = useTenantSettings();
  const [screen, setScreen] = useState<Screen>("dashboard");

  useEffect(() => {
    if (user) {
      const allowed = SCREEN_PERMISSIONS[user.role] || ["dashboard"];
      if (!allowed.includes(screen)) {
        setScreen("dashboard");
      }
    }
  }, [screen, user]);
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

  // Help Center modal + active tour state. Lives in AppContent so both
  // the Topbar's `?` handler and the help-center modal/orchestrator
  // share the same source of truth (no new context).
  const [helpCenterOpen, setHelpCenterOpen] = useState(false);
  const [activeTour, setActiveTour] = useState<TourStep[] | null>(null);

  const { syncState, forceSync } = useSyncManager();

  // Profile Settings Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const knownNotificationIdsRef = useRef<Set<string>>(new Set());

  const fetchNotifications = useCallback(async (isInitial = false) => {
    try {
      const data = await api.get<{ notifications: SystemNotification[] }>("/notifications");
      const list = data.notifications || [];

      if (!isInitial) {
        list.forEach((notif) => {
          if (!knownNotificationIdsRef.current.has(notif.id)) {
            if (notif.severity === "critical") {
              toast.error(`${notif.title}: ${notif.message}`);
            } else if (notif.severity === "warning") {
              toast.warning(`${notif.title}: ${notif.message}`);
            }
          }
        });
      }

      const newKnown = new Set<string>();
      list.forEach((n) => newKnown.add(n.id));
      knownNotificationIdsRef.current = newKnown;

      setNotifications(list);
    } catch {
      // Silently fail — notifications are non-critical
    }
  }, []);

  // Poll notifications every 60 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(false), 60 * 1000);
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
    <OnboardingProvider onNavigate={(s) => setScreen(s as Screen)} activeScreen={screen}>
      <AppShell
        screen={screen}
        setScreen={setScreen}
        mainRef={mainRef}
        syncState={syncState}
        notifications={notifications}
        notifPanelOpen={notifPanelOpen}
        setNotifPanelOpen={setNotifPanelOpen}
        searchSelectedPatientId={searchSelectedPatientId}
        setSearchSelectedPatientId={setSearchSelectedPatientId}
        presetAppointmentData={presetAppointmentData}
        setPresetAppointmentData={setPresetAppointmentData}
        theme={theme}
        toggleTheme={toggleTheme}
        meta={meta}
        profileModalOpen={profileModalOpen}
        setProfileModalOpen={setProfileModalOpen}
        helpCenterOpen={helpCenterOpen}
        setHelpCenterOpen={setHelpCenterOpen}
        activeTour={activeTour}
        setActiveTour={setActiveTour}
      />
      <OnboardingOrchestrator />
      <OnboardingChecklist />
      <HelpCenterModal
        open={helpCenterOpen}
        onOpenChange={setHelpCenterOpen}
        userRole={user?.role ?? "ADMIN"}
        activeScreen={screen}
        onLaunchTour={(tour) => {
          setActiveTour(tour);
          setHelpCenterOpen(false);
        }}
      />
      <TourOrchestrator
        tour={activeTour}
        activeScreen={screen}
        onNavigate={(s) => setScreen(s as Screen)}
        onClose={() => setActiveTour(null)}
      />
    </OnboardingProvider>
  );
}

// Extracted inner shell so OnboardingProvider can wrap it
function AppShell({
  screen, setScreen, mainRef, syncState, notifications, notifPanelOpen, setNotifPanelOpen,
  searchSelectedPatientId, setSearchSelectedPatientId, presetAppointmentData, setPresetAppointmentData,
  theme, toggleTheme, meta, profileModalOpen, setProfileModalOpen,
  helpCenterOpen, setHelpCenterOpen, activeTour, setActiveTour,
}: {
  screen: Screen;
  setScreen: (s: Screen) => void;
  mainRef: React.RefObject<HTMLElement | null>;
  syncState: SyncState;
  notifications: SystemNotification[];
  notifPanelOpen: boolean;
  setNotifPanelOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  searchSelectedPatientId: string | null;
  setSearchSelectedPatientId: (id: string | null) => void;
  presetAppointmentData: any;
  setPresetAppointmentData: (d: any) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  meta: Record<string, { title: string; subtitle: string }>;
  profileModalOpen: boolean;
  setProfileModalOpen: (v: boolean) => void;
  helpCenterOpen: boolean;
  setHelpCenterOpen: (v: boolean) => void;
  activeTour: TourStep[] | null;
  setActiveTour: (t: TourStep[] | null) => void;
}) {
  const { openChecklist, promptTutorialForCurrentScreen } = useOnboarding();

  // `?` button dispatch. When the current screen has a dedicated view
  // tour, open the new Help Center modal so the user can search across
  // guides / workflows / roles / FAQs. Otherwise fall through to the
  // existing OnboardingContext path (AlertDialog + checklist) so
  // OnboardingContext stays untouched per the design.
  const handleOpenHelpCenter = () => {
    if (VIEW_TOURS[screen as keyof typeof VIEW_TOURS]) {
      setHelpCenterOpen(true);
    } else {
      promptTutorialForCurrentScreen();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden relative p-2 md:p-4 gap-2 md:gap-4" style={{ background: 'transparent' }}>
      <Sidebar active={screen} setActive={setScreen} />
      <div className="flex-1 flex flex-col md:ml-28 ml-0 min-w-0 overflow-hidden gap-2 md:gap-4 h-[calc(100vh-16px)] md:h-[calc(100vh-32px)] pb-16 md:pb-0">
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
          onOpenHelpCenter={handleOpenHelpCenter}
          onOpenProfileModal={() => setProfileModalOpen(true)}
        />
        <main ref={mainRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden glass-panel rounded-2xl md:rounded-3xl p-3 md:p-6 border border-border relative">
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
          {screen === "consents" && <ConsentScreen />}
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

      {profileModalOpen && (
        <ProfileSettingsModal onClose={() => setProfileModalOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
