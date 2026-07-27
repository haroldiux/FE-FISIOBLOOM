import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "PHYSIO" | "AESTHETICIAN" | "RECEPTIONIST";
  tenantId: string;
  branchId?: string;
}

interface ShiftStatus {
  hasCheckedIn: boolean;
  canOperate: boolean;
  reason: "no_shift" | "not_checked_in" | null;
  message: string | null;
}

const DEFAULT_SHIFT_STATUS: ShiftStatus = {
  hasCheckedIn: false,
  canOperate: true,
  reason: null,
  message: null,
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (updatedUser: Partial<User>) => void;
  shiftStatus: ShiftStatus;
  refreshShiftStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Fisios, esteticistas y recepción solo pueden operar (crear citas, cobrar,
  // registrar pacientes, etc.) si les toca turno hoy y ya ficharon su entrada.
  // Se consulta al cargar sesión y cada vez que fichan entrada/salida, para que
  // los botones de acción se deshabiliten proactivamente en vez de dejarlos
  // llenar un formulario entero y recién enterarse al guardar que no podían.
  const [shiftStatus, setShiftStatus] = useState<ShiftStatus>(DEFAULT_SHIFT_STATUS);

  const refreshShiftStatus = async () => {
    try {
      const data = await api.get<{
        hasCheckedIn: boolean;
        canOperate: boolean;
        shiftReason: "no_shift" | "not_checked_in" | null;
        shiftMessage: string | null;
      }>("/attendance/status");
      setShiftStatus({
        hasCheckedIn: data.hasCheckedIn,
        canOperate: data.canOperate,
        reason: data.shiftReason,
        message: data.shiftMessage,
      });
    } catch (err) {
      console.error("Error al obtener estado de turno:", err);
    }
  };

  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        try {
          const userData = await api.get<User>("/auth/me");
          setUser(userData);
          refreshShiftStatus();
          if (userData.tenantId) {
            localStorage.setItem("tenantId", userData.tenantId);
          }
          // El Súper Admin no tiene sucursal propia: su selección de sucursal
          // (o "Todas") es una elección manual persistida aparte, no algo que
          // haya que sincronizar con su propio usuario en cada carga.
          if (userData.role !== "SUPER_ADMIN") {
            if (userData.branchId) {
              localStorage.setItem("branchId", userData.branchId);
            } else {
              localStorage.removeItem("branchId");
            }
          }
        } catch (error) {
          console.error("Error al cargar el usuario:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("tenantId");
          localStorage.removeItem("branchId");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<{ token: string; user: User }>("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", response.token);
      if (response.user.tenantId) {
        localStorage.setItem("tenantId", response.user.tenantId);
      }
      if (response.user.role === "SUPER_ADMIN") {
        // Arranca siempre en "Todas las Sucursales" en un login nuevo, por si
        // quedó guardado el branchId de otra cuenta usada antes en este navegador.
        localStorage.removeItem("branchId");
      } else if (response.user.branchId) {
        localStorage.setItem("branchId", response.user.branchId);
      } else {
        localStorage.removeItem("branchId");
      }
      setToken(response.token);
      setUser(response.user);
      refreshShiftStatus();
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tenantId");
    localStorage.removeItem("branchId");
    setToken(null);
    setUser(null);
    setShiftStatus(DEFAULT_SHIFT_STATUS);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated,
        updateUser,
        shiftStatus,
        refreshShiftStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}

