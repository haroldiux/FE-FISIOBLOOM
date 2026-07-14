import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { toast } from "sonner";

export type SyncState = "online" | "offline" | "syncing";

export function useSyncManager() {
  const [syncState, setSyncState] = useState<SyncState>(
    navigator.onLine ? "online" : "offline"
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const performSync = useCallback(async () => {
    // Only sync if online and if we have a token to authorize requests
    const token = localStorage.getItem("token");
    if (!navigator.onLine || !token) {
      if (!navigator.onLine) {
        setSyncState("offline");
      } else {
        setSyncState("online");
      }
      return;
    }

    // Check if there are actually any items to sync
    const hasItems = () => {
      if (localStorage.getItem("offline_invoices")) {
        const invoices = JSON.parse(localStorage.getItem("offline_invoices") || "[]");
        if (invoices.length > 0) return true;
      }
      if (localStorage.getItem("offline_movements")) {
        const movements = JSON.parse(localStorage.getItem("offline_movements") || "[]");
        if (movements.length > 0) return true;
      }
      if (localStorage.getItem("offline_appointment_status")) {
        const appts = JSON.parse(localStorage.getItem("offline_appointment_status") || "[]");
        if (appts.length > 0) return true;
      }
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("offline_consents_")) {
          const consents = JSON.parse(localStorage.getItem(key) || "[]");
          if (consents.length > 0) return true;
        }
      }
      return false;
    };

    if (!hasItems()) {
      setSyncState("online");
      return;
    }

    setSyncState("syncing");
    setIsProcessing(true);
    toast.loading("Sincronizando datos locales...", { id: "sync-toast" });

    try {
      // 1. Sincronizar Invoices
      const invoicesRaw = localStorage.getItem("offline_invoices");
      if (invoicesRaw) {
        const invoices = JSON.parse(invoicesRaw);
        const failedInvoices: any[] = [];
        for (const invoice of invoices) {
          try {
            await api.post("/invoices", invoice);
          } catch (e: any) {
            console.error("Error syncing invoice:", e);
            const isTransient = !e.response || (e.response.status >= 500) || (e.response.status === 408);
            if (isTransient) {
              failedInvoices.push(invoice);
            }
          }
        }
        if (failedInvoices.length > 0) {
          localStorage.setItem("offline_invoices", JSON.stringify(failedInvoices));
        } else {
          localStorage.removeItem("offline_invoices");
        }
      }

      // 2. Sincronizar Consents
      const consentKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("offline_consents_")) {
          consentKeys.push(key);
        }
      }
      for (const key of consentKeys) {
        const consentsRaw = localStorage.getItem(key);
        if (consentsRaw) {
          const failedConsents: any[] = [];
          try {
            const consents = JSON.parse(consentsRaw);
            for (const consent of consents) {
              try {
                await api.post(`/patients/${consent.patientId}/consent`, {
                  serviceId: consent.serviceId,
                  signatureData: consent.signatureData,
                });
              } catch (e: any) {
                console.error("Error syncing consent:", e);
                const isTransient = !e.response || (e.response.status >= 500) || (e.response.status === 408);
                if (isTransient) {
                  failedConsents.push(consent);
                }
              }
            }
          } catch (e) {
            console.error("Error parsing consent key:", key, e);
          }
          if (failedConsents.length > 0) {
            localStorage.setItem(key, JSON.stringify(failedConsents));
          } else {
            localStorage.removeItem(key);
          }
        }
      }

      // 3. Sincronizar Movements (Stock Adjustments)
      const movementsRaw = localStorage.getItem("offline_movements");
      if (movementsRaw) {
        const movements = JSON.parse(movementsRaw);
        const failedMovements: any[] = [];
        for (const movement of movements) {
          try {
            await api.post(`/products/${movement.productId}/adjust-stock`, {
              quantity: movement.quantity,
              type: movement.type,
              notes: movement.notes,
            });
          } catch (e: any) {
            console.error("Error syncing stock adjustment:", e);
            const isTransient = !e.response || (e.response.status >= 500) || (e.response.status === 408);
            if (isTransient) {
              failedMovements.push(movement);
            }
          }
        }
        if (failedMovements.length > 0) {
          localStorage.setItem("offline_movements", JSON.stringify(failedMovements));
        } else {
          localStorage.removeItem("offline_movements");
        }
      }

      // 4. Sincronizar Appointment Status / Creations
      const apptsRaw = localStorage.getItem("offline_appointment_status");
      if (apptsRaw) {
        const appts = JSON.parse(apptsRaw);
        const failedAppts: any[] = [];
        for (const item of appts) {
          try {
            if (item.isNew) {
              await api.post("/appointments", item.payload);
            } else if (item.isStatusUpdateOnly) {
              await api.put(`/appointments/${item.appointmentId}/status`, {
                status: item.status,
              });
            } else {
              await api.put(`/appointments/${item.appointmentId}`, item.payload);
            }
          } catch (e: any) {
            console.error("Error syncing appointment action:", e);
            const isTransient = !e.response || (e.response.status >= 500) || (e.response.status === 408);
            if (isTransient) {
              failedAppts.push(item);
            }
          }
        }
        if (failedAppts.length > 0) {
          localStorage.setItem("offline_appointment_status", JSON.stringify(failedAppts));
        } else {
          localStorage.removeItem("offline_appointment_status");
        }
      }

      console.log("Offline sync completed successfully.");
      
      const itemsRemaining = hasItems();
      if (itemsRemaining) {
        toast.error("Sincronización incompleta: algunos datos no se subieron.", { id: "sync-toast" });
      } else {
        toast.success("Sincronización completada.", { id: "sync-toast" });
      }
    } catch (err) {
      console.error("Offline sync manager general error:", err);
      toast.error("Error al sincronizar datos locales.", { id: "sync-toast" });
    } finally {
      setIsProcessing(false);
      setSyncState("online");
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setSyncState("syncing");
      performSync();
    };

    const handleOffline = () => {
      setSyncState("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check on mount
    if (navigator.onLine) {
      performSync();
    } else {
      setSyncState("offline");
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [performSync]);

  return { syncState, isProcessing, forceSync: performSync };
}
