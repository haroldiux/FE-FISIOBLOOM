import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface Branch {
  id: string;
  name: string;
}

// Solo el Súper Admin ve esto: le permite elegir "Todas las Sucursales" (vista
// combinada) o entrar a una sucursal en particular para ver sus datos propios
// (citas, pacientes, firmas, finanzas, almacén, servicios). El resto de roles
// ya está atado a su propia sucursal por el servidor, así que no necesitan esto.
export default function BranchTabs() {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  useEffect(() => {
    if (user?.role !== "SUPER_ADMIN") return;
    api.get<Branch[]>("/branches").then(setBranches).catch(() => {});
    setSelectedBranchId(localStorage.getItem("branchId") || "");
  }, [user]);

  if (!user || user.role !== "SUPER_ADMIN") return null;

  const handleSelect = (id: string) => {
    if (id) {
      localStorage.setItem("branchId", id);
    } else {
      localStorage.removeItem("branchId");
    }
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      <span className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-1">
        <Building2 className="w-3.5 h-3.5" /> Viendo:
      </span>
      <button
        onClick={() => handleSelect("")}
        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
          !selectedBranchId
            ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
            : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
        }`}
      >
        Todas las Sucursales
      </button>
      {branches.map((b) => (
        <button
          key={b.id}
          onClick={() => handleSelect(b.id)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
            selectedBranchId === b.id
              ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
              : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
          }`}
        >
          {b.name}
        </button>
      ))}
    </div>
  );
}
