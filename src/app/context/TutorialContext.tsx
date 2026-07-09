import React, { createContext, useContext, useState, useEffect } from "react";
import { VIEW_TOURS, WORKFLOW_TOURS, ROLE_ONBOARDING_TOURS, INSPECT_DATABASE, TourStep } from "../data/tutorialData";

export interface InspectItem {
  title: string;
  content: string;
  selector: string;
}

interface TutorialContextType {
  // Tour State
  activeTour: TourStep[] | null;
  activeTourKey: string | null;
  currentStep: number;
  startViewTour: (screenKey: string) => void;
  startWorkflowTour: (workflowKey: string) => void;
  startRoleOnboarding: (roleKey: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  closeTour: () => void;

  // Help Center State
  isHelpCenterOpen: boolean;
  openHelpCenter: () => void;
  closeHelpCenter: () => void;

  // User Onboarding Progress Tracking
  completedTours: string[];
  seenOnboardings: string[];
  markTourCompleted: (tourKey: string) => void;
  markOnboardingSeen: (roleKey: string) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [activeTour, setActiveTour] = useState<TourStep[] | null>(null);
  const [activeTourKey, setActiveTourKey] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState<boolean>(false);

  const [completedTours, setCompletedTours] = useState<string[]>([]);
  const [seenOnboardings, setSeenOnboardings] = useState<string[]>([]);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const storedCompleted = localStorage.getItem("bloom_completed_tours");
      if (storedCompleted) {
        setCompletedTours(JSON.parse(storedCompleted));
      }

      const storedOnboardings = localStorage.getItem("bloom_seen_onboardings");
      if (storedOnboardings) {
        setSeenOnboardings(JSON.parse(storedOnboardings));
      }
    } catch (e) {
      console.error("Error loading tutorial progress from localStorage", e);
    }
  }, []);

  const markTourCompleted = (tourKey: string) => {
    setCompletedTours((prev) => {
      if (prev.includes(tourKey)) return prev;
      const updated = [...prev, tourKey];
      localStorage.setItem("bloom_completed_tours", JSON.stringify(updated));
      return updated;
    });
  };

  const markOnboardingSeen = (roleKey: string) => {
    setSeenOnboardings((prev) => {
      if (prev.includes(roleKey)) return prev;
      const updated = [...prev, roleKey];
      localStorage.setItem("bloom_seen_onboardings", JSON.stringify(updated));
      return updated;
    });
  };

  const startViewTour = (screenKey: string) => {
    const tour = VIEW_TOURS[screenKey];
    if (tour && tour.length > 0) {
      setActiveTour(tour);
      setActiveTourKey(`view_${screenKey}`);
      setCurrentStep(0);
      setIsHelpCenterOpen(false);
    } else {
      console.warn(`No tour defined for view: ${screenKey}`);
    }
  };

  const startWorkflowTour = (workflowKey: string) => {
    const tour = WORKFLOW_TOURS[workflowKey];
    if (tour && tour.length > 0) {
      setActiveTour(tour);
      setActiveTourKey(`workflow_${workflowKey}`);
      setCurrentStep(0);
      setIsHelpCenterOpen(false);
    } else {
      console.warn(`No tour defined for workflow: ${workflowKey}`);
    }
  };

  const startRoleOnboarding = (roleKey: string) => {
    const tour = ROLE_ONBOARDING_TOURS[roleKey];
    if (tour && tour.length > 0) {
      setActiveTour(tour);
      setActiveTourKey(`onboarding_${roleKey}`);
      setCurrentStep(0);
      setIsHelpCenterOpen(false);
    } else {
      console.warn(`No tour defined for onboarding role: ${roleKey}`);
    }
  };

  const nextStep = () => {
    if (!activeTour) return;
    if (currentStep < activeTour.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Completed!
      if (activeTourKey) {
        if (activeTourKey.startsWith("onboarding_")) {
          const role = activeTourKey.replace("onboarding_", "");
          markOnboardingSeen(role);
        } else {
          markTourCompleted(activeTourKey);
        }
      }
      closeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const closeTour = () => {
    setActiveTour(null);
    setActiveTourKey(null);
    setCurrentStep(0);
  };

  const openHelpCenter = () => {
    setIsHelpCenterOpen(true);
    setActiveTour(null);
  };

  const closeHelpCenter = () => {
    setIsHelpCenterOpen(false);
  };

  return (
    <TutorialContext.Provider
      value={{
        activeTour,
        activeTourKey,
        currentStep,
        startViewTour,
        startWorkflowTour,
        startRoleOnboarding,
        nextStep,
        prevStep,
        closeTour,

        isHelpCenterOpen,
        openHelpCenter,
        closeHelpCenter,

        completedTours,
        seenOnboardings,
        markTourCompleted,
        markOnboardingSeen,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
}
