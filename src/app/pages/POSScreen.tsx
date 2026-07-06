import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Banknote,
  CreditCard,
  Smartphone,
  Wallet,
  Check,
  Loader2,
  AlertTriangle,
  Receipt,
  X,
  ChevronDown,
  Package,
} from "lucide-react";
import { api } from "../services/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  isActive?: boolean;
}

interface Patient {
  id: string;
  fullName: string;
  phone: string;
}

interface Appointment {
  id: string;
  dateTime: string;
  duration: number;
  status: string;
  patient: Patient;
  professional: { id: string; name: string };
}

interface CartItem {
  productId?: string;
  description: string;
  unitPrice: number;
  quantity: number;
  category: string;
}

interface Invoice {
  id: string;
  patient: Patient;
  total: number;
  paymentMethod: string;
  paidAt: string;
  tax?: number;
  reference?: string | null;
  isFiscal?: boolean;
  taxId?: string;
  clientName?: string;
  fiscalProvider?: string;
}

// ── Category color map ─────────────────────────────────────────────────────────

const categoryColor: Record<string, string> = {
  TRATAMIENTO: "bg-primary",
  PRODUCTO: "bg-amber-400",
};

const paymentMethods = [
  {
    id: "EFECTIVO",
    label: "Efectivo",
    Icon: Banknote,
    active: "text-emerald-700 bg-emerald-50 border-emerald-400",
  },
  {
    id: "TARJETA",
    label: "Tarjeta",
    Icon: CreditCard,
    active: "text-blue-700 bg-blue-50 border-blue-400",
  },
  {
    id: "TRANSFERENCIA",
    label: "Transferencia",
    Icon: Smartphone,
    active: "text-violet-700 bg-violet-50 border-violet-400",
  },
  {
    id: "BILLETERA_VIRTUAL",
    label: "Billetera Virtual",
    Icon: Wallet,
    active: "text-amber-700 bg-amber-50 border-amber-400",
  },
];

// ── Receipt Modal ──────────────────────────────────────────────────────────────

function ReceiptModal({
  invoice,
  cart,
  patient,
  subtotal,
  total,
  onClose,
}: {
  invoice: Invoice;
  cart: CartItem[];
  patient: Patient | null;
  subtotal: number;
  total: number;
  onClose: () => void;
}) {
  const handlePrint = () => window.print();

  const isSAT = invoice.reference?.startsWith("SAT") || false;
  const isAFIP = invoice.reference?.startsWith("AFIP") || false;
  const hasTax = (invoice.tax && invoice.tax > 0) || isSAT || isAFIP;

  const pdfUrl = isSAT
    ? `https://sat.gob.mx/cfdi/pdf/${invoice.id}`
    : `https://serviciosweb.afip.gob.ar/genericos/comprobantes/cae.aspx?id=${invoice.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-card rounded-2xl border border-border w-full max-w-md mx-4 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-white text-center">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">¡Pago Registrado!</h2>
          <p className="text-white/80 text-sm mt-1">Factura #{invoice.id.slice(-8).toUpperCase()}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground text-xs font-medium">Paciente</p>
              <p className="font-semibold text-foreground">{invoice.patient?.fullName || patient?.fullName}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs font-medium">Fecha</p>
              <p className="font-semibold text-foreground">
                {new Date(invoice.paidAt).toLocaleDateString("es-MX")}
              </p>
            </div>
          </div>

          <div className="border border-border rounded-xl overflow-hidden">
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between items-center px-4 py-2.5 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × ${item.unitPrice.toLocaleString()}
                  </p>
                </div>
                <p className="text-sm font-bold text-foreground">
                  ${(item.unitPrice * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-sm border-t border-border pt-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            {hasTax && (
              <div className="flex justify-between text-muted-foreground">
                <span>IVA ({isSAT ? "16%" : "21%"})</span>
                <span>${(invoice.tax ?? (total - subtotal)).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-foreground">
              <span>Total</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>

          {hasTax && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>Factura Fiscal Autorizada</span>
              </div>
              <div className="text-muted-foreground space-y-1">
                <p className="flex justify-between">
                  <span>Proveedor Fiscal:</span>
                  <span className="font-bold text-foreground">
                    {isSAT ? "SAT México (16% IVA)" : "AFIP Argentina (21% IVA)"}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>ID de Autorización / CAE:</span>
                  <span className="font-mono font-bold text-foreground">{invoice.reference}</span>
                </p>
                {invoice.taxId && (
                  <p className="flex justify-between">
                    <span>RFC / CUIT:</span>
                    <span className="font-mono text-foreground">{invoice.taxId}</span>
                  </p>
                )}
                {invoice.clientName && (
                  <p className="flex justify-between">
                    <span>Razón Social / Cliente:</span>
                    <span className="text-foreground">{invoice.clientName}</span>
                  </p>
                )}
              </div>

              {/* Botón Descargar PDF y QR */}
              <div className="pt-3 border-t border-slate-200 space-y-3 flex flex-col items-center">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors text-center font-bold rounded-lg block text-xs"
                >
                  📄 Descargar PDF Oficial Factura
                </a>
                <div className="flex flex-col items-center justify-center p-2 bg-white border border-slate-100 rounded-lg text-[10px] text-muted-foreground text-center w-full">
                  <div className="w-16 h-16 bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl mb-1 select-none">
                    🔲
                  </div>
                  <span className="font-mono break-all text-[9px] max-w-[280px]">
                    QR: {invoice.reference}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Nueva Venta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main POSScreen ─────────────────────────────────────────────────────────────

export default function POSScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInvoice, setSuccessInvoice] = useState<Invoice | null>(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showProductCatalog, setShowProductCatalog] = useState(false);

  // Connection & Offline Queue States
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // Fiscal Billing States
  const [isFiscal, setIsFiscal] = useState(false);
  const [taxId, setTaxId] = useState("");
  const [clientName, setClientName] = useState("");
  const [fiscalProvider, setFiscalProvider] = useState<"SAT" | "AFIP">("SAT");

  const syncOfflineInvoices = async () => {
    if (!navigator.onLine || syncing) return;
    const raw = localStorage.getItem("offline_invoices");
    if (!raw) return;

    try {
      const queue = JSON.parse(raw);
      if (queue.length === 0) return;

      setSyncing(true);
      const remaining: any[] = [];
      let successCount = 0;

      for (const invoice of queue) {
        try {
          await api.post("/invoices", invoice);
          successCount++;
        } catch (err: any) {
          console.error("Failed to sync offline invoice:", err);
          const isNetworkError = !navigator.onLine || err.message?.includes("Network Error") || err.message?.includes("Failed to fetch");
          if (isNetworkError) {
            remaining.push(invoice);
          }
        }
      }

      if (remaining.length > 0) {
        localStorage.setItem("offline_invoices", JSON.stringify(remaining));
      } else {
        localStorage.removeItem("offline_invoices");
      }

      updateOfflineQueueCount();

      if (successCount > 0) {
        toast.success(`Se sincronizaron ${successCount} venta(s) registrada(s) offline.`);
        loadData();
      }
    } catch (e) {
      console.error("Error parsing offline invoices queue:", e);
    } finally {
      setSyncing(false);
    }
  };

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineInvoices();
    };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncing]);

  // Track offline queue length
  const updateOfflineQueueCount = () => {
    const raw = localStorage.getItem("offline_invoices");
    if (raw) {
      try {
        const queue = JSON.parse(raw);
        setOfflineQueueCount(queue.length);
      } catch (e) {
        setOfflineQueueCount(0);
      }
    } else {
      setOfflineQueueCount(0);
    }
  };

  useEffect(() => {
    updateOfflineQueueCount();
    if (navigator.onLine) {
      syncOfflineInvoices();
    }
    window.addEventListener("storage", updateOfflineQueueCount);
    const interval = setInterval(() => {
      updateOfflineQueueCount();
      if (navigator.onLine) {
        syncOfflineInvoices();
      }
    }, 5000);
    return () => {
      window.removeEventListener("storage", updateOfflineQueueCount);
      clearInterval(interval);
    };
  }, [syncing]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (navigator.onLine) {
        const [productsData, patientsData] = await Promise.all([
          api.get<{ products: Product[] }>("/products").catch(() => ({ products: [] })),
          api.get<{ patients: Patient[] }>("/patients").catch(() => ({ patients: [] })),
        ]);

        const dashData = await api
          .get<{ todayAppointmentsList: any[] }>("/dashboard")
          .catch(() => ({ todayAppointmentsList: [] }));

        const fetchedProducts = (productsData as any).products || (Array.isArray(productsData) ? productsData : []);
        const fetchedPatients = (patientsData as any).patients || (Array.isArray(patientsData) ? patientsData : []);
        const fetchedAppointments = (dashData as any).todayAppointmentsList || [];

        setProducts(fetchedProducts);
        setPatients(fetchedPatients);
        setTodayAppointments(fetchedAppointments);

        // Cache lists locally for offline fallback
        localStorage.setItem("pos_cached_products", JSON.stringify(fetchedProducts));
        localStorage.setItem("pos_cached_patients", JSON.stringify(fetchedPatients));
      } else {
        // Load from cache when offline
        const cachedProducts = JSON.parse(localStorage.getItem("pos_cached_products") || "[]");
        const cachedPatients = JSON.parse(localStorage.getItem("pos_cached_patients") || "[]");
        setProducts(cachedProducts);
        setPatients(cachedPatients);
        setTodayAppointments([]);
      }
    } catch (e) {
      setError("No se pudo cargar el catálogo de productos.");
      // Fallback to cache on error
      const cachedProducts = JSON.parse(localStorage.getItem("pos_cached_products") || "[]");
      const cachedPatients = JSON.parse(localStorage.getItem("pos_cached_patients") || "[]");
      if (cachedProducts.length > 0) setProducts(cachedProducts);
      if (cachedPatients.length > 0) setPatients(cachedPatients);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) && p.isActive !== false
  );

  const filteredPatients = patients.filter((p) =>
    p.fullName.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          description: product.name,
          unitPrice: product.price,
          quantity: 1,
          category: product.category,
        },
      ];
    });
    setShowProductCatalog(false);
    setProductSearch("");
  };

  const updateQty = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, i) =>
          i === index ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const taxRate = isFiscal ? (fiscalProvider === "SAT" ? 0.16 : 0.21) : 0;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handlePay = async () => {
    if (!selectedPatient || !paymentMethod || cart.length === 0) return;
    setPaying(true);
    setError(null);

    const clientOpId = `op-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
    const invoicePayload = {
      patientId: selectedPatient.id,
      appointmentId: selectedAppointmentId || null,
      items: cart.map((i) => ({
        productId: i.productId || null,
        description: i.description,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        total: i.unitPrice * i.quantity,
      })),
      subtotal,
      tax,
      total,
      paymentMethod,
      reference: reference || clientOpId,
      isFiscal,
      taxId: isFiscal ? taxId : undefined,
      clientName: isFiscal ? (clientName || selectedPatient.fullName) : undefined,
      fiscalProvider: isFiscal ? fiscalProvider : undefined,
    };

    if (isOffline) {
      // Offline fallback: save to queue
      try {
        const raw = localStorage.getItem("offline_invoices");
        const queue = raw ? JSON.parse(raw) : [];
        queue.push({
          ...invoicePayload,
          id: clientOpId,
          status: "PAGADO",
          paidAt: new Date().toISOString()
        });
        localStorage.setItem("offline_invoices", JSON.stringify(queue));

        const simulatedInvoice: Invoice = {
          id: clientOpId,
          patient: selectedPatient,
          total,
          paymentMethod,
          paidAt: new Date().toISOString(),
          tax,
          reference: reference || clientOpId,
          isFiscal,
          taxId: isFiscal ? taxId : undefined,
          clientName: isFiscal ? (clientName || selectedPatient.fullName) : undefined,
          fiscalProvider: isFiscal ? fiscalProvider : undefined,
        };

        setSuccessInvoice(simulatedInvoice);
        updateOfflineQueueCount();
      } catch (err) {
        setError("Error al registrar la venta offline localmente.");
      } finally {
        setPaying(false);
      }
      return;
    }

    try {
      const invoice = await api.post<Invoice>("/invoices", invoicePayload);
      setSuccessInvoice(invoice);
    } catch (e: any) {
      const isNetworkError = !navigator.onLine || e.message?.includes("Network Error") || e.message?.includes("Failed to fetch");
      if (isNetworkError) {
        try {
          const raw = localStorage.getItem("offline_invoices");
          const queue = raw ? JSON.parse(raw) : [];
          queue.push({
            ...invoicePayload,
            id: clientOpId,
            status: "PAGADO",
            paidAt: new Date().toISOString()
          });
          localStorage.setItem("offline_invoices", JSON.stringify(queue));

          const simulatedInvoice: Invoice = {
            id: clientOpId,
            patient: selectedPatient,
            total,
            paymentMethod,
            paidAt: new Date().toISOString(),
            tax,
            reference: reference || clientOpId,
            isFiscal,
            taxId: isFiscal ? taxId : undefined,
            clientName: isFiscal ? (clientName || selectedPatient.fullName) : undefined,
            fiscalProvider: isFiscal ? fiscalProvider : undefined,
          };

          setSuccessInvoice(simulatedInvoice);
          updateOfflineQueueCount();
          return;
        } catch (err) {
          // ignore
        }
      }
      setError(e.message || "Error al registrar el pago.");
    } finally {
      setPaying(false);
    }
  };

  const handleNewSale = () => {
    setSuccessInvoice(null);
    setCart([]);
    setSelectedPatient(null);
    setSelectedAppointmentId(undefined);
    setPaymentMethod(null);
    setReference("");
    setIsFiscal(false);
    setTaxId("");
    setClientName("");
    setFiscalProvider("SAT");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground font-medium">Cargando terminal POS...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {isOffline && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm font-semibold shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 animate-pulse" />
          <div>
            <p>Conexión offline activa</p>
            <p className="text-xs text-amber-600 font-normal mt-0.5">
              Cargando catálogo y pacientes locales. Los cobros que realices se guardarán de forma local y se subirán a la nube automáticamente cuando vuelva internet.
            </p>
          </div>
        </div>
      )}

      {offlineQueueCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-800 text-sm font-semibold shadow-sm">
          <Loader2 className="w-5 h-5 text-blue-500 flex-shrink-0 animate-spin" />
          <p>Hay {offlineQueueCount} venta(s) guardadas localmente esperando sincronización.</p>
        </div>
      )}

      {successInvoice && (
        <ReceiptModal
          invoice={successInvoice}
          cart={cart}
          patient={selectedPatient}
          subtotal={subtotal}
          total={total}
          onClose={handleNewSale}
        />
      )}

      <div className="grid grid-cols-5 gap-5" style={{ minHeight: "calc(100vh - 160px)" }}>
        {/* Left — cart */}
        <div className="col-span-3 flex flex-col gap-4">

          {/* Patient selector */}
          <div className="bg-card rounded-2xl border border-border p-4 flex-shrink-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Paciente
            </p>
            <div className="relative">
              <button
                onClick={() => setShowPatientDropdown(!showPatientDropdown)}
                className="w-full flex items-center gap-2 px-3 py-2.5 border border-border rounded-xl text-sm text-left hover:border-primary/40 transition-colors"
              >
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className={selectedPatient ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {selectedPatient ? selectedPatient.fullName : "Seleccionar paciente..."}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
              </button>

              {showPatientDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <input
                      autoFocus
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      placeholder="Buscar paciente..."
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredPatients.length === 0 ? (
                      <p className="text-center text-xs text-muted-foreground py-4">No se encontraron pacientes</p>
                    ) : (
                      filteredPatients.slice(0, 8).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedPatient(p);
                            setShowPatientDropdown(false);
                            setPatientSearch("");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {p.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{p.fullName}</p>
                            <p className="text-xs text-muted-foreground">{p.phone}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cart */}
          <div className="bg-card rounded-2xl border border-border flex flex-col flex-1">
            <div className="px-5 py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Servicios y Productos</h3>
                <span className="text-[11px] font-bold text-muted-foreground bg-background border border-border px-2.5 py-1 rounded-full">
                  {cart.length} items
                </span>
              </div>
              {selectedPatient && (
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Paciente: {selectedPatient.fullName}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2">
                  <Receipt className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">El carrito está vacío</p>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 px-5 py-4 border-b border-border/50 hover:bg-background/60 transition-colors group"
                  >
                    <div className={`w-1.5 h-12 rounded-full flex-shrink-0 ${categoryColor[item.category] ?? "bg-violet-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground">{item.description}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 font-medium">
                        {item.category} ·{" "}
                        <span style={{ fontFamily: "'DM Mono', monospace" }}>
                          ${item.unitPrice.toLocaleString()}
                        </span>{" "}
                        c/u
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(index, -1)}
                        className="w-7 h-7 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span
                        className="text-sm font-bold text-foreground w-5 text-center tabular-nums"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(index, 1)}
                        className="w-7 h-7 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div
                      className="text-sm font-bold text-foreground w-20 text-right tabular-nums"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      ${(item.unitPrice * item.quantity).toLocaleString()}
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="p-1.5 rounded-xl hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}

              {/* Add product */}
              <div className="px-5 py-3.5 relative">
                <button
                  onClick={() => setShowProductCatalog(!showProductCatalog)}
                  className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/70 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar tratamiento o producto
                </button>

                {showProductCatalog && (
                  <div className="absolute bottom-full left-5 right-5 bg-card border border-border rounded-xl shadow-2xl z-10 overflow-hidden">
                    <div className="p-2 border-b border-border">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          autoFocus
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Buscar producto o tratamiento..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                        />
                      </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <p className="text-center text-xs text-muted-foreground py-4">
                          {products.length === 0
                            ? "Sin productos. Agrégalos desde Inventario."
                            : "No se encontraron resultados."}
                        </p>
                      ) : (
                        filteredProducts.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => addToCart(p)}
                            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
                          >
                            <div>
                              <p className="text-sm font-medium text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.category} · Stock: {p.stock}</p>
                            </div>
                            <span className="text-sm font-bold text-primary">
                              ${p.price.toLocaleString()}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right — payment */}
        <div className="col-span-2 flex flex-col">
          <div className="bg-card rounded-2xl border border-border p-5 flex flex-col flex-1">
            <h3 className="text-sm font-bold text-foreground mb-5">Resumen de Pago</h3>

            {/* Totals */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Subtotal</span>
                <span className="font-bold text-foreground tabular-nums" style={{ fontFamily: "'DM Mono', monospace" }}>
                  ${subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">
                  IVA {isFiscal ? (fiscalProvider === "SAT" ? "(16%)" : "(21%)") : ""}
                </span>
                <span className="font-bold text-foreground tabular-nums" style={{ fontFamily: "'DM Mono', monospace" }}>
                  ${tax.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between">
                <span className="text-sm font-bold text-foreground">Total</span>
                <span className="text-lg font-black text-foreground tabular-nums" style={{ fontFamily: "'DM Mono', monospace" }}>
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment method */}
            <div className="mb-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Método de Pago
              </p>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map(({ id, label, Icon, active }) => {
                  const isSelected = paymentMethod === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setPaymentMethod(id)}
                      className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl border-2 transition-all ${
                        isSelected ? active : "border-border hover:border-primary/30 hover:bg-background text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-bold leading-tight text-center">{label}</span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tipo de Comprobante (Interno vs Fiscal) */}
            <div className="mb-5 bg-slate-50/50 border border-slate-200 rounded-2xl p-4 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Tipo de Comprobante
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFiscal(false)}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border-2 transition-all ${
                      !isFiscal
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:bg-background"
                    }`}
                  >
                    Comprobante Interno
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFiscal(true)}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border-2 transition-all ${
                      isFiscal
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:bg-background"
                    }`}
                  >
                    Factura Fiscal
                  </button>
                </div>
              </div>

              {isFiscal && (
                <div className="space-y-3 pt-2 border-t border-slate-200 animate-fade-in">
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground mb-1 block">Proveedor Fiscal</label>
                    <select
                      value={fiscalProvider}
                      onChange={(e) => setFiscalProvider(e.target.value as "SAT" | "AFIP")}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-primary bg-background text-foreground"
                    >
                      <option value="SAT">SAT México (16% IVA)</option>
                      <option value="AFIP">AFIP Argentina (21% IVA)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground mb-1 block">
                      {fiscalProvider === "SAT" ? "RFC / Identificación" : "CUIT / Identificación"}
                    </label>
                    <input
                      type="text"
                      required
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder={fiscalProvider === "SAT" ? "Ej. XAXX010101000" : "Ej. 20-30456789-9"}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-primary bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground mb-1 block">Razón Social / Cliente</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Nombre del cliente o razón social"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-primary bg-background text-foreground"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Reference */}
            <div className="mb-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Referencia / Nota
              </p>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej: Transferencia #123456, Visa ****4821"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-muted-foreground bg-background"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="mt-auto space-y-2.5">
              <button
                disabled={!paymentMethod || !selectedPatient || cart.length === 0 || paying || (isFiscal && !taxId.trim())}
                onClick={handlePay}
                className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  paymentMethod && selectedPatient && cart.length > 0 && !paying && (!isFiscal || taxId.trim())
                    ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {paying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Registrar Pago · ${total.toLocaleString()}
                  </>
                )}
              </button>
              <button
                onClick={handleNewSale}
                className="w-full py-2.5 border border-border text-muted-foreground font-semibold rounded-xl hover:bg-muted/50 transition-all text-sm flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
