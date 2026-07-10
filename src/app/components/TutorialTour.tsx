import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";
import { useTutorial } from "../context/TutorialContext";

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TutorialTourProps {
  onNavigate?: (screen: string) => void;
}

// Rule-based heuristic to infer screen/tab targets dynamically from DOM selectors if not declared
export function enrichStep(step: any): any {
  if (!step) return step;
  const enriched = { ...step };
  const sel = step.selector || "";

  // 1. Inferred Target Screens
  if (!enriched.targetScreen) {
    if (sel.includes("dashboard")) enriched.targetScreen = "dashboard";
    else if (sel.includes("calendar")) enriched.targetScreen = "calendar";
    else if (sel.includes("consent")) enriched.targetScreen = "consents";
    else if (sel.includes("patients") || sel.includes("patient") || sel.includes("tab-")) enriched.targetScreen = "patients";
    else if (sel.includes("pos") || sel.includes("finance") || sel.includes("cash") || sel.includes("payroll")) enriched.targetScreen = "pos";
    else if (sel.includes("inventory")) enriched.targetScreen = "inventory";
    else if (sel.includes("services")) enriched.targetScreen = "services";
    else if (sel.includes("reports") || sel.includes("chart") || sel.includes("kpi")) enriched.targetScreen = "reports";
    else if (sel.includes("config")) enriched.targetScreen = "config";
    else if (sel.includes("saas")) enriched.targetScreen = "saas";
    else if (sel.includes("login")) enriched.targetScreen = "login";
    else if (sel.includes("portal")) enriched.targetScreen = "portal";
  }

  // 2. Inferred Target Tabs
  if (!enriched.targetTab) {
    if (sel.includes("tab-historial")) enriched.targetTab = "historial";
    else if (sel.includes("tab-evolucion") || sel.includes("session-modal")) enriched.targetTab = "evolucion";
    else if (sel.includes("tab-consentimiento") || sel.includes("consent-service") || sel.includes("consent-canvas") || sel.includes("consent-submit")) enriched.targetTab = "consentimiento";
    else if (sel.includes("tab-galeria") || sel.includes("gallery-file") || sel.includes("gallery-type") || sel.includes("gallery-submit") || sel.includes("gallery-sync")) enriched.targetTab = "galeria";
    else if (sel.includes("tab-facturacion")) enriched.targetTab = "facturacion";
    else if (sel.includes("config-professionals") || sel.includes("config-add-professional")) enriched.targetTab = "professionals";
    else if (sel.includes("config-clinic")) enriched.targetTab = "clinic";
    else if (sel.includes("config-whatsapp")) enriched.targetTab = "whatsapp";
    else if (sel.includes("config-branches")) enriched.targetTab = "branches";
    else if (sel.includes("pos-terminal") || sel.includes("pos-coupons") || sel.includes("pos-patient-search") || sel.includes("pos-payment-method") || sel.includes("pos-invoice-type") || sel.includes("pos-submit-sale")) enriched.targetTab = "pos";
    else if (sel.includes("pos-cash") || sel.includes("cash-initial-balance") || sel.includes("cash-expense") || sel.includes("cash-close")) enriched.targetTab = "caja";
    else if (sel.includes("finance-payroll") || sel.includes("pos-payroll")) enriched.targetTab = "payroll";
    else if (sel.includes("services-supplies") || sel.includes("service-form")) enriched.targetTab = "SERVICES";
    else if (sel.includes("services-packages") || sel.includes("package-form")) enriched.targetTab = "PACKAGES";
  }

  return enriched;
}

export default function TutorialTour({ onNavigate }: TutorialTourProps) {
  const {
    activeTour,
    currentStep,
    nextStep,
    prevStep,
    closeTour
  } = useTutorial();

  const [rect, setRect] = useState<ElementRect | null>(null);
  const [tooltipCoords, setTooltipCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const active = !!activeTour;
  const rawStep = activeTour && activeTour[currentStep];
  const stepData = rawStep ? enrichStep(rawStep) : null;

  // 1. Auto-routing: transition screen when active step targetScreen changes
  useEffect(() => {
    if (!active || !stepData || !onNavigate) return;
    if (stepData.targetScreen) {
      onNavigate(stepData.targetScreen);
    }
  }, [currentStep, active, stepData, onNavigate]);

  // 2. Scroll target element into view safely
  useEffect(() => {
    if (!active || !stepData) return;
    try {
      const el = document.querySelector(stepData.selector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (e) {
      console.warn(`Error locating element: ${stepData.selector}`, e);
    }
  }, [currentStep, active, stepData]);

  // 3. Track position of active element rect with mounting interval checks
  useEffect(() => {
    if (!active || !stepData) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      try {
        const el = document.querySelector(stepData.selector);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            setRect({
              top: r.top,
              left: r.left,
              width: r.width,
              height: r.height,
            });
            return;
          }
        }
      } catch (e) {
        console.warn(`Error reading bounds for: ${stepData.selector}`, e);
      }
      setRect(null);
    };

    updateRect();
    
    // Poll to catch elements rendering after screen/tab transition animations
    const interval = setInterval(updateRect, 100);
    const safetyTimeout = setTimeout(() => clearInterval(interval), 2000);
    
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    
    return () => {
      clearInterval(interval);
      clearTimeout(safetyTimeout);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [currentStep, active, stepData]);

  // Keyboard navigation
  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeTour();
      else if (e.key === "ArrowRight") nextStep();
      else if (e.key === "ArrowLeft") prevStep();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, nextStep, prevStep, closeTour]);

  // Auto-advance by click/event on target element
  useEffect(() => {
    if (!active || !stepData || stepData.mode !== "interactive" || !stepData.advanceOn) return;
    const { event } = stepData.advanceOn;
    const targetEl = document.querySelector(stepData.selector);
    if (!targetEl) return;
    const handleAdvance = () => setTimeout(nextStep, 100);
    targetEl.addEventListener(event, handleAdvance);
    return () => targetEl.removeEventListener(event, handleAdvance);
  }, [active, stepData, nextStep]);

  // Calculate dynamic coordinates for tooltip positioning
  useEffect(() => {
    if (!active || !stepData) return;
    
    const calculatePosition = () => {
      const position = stepData.position || "bottom";
      const tooltipWidth = tooltipRef.current?.offsetWidth || 360;
      const tooltipHeight = tooltipRef.current?.offsetHeight || 190;
      const margin = 16;
      
      let top = window.innerHeight / 2 - tooltipHeight / 2;
      let left = window.innerWidth / 2 - tooltipWidth / 2;
      
      if (rect) {
        if (position === "bottom") {
          top = rect.top + rect.height + margin;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
        } else if (position === "top") {
          top = rect.top - tooltipHeight - margin;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
        } else if (position === "left") {
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - margin;
        } else if (position === "right") {
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left + rect.width + margin;
        }
        
        if (left < 16) left = 16;
        if (left + tooltipWidth > window.innerWidth - 16) {
          left = window.innerWidth - tooltipWidth - 16;
        }
        
        if (top < 16) {
          top = rect.top + rect.height + margin;
        }
        if (top + tooltipHeight > window.innerHeight - 16) {
          top = rect.top - tooltipHeight - margin;
          if (top < 16) {
            top = window.innerHeight / 2 - tooltipHeight / 2;
          }
        }
      }
      
      setTooltipCoords({ top, left });
    };

    calculatePosition();
    const timer = setTimeout(calculatePosition, 50);
    return () => clearTimeout(timer);
  }, [rect, currentStep, active, stepData]);

  if (!active || !activeTour || !stepData) return null;

  const totalSteps = activeTour.length;
  const isInteractive = stepData.mode === "interactive";

  return (
    <>
      {/* 1. Backdrop Spotlight / Cutout */}
      {rect ? (
        <div
          className="fixed z-[9990] border-2 border-primary/95 rounded-xl pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            boxShadow: "0 0 0 9999px var(--spotlight-dim), 0 0 20px rgba(255, 255, 255, 0.4)",
          }}
        />
      ) : (
        <div className="fixed inset-0 z-[9990] backdrop-blur-[1px] transition-opacity duration-300 pointer-events-none" style={{ backgroundColor: "var(--spotlight-dim)" }} />
      )}

      {/* 2. Full-screen interaction blocker */}
      <div className={`fixed inset-0 z-[9991] bg-transparent ${isInteractive ? 'pointer-events-none' : ''}`} />

      {/* 3. Floating Tooltip */}
      <div
        ref={tooltipRef}
        style={{ top: tooltipCoords.top, left: tooltipCoords.left }}
        className="fixed w-[360px] bg-popover rounded-2xl shadow-[0_10px_30px_-5px_rgba(15,23,42,0.15),0_0_0_1px_rgba(15,23,42,0.05)] border border-border z-[9992] overflow-hidden flex flex-col font-sans transition-all duration-200 ease-out animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="w-full flex gap-1 px-5 pt-4 bg-popover">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                idx <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="p-5 flex-1">
          <div className="flex items-start justify-between mb-2.5">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span>Paso {currentStep + 1} de {totalSteps}</span>
            </div>
            <button onClick={closeTour} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted" title="Omitir tutorial">
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-foreground font-bold text-base leading-snug mb-1.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {stepData.title}
          </h3>
          <p className="text-muted-foreground text-xs font-medium leading-relaxed">
            {stepData.content}
          </p>

          {isInteractive && (
            <div className="mt-3.5 px-3 py-2 bg-success/10 border border-success/20 rounded-xl text-[10px] text-success font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
              <span>Acción requerida: ¡haz clic o interactúa con el elemento!</span>
            </div>
          )}
        </div>

        <div className="px-5 py-4 bg-muted border-t border-border flex items-center justify-between">
          <button onClick={closeTour} className="text-muted-foreground hover:text-foreground text-xs font-semibold hover:underline">
            Omitir
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                currentStep === 0
                  ? "text-muted-foreground bg-transparent cursor-not-allowed"
                  : "text-foreground bg-card border border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              <ChevronLeft className="w-3 h-3" />
              Atrás
            </button>
            
            {/* Ocultar el botón Siguiente si es interactivo y no es el último paso */}
            {(!isInteractive || currentStep === totalSteps - 1) && (
              <button
                onClick={nextStep}
                disabled={stepData.selector ? !document.querySelector(stepData.selector) : false}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                  (stepData.selector ? !document.querySelector(stepData.selector) : false)
                    ? "bg-primary/40 text-primary-foreground/60 cursor-not-allowed shadow-none"
                    : "bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/25"
                }`}
              >
                {currentStep === totalSteps - 1 ? "Entendido" : "Siguiente"}
                {currentStep < totalSteps - 1 && <ChevronRight className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
