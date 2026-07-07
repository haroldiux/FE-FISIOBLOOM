import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
  X,
  Check,
  TrendingDown,
  History,
  SlidersHorizontal,
  DollarSign,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  isActive: boolean;
  createdAt: string;
}

interface ProductForm {
  name: string;
  category: string;
  price: string;
  stock: string;
  unit: string;
}

interface Movement {
  id: string;
  productId: string;
  type: "STOCK_IN" | "STOCK_OUT" | "SESSION_CONSUMPTION";
  quantity: number;
  notes?: string;
  createdAt: string;
  product?: {
    name: string;
    category: string;
    unit: string;
  };
  appointment?: {
    id: string;
    dateTime: string;
    patient?: {
      id: string;
      fullName: string;
    };
    service?: {
      id: string;
      name: string;
    };
  };
}

const CATEGORIES = ["TRATAMIENTO", "PRODUCTO"];
const UNITS = ["unidad", "sesión", "ml", "g", "kit", "ampolla"];

const categoryBadge: Record<string, string> = {
  TRATAMIENTO: "bg-primary/10 text-primary",
  PRODUCTO: "bg-amber-100 text-amber-700 border-amber-200",
};

const movementTypeBadges: Record<string, { label: string; style: string }> = {
  STOCK_IN: { label: "Entrada (+)", style: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  STOCK_OUT: { label: "Ajuste / Merma (-)", style: "bg-rose-50 text-rose-700 border-rose-100" },
  SESSION_CONSUMPTION: { label: "Consumo Cita (-)", style: "bg-indigo-50 text-indigo-700 border-indigo-100" },
};

// ── Product Modal ─────────────────────────────────────────────────────────────

function ProductModal({
  product,
  onSave,
  onClose,
}: {
  product?: Product | null;
  onSave: (data: ProductForm) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ProductForm>({
    name: product?.name || "",
    category: product?.category || "TRATAMIENTO",
    price: product?.price?.toString() || "",
    stock: product?.stock?.toString() || "0",
    unit: product?.unit || "unidad",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      setError("Nombre y precio son obligatorios.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (e: any) {
      setError(e.message || "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-full max-w-md mx-4 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50/50">
          <h2 className="text-base font-bold text-foreground">
            {product ? "Editar Producto" : "Nuevo Producto / Tratamiento"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Nombre *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Sérum Vitamina C, Ampolla de Ácido Hialurónico"
              className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Categoría
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Unidad
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Precio *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Stock inicial
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                min="0"
                placeholder="0"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              />
            </div>
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
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {product ? "Guardar Cambios" : "Crear Producto"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Adjust Stock Modal ────────────────────────────────────────────────────────

interface AdjustStockModalProps {
  product: Product;
  onSave: (quantity: number, type: "STOCK_IN" | "STOCK_OUT", notes: string) => Promise<void>;
  onClose: () => void;
}

function AdjustStockModal({ product, onSave, onClose }: AdjustStockModalProps) {
  const [quantity, setQuantity] = useState("1");
  const [type, setType] = useState<"STOCK_IN" | "STOCK_OUT">("STOCK_IN");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyVal = parseInt(quantity) || 0;
    if (qtyVal <= 0) {
      setError("La cantidad debe ser mayor a 0.");
      return;
    }
    if (!notes.trim()) {
      setError("Por favor describe brevemente la razón de este ajuste.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(qtyVal, type, notes);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al ajustar el stock.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-full max-w-md mx-4 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50/50">
          <h2 className="text-base font-bold text-foreground">
            Ajustar Stock: {product.name}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Tipo de Ajuste
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "STOCK_IN" | "STOCK_OUT")}
                className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              >
                <option value="STOCK_IN">Entrada (+)</option>
                <option value="STOCK_OUT">Salida / Merma (-)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Cantidad ({product.unit})
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                required
                className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Notas / Razón de Ajuste *
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Compra de stock, vencimiento, merma de sesión, etc."
              rows={3}
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background resize-none"
            />
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
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Guardar Ajuste
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main InventoryScreen ──────────────────────────────────────────────────────

export default function InventoryScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<"STOCK" | "MOVEMENTS">("STOCK");

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Stock Adjustment state
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

  // Movements state
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [movementSearch, setMovementSearch] = useState("");
  const [filterMovementType, setFilterMovementType] = useState("ALL");

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  const syncOfflineMovements = async () => {
    if (!navigator.onLine || syncing) return;
    const raw = localStorage.getItem("offline_movements");
    if (!raw) return;

    try {
      const queue = JSON.parse(raw);
      if (queue.length === 0) return;

      setSyncing(true);
      const remaining: any[] = [];
      let successCount = 0;

      for (const mv of queue) {
        try {
          await api.post(`/products/${mv.productId}/adjust-stock`, {
            quantity: mv.quantity,
            type: mv.type,
            notes: mv.notes
          });
          successCount++;
        } catch (err: any) {
          console.error("Failed to sync offline stock movement:", err);
          const isNetworkError = !navigator.onLine || err.message?.includes("Network Error") || err.message?.includes("Failed to fetch");
          if (isNetworkError) {
            remaining.push(mv);
          }
        }
      }

      if (remaining.length > 0) {
        localStorage.setItem("offline_movements", JSON.stringify(remaining));
      } else {
        localStorage.removeItem("offline_movements");
      }

      if (successCount > 0) {
        toast.success(`Se sincronizaron ${successCount} ajuste(s) de stock offline.`);
        loadProducts();
        if (activeSubTab === "MOVEMENTS") {
          loadMovements();
        }
      }
    } catch (e) {
      console.error("Error parsing offline movements queue:", e);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineMovements();
    };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncing, activeSubTab]);

  useEffect(() => {
    if (navigator.onLine) {
      syncOfflineMovements();
    }
    const interval = setInterval(() => {
      if (navigator.onLine) {
        syncOfflineMovements();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [syncing, activeSubTab]);

  useEffect(() => {
    loadProducts();
    loadMovements();
  }, [activeSubTab]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ products: Product[] } | Product[]>("/products");
      const list = Array.isArray(data) ? data : (data as any).products || [];
      setProducts(list);
      localStorage.setItem("bloom_skin_products", JSON.stringify(list));
    } catch (e: any) {
      // Fallback local
      const local = localStorage.getItem("bloom_skin_products");
      if (local) {
        setProducts(JSON.parse(local));
      } else {
        setError(e.message || "Error al cargar productos.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMovements = async () => {
    setLoadingMovements(true);
    try {
      const data = await api.get<Movement[]>("/products/movements");
      setMovements(data);
      localStorage.setItem("bloom_skin_movements", JSON.stringify(data));
    } catch (e: any) {
      // Fallback local
      const local = localStorage.getItem("bloom_skin_movements");
      if (local) {
        setMovements(JSON.parse(local));
      }
    } finally {
      setLoadingMovements(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "ALL" || p.category === filterCategory;
    return matchSearch && matchCat && p.isActive;
  });

  const filteredMovements = movements.filter((m) => {
    const pName = m.product?.name || "";
    const matchSearch = pName.toLowerCase().includes(movementSearch.toLowerCase());
    if (filterMovementType === "ALL") return matchSearch;
    return matchSearch && m.type === filterMovementType;
  });

  const lowStock = products.filter((p) => p.isActive && p.stock < 5);

  const getTotalInventoryValue = () => {
    return products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  };

  const getTotalLossFromMovements = () => {
    return movements
      .filter(m => m.type === "STOCK_OUT" && !m.appointmentId)
      .reduce((sum, m) => {
        const prod = products.find(p => p.id === m.productId);
        return sum + (m.quantity * (prod?.price || 0));
      }, 0);
  };

  const handleSave = async (form: ProductForm) => {
    const payload = {
      name: form.name,
      category: form.category,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      unit: form.unit,
    };

    try {
      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, payload);
      } else {
        await api.post("/products", payload);
      }
    } catch (err: any) {
      // Offline fallback: save in localStorage list
      const local = localStorage.getItem("bloom_skin_products");
      let list: Product[] = local ? JSON.parse(local) : [];
      if (editProduct) {
        list = list.map(p => p.id === editProduct.id ? { ...p, ...payload, price: parseFloat(payload.price), stock: parseInt(payload.stock) } : p);
      } else {
        list.push({
          id: `p-${Date.now()}`,
          isActive: true,
          createdAt: new Date().toISOString(),
          name: payload.name,
          category: payload.category,
          price: payload.price,
          stock: payload.stock,
          unit: payload.unit
        });
      }
      localStorage.setItem("bloom_skin_products", JSON.stringify(list));
    }

    await loadProducts();
    setShowModal(false);
    setEditProduct(null);
  };

  const handleAdjustStock = async (quantity: number, type: "STOCK_IN" | "STOCK_OUT", notes: string) => {
    if (!adjustingProduct) return;
    try {
      await api.post(`/products/${adjustingProduct.id}/adjust-stock`, {
        quantity,
        type,
        notes
      });
    } catch (err: any) {
      // Save to offline queue
      const movementData = {
        productId: adjustingProduct.id,
        quantity,
        type,
        notes
      };
      const localOffMovementsRaw = localStorage.getItem("offline_movements");
      const localOffMovements = localOffMovementsRaw ? JSON.parse(localOffMovementsRaw) : [];
      localOffMovements.push(movementData);
      localStorage.setItem("offline_movements", JSON.stringify(localOffMovements));

      // Local storage fallback for offline support
      const localProds = localStorage.getItem("bloom_skin_products");
      if (localProds) {
        try {
          const list = JSON.parse(localProds);
          const idx = list.findIndex((p: any) => p.id === adjustingProduct.id);
          if (idx > -1) {
            const diff = type === "STOCK_IN" ? quantity : -quantity;
            list[idx].stock = Math.max(0, list[idx].stock + diff);
            localStorage.setItem("bloom_skin_products", JSON.stringify(list));
          }
        } catch (e) {}
      }
      
      // Add dummy local movement
      const localMovements = localStorage.getItem("bloom_skin_movements");
      const mList = localMovements ? JSON.parse(localMovements) : [];
      mList.unshift({
        id: `m-${Date.now()}`,
        productId: adjustingProduct.id,
        type,
        quantity,
        notes,
        createdAt: new Date().toISOString(),
        product: {
          name: adjustingProduct.name,
          category: adjustingProduct.category,
          unit: adjustingProduct.unit
        }
      });
      localStorage.setItem("bloom_skin_movements", JSON.stringify(mList));
      toast.warning("Sin conexión. El ajuste de stock se ha guardado localmente y se sincronizará automáticamente.");
    }
    
    await loadProducts();
    if (activeSubTab === "MOVEMENTS") {
      await loadMovements();
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      toast.success("Producto desactivado con éxito.");
    } catch (e: any) {
      // Fallback local deletion
      const local = localStorage.getItem("bloom_skin_products");
      if (local) {
        const list = JSON.parse(local).map((p: any) => p.id === id ? { ...p, isActive: false } : p);
        localStorage.setItem("bloom_skin_products", JSON.stringify(list));
      }
      toast.error("Error al desactivar el producto.");
      setError(e.message);
    } finally {
      await loadProducts();
      setDeletingId(null);
    }
  };

  if (loading && activeSubTab === "STOCK") {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground font-medium">Cargando inventario...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header and Sub-tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
          <button
            onClick={() => setActiveSubTab("STOCK")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeSubTab === "STOCK"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="w-4 h-4" /> Catálogo de Stock
          </button>
          <button
            onClick={() => {
              setActiveSubTab("MOVEMENTS");
              loadMovements();
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeSubTab === "MOVEMENTS"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-4 h-4" /> Historial de Movimientos
          </button>
        </div>

        {isAdmin && activeSubTab === "STOCK" && (
          <button
            onClick={() => {
              setEditProduct(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto / Tratamiento
          </button>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={editProduct}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditProduct(null);
          }}
        />
      )}

      {adjustingProduct && (
        <AdjustStockModal
          product={adjustingProduct}
          onSave={handleAdjustStock}
          onClose={() => setAdjustingProduct(null)}
        />
      )}

      {productToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-slate-300 shadow-2xl p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-2">Desactivar Producto</h3>
            <p className="text-xs text-muted-foreground font-medium mb-6">
              ¿Estás seguro de que deseas desactivar a <span className="font-bold text-foreground">"{productToDelete.name}"</span> del catálogo de inventario?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 px-4 py-2.5 border border-border text-foreground hover:bg-muted text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  const id = productToDelete.id;
                  setProductToDelete(null);
                  await handleDeleteConfirm(id);
                }}
                className="flex-1 px-4 py-2.5 bg-red-650 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer bg-red-600"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Low stock alert */}
      {activeSubTab === "STOCK" && lowStock.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <TrendingDown className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">
              {lowStock.length} producto{lowStock.length > 1 ? "s" : ""} con stock bajo (&lt; 5 unidades)
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {lowStock.map((p) => `${p.name} (${p.stock})`).join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* Financial Valuation Bento Cards */}
      {activeSubTab === "STOCK" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl border border-border overflow-hidden p-5 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                Valorización Total del Stock
              </span>
              <span className="text-2xl font-extrabold text-foreground block">
                ${getTotalInventoryValue().toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-muted-foreground block font-medium">
                Suma de precio de venta * stock de todos los insumos activos
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden p-5 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                Pérdidas Acumuladas por Mermas
              </span>
              <span className="text-2xl font-extrabold text-rose-500 block">
                ${getTotalLossFromMovements().toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-muted-foreground block font-medium">
                Pérdidas de almacén registradas por mermas manuales
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center flex-shrink-0 text-rose-400">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* View: STOCK (Inventario) */}
      {activeSubTab === "STOCK" && (
        <>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto o tratamiento..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              />
            </div>

            <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden">
              {["ALL", ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    filterCategory === cat
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "border border-border text-muted-foreground hover:bg-muted/50 bg-background"
                  }`}
                >
                  {cat === "ALL" ? "Todos" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 border border-dashed rounded-2xl">
              <Package className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground font-medium">
                {products.length === 0
                  ? "No hay productos. Crea el primero."
                  : "No se encontraron resultados."}
              </p>
            </div>
          ) : (
            <div id="tour-inventory-catalog" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-card border border-border rounded-2xl p-5 hover:border-primary/20 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-foreground truncate">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${categoryBadge[product.category] || "bg-muted text-muted-foreground"}`}>
                            {product.category}
                          </span>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditProduct(product);
                              setShowModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                           <button
                             onClick={() => setProductToDelete(product)}
                             disabled={deletingId === product.id}
                             className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-colors"
                           >
                            {deletingId === product.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Stock</p>
                        <p className={`text-sm font-bold mt-0.5 ${product.stock < 5 ? "text-amber-600" : "text-foreground"}`}>
                          {product.stock} {product.unit}
                          {product.stock < 5 && (
                            <span className="ml-1.5 text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold border border-amber-200">
                              Bajo
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Precio</p>
                        <p
                          className="text-base font-black text-primary mt-0.5"
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                      <button
                        onClick={() => setAdjustingProduct(product)}
                        className="text-xs font-bold text-primary hover:text-primary/80 transition-all flex items-center gap-1 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/10"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        Ajustar Stock
                      </button>
                      <div className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
                        Acción Rápida
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* View: MOVEMENTS (Historial) */}
      {activeSubTab === "MOVEMENTS" && (
        <>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={movementSearch}
                onChange={(e) => setMovementSearch(e.target.value)}
                placeholder="Buscar por producto..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              />
            </div>

            <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden">
              {[
                { val: "ALL", lbl: "Todos" },
                { val: "STOCK_IN", lbl: "Entradas (+)" },
                { val: "STOCK_OUT", lbl: "Ajustes / Mermas (-)" },
                { val: "SESSION_CONSUMPTION", lbl: "Consumo Cita (-)" },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setFilterMovementType(item.val)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    filterMovementType === item.val
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "border border-border text-muted-foreground hover:bg-muted/50 bg-background"
                  }`}
                >
                  {item.lbl}
                </button>
              ))}
            </div>
          </div>

          {loadingMovements ? (
            <div className="flex items-center justify-center h-48 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground font-medium">Cargando movimientos...</span>
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 border border-dashed rounded-2xl">
              <History className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground font-medium">
                No hay movimientos de inventario que coincidan.
              </p>
            </div>
          ) : (
            <div id="tour-inventory-wastes" className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Producto / Insumo</th>
                      <th className="px-6 py-4">Tipo</th>
                      <th className="px-6 py-4">Cantidad</th>
                      <th className="px-6 py-4">Detalle / Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {filteredMovements.map((m) => {
                      const typeBadge = movementTypeBadges[m.type] || { label: m.type, style: "bg-muted text-muted-foreground" };
                      const formattedDate = new Date(m.createdAt).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      // Generar detalle legible
                      let detailText = m.notes || "-";
                      if (m.type === "SESSION_CONSUMPTION" && m.appointment) {
                        const patientName = m.appointment.patient?.fullName || "Paciente";
                        const srvName = m.appointment.service?.name || "Servicio";
                        detailText = `Consumo automático por sesión - Cita de ${patientName} (${srvName})`;
                      }

                      return (
                        <tr key={m.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                            {formattedDate}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800">{m.product?.name || "Insumo Eliminado"}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{m.product?.category}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${typeBadge.style}`}>
                              {typeBadge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                            {m.quantity} {m.product?.unit || "unid."}
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium max-w-xs truncate" title={detailText}>
                            {detailText}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
