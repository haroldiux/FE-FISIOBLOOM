import { TourStep } from "../types";

/**
 * Role identifiers used across the help center authorization layer.
 * Mirrors the role union in `frontend/src/app/context/AuthContext.tsx`.
 */
export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "RECEPTIONIST"
  | "PHYSIO"
  | "AESTHETICIAN";

/**
 * Allowed screens per role. Used to filter the Flujos tab and the cmdk
 * search so non-admin users never see admin-only workflows.
 *
 * Keep in sync with `SCREEN_PERMISSIONS` in `App.tsx` (auth concern owned
 * by the app shell) — the data layer only mirrors the same permissions.
 */
export const ROLE_ALLOWED_SCREENS: Record<Role, string[]> = {
  SUPER_ADMIN: ["dashboard", "saas"],
  ADMIN: [
    "dashboard",
    "calendar",
    "patients",
    "consents",
    "pos",
    "inventory",
    "services",
    "reports",
    "config",
  ],
  RECEPTIONIST: ["dashboard", "calendar", "patients", "consents", "pos"],
  PHYSIO: ["dashboard", "calendar", "patients", "consents"],
  AESTHETICIAN: ["dashboard", "calendar", "patients", "consents"],
};

/**
 * Workflow key → owning screen. Reconstructed directly from the 20
 * workflow key files in `data/tutorials/workflows/` (one file per key,
 * including `helpcenterTour`).
 *
 * Co-located with the workflows it maps to prevent drift: if a new
 * workflow is added without a target screen, the `isWorkflowVisibleToRole`
 * predicate denies it by default (`false` when no entry exists).
 */
export const WORKFLOW_TARGET_SCREENS: Record<string, string> = {
  "create-appointment": "calendar",
  "register-patient": "patients",
  "record-session": "patients",
  "sign-consent": "consents",
  "upload-gallery": "patients",
  "pos-sale": "pos",
  "cash-register": "pos",
  "create-service": "services",
  "offline-photo-sync": "patients",
  "whatsapp-integration": "config",
  "payroll-settlement": "reports",
  "inventory-transfer": "inventory",
  "staff-attendance": "pos",
  "create-product": "inventory",
  "create-package": "services",
  "create-promotion": "pos",
  "provision-tenant": "saas",
  "update-profile": "dashboard",
  "manual-sync-offline": "dashboard",
  "helpcenter-tour": "dashboard",
};

/**
 * Role-based visibility predicate for a workflow key.
 *
 * - `false` when the key is missing from `WORKFLOW_TARGET_SCREENS`
 *   (safety: unlisted workflows are denied, never silently allowed).
 * - `true` only when the role's `ROLE_ALLOWED_SCREENS` includes the
 *   workflow's target screen.
 */
export function isWorkflowVisibleToRole(
  key: string,
  role: Role,
): boolean {
  const target = WORKFLOW_TARGET_SCREENS[key];
  if (!target) return false;
  const allowed = ROLE_ALLOWED_SCREENS[role];
  if (!allowed) return false;
  return allowed.includes(target);
}

/**
 * Convenience type alias for code that needs to walk both maps together.
 * The tour shape itself is unchanged — the maps here are pure metadata.
 */
export type WorkflowKey = keyof typeof WORKFLOW_TARGET_SCREENS;
export type WorkflowTour = TourStep[];
