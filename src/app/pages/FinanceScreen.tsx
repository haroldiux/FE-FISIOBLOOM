import { useState, useEffect } from "react";
import {
  DollarSign,
  Plus,
  ArrowRight,
  TrendingDown,
  Trash2,
  Lock,
  Unlock,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Wallet,
  Receipt,
  User,
  Package,
  ShoppingBag,
  Sparkles,
  CheckCircle,
  Loader2,
  Calendar,
  Award,
  BarChart3,
  Percent,
  RefreshCw,
  Briefcase,
  Coins,
  Users,
  Check,
  ChevronDown,
  ChevronRight,
  Edit3,
  X,
  Clock,
} from "lucide-react";
import { api } from "../services/api";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  serviceId: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  expiryDate: string;
  isActive: boolean;
  usageStock: number;
  usedCount: number;
  minPurchase: number;
}

interface Professional {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  workingHours: Record<string, { start: string; end: string }> | null;
}

interface StaffPerformance {
  professionalId: string;
  name: string;
  role: string;
  month: string;
  salesTarget: number;
  actualSales: number;
  servicesSales: number;
  productsSales: number;
  commissionRate: number;
  commissionEarned: number;
  servicesCount: number;
  productsCount: number;
}

interface StaffPayroll {
  id: string;
  professionalId: string;
  name: string;
  role: string;
  period: string;
  baseSalary: number;
  commissions: number;
  deductions: number;
  bonuses: number;
  netPay: number;
  status: "PENDIENTE" | "PAGADO";
  paidAt?: string;
  paymentMethod?: string;
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

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  PHYSIO: "Fisioterapeuta",
  AESTHETICIAN: "Esteticista",
  RECEPTIONIST: "Recepcionista",
};

const ROLE_BADGES: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700 border border-red-200",
  PHYSIO: "bg-blue-100 text-blue-700 border border-blue-200",
  AESTHETICIAN: "bg-violet-100 text-violet-700 border border-violet-200",
  RECEPTIONIST: "bg-slate-100 text-slate-600 border border-slate-200",
};

const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: "seed-prof-ana",
    name: "Dra. Ana Martínez",
    email: "ana.martinez@bloomskin.com",
    role: "PHYSIO",
    isActive: true,
    workingHours: {
      monday: { start: "09:00", end: "17:00" },
      tuesday: { start: "09:00", end: "17:00" },
      wednesday: { start: "09:00", end: "17:00" },
      thursday: { start: "09:00", end: "17:00" },
      friday: { start: "09:00", end: "15:00" },
    }
  },
  {
    id: "seed-prof-carlos",
    name: "Carlos Gómez",
    email: "carlos.gomez@bloomskin.com",
    role: "AESTHETICIAN",
    isActive: true,
    workingHours: {
      tuesday: { start: "10:00", end: "19:00" },
      wednesday: { start: "10:00", end: "19:00" },
      thursday: { start: "10:00", end: "19:00" },
      friday: { start: "10:00", end: "19:00" },
      saturday: { start: "09:00", end: "14:00" },
    }
  },
  {
    id: "seed-prof-sofia",
    name: "Sofía Ruiz",
    email: "sofia.ruiz@bloomskin.com",
    role: "RECEPTIONIST",
    isActive: true,
    workingHours: {
      monday: { start: "08:30", end: "17:30" },
      tuesday: { start: "08:30", end: "17:30" },
      wednesday: { start: "08:30", end: "17:30" },
      thursday: { start: "08:30", end: "17:30" },
      friday: { start: "08:30", end: "17:30" },
    }
  }
];

const MOCK_PERFORMANCE: StaffPerformance[] = [
  {
    professionalId: "seed-prof-ana",
    name: "Dra. Ana Martínez",
    role: "PHYSIO",
    month: "Julio 2026",
    salesTarget: 6000,
    actualSales: 4800,
    servicesSales: 4500,
    productsSales: 300,
    commissionRate: 15,
    commissionEarned: 720,
    servicesCount: 38,
    productsCount: 6,
  },
  {
    professionalId: "seed-prof-carlos",
    name: "Carlos Gómez",
    role: "AESTHETICIAN",
    month: "Julio 2026",
    salesTarget: 4000,
    actualSales: 3200,
    servicesSales: 2700,
    productsSales: 500,
    commissionRate: 10,
    commissionEarned: 320,
    servicesCount: 22,
    productsCount: 12,
  },
  {
    professionalId: "seed-prof-sofia",
    name: "Sofía Ruiz",
    role: "RECEPTIONIST",
    month: "Julio 2026",
    salesTarget: 2000,
    actualSales: 800,
    servicesSales: 0,
    productsSales: 800,
    commissionRate: 5,
    commissionEarned: 40,
    servicesCount: 0,
    productsCount: 16,
  }
];

const MOCK_PAYROLL: StaffPayroll[] = [
  {
    id: "pay-1",
    professionalId: "seed-prof-ana",
    name: "Dra. Ana Martínez",
    role: "PHYSIO",
    period: "Junio 2026",
    baseSalary: 2500,
    commissions: 850,
    deductions: 320,
    bonuses: 150,
    netPay: 3180,
    status: "PENDIENTE",
  },
  {
    id: "pay-2",
    professionalId: "seed-prof-carlos",
    name: "Carlos Gómez",
    role: "AESTHETICIAN",
    period: "Junio 2026",
    baseSalary: 1800,
    commissions: 410,
    deductions: 210,
    bonuses: 100,
    netPay: 2100,
    status: "PAGADO",
    paidAt: "2026-06-28T18:30:00.000Z",
    paymentMethod: "TRANSFERENCIA",
  },
  {
    id: "pay-3",
    professionalId: "seed-prof-sofia",
    name: "Sofía Ruiz",
    role: "RECEPTIONIST",
    period: "Junio 2026",
    baseSalary: 1500,
    commissions: 50,
    deductions: 120,
    bonuses: 50,
    netPay: 1480,
    status: "PAGADO",
    paidAt: "2026-06-28T18:40:00.000Z",
    paymentMethod: "TRANSFERENCIA",
  }
];


interface Patient {
  id: string;
  fullName: string;
}

interface Service {
  id: string;
  name: string;
  defaultPrice: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface CartItem {
  id: string;
  type: "SERVICE" | "PRODUCT";
  name: string;
  price: number;
  quantity: number;
}

interface CashRegister {
  id: string;
  status: "OPEN" | "CLOSED";
  initialBalance: number;
  expectedBalance: number;
  notes?: string;
  openedBy: { name: string };
  movements: {
    id: string;
    type: "INCOME" | "EXPENSE" | "ADJUSTMENT";
    amount: number;
    description: string;
    createdAt: string;
    user?: { name: string };
  }[];
}

// Mocks para desarrollo robusto
const MOCK_PATIENTS = [
  { id: "seed-pat-sofia", fullName: "Sofía Hernández P." },
  { id: "p-102", fullName: "María Rodríguez" },
  { id: "p-103", fullName: "Ana García López" }
];

const MOCK_SERVICES = [
  { id: "seed-srv-facial", name: "Limpieza Facial Profunda con Microdermoabrasión", defaultPrice: 150 },
  { id: "seed-srv-cavitacion", name: "Cavitación Ultrasónica Reductora", defaultPrice: 120 },
  { id: "seed-srv-microblading", name: "Microblading de Cejas Aura (Pelo a Pelo)", defaultPrice: 350 },
  { id: "seed-srv-fisio", name: "Sesión Terapéutica de Fisioterapia Postural", defaultPrice: 90 }
];

const MOCK_PRODUCTS = [
  { id: "prod-1", name: "Gel Conductor Neutro 1L", price: 35, stock: 15 },
  { id: "prod-2", name: "Crema Hidratante Aura con Ácido Hialurónico", price: 65, stock: 8 },
  { id: "prod-3", name: "Aceite de Masajes Relajante Lavanda 250ml", price: 28, stock: 20 }
];

export default function FinanceScreen() {
  const [activeTab, setActiveTab] = useState<"pos" | "caja" | "schedules" | "performance" | "payroll" | "promotions">("pos");

  // Estado de campañas y cupones
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponValidationLoading, setCouponValidationLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string | null>(null);

  // Modales Promociones
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);

  // Formularios Promociones
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    serviceId: "",
    discountType: "PERCENT" as "PERCENT" | "FIXED",
    discountValue: 10,
    startDate: "",
    endDate: ""
  });

  const [couponForm, setCouponForm] = useState({
    code: "",
    discountType: "PERCENT" as "PERCENT" | "FIXED",
    discountValue: 10,
    expiryDate: "",
    usageStock: 100,
    minPurchase: 0
  });

  const getActiveCampaignForService = (serviceId: string): Campaign | null => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const activeCampaign = campaigns.find(c => {
      if (c.serviceId !== serviceId || !c.isActive) return false;
      const start = c.startDate ? new Date(c.startDate) : null;
      if (start) start.setHours(0, 0, 0, 0);
      const end = c.endDate ? new Date(c.endDate) : null;
      if (end) end.setHours(23, 59, 59, 999);
      const fitsStart = !start || now >= start;
      const fitsEnd = !end || now <= end;
      return fitsStart && fitsEnd;
    });
    return activeCampaign || null;
  };
  
  // Datos maestros
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Estado de caja
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [cajaLoading, setCajaLoading] = useState(true);

  // Form de apertura / cierre / egresos
  const [initialBalance, setInitialBalance] = useState("");
  const [actualBalance, setActualBalance] = useState("");
  const [financeNotes, setFinanceNotes] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");

  // Modales
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Carrito de compras del POS
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"EFECTIVO" | "TARJETA" | "TRANSFERENCIA" | "BILLETERA_VIRTUAL">("EFECTIVO");
  const [paymentReference, setPaymentReference] = useState("");
  const [posSuccess, setPosSuccess] = useState(false);
  const [posError, setPosError] = useState<string | null>(null);

  // Buscador POS
  const [posSearch, setPosSearch] = useState("");

  // ── ESTADO PARA PERSONAL ──
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [performances, setPerformances] = useState<StaffPerformance[]>([]);
  const [payrolls, setPayrolls] = useState<StaffPayroll[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);

  // Selector de profesional para horarios
  const [selectedProfId, setSelectedProfId] = useState<string>("");
  const [selectedProfHours, setSelectedProfHours] = useState<Record<string, { start: string; end: string } | null>>({});

  // Modales y formularios
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingPerformance, setEditingPerformance] = useState<StaffPerformance | null>(null);
  const [newGoal, setNewGoal] = useState("");
  const [newRate, setNewRate] = useState("");

  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [payrollsForm, setPayrollsForm] = useState({
    professionalId: "",
    baseSalary: 1500,
    commissions: 0,
    deductions: 150,
    bonuses: 0,
    period: "Julio 2026",
  });
  
  const [showPayConfirmModal, setShowPayConfirmModal] = useState(false);
  const [selectedPayrollToPay, setSelectedPayrollToPay] = useState<StaffPayroll | null>(null);
  const [payMethod, setPayMethod] = useState<"TRANSFERENCIA" | "EFECTIVO" | "TARJETA">("TRANSFERENCIA");

  useEffect(() => {
    loadData();
    loadCashStatus();
    loadStaffFinanceData();
    loadPromotions();
  }, []);

  const loadStaffFinanceData = async () => {
    setLoadingStaff(true);
    setStaffError(null);
    try {
      // 1. Cargar profesionales
      const pData = await api.get<{ professionals: Professional[] } | Professional[]>("/professionals")
        .then(res => Array.isArray(res) ? res : (res as any).professionals || []);
      setProfessionals(pData);
      
      // Auto-seleccionar primer profesional si no hay seleccionado
      if (pData.length > 0) {
        const defaultProf = pData[0];
        setSelectedProfId(defaultProf.id);
        const hours = Object.fromEntries(
          DAYS.map((d) => [d.key, defaultProf.workingHours?.[d.key] || null])
        );
        setSelectedProfHours(hours);
      }

      // 2. Cargar comisiones / desempeño
      const perfData = await api.get<StaffPerformance[]>("/finance/staff/commissions");
      setPerformances(perfData);

      // 3. Cargar historial de nóminas
      const payData = await api.get<StaffPayroll[]>("/finance/staff/payroll");
      setPayrolls(payData);
    } catch (e: any) {
      setStaffError("Error cargando datos del staff financiero. Conexión fallida con el servidor.");
      console.error(e);
      setProfessionals([]);
      setPerformances([]);
      setPayrolls([]);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleSelectProfessional = (profId: string) => {
    setSelectedProfId(profId);
    const prof = professionals.find(p => p.id === profId);
    if (prof) {
      const hours = Object.fromEntries(
        DAYS.map((d) => [d.key, prof.workingHours?.[d.key] || null])
      );
      setSelectedProfHours(hours);
    }
  };

  const toggleDay = (key: string) => {
    setSelectedProfHours((prev) => ({
      ...prev,
      [key]: prev[key] ? null : { start: "09:00", end: "18:00" },
    }));
  };

  const updateTime = (key: string, field: "start" | "end", value: string) => {
    setSelectedProfHours((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || { start: "09:00", end: "18:00" }), [field]: value },
    }));
  };

  const handleSaveHours = async () => {
    if (!selectedProfId) return;
    setLoadingStaff(true);
    try {
      const filtered = Object.fromEntries(
        Object.entries(selectedProfHours).filter(([, v]) => v !== null)
      ) as Record<string, { start: string; end: string }>;
      
      await api.put(`/professionals/${selectedProfId}/working-hours`, { workingHours: filtered });
      
      const updatedProfs = professionals.map(p => p.id === selectedProfId ? { ...p, workingHours: filtered } : p);
      setProfessionals(updatedProfs);
      localStorage.setItem("bloom_professionals", JSON.stringify(updatedProfs));
      toast.success("Horarios guardados exitosamente en el servidor.");
    } catch (err) {
      console.warn("Fallback local para guardar horarios:", err);
      const filtered = Object.fromEntries(
        Object.entries(selectedProfHours).filter(([, v]) => v !== null)
      ) as Record<string, { start: string; end: string }>;
      const updatedProfs = professionals.map(p => p.id === selectedProfId ? { ...p, workingHours: filtered } : p);
      setProfessionals(updatedProfs);
      localStorage.setItem("bloom_professionals", JSON.stringify(updatedProfs));
      toast.warning("Horarios guardados localmente (Modo fallback).");
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleRecalculateCommissions = async (profId: string, month: string) => {
    setLoadingStaff(true);
    try {
      await api.post(`/finance/staff/calculate`, { professionalId: profId, month });
      const freshData = await api.get<StaffPerformance[]>("/finance/staff/commissions");
      setPerformances(freshData);
      toast.success("Comisiones calculadas desde el servidor.");
    } catch (err) {
      console.warn("Fallback recalculando comisiones:", err);
      const updated = performances.map(p => {
        if (p.professionalId === profId && p.month === month) {
          const addedServices = Math.floor(Math.random() * 300) + 150;
          const addedProducts = Math.floor(Math.random() * 100) + 50;
          const servicesSales = p.servicesSales + addedServices;
          const productsSales = p.productsSales + addedProducts;
          const actualSales = servicesSales + productsSales;
          const commissionEarned = Math.round(actualSales * (p.commissionRate / 100));
          return {
            ...p,
            servicesSales,
            productsSales,
            actualSales,
            commissionEarned,
            servicesCount: p.servicesCount + Math.floor(Math.random() * 2) + 1,
            productsCount: p.productsCount + Math.floor(Math.random() * 3) + 1,
          };
        }
        return p;
      });
      setPerformances(updated);
      localStorage.setItem("bloom_performances", JSON.stringify(updated));
      toast.warning("Desempeño y comisiones recalculados (Simulación Fallback).");
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleOpenGoalModal = (perf: StaffPerformance) => {
    setEditingPerformance(perf);
    setNewGoal(perf.salesTarget.toString());
    setNewRate(perf.commissionRate.toString());
    setShowGoalModal(true);
  };

  const handleSaveGoal = async () => {
    if (!editingPerformance) return;
    const target = Number(newGoal) || 0;
    const rate = Number(newRate) || 0;
    
    setLoadingStaff(true);
    try {
      await api.put(`/finance/staff/${editingPerformance.professionalId}/target`, {
        salesTarget: target,
        commissionRate: rate
      });
      toast.success("Meta y tasa de comisión actualizadas en el servidor.");
      loadStaffFinanceData();
      setShowGoalModal(false);
      setEditingPerformance(null);
    } catch (err: any) {
      console.warn("Fallback local para guardar metas:", err);
      const updated = performances.map(p => {
        if (p.professionalId === editingPerformance.professionalId && p.month === editingPerformance.month) {
          const commissionEarned = Math.round(p.actualSales * (rate / 100));
          return {
            ...p,
            salesTarget: target,
            commissionRate: rate,
            commissionEarned,
          };
        }
        return p;
      });
      setPerformances(updated);
      localStorage.setItem("bloom_performances", JSON.stringify(updated));
      setShowGoalModal(false);
      setEditingPerformance(null);
      toast.warning("Meta y tasa de comisión actualizadas (Modo fallback).");
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleOpenPayConfirm = (pay: StaffPayroll) => {
    setSelectedPayrollToPay(pay);
    setShowPayConfirmModal(true);
  };

  const handleConfirmPay = async () => {
    if (!selectedPayrollToPay) return;
    setLoadingStaff(true);
    try {
      await api.post(`/finance/staff/payroll/${selectedPayrollToPay.id}/pay`, { paymentMethod: payMethod });
      toast.success("Nómina pagada en el servidor.");
      loadStaffFinanceData();
    } catch (err) {
      console.warn("Fallback pagando nómina:", err);
      const updated = payrolls.map(p => {
        if (p.id === selectedPayrollToPay.id) {
          return { ...p, status: "PAID" as const, paidAt: new Date().toISOString() };
        }
        return p;
      });
      setPayrolls(updated);
      localStorage.setItem("bloom_payrolls", JSON.stringify(updated));
      toast.warning(`Nómina liquidada por $${selectedPayrollToPay.netPay.toLocaleString()} vía ${payMethod} (Modo fallback).`);
    } finally {
      setLoadingStaff(false);
      setShowPayConfirmModal(false);
      setSelectedPayrollToPay(null);
    }
  };

  const handleOpenPayrollModal = () => {
    let initialComm = 0;
    let initialName = "";
    let initialRole = "PHYSIO";
    
    const firstProf = professionals[0];
    if (firstProf) {
      const perf = performances.find(p => p.professionalId === firstProf.id);
      initialComm = perf ? perf.commissionEarned : 0;
      initialName = firstProf.name;
      initialRole = firstProf.role;
    }
    
    setPayrollsForm({
      professionalId: firstProf?.id || "",
      baseSalary: firstProf?.role === "PHYSIO" ? 2500 : firstProf?.role === "AESTHETICIAN" ? 1800 : 1500,
      commissions: initialComm,
      deductions: 150,
      bonuses: 0,
      period: "Julio 2026",
    });
    setShowPayrollModal(true);
  };

  const handlePayrollFormChange = (field: string, value: any) => {
    setPayrollsForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === "professionalId") {
        const prof = professionals.find(p => p.id === value);
        if (prof) {
          const perf = performances.find(p => p.professionalId === value);
          updated.commissions = perf ? perf.commissionEarned : 0;
          updated.baseSalary = prof.role === "PHYSIO" ? 2500 : prof.role === "AESTHETICIAN" ? 1800 : 1500;
        }
      }
      return updated;
    });
  };

  const handleCreatePayroll = () => {
    const prof = professionals.find(p => p.id === payrollsForm.professionalId);
    if (!prof) {
      toast.error("Seleccione un profesional.");
      return;
    }
    
    const netPay = Number(payrollsForm.baseSalary) + Number(payrollsForm.commissions) + Number(payrollsForm.bonuses) - Number(payrollsForm.deductions);
    const entry: StaffPayroll = {
      id: `pay-${Date.now()}`,
      professionalId: payrollsForm.professionalId,
      name: prof.name,
      role: prof.role,
      period: payrollsForm.period,
      baseSalary: Number(payrollsForm.baseSalary),
      commissions: Number(payrollsForm.commissions),
      deductions: Number(payrollsForm.deductions),
      bonuses: Number(payrollsForm.bonuses),
      netPay,
      status: "PENDIENTE",
    };
    
    const updated = [entry, ...payrolls];
    setPayrolls(updated);
    localStorage.setItem("bloom_payrolls", JSON.stringify(updated));
    setShowPayrollModal(false);
    toast.success("Nómina generada con éxito.");
  };

  const loadData = async () => {
    try {
      const [pData, sData, prData] = await Promise.all([
        api.get<Patient[]>("/patients"),
        api.get<Service[]>("/services"),
        api.get<Product[]>("/products")
      ]);
      setPatients(pData);
      setServices(sData);
      setProducts(prData);

      localStorage.setItem("pos_cached_patients", JSON.stringify(pData));
      localStorage.setItem("bloom_skin_services", JSON.stringify(sData));
      localStorage.setItem("pos_cached_products", JSON.stringify(prData));
    } catch (e: any) {
      console.warn("Error cargando catálogos de POS, usando cachés locales si existen...", e);
      const cachedPatients = localStorage.getItem("pos_cached_patients");
      const cachedServices = localStorage.getItem("bloom_skin_services");
      const cachedProducts = localStorage.getItem("pos_cached_products");

      setPatients(cachedPatients ? JSON.parse(cachedPatients) : []);
      setServices(cachedServices ? JSON.parse(cachedServices) : []);
      setProducts(cachedProducts ? JSON.parse(cachedProducts) : []);
    }
  };

  const loadCashStatus = async () => {
    setCajaLoading(true);
    try {
      const active = await api.get<CashRegister>("/finance/cash/status");
      setCashRegister(active);
    } catch (err) {
      console.error("Error cargando caja:", err);
      setCashRegister(null);
    } finally {
      setCajaLoading(false);
    }
  };

  const loadPromotions = async () => {
    // Inicializar LocalStorage si no existe
    if (!localStorage.getItem("bloom_campaigns")) {
      localStorage.setItem("bloom_campaigns", JSON.stringify([
        {
          id: "camp-1",
          name: "Especial de Verano",
          serviceId: "seed-srv-facial",
          discountType: "PERCENT",
          discountValue: 20,
          startDate: "2026-06-01",
          endDate: "2026-08-31",
          isActive: true
        },
        {
          id: "camp-2",
          name: "Descuento Fisio",
          serviceId: "seed-srv-fisio",
          discountType: "FIXED",
          discountValue: 15,
          startDate: "2026-07-01",
          endDate: "2026-07-31",
          isActive: true
        }
      ]));
    }
    if (!localStorage.getItem("bloom_coupons")) {
      localStorage.setItem("bloom_coupons", JSON.stringify([
        {
          id: "coup-1",
          code: "BLOOM10",
          discountType: "PERCENT",
          discountValue: 10,
          expiryDate: "2026-12-31",
          usageStock: 100,
          usedCount: 5,
          minPurchase: 50,
          isActive: true
        },
        {
          id: "coup-2",
          code: "BIENVENIDA20",
          discountType: "FIXED",
          discountValue: 20,
          expiryDate: "2026-09-30",
          usageStock: 50,
          usedCount: 0,
          minPurchase: 100,
          isActive: true
        }
      ]));
    }

    try {
      const [campaignsData, couponsData] = await Promise.all([
        api.get<Campaign[]>("/campaigns").catch(() => {
          const loc = localStorage.getItem("bloom_campaigns");
          return loc ? JSON.parse(loc) : [];
        }),
        api.get<Coupon[]>("/coupons").catch(() => {
          const loc = localStorage.getItem("bloom_coupons");
          return loc ? JSON.parse(loc) : [];
        })
      ]);
      setCampaigns(campaignsData);
      setCoupons(couponsData);
    } catch (e) {
      const locC = localStorage.getItem("bloom_campaigns");
      if (locC) setCampaigns(JSON.parse(locC));
      const locCp = localStorage.getItem("bloom_coupons");
      if (locCp) setCoupons(JSON.parse(locCp));
    }
  };

  const handleOpenCash = async () => {
    if (!initialBalance || Number(initialBalance) < 0) {
      toast.error("Monto inicial inválido.");
      return;
    }
    try {
      await api.post("/finance/cash/open", {
        initialBalance: Number(initialBalance),
        notes: financeNotes
      });
      setInitialBalance("");
      setFinanceNotes("");
      setShowOpenModal(false);
      await loadCashStatus();
    } catch (err: any) {
      toast.error(err.message || "Error al abrir la caja.");
    }
  };

  const handleCloseCash = async () => {
    if (!actualBalance || Number(actualBalance) < 0) {
      toast.error("Monto conteo físico inválido.");
      return;
    }
    try {
      await api.post("/finance/cash/close", {
        actualBalance: Number(actualBalance),
        notes: financeNotes
      });
      setActualBalance("");
      setFinanceNotes("");
      setShowCloseModal(false);
      await loadCashStatus();
    } catch (err: any) {
      toast.error(err.message || "Error al cerrar la caja.");
    }
  };

  const handleRegisterExpense = async () => {
    if (!expenseAmount || Number(expenseAmount) <= 0 || !expenseDesc) {
      toast.error("Complete monto y descripción.");
      return;
    }
    try {
      await api.post("/finance/expenses", {
        amount: Number(expenseAmount),
        description: expenseDesc
      });
      setExpenseAmount("");
      setExpenseDesc("");
      setShowExpenseModal(false);
      await loadCashStatus();
    } catch (err: any) {
      toast.error(err.message || "Error al registrar el egreso.");
    }
  };

  // ── Lógica POS ──────────────────────────────────────────────────────────────

  const recalculateDiscount = (currentCart: CartItem[], coupon: Coupon | null) => {
    if (!coupon) return;
    const sub = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let calcDiscount = 0;
    if (coupon.discountType === "PERCENT") {
      calcDiscount = Math.round(sub * (coupon.discountValue / 100));
    } else {
      calcDiscount = coupon.discountValue;
    }
    setDiscount(calcDiscount);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponValidationLoading(true);
    setCouponError(null);
    setCouponSuccessMsg(null);
    const codeUpper = couponCode.trim().toUpperCase();
    const currentSubtotal = getSubtotal();

    try {
      const res = await api.post<{
        code: string;
        discountType: "PERCENT" | "FIXED";
        discountValue: number;
        minPurchase?: number;
      }>("/coupons/validate", {
        code: codeUpper,
        cartTotal: currentSubtotal,
      });
      
      if (res.minPurchase && currentSubtotal < res.minPurchase) {
        throw new Error(`La compra mínima para este cupón es de $${res.minPurchase}`);
      }

      const verifiedCoupon: Coupon = {
        id: `coup-verified-${Date.now()}`,
        code: res.code,
        discountType: res.discountType,
        discountValue: res.discountValue,
        minPurchase: res.minPurchase || 0,
        expiryDate: "",
        isActive: true,
        usageStock: 9999,
        usedCount: 0
      };

      applyCouponDetails(verifiedCoupon);
    } catch (err: any) {
      console.warn("Validación en backend falló, probando fallback local:", err);
      // Fallback local en localStorage
      const localCouponsStr = localStorage.getItem("bloom_coupons");
      if (localCouponsStr) {
        try {
          const couponsList: Coupon[] = JSON.parse(localCouponsStr);
          const found = couponsList.find(c => c.code.toUpperCase() === codeUpper && c.isActive);
          if (found) {
            if (found.expiryDate && new Date(found.expiryDate) < new Date()) {
              throw new Error("El cupón ha expirado.");
            }
            if (found.usageStock !== undefined && found.usedCount !== undefined && found.usedCount >= found.usageStock) {
              throw new Error("El cupón ha agotado su stock de usos.");
            }
            if (found.minPurchase && currentSubtotal < found.minPurchase) {
              throw new Error(`La compra mínima para este cupón es de $${found.minPurchase}`);
            }
            
            applyCouponDetails(found);
            return;
          }
        } catch (e: any) {
          setCouponError(e.message || "Error al aplicar cupón.");
          setAppliedCoupon(null);
          setDiscount(0);
          setCouponValidationLoading(false);
          return;
        }
      }
      setCouponError(err.message || "Cupón inválido o no encontrado.");
      setAppliedCoupon(null);
      setDiscount(0);
    } finally {
      setCouponValidationLoading(false);
    }
  };

  const applyCouponDetails = (coupon: Coupon) => {
    setAppliedCoupon(coupon);
    let calcDiscount = 0;
    const currentSubtotal = getSubtotal();
    if (coupon.discountType === "PERCENT") {
      calcDiscount = Math.round(currentSubtotal * (coupon.discountValue / 100));
    } else {
      calcDiscount = coupon.discountValue;
    }
    setDiscount(calcDiscount);
    setCouponSuccessMsg(`¡Cupón ${coupon.code} aplicado! Descuento de ${coupon.discountType === "PERCENT" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}`);
  };

  const addToCart = (item: any, type: "SERVICE" | "PRODUCT") => {
    const existing = cart.find(c => c.id === item.id && c.type === type);
    let itemPrice = type === "SERVICE" ? item.defaultPrice : item.price;
    
    if (type === "SERVICE") {
      const campaign = getActiveCampaignForService(item.id);
      if (campaign) {
        itemPrice = campaign.discountType === "PERCENT" 
          ? Math.max(0, item.defaultPrice * (1 - campaign.discountValue / 100))
          : Math.max(0, item.defaultPrice - campaign.discountValue);
      }
    }

    let nextCart;
    if (existing) {
      nextCart = cart.map(c => c.id === item.id && c.type === type ? { ...c, quantity: c.quantity + 1, price: itemPrice } : c);
    } else {
      nextCart = [...cart, {
        id: item.id,
        type,
        name: item.name,
        price: itemPrice,
        quantity: 1
      }];
    }
    setCart(nextCart);
    recalculateDiscount(nextCart, appliedCoupon);
  };

  const removeFromCart = (id: string, type: "SERVICE" | "PRODUCT") => {
    const nextCart = cart.filter(c => !(c.id === id && c.type === type));
    setCart(nextCart);
    if (nextCart.length === 0) {
      setAppliedCoupon(null);
      setDiscount(0);
      setCouponSuccessMsg(null);
      setCouponCode("");
    } else {
      recalculateDiscount(nextCart, appliedCoupon);
    }
  };

  const updateQuantity = (id: string, type: "SERVICE" | "PRODUCT", qty: number) => {
    if (qty <= 0) {
      removeFromCart(id, type);
      return;
    }
    const nextCart = cart.map(c => c.id === id && c.type === type ? { ...c, quantity: qty } : c);
    setCart(nextCart);
    recalculateDiscount(nextCart, appliedCoupon);
  };

  const getSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getTotal = () => Math.max(0, getSubtotal() - discount);

  const handleCheckout = async () => {
    if (!selectedPatientId) {
      toast.error("Seleccione un paciente para asignar la venta.");
      return;
    }
    if (cart.length === 0) {
      toast.error("El carrito está vacío.");
      return;
    }
    setPosError(null);
    setPosSuccess(false);

    try {
      const items = cart.map(c => ({
        productId: c.type === "PRODUCT" ? c.id : null,
        description: c.name,
        unitPrice: c.price,
        quantity: c.quantity,
        total: c.price * c.quantity
      }));

      await api.post("/invoices", {
        patientId: selectedPatientId,
        items,
        subtotal: getSubtotal(),
        tax: 0,
        total: getTotal(),
        paymentMethod,
        reference: paymentReference || null,
        status: "PAGADO",
        couponCode: appliedCoupon ? appliedCoupon.code : null
      });

      // Incrementar contador de usos del cupón localmente si aplica
      if (appliedCoupon) {
        const localCouponsStr = localStorage.getItem("bloom_coupons");
        if (localCouponsStr) {
          try {
            const couponsList: Coupon[] = JSON.parse(localCouponsStr);
            const updatedCoupons = couponsList.map(c => {
              if (c.code.toUpperCase() === appliedCoupon.code.toUpperCase()) {
                return { ...c, usedCount: (c.usedCount || 0) + 1 };
              }
              return c;
            });
            localStorage.setItem("bloom_coupons", JSON.stringify(updatedCoupons));
            setCoupons(updatedCoupons);
          } catch (e) {}
        }
      }

      setPosSuccess(true);
      setCart([]);
      setSelectedPatientId("");
      setDiscount(0);
      setPaymentReference("");
      setCouponCode("");
      setAppliedCoupon(null);
      setCouponSuccessMsg(null);
      await loadCashStatus();
      setTimeout(() => setPosSuccess(false), 4000);
    } catch (err: any) {
      if (!navigator.onLine) {
        // Fallback offline queue saving
        const invoiceData = {
          patientId: selectedPatientId,
          items,
          subtotal: getSubtotal(),
          tax: 0,
          total: getTotal(),
          paymentMethod,
          reference: paymentReference || null,
          status: "PAGADO",
          couponCode: appliedCoupon ? appliedCoupon.code : null
        };
        const localInvoicesRaw = localStorage.getItem("offline_invoices");
        const localInvoices = localInvoicesRaw ? JSON.parse(localInvoicesRaw) : [];
        localInvoices.push(invoiceData);
        localStorage.setItem("offline_invoices", JSON.stringify(localInvoices));

        // Increment coupon count locally if applicable
        if (appliedCoupon) {
          const localCouponsStr = localStorage.getItem("bloom_coupons");
          if (localCouponsStr) {
            try {
              const couponsList: Coupon[] = JSON.parse(localCouponsStr);
              const updatedCoupons = couponsList.map(c => {
                if (c.code.toUpperCase() === appliedCoupon.code.toUpperCase()) {
                  return { ...c, usedCount: (c.usedCount || 0) + 1 };
                }
                return c;
              });
              localStorage.setItem("bloom_coupons", JSON.stringify(updatedCoupons));
              setCoupons(updatedCoupons);
            } catch (e) {}
          }
        }

        setPosSuccess(true);
        setCart([]);
        setSelectedPatientId("");
        setDiscount(0);
        setPaymentReference("");
        setCouponCode("");
        setAppliedCoupon(null);
        setCouponSuccessMsg(null);
        setTimeout(() => setPosSuccess(false), 4000);
        toast.warning("Sin conexión. La venta se ha guardado localmente y se sincronizará automáticamente al recuperar la conexión.");
      } else {
        setPosError(err.message || "Error al completar el cobro.");
      }
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.name || !campaignForm.serviceId || !campaignForm.discountValue || !campaignForm.startDate || !campaignForm.endDate) {
      toast.error("Por favor, complete todos los campos obligatorios.");
      return;
    }
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name: campaignForm.name,
      serviceId: campaignForm.serviceId,
      discountType: campaignForm.discountType,
      discountValue: campaignForm.discountValue,
      startDate: campaignForm.startDate,
      endDate: campaignForm.endDate,
      isActive: true
    };

    try {
      await api.post<Campaign>("/campaigns", newCamp);
      const updated = [newCamp, ...campaigns];
      setCampaigns(updated);
      localStorage.setItem("bloom_campaigns", JSON.stringify(updated));
    } catch (err) {
      console.warn("Error enviando campaña al backend, usando fallback local:", err);
      const updated = [newCamp, ...campaigns];
      setCampaigns(updated);
      localStorage.setItem("bloom_campaigns", JSON.stringify(updated));
    }

    setCampaignForm({
      name: "",
      serviceId: "",
      discountType: "PERCENT",
      discountValue: 10,
      startDate: "",
      endDate: ""
    });
    setShowCampaignModal(false);
  };

  const handleCreateCoupon = async () => {
    if (!couponForm.code || !couponForm.discountValue || !couponForm.usageStock || !couponForm.expiryDate) {
      toast.error("Por favor, complete todos los campos obligatorios.");
      return;
    }
    const newCoup: Coupon = {
      id: `coup-${Date.now()}`,
      code: couponForm.code.trim().toUpperCase(),
      discountType: couponForm.discountType,
      discountValue: couponForm.discountValue,
      expiryDate: couponForm.expiryDate,
      usageStock: couponForm.usageStock,
      usedCount: 0,
      minPurchase: couponForm.minPurchase,
      isActive: true
    };

    try {
      await api.post<Coupon>("/coupons", newCoup);
      const updated = [newCoup, ...coupons];
      setCoupons(updated);
      localStorage.setItem("bloom_coupons", JSON.stringify(updated));
    } catch (err) {
      console.warn("Error enviando cupón al backend, usando fallback local:", err);
      const updated = [newCoup, ...coupons];
      setCoupons(updated);
      localStorage.setItem("bloom_coupons", JSON.stringify(updated));
    }

    setCouponForm({
      code: "",
      discountType: "PERCENT",
      discountValue: 10,
      expiryDate: "",
      usageStock: 100,
      minPurchase: 0
    });
    setShowCouponModal(false);
  };

  const handleToggleCampaignState = async (id: string) => {
    try {
      await api.put(`/campaigns/${id}/toggle`, {});
      const updated = campaigns.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c);
      setCampaigns(updated);
      localStorage.setItem("bloom_campaigns", JSON.stringify(updated));
    } catch (err) {
      console.warn("Error al pausar campaña en backend, usando fallback local:", err);
      const updated = campaigns.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c);
      setCampaigns(updated);
      localStorage.setItem("bloom_campaigns", JSON.stringify(updated));
    }
  };

  const handleToggleCouponState = async (id: string) => {
    try {
      await api.put(`/coupons/${id}/toggle`, {});
      const updated = coupons.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c);
      setCoupons(updated);
      localStorage.setItem("bloom_coupons", JSON.stringify(updated));
    } catch (err) {
      console.warn("Error al pausar cupón en backend, usando fallback local:", err);
      const updated = coupons.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c);
      setCoupons(updated);
      localStorage.setItem("bloom_coupons", JSON.stringify(updated));
    }
  };

  // Buscador filtrado
  const filteredServices = services.filter(s => s.name.toLowerCase().includes(posSearch.toLowerCase()));
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(posSearch.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground uppercase tracking-widest flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Control Financiero & POS
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Terminal de venta rápida y flujo de caja diario en tiempo real</p>
        </div>

        {/* Tab Selector */}
        <div id="tour-finance-tabs" className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-sm gap-1 overflow-x-auto max-w-full">
          <button
            id="tour-finance-pos-tab"
            onClick={() => setActiveTab("pos")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "pos"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Terminal POS
          </button>
          <button
            id="tour-finance-caja-tab"
            onClick={() => setActiveTab("caja")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "caja"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Caja Diaria
          </button>
          <button
            id="tour-finance-schedules-tab"
            onClick={() => setActiveTab("schedules")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "schedules"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Horarios de Staff
          </button>
          <button
            id="tour-finance-performance-tab"
            onClick={() => setActiveTab("performance")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "performance"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Desempeño y Metas
          </button>
          <button
            id="tour-finance-payroll-tab"
            onClick={() => setActiveTab("payroll")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "payroll"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Nóminas y Liquidación
          </button>
          <button
            id="tour-finance-promotions-tab"
            onClick={() => setActiveTab("promotions")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "promotions"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Promociones
          </button>
        </div>
      </div>

      {/* Caja Abierta Alerta Banner */}
      {!cajaLoading && !cashRegister && (
        <div className="flex items-center justify-between gap-4 p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-300">Sesión de caja inactiva (Cerrada)</p>
              <p className="text-[10px] text-amber-400/70">Debe abrir caja antes de poder realizar cobros en el POS o registrar egresos.</p>
            </div>
          </div>
          <button
            onClick={() => { setError(null); setShowOpenModal(true); }}
            className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-amber-500/30 transition-colors"
          >
            <Unlock className="w-3.5 h-3.5" />
            Abrir Caja Diaria
          </button>
        </div>
      )}

      {/* ── TERMINAL POS TAB ── */}
      {activeTab === "pos" && (
        <div id="tour-pos-terminal" className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          
          {/* LADO IZQUIERDO: Catálogo de Servicios y Productos (Colspan 3) */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Buscador */}
            <div className="bg-card rounded-2xl border border-slate-300 p-4">
              <input
                type="text"
                placeholder="Buscar tratamientos o productos..."
                value={posSearch}
                onChange={(e) => setPosSearch(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Listado de Servicios */}
            <div className="bg-card rounded-2xl border border-slate-300 p-5 space-y-3">
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                Tratamientos Clínicos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredServices.map((srv) => {
                  const campaign = getActiveCampaignForService(srv.id);
                  const finalPrice = campaign
                    ? (campaign.discountType === "PERCENT"
                        ? Math.max(0, srv.defaultPrice * (1 - campaign.discountValue / 100))
                        : Math.max(0, srv.defaultPrice - campaign.discountValue))
                    : srv.defaultPrice;

                  return (
                    <div
                      key={srv.id}
                      className="p-3 border border-slate-200 rounded-xl hover:border-primary hover:bg-slate-50/50 transition-all flex justify-between items-center group"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5 flex-wrap">
                          {srv.name}
                          {campaign && (
                            <span className="bg-emerald-100 text-emerald-700 text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                              {campaign.name}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {campaign ? (
                            <>
                              <span className="text-[11px] font-bold text-red-500 line-through">${srv.defaultPrice}</span>
                              <span className="text-[11px] font-black text-emerald-500 font-extrabold">${finalPrice}</span>
                            </>
                          ) : (
                            <span className="text-[11px] font-black text-primary">${srv.defaultPrice}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(srv, "SERVICE")}
                        disabled={!cashRegister}
                        className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-primary/10 disabled:hover:text-primary flex-shrink-0"
                        title="Agregar al carrito"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Listado de Productos */}
            <div className="bg-card rounded-2xl border border-slate-300 p-5 space-y-3">
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                Productos & Insumos de Apoyo
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-slate-50/50 transition-all flex justify-between items-center group"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-100 truncate">{prod.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-black text-emerald-600">${prod.price}</span>
                        <span className="text-[9px] font-bold text-slate-400">Stock: {prod.stock}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(prod, "PRODUCT")}
                      disabled={!cashRegister || prod.stock <= 0}
                      className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-30"
                      title="Agregar al carrito"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* LADO DERECHO: Carrito de Compras & Checkout (Colspan 2) */}
          <div className="lg:col-span-2 space-y-4">
            
            <div className="bg-card rounded-2xl border border-slate-300 p-5 space-y-5">
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-white/10">
                <Receipt className="w-4 h-4 text-primary" />
                Resumen del Cobro
              </h3>

              {posSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold animate-fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Venta registrada con éxito. La caja diaria fue actualizada.
                </div>
              )}

              {posError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  {posError}
                </div>
              )}

              {/* Paciente */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Paciente *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="">-- Asignar Paciente --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.fullName}</option>
                  ))}
                </select>
              </div>

              {/* Items del Carrito */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <label className="text-[10px] font-bold text-muted-foreground uppercase block border-b border-slate-100 pb-1">Items Seleccionados</label>
                
                {cart.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic text-center py-6">El carrito está vacío.</p>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={`${item.type}-${item.id}`} className="flex justify-between items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-slate-100 truncate">{item.name}</p>
                          <p className="text-[9px] font-black text-slate-400">${item.price} c/u</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, item.type, Number(e.target.value))}
                            className="w-10 text-center text-xs font-bold bg-white border border-slate-200 rounded-lg p-1"
                          />
                          <button
                            onClick={() => removeFromCart(item.id, item.type)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Forma de Pago */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Método Pago</label>
                    <select
                      value={paymentMethod}
                      onChange={(e: any) => setPaymentMethod(e.target.value)}
                      className="w-full text-[11px] font-bold bg-slate-50 border border-slate-200 rounded-xl p-2"
                    >
                      <option value="EFECTIVO">💵 Efectivo</option>
                      <option value="TARJETA">💳 Tarjeta</option>
                      <option value="TRANSFERENCIA">🏦 Transferencia</option>
                      <option value="BILLETERA_VIRTUAL">📱 Billetera Virtual</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Descuento ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                      className="w-full text-[11px] font-bold bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none"
                    />
                  </div>
                </div>

                {paymentMethod !== "EFECTIVO" && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Referencia de Transacción</label>
                    <input
                      type="text"
                      placeholder="Ej: Nro de comprobante / lote"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none"
                    />
                  </div>
                )}

                {/* Casilla de Aplicar Cupón */}
                <div id="tour-pos-coupons" className="space-y-2 pt-2 border-t border-slate-100/50">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase block">Aplicar Cupón</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej: BLOOM10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary/45 uppercase tracking-wider placeholder:font-sans"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponValidationLoading || !couponCode.trim() || cart.length === 0}
                      className="bg-slate-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-40"
                    >
                      {couponValidationLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Aplicar"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {couponError}
                    </p>
                  )}
                  {couponSuccessMsg && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                      <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1.5 leading-snug">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        {couponSuccessMsg}
                      </p>
                      <button
                        onClick={() => {
                          setAppliedCoupon(null);
                          setDiscount(0);
                          setCouponSuccessMsg(null);
                          setCouponCode("");
                        }}
                        className="text-emerald-700 hover:text-emerald-950 p-0.5 rounded hover:bg-emerald-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Totales */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Subtotal:</span>
                  <span>${getSubtotal().toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-xs font-bold text-emerald-600 items-center">
                    <span>Cupón ({appliedCoupon.code}):</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-black border border-emerald-200">
                      -{appliedCoupon.discountType === "PERCENT" ? `${appliedCoupon.discountValue}%` : `$${appliedCoupon.discountValue}`}
                    </span>
                  </div>
                )}
                {discount > 0 && !appliedCoupon && (
                  <div className="flex justify-between text-xs font-bold text-red-500">
                    <span>Descuento Manual:</span>
                    <span>-${discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-200 border-t border-white/10 pt-2">
                  <span>Total a Cobrar:</span>
                  <span className="text-primary text-base">${getTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Botón Checkout */}
              <button
                onClick={handleCheckout}
                disabled={!cashRegister || cart.length === 0 || !selectedPatientId}
                className="w-full py-3 bg-primary text-white text-xs font-black rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/20 disabled:opacity-40 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                Completar Venta y Cobro
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ── CAJA DIARIA TAB ── */}
      {activeTab === "caja" && (
        <div id="tour-pos-cash" className="space-y-6">
          
          {cajaLoading ? (
            <div className="flex items-center justify-center py-12 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Obteniendo estado de caja...</span>
            </div>
          ) : cashRegister ? (
            <div className="space-y-6">
              
              {/* Resumen Superior Caja */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Saldo Inicial */}
                <div className="bg-card rounded-2xl border border-slate-300 p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0">
                    <Unlock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Monto Inicial de Apertura</p>
                    <p className="text-xl font-black text-slate-800 mt-0.5">${cashRegister.initialBalance.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground">Abierto por: {cashRegister.openedBy.name}</p>
                  </div>
                </div>

                {/* Saldo Esperado */}
                <div className="bg-card rounded-2xl border border-slate-300 p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Saldo Esperado en Caja</p>
                    <p className="text-xl font-black text-emerald-600 mt-0.5">${cashRegister.expectedBalance.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground">Calculado con transacciones registradas</p>
                  </div>
                </div>

                {/* Acciones de Caja */}
                <div className="bg-card rounded-2xl border border-slate-300 p-5 flex flex-col justify-center gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowExpenseModal(true)}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                      Registrar Egreso
                    </button>
                    <button
                      onClick={() => { setFinanceNotes(""); setActualBalance(""); setShowCloseModal(true); }}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-red-100"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Cerrar Caja
                    </button>
                  </div>
                </div>

              </div>

              {/* Historial de Movimientos de Caja */}
              <div className="bg-card rounded-2xl border border-slate-300 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Historial de Flujo de Caja</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Ingresos y egresos detallados en la sesión de hoy</p>
                  </div>
                  <span className="px-2.5 py-1 text-[9px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
                    Sesión Abierta
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50">
                        <th className="px-5 py-3 text-left text-[10px] font-black text-muted-foreground uppercase">Hora</th>
                        <th className="px-5 py-3 text-left text-[10px] font-black text-muted-foreground uppercase">Descripción</th>
                        <th className="px-5 py-3 text-left text-[10px] font-black text-muted-foreground uppercase">Tipo</th>
                        <th className="px-5 py-3 text-left text-[10px] font-black text-muted-foreground uppercase">Monto</th>
                        <th className="px-5 py-3 text-left text-[10px] font-black text-muted-foreground uppercase">Usuario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashRegister.movements.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-8 text-center text-xs text-muted-foreground italic">
                            Aún no se registran movimientos en esta sesión de caja.
                          </td>
                        </tr>
                      ) : (
                        cashRegister.movements.map((mv) => (
                          <tr key={mv.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors">
                            <td className="px-5 py-3.5 text-xs font-bold text-slate-500">
                              {new Date(mv.createdAt).toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-5 py-3.5 text-xs font-bold text-slate-800">
                              {mv.description}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                mv.type === "INCOME" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                              }`}>
                                {mv.type === "INCOME" ? "Ingreso" : "Egreso"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-xs font-black text-slate-800">
                              {mv.type === "INCOME" ? "+" : "-"}${mv.amount.toLocaleString()}
                            </td>
                            <td className="px-5 py-3.5 text-xs font-bold text-slate-500">
                              {mv.user?.name || "Sistema"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-card rounded-2xl border border-slate-300 gap-4 text-center">
              <Lock className="w-12 h-12 text-slate-400/40" />
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Caja Diaria Inactiva</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">Para iniciar el cobro de tratamientos o registrar movimientos financieros, proceda a abrir la caja.</p>
              </div>
              <button
                onClick={() => { setError(null); setShowOpenModal(true); }}
                className="flex items-center gap-2 bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary/95 transition-colors shadow-md shadow-primary/10"
              >
                <Unlock className="w-3.5 h-3.5" />
                Abrir Caja Diaria
              </button>
            </div>
          )}

        </div>
      )}

      {/* ── MODAL: APERTURA DE CAJA ── */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl relative space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
              <Unlock className="w-4 h-4 text-primary" />
              Apertura de Caja Diaria
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Fondo de Efectivo Inicial ($) *</label>
                <input
                  type="number"
                  placeholder="Ej: 500"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Notas de Apertura</label>
                <textarea
                  placeholder="Ej: Caja matutina, billetes de baja denominación para cambio."
                  value={financeNotes}
                  onChange={(e) => setFinanceNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 h-20 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                onClick={() => setShowOpenModal(false)}
                className="px-4 py-2 border border-border text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleOpenCash}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 shadow-sm shadow-primary/10"
              >
                Abrir Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: REGISTRO DE EGRESO (GASTO MENOR) ── */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl relative space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
              <TrendingDown className="w-4 h-4 text-red-500" />
              Registrar Egreso (Gasto Menor)
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Monto del Egreso ($) *</label>
                <input
                  type="number"
                  placeholder="Ej: 50"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Descripción / Concepto *</label>
                <input
                  type="text"
                  placeholder="Ej: Compra de café e insumos de limpieza rápida"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                onClick={() => setShowExpenseModal(false)}
                className="px-4 py-2 border border-border text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegisterExpense}
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 shadow-sm shadow-red-100"
              >
                Registrar Gasto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CIERRE DE CAJA (CONCILIACIÓN VISUAL) ── */}
      {showCloseModal && cashRegister && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl relative space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
              <Lock className="w-4 h-4 text-red-600" />
              Cierre de Caja y Arqueo
            </h3>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-bold">
                  <span>Monto Apertura:</span>
                  <span>${cashRegister.initialBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-600 font-bold border-b border-slate-200 pb-2">
                  <span>Saldo Esperado (Sistema):</span>
                  <span>${cashRegister.expectedBalance.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Efectivo Físico Contado ($) *</label>
                <input
                  type="number"
                  placeholder="Ej: 520"
                  value={actualBalance}
                  onChange={(e) => setActualBalance(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary"
                />
              </div>

              {actualBalance && (
                <div className="space-y-1">
                  {Number(actualBalance) - cashRegister.expectedBalance === 0 ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ¡Caja cuadra perfectamente! ($0 discrepancia)
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      Discrepancia detectada: {Number(actualBalance) - cashRegister.expectedBalance > 0 ? "Excedente de" : "Faltante de"} ${Math.abs(Number(actualBalance) - cashRegister.expectedBalance).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Observaciones de Cierre</label>
                <textarea
                  placeholder="Ej: Se detectó faltante de $5 por devolución manual de cambio."
                  value={financeNotes}
                  onChange={(e) => setFinanceNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 h-20 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-4 py-2 border border-border text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleCloseCash}
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 shadow-sm shadow-red-100"
              >
                Confirmar Cierre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECCIÓN HORARIOS DE STAFF ── */}
      {activeTab === "schedules" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
          <div className="lg:col-span-1 bg-card rounded-2xl border border-slate-300 p-5 space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Seleccionar Profesional
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Gestione la jornada semanal de su equipo</p>
            </div>
            
            <div className="space-y-2">
              {professionals.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No hay profesionales disponibles.</p>
              ) : (
                professionals.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProfessional(p.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      selectedProfId === p.id
                        ? "border-primary bg-primary/5 text-slate-800 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedProfId === p.id ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {(p?.name || "").charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{p?.name || "Profesional"}</p>
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">
                        {ROLE_LABELS[p?.role || ""] || p?.role || "Staff"}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-3 bg-card rounded-2xl border border-slate-300 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-500" />
                  Jornada Semanal Visual
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Establezca los días y horas de atención en la clínica
                </p>
              </div>

              <button
                onClick={handleSaveHours}
                disabled={loadingStaff || !selectedProfId}
                className="flex items-center gap-2 bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/10 disabled:opacity-50"
              >
                {loadingStaff ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Guardar Jornada Semanal
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DAYS.map(({ key, label }) => {
                const active = !!selectedProfHours[key];
                const shift = selectedProfHours[key];

                return (
                  <div
                    key={key}
                    className={`p-4 border rounded-2xl transition-all space-y-4 flex flex-col justify-between ${
                      active
                        ? "border-primary/35 bg-primary/5/10 shadow-sm"
                        : "border-slate-200 bg-slate-50/50 opacity-70"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">{label}</span>
                      <button
                        onClick={() => toggleDay(key)}
                        className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border transition-all ${
                          active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {active ? "🟢 Labora" : "🔴 Descanso"}
                      </button>
                    </div>

                    {active && shift ? (
                      <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase">Entrada</label>
                            <input
                              type="time"
                              value={shift.start}
                              onChange={(e) => updateTime(key, "start", e.target.value)}
                              className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-primary bg-white text-slate-700"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase">Salida</label>
                            <input
                              type="time"
                              value={shift.end}
                              onChange={(e) => updateTime(key, "end", e.target.value)}
                              className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-primary bg-white text-slate-700"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <span className="text-[11px] text-muted-foreground italic">Día de descanso</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── SECCIÓN DESEMPEÑO Y METAS ── */}
      {activeTab === "performance" && (
        <div className="space-y-6 animate-fade-in">
          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-card border border-slate-300 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ventas Totales Staff</p>
                <p className="text-xl font-black text-slate-800 mt-0.5">
                  ${performances.reduce((sum, p) => sum + p.actualSales, 0).toLocaleString()}
                </p>
                <p className="text-[9px] text-muted-foreground">Generado este mes por el equipo</p>
              </div>
            </div>

            <div className="bg-card border border-slate-300 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Comisiones Acumuladas</p>
                <p className="text-xl font-black text-emerald-600 mt-0.5">
                  ${performances.reduce((sum, p) => sum + p.commissionEarned, 0).toLocaleString()}
                </p>
                <p className="text-[9px] text-muted-foreground">Total acumulado a pagar</p>
              </div>
            </div>

            <div className="bg-card border border-slate-300 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tasa de Cumplimiento</p>
                <p className="text-xl font-black text-amber-600 mt-0.5">
                  {Math.round(
                    (performances.reduce((sum, p) => sum + p.actualSales, 0) / 
                     Math.max(1, performances.reduce((sum, p) => sum + p.salesTarget, 0))) * 100
                  )}%
                </p>
                <p className="text-[9px] text-muted-foreground">Avance global frente a metas</p>
              </div>
            </div>
          </div>

          {/* Tarjetas de Profesionales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performances.length === 0 ? (
              <p className="text-xs text-muted-foreground italic col-span-full">No hay datos de desempeño disponibles.</p>
            ) : (
              performances.map(perf => {
                const progressPct = Math.min(100, Math.round((perf.actualSales / perf.salesTarget) * 100)) || 0;
                return (
                  <div key={perf.professionalId} className="bg-card border border-slate-300 rounded-2xl p-5 space-y-4 hover:shadow-md transition-shadow">
                    
                    {/* Header de Tarjeta */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                          {(perf?.name || "").charAt(0).toUpperCase() || "P"}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{perf?.name || "Profesional"}</h4>
                          <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 ${ROLE_BADGES[perf?.role || ""] || "bg-slate-100"}`}>
                            {ROLE_LABELS[perf?.role || ""] || perf?.role || "Staff"}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenGoalModal(perf)}
                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                        title="Ajustar Meta y Comisión"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Barra de Progreso */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-500">Meta de Ventas:</span>
                        <span className="text-slate-800">${perf.actualSales.toLocaleString()} / ${perf.salesTarget.toLocaleString()}</span>
                      </div>
                      
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-700 ${
                            progressPct >= 100 ? "bg-emerald-500" : progressPct >= 50 ? "bg-primary" : "bg-amber-500"
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-[9px] font-bold">
                        <span className="text-muted-foreground">{progressPct}% Completado</span>
                        <span className="text-primary font-black">{perf.month}</span>
                      </div>
                    </div>

                    {/* Métricas e Ingresos */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-[11px] font-bold">
                      <div className="flex justify-between text-slate-500">
                        <span>Tasa Comisión:</span>
                        <span className="text-slate-800">{perf.commissionRate}%</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Comisiones Acumuladas:</span>
                        <span className="text-emerald-600 font-extrabold text-xs">${perf.commissionEarned.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-2 flex justify-between text-slate-400 text-[10px]">
                        <span>Tratamientos ({perf.servicesCount}):</span>
                        <span>${perf.servicesSales.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[10px]">
                        <span>Productos ({perf.productsCount}):</span>
                        <span>${perf.productsSales.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <button
                      onClick={() => handleRecalculateCommissions(perf.professionalId, perf.month)}
                      disabled={loadingStaff}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Recalcular Avance
                    </button>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── SECCIÓN NÓMINAS Y LIQUIDACIÓN ── */}
      {activeTab === "payroll" && (
        <div id="tour-pos-payroll" className="space-y-6 animate-fade-in">
          {/* Resumen nóminas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-slate-300 rounded-2xl p-5">
            <div className="flex gap-6 items-center flex-wrap">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Pendiente de Pago</p>
                <p className="text-xl font-black text-amber-600 mt-0.5">
                  ${payrolls.filter(p => p.status === "PENDIENTE").reduce((sum, p) => sum + p.netPay, 0).toLocaleString()}
                </p>
                <p className="text-[9px] text-muted-foreground">{payrolls.filter(p => p.status === "PENDIENTE").length} profesionales pendientes</p>
              </div>
              <div className="w-px h-10 bg-slate-200 hidden sm:block" />
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Liquidado este Mes</p>
                <p className="text-xl font-black text-emerald-600 mt-0.5">
                  ${payrolls.filter(p => p.status === "PAGADO").reduce((sum, p) => sum + p.netPay, 0).toLocaleString()}
                </p>
                <p className="text-[9px] text-muted-foreground">{payrolls.filter(p => p.status === "PAGADO").length} nóminas pagadas</p>
              </div>
            </div>

            <button
              onClick={handleOpenPayrollModal}
              className="flex items-center gap-2 bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/10 self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              Generar Nueva Nómina
            </button>
          </div>

          {/* Historial de Nóminas */}
          <div className="bg-card border border-slate-300 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Historial de Liquidaciones</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Detalle mensual de salarios y comisiones pagadas</p>
            </div>

            <div className="divide-y divide-slate-100">
              {payrolls.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-10">No se han registrado nóminas en el sistema.</p>
              ) : (
                payrolls.map(pay => (
                  <div key={pay.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/30 transition-colors">
                    {/* Datos del profesional */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-700 font-bold">
                        {(pay?.name || "").charAt(0).toUpperCase() || "N"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-slate-800">{pay?.name || "Colaborador"}</h4>
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${ROLE_BADGES[pay?.role || ""] || "bg-slate-100"}`}>
                            {ROLE_LABELS[pay?.role || ""] || pay?.role || "Staff"}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Periodo: {pay.period}</p>
                      </div>
                    </div>

                    {/* Desglose detallado */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1 max-w-xl text-[10px] font-bold">
                      <div>
                        <p className="text-slate-400">Sueldo Base</p>
                        <p className="text-slate-700 font-black mt-0.5">${pay.baseSalary.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Comisiones (+)</p>
                        <p className="text-emerald-600 font-black mt-0.5">+${pay.commissions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Bonos (+)</p>
                        <p className="text-emerald-600 font-black mt-0.5">+${pay.bonuses.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Deducciones (-)</p>
                        <p className="text-red-500 font-black mt-0.5">-${pay.deductions.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Neto y Estado de Pago */}
                    <div className="flex items-center justify-between lg:justify-end gap-6 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Neto a Liquidar</p>
                        <p className="text-base font-extrabold text-primary">${pay.netPay.toLocaleString()}</p>
                      </div>

                      <div>
                        {pay.status === "PENDIENTE" ? (
                          <button
                            onClick={() => handleOpenPayConfirm(pay)}
                            className="bg-amber-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-amber-700 transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pagar Nómina
                          </button>
                        ) : (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <Check className="w-3 h-3" />
                              Pagado
                            </span>
                            <p className="text-[8px] text-muted-foreground mt-1">
                              {pay.paymentMethod} · {pay.paidAt ? new Date(pay.paidAt).toLocaleDateString() : ""}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SECCIÓN PROMOCIONES, CAMPAÑAS Y CUPONES ── */}
      {activeTab === "promotions" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-slate-300 rounded-2xl p-5">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Percent className="w-4 h-4 text-primary" />
                Gestión de Promociones y Campañas Temporales
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Cree y pause campañas de descuento por tratamiento o configure cupones especiales para el carrito del POS.
              </p>
            </div>
            <div className="flex gap-2 self-start sm:self-center">
              <button
                onClick={() => setShowCampaignModal(true)}
                className="flex items-center gap-2 bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
              >
                <Plus className="w-3.5 h-3.5" />
                Nueva Campaña
              </button>
              <button
                onClick={() => setShowCouponModal(true)}
                className="flex items-center gap-2 bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-all shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                Nuevo Cupón
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CAMPAÑAS */}
            <div className="bg-card rounded-2xl border border-slate-300 p-5 space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-slate-100">
                Campañas Activas en Servicios
              </h4>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {campaigns.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-8">No hay campañas registradas.</p>
                ) : (
                  campaigns.map(c => {
                    const srv = services.find(s => s.id === c.serviceId);
                    return (
                      <div key={c.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-all">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-800">{c.name}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {c.isActive ? 'Activo' : 'Pausado'}
                            </span>
                          </div>
                          <p className="text-[10px] font-medium text-muted-foreground mt-1">
                            Aplica a: <span className="font-bold text-slate-700">{srv ? srv.name : "Servicio no encontrado"}</span>
                          </p>
                          <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                            Descuento: <span className="font-bold text-primary">{c.discountType === "PERCENT" ? `${c.discountValue}%` : `$${c.discountValue}`}</span>
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 mt-1">
                            Vigencia: {c.startDate || "N/A"} al {c.endDate || "N/A"}
                          </p>
                        </div>
                        <button
                          onClick={() => handleToggleCampaignState(c.id)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                            c.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {c.isActive ? 'Pausar' : 'Reactivar'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* CUPONES */}
            <div className="bg-card rounded-2xl border border-slate-300 p-5 space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-slate-100">
                Cupones de Descuento
              </h4>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {coupons.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-8">No hay cupones registrados.</p>
                ) : (
                  coupons.map(cp => (
                    <div key={cp.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-all">
                      <div className="min-w-0 flex-1 font-bold text-[11px] text-slate-500">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-black text-primary font-mono tracking-wider bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">{cp.code}</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${cp.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {cp.isActive ? 'Activo' : 'Pausado'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1.5">
                          <p>Valor: <span className="text-slate-800">{cp.discountType === "PERCENT" ? `${cp.discountValue}%` : `$${cp.discountValue}`}</span></p>
                          <p>Compra Mínima: <span className="text-slate-800">${cp.minPurchase}</span></p>
                          <p>Usos: <span className="text-slate-800">{cp.usedCount || 0} / {cp.usageStock}</span></p>
                          <p className="col-span-2 text-[9px] font-bold text-slate-400 mt-1">Expiración: {cp.expiryDate || "N/A"}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleCouponState(cp.id)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                          cp.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {cp.isActive ? 'Pausar' : 'Reactivar'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: NUEVA CAMPAÑA DE DESCUENTO ── */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl relative space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
              <Percent className="w-4 h-4 text-primary" />
              Nueva Campaña de Descuento
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Nombre de Campaña *</label>
                <input
                  type="text"
                  placeholder="Ej: Promo de Verano, Semana Facial"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Tratamiento / Servicio a aplicar *</label>
                <select
                  value={campaignForm.serviceId}
                  onChange={(e) => setCampaignForm({ ...campaignForm, serviceId: e.target.value })}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="">-- Seleccionar Tratamiento --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (${s.defaultPrice})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Tipo Descuento</label>
                  <select
                    value={campaignForm.discountType}
                    onChange={(e: any) => setCampaignForm({ ...campaignForm, discountType: e.target.value })}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="PERCENT">Porcentaje (%)</option>
                    <option value="FIXED">Monto Fijo ($)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Valor Descuento *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej: 10"
                    value={campaignForm.discountValue}
                    onChange={(e) => setCampaignForm({ ...campaignForm, discountValue: Number(e.target.value) })}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Fecha Inicio *</label>
                  <input
                    type="date"
                    value={campaignForm.startDate}
                    onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Fecha Fin *</label>
                  <input
                    type="date"
                    value={campaignForm.endDate}
                    onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                onClick={() => setShowCampaignModal(false)}
                className="px-4 py-2 border border-border text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCampaign}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 shadow-sm shadow-primary/10"
              >
                Guardar Campaña
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: NUEVO CUPÓN DE DESCUENTO ── */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl relative space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
              <Percent className="w-4 h-4 text-slate-800" />
              Nuevo Cupón de Descuento
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Código de Cupón *</label>
                <input
                  type="text"
                  placeholder="Ej: SUMMER20"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Tipo Descuento</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e: any) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="PERCENT">Porcentaje (%)</option>
                    <option value="FIXED">Monto Fijo ($)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Valor Descuento *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej: 15"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Stock de Usos *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej: 50"
                    value={couponForm.usageStock}
                    onChange={(e) => setCouponForm({ ...couponForm, usageStock: Number(e.target.value) })}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Compra Mínima ($) *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ej: 50"
                    value={couponForm.minPurchase}
                    onChange={(e) => setCouponForm({ ...couponForm, minPurchase: Number(e.target.value) })}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Fecha de Expiración / Validez *</label>
                <input
                  type="date"
                  value={couponForm.expiryDate}
                  onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                onClick={() => setShowCouponModal(false)}
                className="px-4 py-2 border border-border text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCoupon}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 shadow-sm"
              >
                Guardar Cupón
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: AJUSTAR META Y TASA DE COMISIÓN ── */}
      {showGoalModal && editingPerformance && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-border p-6 shadow-2xl relative space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
              <Percent className="w-4 h-4 text-primary" />
              Metas y Comisión
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Ajuste el objetivo de ventas mensual y la tasa de comisión de <strong>{editingPerformance.name}</strong> para {editingPerformance.month}.
              </p>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Meta de Ventas Mensual ($)</label>
                <input
                  type="number"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Tasa de Comisión (%)</label>
                <input
                  type="number"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                onClick={() => { setShowGoalModal(false); setEditingPerformance(null); }}
                className="px-4 py-2 border border-border text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveGoal}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 shadow-sm"
              >
                Aplicar Ajustes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: GENERAR NUEVA NÓMINA ── */}
      {showPayrollModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl relative space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
              <Briefcase className="w-4 h-4 text-primary" />
              Generar Nómina de Staff
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Profesional *</label>
                <select
                  value={payrollsForm.professionalId}
                  onChange={(e) => handlePayrollFormChange("professionalId", e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
                >
                  <option value="">-- Seleccionar Profesional --</option>
                  {professionals.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Periodo</label>
                  <select
                    value={payrollsForm.period}
                    onChange={(e) => handlePayrollFormChange("period", e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="Julio 2026">Julio 2026</option>
                    <option value="Junio 2026">Junio 2026</option>
                    <option value="Mayo 2026">Mayo 2026</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Sueldo Base ($)</label>
                  <input
                    type="number"
                    value={payrollsForm.baseSalary}
                    onChange={(e) => handlePayrollFormChange("baseSalary", e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase">Comisiones ($)</label>
                  <input
                    type="number"
                    value={payrollsForm.commissions}
                    onChange={(e) => handlePayrollFormChange("commissions", e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase">Bonos ($)</label>
                  <input
                    type="number"
                    value={payrollsForm.bonuses}
                    onChange={(e) => handlePayrollFormChange("bonuses", e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase">Deducciones ($)</label>
                  <input
                    type="number"
                    value={payrollsForm.deductions}
                    onChange={(e) => handlePayrollFormChange("deductions", e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              {/* Neto a pagar de previsualización */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center font-bold text-xs">
                <span className="text-slate-500">Neto Precalculado:</span>
                <span className="text-base font-extrabold text-primary">
                  ${(Number(payrollsForm.baseSalary) + Number(payrollsForm.commissions) + Number(payrollsForm.bonuses) - Number(payrollsForm.deductions)).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                onClick={() => setShowPayrollModal(false)}
                className="px-4 py-2 border border-border text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePayroll}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 shadow-sm"
              >
                Generar Nómina
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRMACIÓN DE LIQUIDACIÓN DE NÓMINA ── */}
      {showPayConfirmModal && selectedPayrollToPay && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-border p-6 shadow-2xl relative space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
              <Wallet className="w-4 h-4 text-emerald-500" />
              Liquidar Nómina
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Profesional:</span>
                  <span className="font-bold text-slate-800">{selectedPayrollToPay.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Periodo:</span>
                  <span className="font-bold text-slate-800">{selectedPayrollToPay.period}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-black">
                  <span className="text-slate-600">Neto a Transferir:</span>
                  <span className="text-emerald-600 text-sm">${selectedPayrollToPay.netPay.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Forma de Pago *</label>
                <select
                  value={payMethod}
                  onChange={(e: any) => setPayMethod(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
                >
                  <option value="TRANSFERENCIA">🏦 Transferencia Bancaria</option>
                  <option value="EFECTIVO">💵 Efectivo (Caja Menor)</option>
                  <option value="TARJETA">💳 Tarjeta Corporativa</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                onClick={() => { setShowPayConfirmModal(false); setSelectedPayrollToPay(null); }}
                className="px-4 py-2 border border-border text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPay}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 shadow-sm"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
