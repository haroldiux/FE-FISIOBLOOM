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

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        try {
          const userData = await api.get<User>("/auth/me");
          setUser(userData);
          if (userData.tenantId) {
            localStorage.setItem("tenantId", userData.tenantId);
          }
          if (userData.branchId) {
            localStorage.setItem("branchId", userData.branchId);
          } else {
            localStorage.removeItem("branchId");
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
      if (response.user.branchId) {
        localStorage.setItem("branchId", response.user.branchId);
      } else {
        localStorage.removeItem("branchId");
      }
      setToken(response.token);
      setUser(response.user);
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
