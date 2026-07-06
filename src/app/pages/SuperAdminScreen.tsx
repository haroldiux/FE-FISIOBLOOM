import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Loader2, Plus, RefreshCw, CheckCircle, XCircle, ShieldAlert } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  plan: string;
  createdAt: string;
}

export default function SuperAdminScreen() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [plan, setPlan] = useState("BASIC");
  const [showModal, setShowModal] = useState(false);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/saas/tenants");
      setTenants(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al cargar inquilinos globales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    try {
      setSubmitting(true);
      setError(null);
      await api.post("/saas/tenants", { name, slug, plan });
      setName("");
      setSlug("");
      setPlan("BASIC");
      setShowModal(false);
      await fetchTenants();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al crear inquilino.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (tenant: Tenant) => {
    try {
      setError(null);
      await api.put(`/saas/tenants/${tenant.id}`, {
        isActive: !tenant.isActive,
      });
      await fetchTenants();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al actualizar estado.");
    }
  };

  const handleChangePlan = async (tenant: Tenant, newPlan: string) => {
    try {
      setError(null);
      await api.put(`/saas/tenants/${tenant.id}`, {
        plan: newPlan,
      });
      await fetchTenants();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al actualizar plan.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">SaaS Global Console</h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Administra los clientes multi-tenant, planes de facturación y estados de servicio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTenants}
            className="p-2 border border-border rounded-xl hover:bg-muted/20 transition-all cursor-pointer text-muted-foreground"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nuevo Inquilino
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/10">
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Inquilino</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Slug</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Plan</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Fecha Registro</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/5 transition-all">
                    <td className="p-4">
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-2xs text-muted-foreground font-mono">{t.id}</p>
                    </td>
                    <td className="p-4 text-sm font-mono text-foreground font-medium">{t.slug}</td>
                    <td className="p-4">
                      <select
                        value={t.plan}
                        onChange={(e) => handleChangePlan(t, e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground font-semibold focus:outline-none"
                      >
                        <option value="BASIC">BASIC</option>
                        <option value="PREMIUM">PREMIUM</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-bold ${
                          t.isActive
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {t.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {t.isActive ? "Activo" : "Suspendido"}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground font-medium">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(t)}
                        className={`px-3 py-1.5 text-2xs font-bold rounded-lg transition-all cursor-pointer ${
                          t.isActive
                            ? "bg-red-50 text-red-600 hover:bg-red-100/50"
                            : "bg-green-50 text-green-600 hover:bg-green-100/50"
                        }`}
                      >
                        {t.isActive ? "Suspender" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Registrar Inquilino</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Crea una nueva base aislada para un centro estético.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Nombre Comercial
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aura Clínica Estética"
                  className="w-full px-3 py-2 text-sm border border-border bg-background rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Identificador Slug (Único)
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="e.g. aura-clinica"
                  className="w-full px-3 py-2 text-sm border border-border bg-background rounded-xl text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Plan Inicial
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border bg-background rounded-xl text-foreground focus:outline-none"
                >
                  <option value="BASIC">BASIC (Sin multi-sucursal ni API)</option>
                  <option value="PREMIUM">PREMIUM (Acceso a todas las características)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted/10 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
