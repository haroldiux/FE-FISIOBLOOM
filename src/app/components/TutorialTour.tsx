import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";
import { useTutorial } from "../context/TutorialContext";

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function TutorialTour() {
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
  const stepData = activeTour && activeTour[currentStep];

  // Scroll target element into view safely
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

  // Track position of active element rect
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
    const timer = setTimeout(updateRect, 350); // wait for scroll animation
    
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [currentStep, active, stepData]);

  // Keyboard navigation
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeTour();
      } else if (e.key === "ArrowRight") {
        nextStep();
      } else if (e.key === "ArrowLeft") {
        prevStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, nextStep, prevStep, closeTour]);

  // Auto-advance by click/event on target element (for interactive mode)
  useEffect(() => {
    if (!active || !stepData || stepData.mode !== "interactive" || !stepData.advanceOn) return;

    const { event, selector } = stepData.advanceOn;
    const targetEl = document.querySelector(stepData.selector);

    if (!targetEl) return;

    const handleAdvance = () => {
      // Small delay to let the DOM update (e.g. drawer opens) before moving to next step
      setTimeout(nextStep, 100);
    };

    targetEl.addEventListener(event, handleAdvance);
    return () => targetEl.removeEventListener(event, handleAdvance);
  }, [active, stepData, nextStep]);

  // Calculate dynamic coordinates for tooltip positioning near the spotlight
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
        
        // Horizontal bounds checks
        if (left < 16) left = 16;
        if (left + tooltipWidth > window.innerWidth - 16) {
          left = window.innerWidth - tooltipWidth - 16;
        }
        
        // Vertical bounds checks and auto fallback
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
          className={`fixed z-[9990] border-2 border-primary/95 shadow-[0_0_0_9999px_rgba(15,23,42,0.7),0_0_20px_rgba(255,255,255,0.4)] rounded-xl pointer-events-none transition-all duration-300 ease-out`}
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-slate-900/70 z-[9990] backdrop-blur-[1px] transition-opacity duration-300 pointer-events-none" />
      )}

      {/* 2. Full-screen interaction blocker (disabled or pointer-events-none in interactive mode) */}
      <div className={`fixed inset-0 z-[9991] bg-transparent ${isInteractive ? 'pointer-events-none' : ''}`} />

      {/* 3. Floating Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          top: tooltipCoords.top,
          left: tooltipCoords.left,
        }}
        className="fixed w-[360px] bg-white dark:bg-slate-900 rounded-2xl shadow-[0_10px_30px_-5px_rgba(15,23,42,0.15),0_0_0_1px_rgba(15,23,42,0.05)] border border-slate-100 dark:border-slate-800 z-[9992] overflow-hidden flex flex-col font-sans transition-all duration-200 ease-out animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Segmented Progress Bar */}
        <div className="w-full flex gap-1 px-5 pt-4 bg-white dark:bg-slate-900">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                idx <= currentStep ? "bg-primary" : "bg-slate-100 dark:bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-5 flex-1">
          <div className="flex items-start justify-between mb-2.5">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
              <span>Paso {currentStep + 1} de {totalSteps}</span>
            </div>
            <button
              onClick={closeTour}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Omitir tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-slate-800 dark:text-white font-bold text-base leading-snug mb-1.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {stepData.title}
          </h3>
          <p className="text-slate-500 dark:text-slate-450 text-xs font-medium leading-relaxed">
            {stepData.content}
          </p>

          {isInteractive && (
            <div className="mt-3.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Acción requerida: ¡haz clic o interactúa con el elemento!</span>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <button
            onClick={closeTour}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 text-xs font-semibold hover:underline"
          >
            Omitir
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                currentStep === 0
                  ? "text-slate-300 dark:text-slate-700 bg-transparent cursor-not-allowed"
                  : "text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <ChevronLeft className="w-3 h-3" />
              Atrás
            </button>
            <button
              onClick={nextStep}
              className="px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-primary/95 shadow-md shadow-primary/25 transition-all"
            >
              {currentStep === totalSteps - 1 ? "Entendido" : "Siguiente"}
              {currentStep < totalSteps - 1 && <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
