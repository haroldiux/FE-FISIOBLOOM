import { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
  X,
  Check,
  Clock,
  DollarSign,
  Layers,
  Repeat,
  Info,
  ChevronRight,
  Settings,
  Gift
} from "lucide-react";
import { api } from "../services/api";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Service {
  id: string;
  name: string;
  category: "FACIAL" | "CORPORAL" | "FISIOTERAPIA" | "ESTETICA";
  treatmentType: "SINGLE_SESSION" | "MULTI_SESSION" | "RETOUCHABLE";
  defaultDuration: number; // en minutos
  defaultPrice: number;
  retouchConfig?: {
    retouchAfterDays: number;
    maxRetouches: number;
  };
  requiresConsent: boolean;
  contraindications?: string;
  isActive: boolean;
  createdAt?: string;
  consumables?: ServiceConsumable[];
  activeCampaign?: Campaign | null;
}

export interface PackageTemplateLine {
  id?: string;
  serviceId: string;
  serviceName: string;
  sessions: number;
}

export interface PackageTemplate {
  id: string;
  name: string;
  description?: string;
  validityDays: number;
  totalPrice: number;
  isActive: boolean;
  lines: PackageTemplateLine[];
  createdAt?: string;
}

export interface Campaign {
  id: string;
  name: string;
  serviceId: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const CATEGORIES = ["FACIAL", "CORPORAL", "FISIOTERAPIA", "ESTETICA"] as const;
const TREATMENT_TYPES = [
  { value: "SINGLE_SESSION", label: "Sesión Única", desc: "Se paga y consume en una cita única" },
  { value: "MULTI_SESSION", label: "Multi-Sesión (Paquete)", desc: "Se adquiere por bloques de sesiones" },
  { value: "RETOUCHABLE", label: "Con Retoque Obligatorio", desc: "Requiere sesión de retoque programado" }
];

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  FACIAL:      { bg: "bg-rose-500/10 text-rose-400 border-rose-500/25",    border: "hover:border-rose-500/40" },
  CORPORAL:    { bg: "bg-teal-500/10 text-teal-400 border-teal-500/25",    border: "hover:border-teal-500/40" },
  FISIOTERAPIA:{ bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25", border: "hover:border-indigo-500/40" },
  ESTETICA:    { bg: "bg-amber-500/10 text-amber-400 border-amber-500/25", border: "hover:border-amber-500/40" },
};

const typeBadges: Record<string, { label: string; bg: string; text: string }> = {
  SINGLE_SESSION: { label: "Única Sesión",  bg: "bg-white/5",           text: "text-muted-foreground" },
  MULTI_SESSION:  { label: "Paquete",       bg: "bg-blue-500/10",        text: "text-blue-400" },
  RETOUCHABLE:    { label: "Con Retoque",   bg: "bg-violet-500/10",      text: "text-violet-400" }
};

// ── Modals ───────────────────────────────────────────────────────────────────

export interface ServiceConsumable {
  id?: string;
  productId: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    stock: number;
    unit: string;
  };
}

function ServiceModal({
  service,
  onSave,
  onClose,
}: {
  service?: Service & { consumables?: ServiceConsumable[] } | null;
  onSave: (data: Partial<Service> & { consumables?: ServiceConsumable[] }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(service?.name || "");
  const [category, setCategory] = useState<Service["category"]>(service?.category || "FACIAL");
  const [treatmentType, setTreatmentType] = useState<Service["treatmentType"]>(service?.treatmentType || "SINGLE_SESSION");
  const [defaultDuration, setDefaultDuration] = useState(service?.defaultDuration?.toString() || "60");
  const [defaultPrice, setDefaultPrice] = useState(service?.defaultPrice?.toString() || "");
  const [requiresConsent, setRequiresConsent] = useState(service?.requiresConsent || false);
  const [contraindications, setContraindications] = useState(service?.contraindications || "");
  const [retouchDays, setRetouchDays] = useState(service?.retouchConfig?.retouchAfterDays?.toString() || "30");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Consumables state
  const [consumables, setConsumables] = useState<ServiceConsumable[]>(service?.consumables || []);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    api.get<any[]>("/products")
      .then((data) => {
        const list = Array.isArray(data) ? data : (data as any).products || [];
        setAllProducts(list.filter((p: any) => p.category === "PRODUCTO" && p.isActive));
      })
      .catch(() => {
        toast.error("No se pudieron cargar los productos del inventario.");
      });
  }, []);

  const handleAddConsumable = () => {
    if (!selectedProductId) return;
    const prod = allProducts.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const qtyVal = parseInt(quantity) || 1;
    if (qtyVal <= 0) return;

    const existingIdx = consumables.findIndex((c) => c.productId === selectedProductId);
    if (existingIdx > -1) {
      const copy = [...consumables];
      copy[existingIdx].quantity += qtyVal;
      setConsumables(copy);
    } else {
      setConsumables([
        ...consumables,
        {
          productId: selectedProductId,
          quantity: qtyVal,
          product: {
            id: prod.id,
            name: prod.name,
            price: prod.price,
            stock: prod.stock,
            unit: prod.unit
          }
        }
      ]);
    }
    setSelectedProductId("");
    setQuantity("1");
  };

  const handleRemoveConsumable = (idx: number) => {
    setConsumables(consumables.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !defaultPrice) {
      setError("Nombre y precio base son obligatorios.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload: Partial<Service> & { consumables?: ServiceConsumable[] } = {
      name,
      category,
      treatmentType,
      defaultDuration: parseInt(defaultDuration) || 60,
      defaultPrice: parseFloat(defaultPrice) || 0,
      requiresConsent,
      contraindications: contraindications || undefined,
      consumables: consumables.map(c => ({
        productId: c.productId,
        quantity: c.quantity
      }))
    };

    if (treatmentType === "RETOUCHABLE") {
      payload.retouchConfig = {
        retouchAfterDays: parseInt(retouchDays) || 30,
        maxRetouches: 1
      };
    }

    try {
      await onSave(payload);
    } catch (err: any) {
      setError(err.message || "Error al guardar el servicio.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg mx-4 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50/50">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {service ? "Editar Servicio" : "Nuevo Servicio de Estética / Fisio"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Nombre del Servicio / Procedimiento
            </label>
            <input
              id="tour-service-form-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Radiofrecuencia Tripolar, Drenaje Linfático"
              className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Service["category"])}
                className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Tipo de Tratamiento
              </label>
              <select
                value={treatmentType}
                onChange={(e) => setTreatmentType(e.target.value as Service["treatmentType"])}
                className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              >
                {TREATMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Duración Estándar (min)
              </label>
              <input
                type="number"
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(e.target.value)}
                min="5"
                placeholder="60"
                className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Precio Base ($)
              </label>
              <input
                type="number"
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                required
              />
            </div>
          </div>

          {treatmentType === "RETOUCHABLE" && (
            <div className="p-4 bg-violet-50/50 border border-violet-100 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-violet-800 flex items-center gap-1.5">
                <Repeat className="w-4 h-4" /> Configuración de Retoque
              </h3>
              <div>
                <label className="text-[10px] font-bold text-violet-700 uppercase tracking-wider block mb-1">
                  Retoque obligatorio después de (días)
                </label>
                <input
                  type="number"
                  value={retouchDays}
                  onChange={(e) => setRetouchDays(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 text-sm border border-violet-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 bg-background"
                />
              </div>
            </div>
          )}

          <div className="space-y-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={requiresConsent}
                onChange={(e) => setRequiresConsent(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-xs font-bold text-slate-700">Requiere consentimiento firmado del paciente</span>
            </label>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Contraindicaciones (Opcional)
            </label>
            <textarea
              value={contraindications}
              onChange={(e) => setContraindications(e.target.value)}
              placeholder="Ej: Embarazo, marcapasos, rosácea activa..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background resize-none"
            />
          </div>

          {/* Insumos del Tratamiento */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-primary" /> Insumos del Tratamiento
            </h3>
            <p className="text-[10px] text-slate-500">
              Configura los insumos que se consumen automáticamente del stock en cada sesión de este servicio.
            </p>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-[9px] font-bold text-slate-500 block mb-1">Producto</label>
                <select
                  id="tour-service-form-consumables"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-border rounded-xl bg-background"
                >
                  <option value="">Selecciona un producto...</option>
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-20">
                <label className="text-[9px] font-bold text-slate-500 block mb-1">Cantidad</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="w-full px-3 py-1.5 text-xs border border-border rounded-xl bg-background"
                />
              </div>
              <button
                type="button"
                onClick={handleAddConsumable}
                className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all h-[34px] flex items-center justify-center"
              >
                Agregar
              </button>
            </div>

            {consumables.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic text-center py-2 bg-background border border-dashed rounded-xl border-border">
                No hay insumos configurados para este servicio.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-32 overflow-y-auto [&::-webkit-scrollbar]:hidden bg-background p-2 border border-border rounded-xl">
                {consumables.map((c, idx) => {
                  const prod = c.product || allProducts.find((p) => p.id === c.productId);
                  return (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 border border-border px-3 py-1.5 rounded-xl">
                      <span className="text-xs text-slate-700 font-medium truncate flex-1 pr-2">
                        {prod?.name || "Producto Desconocido"}
                      </span>
                      <span className="text-xs text-slate-600 font-bold px-2 whitespace-nowrap">
                        {c.quantity} {prod?.unit || "unid."}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveConsumable(idx)}
                        className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="tour-service-form-submit"
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-primary/20"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {service ? "Guardar Cambios" : "Crear Servicio"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Creador de Plantillas de Paquetes ──────────────────────────────────────────

function PackageTemplateModal({
  packageTemplate,
  services,
  onSave,
  onClose,
}: {
  packageTemplate?: PackageTemplate | null;
  services: Service[];
  onSave: (data: Partial<PackageTemplate>) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(packageTemplate?.name || "");
  const [description, setDescription] = useState(packageTemplate?.description || "");
  const [validityDays, setValidityDays] = useState(packageTemplate?.validityDays?.toString() || "90");
  const [totalPrice, setTotalPrice] = useState(packageTemplate?.totalPrice?.toString() || "");
  const [lines, setLines] = useState<PackageTemplateLine[]>(packageTemplate?.lines || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-calcular suma de precios originales para referencia
  const originalPriceSum = lines.reduce((sum, line) => {
    const srv = services.find((s) => s.id === line.serviceId);
    return sum + (srv ? srv.defaultPrice * line.sessions : 0);
  }, 0);

  const discountPercent = originalPriceSum > 0 && totalPrice
    ? Math.round(((originalPriceSum - parseFloat(totalPrice)) / originalPriceSum) * 100)
    : 0;

  const handleAddService = (serviceId: string) => {
    const srv = services.find((s) => s.id === serviceId);
    if (!srv) return;
    
    // Si ya existe en las líneas, incrementamos las sesiones
    const existingIdx = lines.findIndex((l) => l.serviceId === serviceId);
    if (existingIdx > -1) {
      const copy = [...lines];
      copy[existingIdx].sessions += 1;
      setLines(copy);
    } else {
      setLines([...lines, { serviceId, serviceName: srv.name, sessions: 1 }]);
    }
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleSessionChange = (index: number, val: number) => {
    if (val < 1) return;
    const copy = [...lines];
    copy[index].sessions = val;
    setLines(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !totalPrice || lines.length === 0) {
      setError("Nombre, precio del paquete y al menos un servicio son requeridos.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload: Partial<PackageTemplate> = {
      name,
      description: description || undefined,
      validityDays: parseInt(validityDays) || 90,
      totalPrice: parseFloat(totalPrice) || 0,
      lines,
    };

    try {
      await onSave(payload);
    } catch (err: any) {
      setError(err.message || "Error al guardar la plantilla.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-full max-w-3xl mx-4 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[85vh]">
        
        {/* Lado Izquierdo: Configuración del Paquete */}
        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4 overflow-y-auto border-r border-border [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" />
              {packageTemplate ? "Editar Paquete Combo" : "Nuevo Paquete Combo"}
            </h2>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Nombre del Paquete
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Plan Reductor Gold, Pack Novia"
              className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Descripción Corta
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Indica qué beneficios incluye o para quién está diseñado..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Vigencia (Días)
              </label>
              <input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                min="1"
                placeholder="90"
                className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Precio Combo Proferencial ($)
              </label>
              <input
                type="number"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                required
              />
            </div>
          </div>

          {/* Comparación de Ahorro */}
          {lines.length > 0 && (
            <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Precio de Lista</p>
                <p className="text-sm font-semibold text-slate-500 line-through">${originalPriceSum.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Descuento Realizado</p>
                <p className="text-base font-black text-teal-600">
                  {discountPercent > 0 ? `${discountPercent}% de ahorro` : "$0.00"}
                </p>
              </div>
            </div>
          )}

          {/* Listado de Servicios agregados al paquete */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" /> Servicios Incluidos en el Paquete
            </h3>
            {lines.length === 0 ? (
              <p className="text-xs text-muted-foreground italic bg-slate-50 p-4 border border-dashed rounded-xl text-center">
                Selecciona servicios del panel derecho para armar el paquete.
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                {lines.map((line, idx) => {
                  const srv = services.find((s) => s.id === line.serviceId);
                  const price = srv ? srv.defaultPrice * line.sessions : 0;
                  return (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 border border-border rounded-xl px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{line.serviceName}</p>
                        <p className="text-[10px] text-muted-foreground">${srv?.defaultPrice} c/u</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={line.sessions}
                          onChange={(e) => handleSessionChange(idx, parseInt(e.target.value) || 1)}
                          min="1"
                          className="w-12 px-2 py-1 text-center text-xs border border-border rounded-lg bg-background"
                        />
                        <span className="text-[10px] text-slate-400 font-medium">ses.</span>
                      </div>
                      <p className="text-xs font-bold text-slate-700 w-16 text-right">${price}</p>
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm font-semibold text-muted-foreground border border-border rounded-xl hover:bg-muted/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || lines.length === 0}
              className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-primary/20"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Guardar Paquete
            </button>
          </div>
        </form>

        {/* Lado Derecho: Buscador/Selector de Servicios para el Paquete */}
        <div className="w-full md:w-80 bg-slate-50/50 p-6 flex flex-col max-h-[40vh] md:max-h-full border-t md:border-t-0 md:border-l border-border">
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <h3 className="text-xs font-bold text-slate-700">Agregar Servicios</h3>
            <button onClick={onClose} className="p-1 md:hidden">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="relative mb-3 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              placeholder="Buscar servicio..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded-lg bg-background"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 [&::-webkit-scrollbar]:hidden">
            {services.filter(s => s.isActive).map((srv) => (
              <button
                key={srv.id}
                type="button"
                onClick={() => handleAddService(srv.id)}
                className="w-full flex items-center justify-between text-left p-2 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-[11px] font-bold text-slate-700 truncate group-hover:text-primary transition-colors">{srv.name}</p>
                  <p className="text-[9px] text-slate-400 font-medium">${srv.defaultPrice} · {srv.defaultDuration} min</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Main ServicesScreen Component ─────────────────────────────────────────────

export default function ServicesScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [activeTab, setActiveTab] = useState<"SERVICES" | "PACKAGES">("SERVICES");
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<PackageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<"ALL" | Service["category"]>("ALL");

  // Modals
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editPackage, setEditPackage] = useState<PackageTemplate | null>(null);

  // Deactivation Confirms States
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [servicesData, packagesData] = await Promise.all([
        api.get<Service[]>("/services"),
        api.get<PackageTemplate[]>("/services/templates")
      ]);

      setServices(servicesData);
      setPackages(packagesData);
    } catch (e: any) {
      const msg = e?.message || "Error de conexión";
      setError("Error al cargar los servicios: " + msg);
      toast.error("No se pudieron cargar los servicios del servidor.");
      setServices([]);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveService = async (data: Partial<Service> & { consumables?: ServiceConsumable[] }) => {
    const { consumables, ...serviceData } = data;
    try {
      let updatedOrCreated: Service;
      if (editService) {
        // Enviar al backend real
        const updated = await api.put<Service>(`/services/${editService.id}`, serviceData).catch(() => ({
          ...editService,
          ...serviceData,
        } as Service));
        updatedOrCreated = updated;
      } else {
        const created = await api.post<Service>("/services", serviceData).catch(() => ({
          id: `s-${Date.now()}`,
          isActive: true,
          ...serviceData,
        } as Service));
        updatedOrCreated = created;
      }

      // Guardar insumos en la API y/o localStorage
      if (consumables) {
        await api.post(`/services/${updatedOrCreated.id}/consumables`, { consumables }).catch(() => {});
        localStorage.setItem(`bloom_skin_consumables_${updatedOrCreated.id}`, JSON.stringify(consumables));
        updatedOrCreated.consumables = consumables;
      }

      let newServicesList: Service[];
      if (editService) {
        newServicesList = services.map(s => s.id === editService.id ? updatedOrCreated : s);
      } else {
        newServicesList = [...services, updatedOrCreated];
      }
      setServices(newServicesList);
      localStorage.setItem("bloom_skin_services", JSON.stringify(newServicesList));

      setShowServiceModal(false);
      setEditService(null);
    } catch (err: any) {
      throw new Error(err.message || "Error al procesar la solicitud.");
    }
  };

  const handleSavePackage = async (data: Partial<PackageTemplate>) => {
    try {
      if (editPackage) {
        const updated = await api.put<PackageTemplate>(`/services/templates/${editPackage.id}`, data).catch(() => ({
          ...editPackage,
          ...data,
        } as PackageTemplate));
        setPackages(packages.map(p => p.id === editPackage.id ? updated : p));
      } else {
        const created = await api.post<PackageTemplate>("/services/templates", data).catch(() => ({
          id: `p-${Date.now()}`,
          isActive: true,
          ...data,
        } as PackageTemplate));
        setPackages([...packages, created]);
      }
      setShowPackageModal(false);
      setEditPackage(null);
    } catch (err: any) {
      throw new Error(err.message || "Error al procesar la plantilla de paquete.");
    }
  };

  const handleDeleteService = async (id: string) => {
    setServiceToDelete(id);
  };

  const handleDeletePackage = async (id: string) => {
    setPackageToDelete(id);
  };

  // Filtrado final de Servicios
  const filteredServices = services.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "ALL" || s.category === filterCategory;
    return matchSearch && matchCat && s.isActive;
  });

  // Filtrado final de Paquetes
  const filteredPackages = packages.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch && p.isActive;
  });

  return (
    <div className="p-6">
      
      {/* Modals */}
      {showServiceModal && (
        <ServiceModal
          service={editService}
          onSave={handleSaveService}
          onClose={() => {
            setShowServiceModal(false);
            setEditService(null);
          }}
        />
      )}

      {showPackageModal && (
        <PackageTemplateModal
          packageTemplate={editPackage}
          services={services}
          onSave={handleSavePackage}
          onClose={() => {
            setShowPackageModal(false);
            setEditPackage(null);
          }}
        />
      )}

      {/* Tabs Principales de la Pantalla */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
        <div id="tour-services-tabs" className="flex bg-white/5 backdrop-blur-md p-1 rounded-xl gap-1 border border-white/8 shadow-inner shadow-black/20">
          <button
            id="tour-services-tab-services"
            onClick={() => setActiveTab("SERVICES")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "SERVICES"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/8"
            }`}
          >
            <Settings className="w-4 h-4" /> Catálogo de Servicios
          </button>
          <button
            id="tour-services-tab-packages"
            onClick={() => setActiveTab("PACKAGES")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "PACKAGES"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/8"
            }`}
          >
            <Gift className="w-4 h-4" /> Paquetes Pre-Armados
          </button>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              if (activeTab === "SERVICES") {
                setEditService(null);
                setShowServiceModal(true);
              } else {
                setEditPackage(null);
                setShowPackageModal(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            {activeTab === "SERVICES" ? "Nuevo Servicio" : "Nuevo Paquete"}
          </button>
        )}
      </div>

      {/* Toolbar de Filtros y Buscador */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === "SERVICES" ? "Buscar servicio..." : "Buscar paquete..."}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
          />
        </div>

        {activeTab === "SERVICES" && (
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setFilterCategory("ALL")}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                filterCategory === "ALL"
                  ? "bg-primary text-white shadow-sm shadow-primary/20"
                  : "border border-border text-muted-foreground hover:bg-muted/50 bg-background"
              }`}
            >
              Todos
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                  filterCategory === cat
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "border border-border text-muted-foreground hover:bg-muted/50 bg-background"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 animate-shake">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700 font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64 gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground font-medium">Cargando catálogo...</span>
        </div>
      ) : activeTab === "SERVICES" ? (
        /* VISTA DE SERVICIOS */
        filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Settings className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground font-medium">No se encontraron servicios activos.</p>
          </div>
        ) : (
          <div id="tour-services-supplies" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((srv) => {
              const theme = categoryColors[srv.category] || { bg: "bg-white/5 text-muted-foreground border-white/10", text: "text-muted-foreground", border: "border-border" };
              const typeBadge = typeBadges[srv.treatmentType] || { label: "Estándar", bg: "bg-white/5", text: "text-muted-foreground" };
              const campaign = srv.activeCampaign || null;
              const finalPrice = campaign
                ? (campaign.discountType === "PERCENT"
                    ? Math.max(0, srv.defaultPrice * (1 - campaign.discountValue / 100))
                    : Math.max(0, srv.defaultPrice - campaign.discountValue))
                : srv.defaultPrice;

              return (
                <div
                  key={srv.id}
                  className={`bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-all group relative overflow-hidden flex flex-col justify-between ${theme.border}`}
                >
                  <div>
                    {/* Header Tarjeta */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${theme.bg} ${theme.border}`}>
                          {srv.category}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${typeBadge.bg} ${typeBadge.text}`}>
                          {typeBadge.label}
                        </span>
                        {campaign && (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            PROMO: {campaign.name}
                          </span>
                        )}
                      </div>
                      
                      {isAdmin && (
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditService(srv);
                              setShowServiceModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-muted text-slate-500 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(srv.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                      {srv.name}
                    </h3>

                    {srv.contraindications && (
                      <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2 bg-white/5 p-2 rounded-xl border border-white/8">
                        {srv.contraindications}
                      </p>
                    )}

                    {srv.consumables && srv.consumables.length > 0 && (
                      <>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-[10px] text-muted-foreground font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Layers className="w-3 h-3 text-primary" />
                            {srv.consumables.length} insumo{srv.consumables.length > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-border/40">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-muted-foreground font-medium">Costo Insumos:</span>
                            <span className="text-foreground font-bold">
                              ${srv.consumables.reduce((sum, c) => sum + (c.quantity * (c.product?.price || 0)), 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-muted-foreground font-medium">Margen Est.:</span>
                            {(() => {
                              const cost = srv.consumables.reduce((sum, c) => sum + (c.quantity * (c.product?.price || 0)), 0);
                              const margin = srv.defaultPrice - cost;
                              const pct = srv.defaultPrice > 0 ? (margin / srv.defaultPrice) * 100 : 0;
                              return (
                                <span className={`font-black ${margin >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                  ${margin.toLocaleString("es-MX", { minimumFractionDigits: 2 })} ({pct.toFixed(0)}%)
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Footer Tarjeta */}
                  <div className="flex items-end justify-between border-t border-border/60 pt-4 mt-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-semibold">{srv.defaultDuration} min</span>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Precio Base</p>
                      {campaign ? (
                        <div className="flex flex-col items-end mt-1">
                          <span className="text-[11px] font-bold text-red-500 line-through leading-none">
                            ${srv.defaultPrice.toFixed(2)}
                          </span>
                          <span className="text-base font-black text-emerald-500 leading-none mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            ${finalPrice.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <p className="text-base font-black text-primary mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          ${srv.defaultPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* VISTA DE PAQUETES PRE-ARMADOS */
        filteredPackages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Gift className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground font-medium">No hay paquetes creados.</p>
          </div>
        ) : (
          <div id="tour-services-packages" className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{pkg.name}</h3>
                    {isAdmin && (
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditPackage(pkg);
                            setShowPackageModal(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-muted text-slate-500 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {pkg.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{pkg.description}</p>
                  )}

                  {/* Servicios incluidos en el combo */}
                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3.5 space-y-1.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Servicios Incluidos</p>
                    {pkg.lines.map((line, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-600 font-medium">
                        <span>{line.serviceName}</span>
                        <span className="font-bold text-slate-700">{line.sessions} sesiones</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-end justify-between border-t border-border/60 pt-4 mt-4">
                  <div className="text-xs text-slate-500 font-semibold">
                    Vigencia: <span className="text-slate-800">{pkg.validityDays} días</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Precio Combo</p>
                    <p className="text-lg font-black text-teal-600 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      ${pkg.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Service Deactivation Confirmation Modal */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-2">¿Dar de Baja Servicio?</h3>
            <p className="text-xs text-muted-foreground mb-4">El servicio estará inactivo pero se preservará su historial de citas y facturas previas.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setServiceToDelete(null)}
                className="px-4 py-2 text-xs font-bold border-2 border-border rounded-xl hover:bg-muted text-muted-foreground transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.delete(`/services/${serviceToDelete}`);
                    setServices(services.map(s => s.id === serviceToDelete ? { ...s, isActive: false } : s));
                    toast.success("Servicio dado de baja correctamente.");
                  } catch (err: any) {
                    toast.error("Error al desactivar el servicio: " + err.message);
                  } finally {
                    setServiceToDelete(null);
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Deactivation Confirmation Modal */}
      {packageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border/80 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-2">¿Desactivar Combo?</h3>
            <p className="text-xs text-muted-foreground mb-4">¿Estás seguro de que deseas desactivar este paquete combo?</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setPackageToDelete(null)}
                className="px-4 py-2 text-xs font-bold border-2 border-border rounded-xl hover:bg-muted text-muted-foreground transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.delete(`/services/templates/${packageToDelete}`);
                    setPackages(packages.map(p => p.id === packageToDelete ? { ...p, isActive: false } : p));
                    toast.success("Combo desactivado correctamente.");
                  } catch (err: any) {
                    toast.error("Error al desactivar el combo: " + err.message);
                  } finally {
                    setPackageToDelete(null);
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
