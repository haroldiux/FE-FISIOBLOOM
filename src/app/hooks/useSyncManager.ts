import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { toast } from "sonner";

export type SyncState = "online" | "offline" | "syncing";

// Nombre de candado compartido: cualquier lugar del código que sincronice las
// colas offline (este hook, o el propio InventoryScreen) debe pedir este
// mismo lock antes de tocar localStorage. Sin esto, dos sincronizaciones
// corriendo a la vez (dos pestañas abiertas, o un remount + el evento
// "online" disparándose casi juntos) pueden leer la misma cola pendiente
// ANTES de que ninguna la borre, y terminan reenviando el mismo registro
// dos veces — fue justo lo que causó firmas y ajustes de stock duplicados.
export const OFFLINE_SYNC_LOCK_NAME = "bloomskin-offline-sync";

// Si el navegador no soporta la Web Locks API (muy viejo), al menos evita que
// esta misma pestaña dispare dos sincronizaciones superpuestas.
let fallbackLockHeld = false;

export async function withOfflineSyncLock(fn: () => Promise<void>): Promise<void> {
  if (typeof navigator !== "undefined" && "locks" in navigator) {
    await (navigator as any).locks.request(OFFLINE_SYNC_LOCK_NAME, { ifAvailable: true }, async (lock: any) => {
      if (!lock) return; // otra pestaña (o este mismo hook) ya está sincronizando ahora mismo
      await fn();
    });
    return;
  }
  if (fallbackLockHeld) return;
  fallbackLockHeld = true;
  try {
    await fn();
  } finally {
    fallbackLockHeld = false;
  }
}

function hasPendingOfflineItems(): boolean {
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
}

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

    if (!hasPendingOfflineItems()) {
      setSyncState("online");
      return;
    }

    setSyncState("syncing");
    setIsProcessing(true);

    // Todo lo que sigue toca localStorage y hace POSTs de reintento: debe
    // correr de a una sola vez en todo el navegador (entre pestañas), o dos
    // sincronizaciones superpuestas pueden reenviar el mismo pendiente dos
    // veces antes de que cualquiera lo borre de la cola.
    try {
      await withOfflineSyncLock(async () => {
        // Volver a chequear ya adentro del lock: si otra pestaña sincronizó
        // mientras esperábamos el candado, puede que ya no quede nada.
        if (!hasPendingOfflineItems()) return;

        toast.loading("Sincronizando datos locales...", { id: "sync-toast" });
        let hadSilentDataLoss = false;

        // 1. Sincronizar Invoices
        // Importante: si el POST falla, la venta NUNCA se descarta silenciosamente.
        // Antes, un error "no transitorio" (ej. 400 por validación) hacía que la
        // factura se borrara de localStorage como si se hubiera sincronizado,
        // perdiendo el cobro sin avisarle a nadie. Ahora se reintenta siempre,
        // salvo que el servidor confirme que ya existe (éxito idempotente).
        const invoicesRaw = localStorage.getItem("offline_invoices");
        if (invoicesRaw) {
          const invoices = JSON.parse(invoicesRaw);
          const failedInvoices: any[] = [];
          for (const invoice of invoices) {
            try {
              await api.post("/invoices", invoice);
            } catch (e: any) {
              console.error("Error syncing invoice:", e);
              failedInvoices.push(invoice);
              hadSilentDataLoss = true;
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
                  failedConsents.push(consent);
                  hadSilentDataLoss = true;
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
              failedMovements.push(movement);
              hadSilentDataLoss = true;
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
              failedAppts.push(item);
              hadSilentDataLoss = true;
            }
          }
          if (failedAppts.length > 0) {
            localStorage.setItem("offline_appointment_status", JSON.stringify(failedAppts));
          } else {
            localStorage.removeItem("offline_appointment_status");
          }
        }

        console.log("Offline sync completed successfully.");

        const itemsRemaining = hasPendingOfflineItems();
        if (itemsRemaining) {
          toast.error(
            hadSilentDataLoss
              ? "Atención: hay ventas, consentimientos o cambios pendientes que el servidor rechazó. No se perdieron — siguen guardados en este dispositivo. Avisá a soporte antes de reintentar la venta a mano."
              : "Sincronización incompleta: algunos datos no se subieron.",
            { id: "sync-toast", duration: 15000 }
          );
        } else {
          toast.success("Sincronización completada.", { id: "sync-toast" });
        }
      });
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
