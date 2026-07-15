import { TourStep } from "../types";
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
import { inventoryTransferWorkflow } from "./inventoryTransfer";
import { staffAttendanceWorkflow } from "./staffAttendance";
import { createProductWorkflow } from "./createProduct";
import { createPackageWorkflow } from "./createPackage";
import { createPromotionWorkflow } from "./createPromotion";
import { provisionTenantWorkflow } from "./provisionTenant";
import { updateProfileWorkflow } from "./updateProfile";
import { manualSyncOfflineWorkflow } from "./manualSyncOffline";
import { helpcenterTourWorkflow } from "./helpcenterTour";

export const WORKFLOW_TOURS: Record<string, TourStep[]> = {
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
  "inventory-transfer": inventoryTransferWorkflow,
  "staff-attendance": staffAttendanceWorkflow,
  "create-product": createProductWorkflow,
  "create-package": createPackageWorkflow,
  "create-promotion": createPromotionWorkflow,
  "provision-tenant": provisionTenantWorkflow,
  "update-profile": updateProfileWorkflow,
  "manual-sync-offline": manualSyncOfflineWorkflow,
  "helpcenter-tour": helpcenterTourWorkflow,
};
