import { TourStep } from "../types";
import { dashboardTour } from "./dashboard";
import { calendarTour } from "./calendar";
import { patientsTour } from "./patients";
import { posTour } from "./pos";
import { inventoryTour } from "./inventory";
import { servicesTour } from "./services";
import { reportsTour } from "./reports";
import { configTour } from "./config";
import { saasTour } from "./saas";
import { loginTour } from "./login";
import { portalTour } from "./portal";
import { financeTour } from "./finance";
import { consentTour } from "./consents";

export const VIEW_TOURS: Record<string, TourStep[]> = {
  dashboard: dashboardTour,
  calendar: calendarTour,
  patients: patientsTour,
  pos: posTour,
  inventory: inventoryTour,
  services: servicesTour,
  reports: reportsTour,
  config: configTour,
  saas: saasTour,
  login: loginTour,
  portal: portalTour,
  finance: financeTour,
  consents: consentTour,
};
