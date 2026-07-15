import { TourStep } from "../types";

export const consentTour: TourStep[] = [
  {
    selector: "#tour-consent-stats",
    title: "Consent Overview",
    content: "Snapshot of the total signed documents and how many patients signed today. Use this header to gauge clinic-wide compliance at a glance.",
    position: "bottom"
  },
  {
    selector: "#tour-consent-search",
    title: "Search Consents",
    content: "Filter the list by patient name or by the treatment associated with the signed document.",
    position: "bottom"
  },
  {
    selector: "#tour-consent-quick-sign",
    title: "Quick Sign",
    content: "Click this button to open the signature modal and capture a new informed consent on the spot.",
    position: "bottom"
  },
  {
    selector: "#tour-consent-patient",
    title: "Select Patient",
    content: "Search and pick the patient who is signing. Only patients with a clinical record can be linked to a consent.",
    position: "right"
  },
  {
    selector: "#tour-consent-service",
    title: "Select Service",
    content: "Choose the service this consent covers. Pick the general template for intake or the laser template for laser-based treatments.",
    position: "right"
  },
  {
    selector: "#tour-consent-signature",
    title: "Terms & Signature",
    content: "Read the informed consent terms, then sign on the canvas using a finger, stylus, or mouse. Use the clear option to restart the signature.",
    position: "top"
  },
  {
    selector: "#tour-consent-upload",
    title: "Upload Scanned Consent",
    content: "Alternative to the canvas: upload a scanned copy of the consent when the patient signs on paper. Supported formats include PDF and image files.",
    position: "left"
  },
  {
    selector: "#tour-consent-save",
    title: "Save Consent",
    content: "Confirm the details and save the signed document. The consent is stored against the patient and flagged on their profile.",
    position: "top"
  }
];
