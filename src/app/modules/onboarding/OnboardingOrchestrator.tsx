import { useEffect, useRef, useState, useCallback } from 'react';
import { animate } from 'animejs';
import { useOnboarding } from './OnboardingContext';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function OnboardingOrchestrator() {
  const {
    isVisible,
    currentStep,
    currentPhase,
    currentPhaseIndex,
    currentStepIndex,
    flow,
    next,
    previous,
    dismiss,
  } = useOnboarding();

  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePositions = useCallback(() => {
    if (!currentStep) { setSpotlightRect(null); return; }
    const el = document.querySelector(`[data-onboarding="${currentStep.targetId}"], #${currentStep.targetId}`);
    if (!el) { setSpotlightRect(null); return; }

    const rect = el.getBoundingClientRect();
    const pad = 8;
    setSpotlightRect({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    });

    const tw = 320;
    const th = tooltipRef.current?.offsetHeight ?? 160;
    const margin = 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top = 0;
    let left = 0;

    switch (currentStep.placement) {
      case 'bottom': top = rect.bottom + margin; left = rect.left + rect.width / 2 - tw / 2; break;
      case 'top':    top = rect.top - th - margin; left = rect.left + rect.width / 2 - tw / 2; break;
      case 'right':  top = rect.top + rect.height / 2 - th / 2; left = rect.right + margin; break;
      case 'left':   top = rect.top + rect.height / 2 - th / 2; left = rect.left - tw - margin; break;
    }

    left = Math.max(margin, Math.min(left, vw - tw - margin));
    top  = Math.max(margin, Math.min(top,  vh - th - margin));
    setTooltipPos({ top, left, width: tw });
  }, [currentStep]);

  // Scroll to element when step changes and dispatch action if any
  useEffect(() => {
    if (!isVisible || !currentStep) return;

    if (currentStep.action) {
      window.dispatchEvent(new CustomEvent('onboarding-action', { detail: currentStep.action }));
      
      // Add a slight delay after switching tabs before scrolling
      setTimeout(() => {
        const el = document.querySelector(`[data-onboarding="${currentStep.targetId}"], #${currentStep.targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return;
    }

    const el = document.querySelector(`[data-onboarding="${currentStep.targetId}"], #${currentStep.targetId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep, isVisible]);

  // Re-calculate after screen navigation has rendered
  useEffect(() => {
    if (!isVisible || !currentStep) return;
    const t = setTimeout(updatePositions, 380);
    return () => clearTimeout(t);
  }, [isVisible, currentStep, updatePositions]);

  useEffect(() => {
    window.addEventListener('resize', updatePositions);
    // Use capture: true to catch scroll events from any nested scrollable container
    window.addEventListener('scroll', updatePositions, { capture: true, passive: true });
    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions, { capture: true } as EventListenerOptions);
    };
  }, [updatePositions]);

  // Animate tooltip in on each step change
  useEffect(() => {
    if (!isVisible || !tooltipRef.current) return;
    animate(tooltipRef.current, {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 250,
      easing: 'spring(1, 80, 10, 0)',
    });
  }, [isVisible, currentStep]);

  if (!isVisible || !currentStep || !currentPhase) return null;

  const totalSteps  = flow.reduce((acc, p) => acc + p.steps.length, 0);
  const overallStep = flow.slice(0, currentPhaseIndex).reduce((acc, p) => acc + p.steps.length, 0) + currentStepIndex + 1;
  const stepsInPhase = currentPhase.steps.length;
  const isFirst = currentPhaseIndex === 0 && currentStepIndex === 0;
  const isLast  = currentPhaseIndex === flow.length - 1 && currentStepIndex === stepsInPhase - 1;

  return (
    <>
      {/* Dark overlay with stronger glassmorphism */}
      <div
        className="fixed inset-0 z-[9000] pointer-events-none transition-all duration-300"
        style={{
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          clipPath: spotlightRect
            ? `polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, ${spotlightRect.left}px ${spotlightRect.top}px, ${spotlightRect.left + spotlightRect.width}px ${spotlightRect.top}px, ${spotlightRect.left + spotlightRect.width}px ${spotlightRect.top + spotlightRect.height}px, ${spotlightRect.left}px ${spotlightRect.top + spotlightRect.height}px, ${spotlightRect.left}px ${spotlightRect.top}px)`
            : 'none'
        }}
      />

      {/* Spotlight border */}
      {spotlightRect && (
        <div
          className="fixed z-[9001] pointer-events-none transition-all duration-300"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
            border: '2px solid rgba(167,139,250,0.9)',
            borderRadius: '8px',
            boxShadow: '0 0 15px rgba(167,139,250,0.4)',
          }}
        />
      )}

      {/* Dismiss (×) */}
      <button
        onClick={dismiss}
        className="fixed top-4 right-4 z-[9100] p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
        aria-label="Cerrar tutorial"
      >
        <X size={18} />
      </button>

      {/* Tooltip card with glassmorphism */}
      <div
        ref={tooltipRef}
        className="fixed z-[9100] pointer-events-auto"
        style={{ ...tooltipPos, opacity: 0 }}
      >
        <div className="bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 dark:border-zinc-700/50 overflow-hidden w-80">
          {/* Header */}
          <div className="bg-violet-500 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">
                {currentPhase.icon} {currentPhase.title}
              </span>
              <span className="text-xs text-violet-200">{overallStep} / {totalSteps}</span>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1 bg-violet-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${(overallStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Body */}
          <div className="px-4 py-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              {currentStep.title}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 flex items-center justify-between gap-2">
            <button
              onClick={dismiss}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              Omitir tour
            </button>
            <div className="flex gap-2">
              {!isFirst && (
                <button
                  onClick={previous}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <ChevronLeft size={14} />
                  Atrás
                </button>
              )}
              <button
                onClick={next}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500 text-white hover:bg-violet-600 transition-colors"
              >
                {isLast ? '¡Listo!' : 'Siguiente'}
                {!isLast && <ChevronRight size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
