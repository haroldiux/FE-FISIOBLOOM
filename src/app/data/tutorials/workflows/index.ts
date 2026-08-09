import { TourStep } from "../types";
import { WORKFLOW_TARGET_SCREENS } from "./targetScreens";
import { createAppointmentWorkflow } from "./createAppointment";
import { registerPatientWorkflow } from "./registerPatient";
import { recordSessionWorkflow } from "./recordSession";
import { signConsentWorkflow } from "./signConsent";
import { uploadGalleryWorkflow } from "./uploadGallery";
import { posSaleWorkflow } from "./posSale";
import { cashRegisterWorkflow } from "./cashRegister";
import { createServiceWorkflow } from "./createService";
import { offlinePhotoSyncWorkflow } from "./offlinePhotoSync";
import { whatsappIntegrationWorkflow } from "./whatsappIntegration";
import { payrollSettlementWorkflow } from "./payrollSettlement";

// New workflows
import { staffAttendanceWorkflow } from "./staffAttendance";
import { createProductWorkflow } from "./createProduct";
import { createPackageWorkflow } from "./createPackage";
import { createPromotionWorkflow } from "./createPromotion";
import { provisionTenantWorkflow } from "./provisionTenant";
import { updateProfileWorkflow } from "./updateProfile";
import { manualSyncOfflineWorkflow } from "./manualSyncOffline";
import { helpcenterTourWorkflow } from "./helpcenterTour";

const RAW_WORKFLOW_TOURS: Record<string, TourStep[]> = {
  "create-appointment": createAppointmentWorkflow,
  "register-patient": registerPatientWorkflow,
  "record-session": recordSessionWorkflow,
  "sign-consent": signConsentWorkflow,
  "upload-gallery": uploadGalleryWorkflow,
  "pos-sale": posSaleWorkflow,
  "cash-register": cashRegisterWorkflow,
  "create-service": createServiceWorkflow,
  "offline-photo-sync": offlinePhotoSyncWorkflow,
  "whatsapp-integration": whatsappIntegrationWorkflow,
  "payroll-settlement": payrollSettlementWorkflow,

  // New workflows mapping
  "staff-attendance": staffAttendanceWorkflow,
  "create-product": createProductWorkflow,
  "create-package": createPackageWorkflow,
  "create-promotion": createPromotionWorkflow,
  "provision-tenant": provisionTenantWorkflow,
  "update-profile": updateProfileWorkflow,
  "manual-sync-offline": manualSyncOfflineWorkflow,
  "helpcenter-tour": helpcenterTourWorkflow,
};

// Un flujo puede lanzarse desde el Centro de Ayuda estando en CUALQUIER
// pantalla (el modal es global), pero sus selectores viven todos en la
// pantalla "dueña" del flujo (ver WORKFLOW_TARGET_SCREENS). Sin esto, un
// flujo lanzado desde una pantalla distinta a la suya no encontraba ningún
// elemento y se auto-saltaba paso a paso hasta cerrarse solo.
export const WORKFLOW_TOURS: Record<string, TourStep[]> = Object.fromEntries(
  Object.entries(RAW_WORKFLOW_TOURS).map(([key, steps]) => {
    const targetScreen = WORKFLOW_TARGET_SCREENS[key];
    if (!targetScreen || steps.length === 0 || steps[0].targetScreen) {
      return [key, steps];
    }
    return [key, [{ ...steps[0], targetScreen }, ...steps.slice(1)]];
  }),
);
