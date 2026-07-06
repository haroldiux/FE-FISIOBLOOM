import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";

export interface TourStep {
  selector: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
}

interface TutorialTourProps {
  steps: TourStep[];
  active: boolean;
  onClose: () => void;
  screenName: string;
}

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function TutorialTour({ steps, active, onClose, screenName }: TutorialTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<ElementRect | null>(null);
  const [tooltipCoords, setTooltipCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Reset step when active state changes
  useEffect(() => {
    if (active) {
      setCurrentStep(0);
    }
  }, [active]);

  // Scroll target element into view safely
  useEffect(() => {
    if (!active || steps.length === 0 || currentStep >= steps.length) return;
    const step = steps[currentStep];
    try {
      const el = document.querySelector(step.selector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    } catch (e) {
      console.warn(`Invalid selector or error locating element: ${step.selector}`, e);
    }
  }, [currentStep, active, steps]);

  // Track position of active element rect
  useEffect(() => {
    if (!active || steps.length === 0 || currentStep >= steps.length) {
      setRect(null);
      return;
    }

    const step = steps[currentStep];
    
    const updateRect = () => {
      try {
        const el = document.querySelector(step.selector);
        if (el) {
          const r = el.getBoundingClientRect();
          // Check if rect has dimensions
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
        console.warn(`Error selecting or reading bounds for: ${step.selector}`, e);
      }
      setRect(null);
    };

    // Initial check, followed by delay for scroll completion, and event listeners
    updateRect();
    const timer = setTimeout(updateRect, 350);
    
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [currentStep, active, steps]);

  // Calculate dynamic coordinates for tooltip positioning near the spotlight
  useEffect(() => {
    if (!active || steps.length === 0) return;
    
    const calculatePosition = () => {
      const step = steps[currentStep];
      if (!step) return;
      const position = step.position || "bottom";
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
          // If top position overflows, put at the bottom
          top = rect.top + rect.height + margin;
        }
        if (top + tooltipHeight > window.innerHeight - 16) {
          // If bottom position overflows, put at the top
          top = rect.top - tooltipHeight - margin;
          if (top < 16) {
            // Center if neither fits
            top = window.innerHeight / 2 - tooltipHeight / 2;
          }
        }
      }
      
      setTooltipCoords({ top, left });
    };

    calculatePosition();
    const timer = setTimeout(calculatePosition, 50);
    return () => clearTimeout(timer);
  }, [rect, currentStep, active, steps]);

  if (!active || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`bloom_tour_seen_${screenName}`, "true");
    onClose();
  };

  return (
    <>
      {/* 1. Backdrop Spotlight / Cutout */}
      {rect ? (
        <div
          className="fixed z-[9990] border-2 border-primary/95 shadow-[0_0_0_9999px_rgba(15,23,42,0.7),0_0_20px_rgba(255,255,255,0.4)] rounded-xl pointer-events-none transition-all duration-300 ease-out"
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

      {/* 2. Full-screen interaction blocker */}
      <div className="fixed inset-0 z-[9991] bg-transparent" />

      {/* 3. Floating Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          top: tooltipCoords.top,
          left: tooltipCoords.left,
        }}
        className="fixed w-[360px] bg-white rounded-2xl shadow-[0_10px_30px_-5px_rgba(15,23,42,0.15),0_0_0_1px_rgba(15,23,42,0.05)] border border-slate-100 z-[9992] overflow-hidden flex flex-col font-sans transition-all duration-200 ease-out"
      >
        {/* Progress Line */}
        <div className="w-full h-1 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-5 flex-1">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
              <span>Paso {currentStep + 1} de {steps.length}</span>
            </div>
            <button
              onClick={handleComplete}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
              title="Omitir tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-slate-800 font-bold text-base leading-snug mb-1.5 animate-fade-in" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {currentStepData.title}
          </h3>
          <p className="text-slate-500 text-xs font-medium leading-relaxed">
            {currentStepData.content}
          </p>
        </div>

        {/* Action Footer */}
        <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleComplete}
            className="text-slate-400 hover:text-slate-600 text-xs font-semibold hover:underline"
          >
            Omitir
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                currentStep === 0
                  ? "text-slate-300 bg-transparent cursor-not-allowed"
                  : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <ChevronLeft className="w-3 h-3" />
              Atrás
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-primary/95 shadow-md shadow-primary/25 transition-all"
            >
              {currentStep === steps.length - 1 ? "Entendido" : "Siguiente"}
              {currentStep < steps.length - 1 && <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
