import React, { useState, useEffect } from "react";
import {
  Building2,
  Clock,
  Users,
  Save,
  Loader2,
  AlertTriangle,
  Check,
  Plus,
  Trash2,
  Edit2,
  X,
  Shield,
  Eye,
  EyeOff,
  MessageCircle,
  Wifi,
  WifiOff,
  FlaskConical,
  Bell,
  ToggleLeft,
  ToggleRight,
  ClipboardList,
  ChevronDown,
  MapPin,
  Phone,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTenantSettings } from "../context/TenantSettingsContext";

// ── WhatsApp Types ─────────────────────────────────────────────────────────────

interface WhatsAppStatus {
  redisActive: boolean;
  queueEngine: string;
  totalSent: number;
  lastProcessed: string | null;
  lastPatient: string | null;
}

interface WhatsAppLog {
  id: string;
  patientName: string;
  phone: string;
  message: string;
  sentAt: string;
  status: 'SIMULADO' | 'ENVIADO' | 'ERROR';
  appointmentId: string;
}

interface WhatsAppSettings {
  enabled: boolean;
  retouchReminders: boolean;
  anticipationHours: 24 | 48 | 2;
  senderName: string;
  apiToken: string;
  phoneNumberId: string;
  messageTemplate: string;
}

const DEFAULT_SETTINGS: WhatsAppSettings = {
  enabled: true,
  retouchReminders: true,
  anticipationHours: 24,
  senderName: "Centro Estético",
  apiToken: "",
  phoneNumberId: "",
  messageTemplate: "Hola {{nombre_paciente}}, te recordamos tu cita de {{servicio}} con {{profesional}} mañana a las {{hora_cita}}. ¡Te esperamos!",
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface Professional {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  workingHours: Record<string, { start: string; end: string }> | null;
}

interface ProfessionalForm {
  name: string;
  email: string;
  password: string;
  role: string;
}

const DAYS = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

const ROLES = ["ADMIN", "PHYSIO", "AESTHETICIAN", "RECEPTIONIST"];

const roleBadge: Record<string, string> = {
  ADMIN: "bg-red-500/10 text-red-400 border border-red-500/20",
  PHYSIO: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  AESTHETICIAN: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  RECEPTIONIST: "bg-white/5 text-muted-foreground border border-white/10",
};

const roleLabel: Record<string, string> = {
  ADMIN: "Administrador",
  PHYSIO: "Fisioterapeuta",
  AESTHETICIAN: "Esteticista",
  RECEPTIONIST: "Recepcionista",
};

// ── Working Hours Editor ──────────────────────────────────────────────────────

function WorkingHoursEditor({
  professionalId,
  currentHours,
  onSaved,
}: {
  professionalId: string;
  currentHours: Record<string, { start: string; end: string }> | null;
  onSaved: () => void;
}) {
  const [hours, setHours] = useState<Record<string, { start: string; end: string } | null>>(
    Object.fromEntries(
      DAYS.map((d) => [d.key, currentHours?.[d.key] || null])
    )
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const toggleDay = (key: string) => {
    setHours((prev) => ({
      ...prev,
      [key]: prev[key] ? null : { start: "09:00", end: "18:00" },
    }));
  };

  const updateTime = (key: string, field: "start" | "end", value: string) => {
    setHours((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || { start: "09:00", end: "18:00" }), [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const filtered = Object.fromEntries(
        Object.entries(hours).filter(([, v]) => v !== null)
      );
      await api.put(`/professionals/${professionalId}/working-hours`, { workingHours: filtered });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
    } catch (e: any) {
      setError(e.message || "Error al guardar horarios.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      {DAYS.map(({ key, label }) => {
        const active = !!hours[key];
        return (
          <div key={key} className="flex items-center gap-3">
            <button
              onClick={() => toggleDay(key)}
              className={`w-24 text-xs font-bold py-1.5 px-2 rounded-lg border transition-all flex-shrink-0 ${
                active
                  ? "bg-primary text-white border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {label}
            </button>
            {active ? (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={hours[key]!.start}
                  onChange={(e) => updateTime(key, "start", e.target.value)}
                  className="px-2 py-1 text-xs border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                />
                <span className="text-xs text-muted-foreground">—</span>
                <input
                  type="time"
                  value={hours[key]!.end}
                  onChange={(e) => updateTime(key, "end", e.target.value)}
                  className="px-2 py-1 text-xs border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                />
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">No labora</span>
            )}
          </div>
        );
      })}

      {error && (
        <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : saved ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Save className="w-3.5 h-3.5" />
        )}
        {saved ? "¡Guardado!" : "Guardar Horarios"}
      </button>
    </div>
  );
}

// ── Branches Types & Modal ───────────────────────────────────────────────────

interface Branch {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
}

interface BranchForm {
  name: string;
  address: string;
  phone: string;
}

function BranchModal({
  branch,
  onSave,
  onClose,
}: {
  branch?: Branch | null;
  onSave: (data: BranchForm) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<BranchForm>({
    name: branch?.name || "",
    address: branch?.address || "",
    phone: branch?.phone || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("El nombre de la sucursal es obligatorio.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (e: any) {
      setError(e.message || "Error al guardar la sucursal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-full max-w-md mx-4 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">
            {branch ? "Editar Sucursal" : "Nueva Sucursal"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Nombre de Sucursal *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Sucursal Del Valle"
              className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Dirección</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Ej: Av. Insurgentes Sur 1234"
              className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Teléfono</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Ej: +52 55 1234 5678"
              className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold border border-border rounded-xl hover:bg-muted/50 text-foreground transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {branch ? "Guardar Cambios" : "Crear Sucursal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── New Professional Modal ─────────────────────────────────────────────────────

function ProfessionalModal({
  onSave,
  onClose,
}: {
  onSave: (data: ProfessionalForm) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ProfessionalForm>({
    name: "",
    email: "",
    password: "",
    role: "PHYSIO",
  });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (e: any) {
      setError(e.message || "Error al crear el profesional.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-full max-w-md mx-4 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">Nuevo Profesional</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Nombre *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Dr. Juan Pérez"
              className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="juan@bloomskin.com"
              className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Contraseña *</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Rol</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
            >
              {ROLES.map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Crear Profesional
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main ConfigScreen ─────────────────────────────────────────────────────────

export default function ConfigScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"professionals" | "clinic" | "whatsapp" | "branches">("professionals");

  // WhatsApp State
  const [waStatus, setWaStatus] = useState<WhatsAppStatus | null>(null);
  const [waLogs, setWaLogs] = useState<WhatsAppLog[]>([]);
  const [waSettings, setWaSettings] = useState<WhatsAppSettings>(DEFAULT_SETTINGS);
  const [waLoading, setWaLoading] = useState(false);
  const [waTestSending, setWaTestSending] = useState(false);
  const [waTestResult, setWaTestResult] = useState<string | null>(null);
  const [showApiToken, setShowApiToken] = useState(false);

  // Tenant Settings & Feature Flags State
  const { settings: tenantSettings, updateSettings } = useTenantSettings();
  const [primaryColor, setPrimaryColor] = useState(tenantSettings.branding.primaryColor);
  const [savingTenantSettings, setSavingTenantSettings] = useState(false);

  // Clinic Contact Info State
  const [contactInfo, setContactInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  // Branches State
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [showBranchModal, setShowBranchModal] = useState(false);

  useEffect(() => {
    setPrimaryColor(tenantSettings.branding.primaryColor);
    if (tenantSettings.contactInfo) {
      setContactInfo({
        name: tenantSettings.contactInfo.name || '',
        address: tenantSettings.contactInfo.address || '',
        phone: tenantSettings.contactInfo.phone || '',
        email: tenantSettings.contactInfo.email || '',
      });
    }
    if (tenantSettings.whatsapp) {
      setWaSettings({
        enabled: tenantSettings.whatsapp.enabled ?? DEFAULT_SETTINGS.enabled,
        retouchReminders: tenantSettings.whatsapp.retouchReminders ?? DEFAULT_SETTINGS.retouchReminders,
        anticipationHours: tenantSettings.whatsapp.anticipationHours ?? DEFAULT_SETTINGS.anticipationHours,
        senderName: tenantSettings.whatsapp.senderName ?? DEFAULT_SETTINGS.senderName,
        apiToken: tenantSettings.whatsapp.apiToken ?? DEFAULT_SETTINGS.apiToken,
        phoneNumberId: tenantSettings.whatsapp.phoneNumberId ?? DEFAULT_SETTINGS.phoneNumberId,
        messageTemplate: tenantSettings.whatsapp.messageTemplate ?? DEFAULT_SETTINGS.messageTemplate,
      });
    }
  }, [tenantSettings]);

  const handleToggleFeature = async (featureKey: 'multiBranch' | 'inventory' | 'portalPaciente') => {
    try {
      await updateSettings({
        features: {
          ...tenantSettings.features,
          [featureKey]: !tenantSettings.features[featureKey]
        }
      });
    } catch (err: any) {
      setError("Error al actualizar características: " + err.message);
    }
  };

  const handleSaveTenantSettings = async () => {
    setSavingTenantSettings(true);
    setError(null);
    try {
      await updateSettings({
        branding: {
          ...tenantSettings.branding,
          primaryColor
        },
        contactInfo
      });
      setWaTestResult("✅ Configuración del centro médico guardada correctamente.");
      setTimeout(() => setWaTestResult(null), 3000);
    } catch (err: any) {
      setError("Error al guardar la configuración: " + err.message);
    } finally {
      setSavingTenantSettings(false);
    }
  };

  useEffect(() => {
    loadProfessionals();
  }, []);

  useEffect(() => {
    if (activeTab === "whatsapp" && isAdmin) {
      setWaLoading(true);
      Promise.all([
        api.get<WhatsAppStatus>("/whatsapp/status"),
        api.get<{ logs: WhatsAppLog[] }>("/whatsapp/logs"),
      ]).then(([status, logs]) => {
        setWaStatus(status);
        setWaLogs(logs.logs || []);
      }).catch(() => {}).finally(() => setWaLoading(false));
    } else if (activeTab === "branches" && isAdmin) {
      loadBranches();
    }
  }, [activeTab, isAdmin]);

  const handleSaveWaSettings = async () => {
    setWaLoading(true);
    setWaTestResult(null);
    try {
      await updateSettings({
        whatsapp: {
          enabled: waSettings.enabled,
          retouchReminders: waSettings.retouchReminders,
          anticipationHours: waSettings.anticipationHours,
          senderName: waSettings.senderName,
          apiToken: waSettings.apiToken,
          phoneNumberId: waSettings.phoneNumberId,
          messageTemplate: waSettings.messageTemplate,
        }
      });
      setWaTestResult("✅ Configuración de WhatsApp guardada correctamente.");
      setTimeout(() => setWaTestResult(null), 3000);
    } catch (e: any) {
      setWaTestResult(`❌ Error: ${e.message}`);
    } finally {
      setWaLoading(false);
    }
  };

  const loadBranches = async () => {
    setBranchesLoading(true);
    setError(null);
    try {
      const data = await api.get<Branch[]>("/branches");
      setBranches(data);
    } catch (e: any) {
      setError(e.message || "Error al cargar sucursales.");
    } finally {
      setBranchesLoading(false);
    }
  };

  const handleCreateOrUpdateBranch = async (form: BranchForm) => {
    try {
      if (editingBranch) {
        await api.put(`/branches/${editingBranch.id}`, form);
      } else {
        await api.post("/branches", form);
      }
      setShowBranchModal(false);
      setEditingBranch(null);
      await loadBranches();
    } catch (e: any) {
      setError(e.message || "Error al guardar sucursal.");
      throw e;
    }
  };

  const handleToggleBranchActive = async (branch: Branch) => {
    try {
      await api.put(`/branches/${branch.id}`, { isActive: !branch.isActive });
      await loadBranches();
    } catch (e: any) {
      setError(e.message || "Error al cambiar estado de la sucursal.");
    }
  };

  const handleSendTestReminder = async () => {
    setWaTestSending(true);
    setWaTestResult(null);
    try {
      await api.post("/whatsapp/test", {
        patientName: "Paciente de Prueba",
        phone: "+54 9 11 0000-0000",
        message: waSettings.messageTemplate
          .replace("{{nombre_paciente}}", "Paciente de Prueba")
          .replace("{{servicio}}", "Sesión de Prueba")
          .replace("{{profesional}}", "Terapeuta")
          .replace("{{hora_cita}}", "10:30"),
      });
      setWaTestResult("📱 Recordatorio de prueba enviado (simulado) correctamente.");
      // Refresh logs
      const logs = await api.get<{ logs: WhatsAppLog[] }>("/whatsapp/logs");
      setWaLogs(logs.logs || []);
    } catch (e: any) {
      setWaTestResult(`❌ Error: ${e.message}`);
    } finally {
      setWaTestSending(false);
    }
  };

  const previewMessage = waSettings.messageTemplate
    .replace("{{nombre_paciente}}", "Ana García")
    .replace("{{servicio}}", "Presoterapia")
    .replace("{{profesional}}", "Lic. Martínez")
    .replace("{{hora_cita}}", "10:30");

  const loadProfessionals = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ professionals: Professional[] } | Professional[]>("/professionals");
      const list = Array.isArray(data) ? data : (data as any).professionals || [];
      setProfessionals(list);
    } catch (e: any) {
      setError(e.message || "Error al cargar profesionales.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfessional = async (form: ProfessionalForm) => {
    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      await loadProfessionals();
      setShowNewModal(false);
    } catch (e: any) {
      setError(e.message || "Error al crear profesional.");
      throw e;
    }
  };

  const handleToggleActive = async (pro: Professional) => {
    try {
      await api.put(`/professionals/${pro.id}`, { isActive: !pro.isActive });
      await loadProfessionals();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="p-6">
      {showNewModal && (
        <ProfessionalModal
          onSave={handleCreateProfessional}
          onClose={() => setShowNewModal(false)}
        />
      )}

      {/* Tabs */}
      <div id="tour-config-tabs" className="flex gap-1 bg-input-background p-1 rounded-xl mb-6 w-fit border border-border shadow-inner">
        {([
          { id: "professionals" as const, label: "Profesionales", Icon: Users },
          { id: "clinic" as const, label: "Centro Médico", Icon: Building2 },
          ...(isAdmin ? [
            { id: "branches" as const, label: "Sucursales", Icon: MapPin },
            { id: "whatsapp" as const, label: "WhatsApp", Icon: MessageCircle }
          ] : []),
        ] as { id: "professionals" | "clinic" | "whatsapp" | "branches"; label: string; Icon: React.ComponentType<any> }[]).map(({ id, label, Icon }) => (
          <button
            key={id}
            id={`tour-config-${id}-tab`}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === id
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-3 h-3" /></button>
        </div>
      )}

      {/* Professionals tab */}
      {activeTab === "professionals" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Gestión de Profesionales</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {professionals.filter((p) => p.isActive).length} activos · {professionals.length} total
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowNewModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                Nuevo Profesional
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Cargando...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {professionals.map((pro) => (
                <div key={pro.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        pro.isActive
                          ? "bg-gradient-to-br from-cyan-400 to-teal-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {pro.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-foreground">{pro.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge[pro.role] || "bg-muted text-muted-foreground"}`}>
                          {roleLabel[pro.role] || pro.role}
                        </span>
                        {!pro.isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{pro.email}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => setExpandedId(expandedId === pro.id ? null : pro.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <Clock className="w-3 h-3" />
                            Horarios
                          </button>
                          <button
                            onClick={() => handleToggleActive(pro)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all spring-hover ${
                              pro.isActive
                                ? "border border-red-500/30 text-red-400 hover:bg-red-500/10"
                                : "border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            }`}
                          >
                            {pro.isActive ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                            {pro.isActive ? "Desactivar" : "Activar"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Working hours panel */}
                  {expandedId === pro.id && (
                    <div className="border-t border-border px-4 py-4 bg-muted/20">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Horario Laboral — {pro.name}
                      </h4>
                      <WorkingHoursEditor
                        professionalId={pro.id}
                        currentHours={pro.workingHours}
                        onSaved={loadProfessionals}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clinic tab */}
      {activeTab === "clinic" && (
        <div className="max-w-xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-foreground">Información del Centro Médico</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Personaliza el nombre, dirección y configuraciones generales del inquilino.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Nombre del Centro
              </label>
              <input
                value={contactInfo.name}
                onChange={e => setContactInfo(s => ({ ...s, name: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Dirección
              </label>
              <input
                value={contactInfo.address}
                onChange={e => setContactInfo(s => ({ ...s, address: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Teléfono
                </label>
                <input
                  value={contactInfo.phone}
                  onChange={e => setContactInfo(s => ({ ...s, phone: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Email
                </label>
                <input
                  value={contactInfo.email}
                  onChange={e => setContactInfo(s => ({ ...s, email: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          {/* SaaS Settings & Feature Flags (Admin Only) */}
          {isAdmin && (
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-foreground">Características y Módulos</h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Activa o desactiva módulos funcionales para este inquilino.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Multi-sucursal</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Habilitar administración de múltiples sedes físicas</p>
                  </div>
                  <button
                    onClick={() => handleToggleFeature('multiBranch')}
                    className="flex-shrink-0 ml-4 focus:outline-none cursor-pointer"
                  >
                    {tenantSettings.features.multiBranch
                      ? <ToggleRight className="w-8 h-8 text-primary" />
                      : <ToggleLeft className="w-8 h-8 text-muted-foreground/45" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Módulo de Inventario</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Control de stock de insumos y consumos automáticos</p>
                  </div>
                  <button
                    onClick={() => handleToggleFeature('inventory')}
                    className="flex-shrink-0 ml-4 focus:outline-none cursor-pointer"
                  >
                    {tenantSettings.features.inventory
                      ? <ToggleRight className="w-8 h-8 text-primary" />
                      : <ToggleLeft className="w-8 h-8 text-muted-foreground/45" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Portal del Paciente</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Permitir reservas online y consulta de historial a pacientes</p>
                  </div>
                  <button
                    onClick={() => handleToggleFeature('portalPaciente')}
                    className="flex-shrink-0 ml-4 focus:outline-none cursor-pointer"
                  >
                    {tenantSettings.features.portalPaciente
                      ? <ToggleRight className="w-8 h-8 text-primary" />
                      : <ToggleLeft className="w-8 h-8 text-muted-foreground/45" />}
                  </button>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Color Primario Corporativo (Branding)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 border border-border rounded-xl cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="px-3 py-2 text-xs border border-border rounded-lg bg-background w-28 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveTenantSettings}
                disabled={savingTenantSettings}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-95 transition-all disabled:opacity-60 cursor-pointer"
              >
                {savingTenantSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar Configuración SaaS
              </button>
            </div>
          )}
        </div>
      )}

      {/* WhatsApp tab — Admin only */}
      {activeTab === "whatsapp" && isAdmin && (
        <div className="space-y-6 max-w-3xl">
          <div>
            <h2 className="text-base font-bold text-foreground">Recordatorios por WhatsApp</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Configura el envío automático de mensajes de recordatorio a los pacientes antes de sus citas.
            </p>
          </div>

          {waLoading ? (
            <div className="flex items-center gap-3 h-32">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Cargando estado del sistema...</span>
            </div>
          ) : (
            <>
              {/* A — Status Card */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5" />
                  Estado del Sistema de Colas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-muted/30 rounded-xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Motor</p>
                    <div className="flex items-center gap-1.5">
                      {waStatus?.redisActive ? <Wifi className="w-3.5 h-3.5 text-emerald-500" /> : <WifiOff className="w-3.5 h-3.5 text-amber-500" />}
                      <span className="text-xs font-bold text-foreground">{waStatus?.redisActive ? 'BullMQ' : 'Memoria'}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Enviados</p>
                    <p className="text-lg font-black text-primary">{waStatus?.totalSent ?? 0}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-xl col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Último recordatorio</p>
                    <p className="text-xs font-semibold text-foreground truncate">
                      {waStatus?.lastPatient
                        ? `${waStatus.lastPatient} — ${new Date(waStatus.lastProcessed!).toLocaleString('es-MX')}`
                        : 'Sin registros aún'}
                    </p>
                  </div>
                </div>
              </div>

              {/* B — Settings */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" />
                  Configuración de Recordatorios
                </h3>

                {/* Toggles */}
                <div className="space-y-3">
                  {([
                    { key: 'enabled' as const, label: 'Activar envío automático de recordatorios', desc: 'Se disparará automáticamente al crear una cita' },
                    { key: 'retouchReminders' as const, label: 'Incluir recordatorios de retoques vencidos', desc: 'Notifica a pacientes con retoques médicos pendientes' },
                  ] as { key: 'enabled' | 'retouchReminders'; label: string; desc: string }[]).map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                      <button
                        onClick={() => setWaSettings(s => ({ ...s, [key]: !s[key] }))}
                        className="flex-shrink-0 ml-4"
                      >
                        {waSettings[key]
                          ? <ToggleRight className="w-8 h-8 text-emerald-500" />
                          : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Anticipation */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Anticipación del recordatorio
                  </label>
                  <div className="flex gap-2">
                    {([2, 24, 48] as const).map((h) => (
                      <button
                        key={h}
                        onClick={() => setWaSettings(s => ({ ...s, anticipationHours: h }))}
                        className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all ${
                          waSettings.anticipationHours === h
                            ? 'bg-primary text-white border-primary'
                            : 'border-border text-muted-foreground hover:border-primary/40'
                        }`}
                      >
                        {h === 2 ? '2 horas antes' : h === 24 ? '24h antes' : '48h antes'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Credentials */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Nombre del remitente</label>
                    <input
                      value={waSettings.senderName}
                      onChange={e => setWaSettings(s => ({ ...s, senderName: e.target.value }))}
                      placeholder="Ej: Bloom Skin Clinic"
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                    />
                  </div>
                  <div className="relative">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Token API WhatsApp Business (opcional)
                    </label>
                    <input
                      type={showApiToken ? 'text' : 'password'}
                      value={waSettings.apiToken}
                      onChange={e => setWaSettings(s => ({ ...s, apiToken: e.target.value }))}
                      placeholder="EAAxxxxx... (dejar vacío para modo simulado)"
                      className="w-full px-3 py-2.5 pr-10 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                    />
                    <button onClick={() => setShowApiToken(v => !v)} className="absolute right-3 top-9 text-muted-foreground">
                      {showApiToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {!waSettings.apiToken && (
                      <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Sin token: los recordatorios quedan en modo simulado (solo logs).
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* C — Message Template */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  Plantilla del Mensaje
                </h3>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Variables disponibles:
                    <span className="font-mono ml-1 text-primary">{'{{nombre_paciente}}'}</span>
                    <span className="font-mono ml-1 text-primary">{'{{servicio}}'}</span>
                    <span className="font-mono ml-1 text-primary">{'{{profesional}}'}</span>
                    <span className="font-mono ml-1 text-primary">{'{{hora_cita}}'}</span>
                  </label>
                  <textarea
                    value={waSettings.messageTemplate}
                    onChange={e => setWaSettings(s => ({ ...s, messageTemplate: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background resize-none"
                  />
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">Vista previa del mensaje</p>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">{previewMessage}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveWaSettings}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Guardar configuración
                  </button>
                  <button
                    onClick={handleSendTestReminder}
                    disabled={waTestSending}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50"
                  >
                    {waTestSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
                    Enviar prueba
                  </button>
                </div>
                {waTestResult && (
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{waTestResult}</p>
                )}
              </div>

              {/* D — Logs */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
                  <ClipboardList className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Log de Recordatorios ({waLogs.length})</h3>
                </div>
                {waLogs.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
                    No hay recordatorios registrados aún.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {waLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 px-5 py-3">
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-full mt-0.5 flex-shrink-0 ${
                          log.status === 'ENVIADO' ? 'bg-emerald-100 text-emerald-700'
                          : log.status === 'ERROR' ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                        }`}>{log.status}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground">{log.patientName} <span className="font-normal text-muted-foreground">({log.phone})</span></p>
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{log.message}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground flex-shrink-0">
                          {new Date(log.sentAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
      {/* Branches tab — Admin only */}
      {activeTab === "branches" && isAdmin && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Sedes / Sucursales</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5 font-sans">
                Administra las sedes físicas y clínicas de tu organización.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingBranch(null);
                setShowBranchModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nueva Sucursal
            </button>
          </div>

          {branchesLoading ? (
            <div className="flex items-center justify-center h-40 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Cargando sucursales...</span>
            </div>
          ) : branches.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-card border border-border border-dashed rounded-2xl">
              <MapPin className="w-8 h-8 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-semibold text-muted-foreground">No hay sucursales registradas.</p>
              <p className="text-xs text-muted-foreground mt-1">Crea tu primera sede para empezar a organizar tu clínica.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:border-primary/30 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {branch.name}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        branch.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {branch.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-muted-foreground">
                      {branch.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground/75" />
                          <span>{branch.address}</span>
                        </div>
                      )}
                      {branch.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground/75" />
                          <span>{branch.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-5 pt-3 border-t border-border/50">
                    <button
                      onClick={() => {
                        setEditingBranch(branch);
                        setShowBranchModal(true);
                      }}
                      className="p-2 text-muted-foreground hover:text-foreground rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleBranchActive(branch)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer ${
                        branch.isActive
                          ? "border-red-500/20 text-red-500 hover:bg-red-500/10"
                          : "border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10"
                      }`}
                      title={branch.isActive ? "Desactivar" : "Activar"}
                    >
                      {branch.isActive ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showBranchModal && (
        <BranchModal
          branch={editingBranch}
          onSave={handleCreateOrUpdateBranch}
          onClose={() => {
            setShowBranchModal(false);
            setEditingBranch(null);
          }}
        />
      )}
    </div>
  );
}
