import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { TourStep } from "../../data/tutorials";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface TourOrchestratorProps {
  /**
   * The active tour. When `null`, the orchestrator renders nothing.
   * Setting a non-null value mounts the orchestrator; setting it back to
   * `null` (e.g. via `onClose`) unmounts it.
   */
  tour: TourStep[] | null;
  /**
   * The currently active screen. Used to decide whether a step's
   * `targetScreen` requires a cross-screen navigation before resolving
   * the selector.
   */
  activeScreen: string;
  /**
   * Invoked when a step's `targetScreen` differs from `activeScreen`.
   * The orchestrator will await the selector via `MutationObserver`
   * (3000ms hard timeout) before positioning the spotlight.
   */
  onNavigate: (screen: string) => void;
  /**
   * Invoked when the user presses Escape, clicks the dismiss (×) button,
   * or reaches the last step and presses "Listo".
   */
  onClose: () => void;
}

/**
 * Cross-screen tour runner that consumes `TourStep[]` from the help
 * center. This is intentionally a SIBLING of `OnboardingOrchestrator` —
 * the two never nest. `OnboardingOrchestrator` owns the auto-onboarding
 * flow with `OnboardingPhase` semantics; `TourOrchestrator` owns the
 * one-shot help-center tours with `targetScreen` / `targetTab` /
 * `advanceOn` semantics.
 *
 * Visual technique (clip-path spotlight + animejs tooltip fade-in) is
 * intentionally cloned from `OnboardingOrchestrator` rather than
 * abstracted, because the two have different lifecycles and
 * `OnboardingOrchestrator` is bound to `OnboardingContext`. Two small
 * components beat one complex one.
 */
export function TourOrchestrator({
  tour,
  activeScreen,
  onNavigate,
  onClose,
}: TourOrchestratorProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);
  const prevTourRef = useRef<TourStep[] | null>(null);

  // Reset step index when the tour changes (new tour starts or tour is
  // replaced). Without this, a previous tour ending at step N leaves
  // stepIndex at N; when a shorter tour starts, tour[N] is undefined
  // and the component silently renders nothing.
  useEffect(() => {
    if (tour !== prevTourRef.current) {
      prevTourRef.current = tour;
      setStepIndex(0);
    }
  }, [tour]);

  // The current step. Guarded everywhere; when `tour` is null we render
  // nothing and short-circuit the rest of the lifecycle.
  const currentStep: TourStep | undefined = tour?.[stepIndex];

  /**
   * Recompute the spotlight rect and tooltip position for the current
   * step. Mirrors `OnboardingOrchestrator.updatePositions` but reads from
   * `TourStep.selector` (a CSS selector) rather than
   * `OnboardingStep.targetId` (a key with `[data-onboarding]` fallback).
   */
  const updatePositions = useCallback(() => {
    if (!currentStep) {
      setSpotlightRect(null);
      return;
    }
    const el = document.querySelector(currentStep.selector);
    if (!el) {
      setSpotlightRect(null);
      return;
    }

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

    switch (currentStep.position) {
      case "bottom":
        top = rect.bottom + margin;
        left = rect.left + rect.width / 2 - tw / 2;
        break;
      case "top":
        top = rect.top - th - margin;
        left = rect.left + rect.width / 2 - tw / 2;
        break;
      case "right":
        top = rect.top + rect.height / 2 - th / 2;
        left = rect.right + margin;
        break;
      case "left":
        top = rect.top + rect.height / 2 - th / 2;
        left = rect.left - tw - margin;
        break;
      case "center":
      default:
        // Center on the viewport; orchestrator spotlight points to the element
        // but the tooltip is uncluttered.
        top = vh / 2 - th / 2;
        left = vw / 2 - tw / 2;
        break;
    }

    left = Math.max(margin, Math.min(left, vw - tw - margin));
    top = Math.max(margin, Math.min(top, vh - th - margin));
    setTooltipPos({ top, left, width: tw });
  }, [currentStep]);

  /**
   * Cross-screen navigation + selector wait. If the current step's
   * `targetScreen` differs from `activeScreen`, navigate first and wait
   * for the selector to appear via `MutationObserver` (3s hard timeout).
   * Otherwise, resolve immediately.
   */
  useEffect(() => {
    if (!tour || !currentStep) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let observer: MutationObserver | null = null;

    const resolveAndPosition = () => {
      if (cancelled) return;
      const el = document.querySelector(currentStep.selector);
      if (!el) {
        // El elemento de este paso no existe para este usuario/pantalla (ej.
        // un control que solo ve un rol distinto, como el selector de
        // sucursal que solo renderiza para SUPER_ADMIN). Antes esto dejaba
        // el tooltip "flotando" sin ancla — a veces caía dentro de la
        // pantalla por casualidad, a veces completamente afuera, según el
        // layout — en vez de eso, se salta directo al siguiente paso.
        if (tour && stepIndex < tour.length - 1) {
          setStepIndex((prev) => Math.min(prev + 1, tour.length - 1));
        } else {
          onClose();
        }
        return;
      }
      // Scroll the target element into view so the spotlight is visible
      // even when the element is below the fold. Matches the pattern used
      // in OnboardingOrchestrator lines 75/83.
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Slight delay so the freshly-rendered target lays out before we read
      // its bounding box. Mirrors the OnboardingOrchestrator 380ms
      // post-navigation settle, but driven by a deterministic observer
      // instead of a fixed setTimeout.
      setTimeout(() => {
        if (!cancelled) updatePositions();
      }, 380);
    };

    const onSelectorAppeared = () => {
      observer?.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
      resolveAndPosition();
    };

    // Waits for the selector to show up via MutationObserver instead of
    // checking it synchronously right after a tab click. A plain
    // `tabEl.click()` schedules a state update in the OTHER component
    // (e.g. ConfigScreen's `setActiveTab`) that only commits to the DOM on
    // a later render — checking `document.querySelector` in the same tick
    // as the click reliably saw the pre-click DOM and false-skipped the
    // step. This mirrors the targetScreen cross-navigation wait below.
    const waitForSelector = (hardTimeoutMs: number) => {
      if (document.querySelector(currentStep.selector)) {
        resolveAndPosition();
        return;
      }
      observer = new MutationObserver(() => {
        if (cancelled) return;
        if (document.querySelector(currentStep.selector)) {
          onSelectorAppeared();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });
      timeoutId = setTimeout(() => {
        observer?.disconnect();
        resolveAndPosition();
      }, hardTimeoutMs);
    };

    if (
      currentStep.targetScreen &&
      currentStep.targetScreen !== activeScreen
    ) {
      onNavigate(currentStep.targetScreen);
      // 3s hard timeout — if the selector never appears, give up and
      // render whatever we have (the spotlight rect stays `null` and
      // the tooltip floats over the dim overlay, which is recoverable).
      waitForSelector(3000);
    } else if (currentStep.targetTab) {
      const tabEl = document.querySelector(
        `[data-tab="${currentStep.targetTab}"]`,
      ) as HTMLElement | null;
      tabEl?.click();
      // A tab click can uncover content that itself needs a network
      // round-trip before it mounts (e.g. switching to a patient's tab
      // right after that patient was just created — the tab bar is gone
      // behind a "Cargando expediente..." spinner until the detail fetch
      // resolves). 1500ms was tuned for a pure UI tab-swap and was too
      // short for that case, silently skipping the step. waitForSelector()
      // resolves immediately once the element is already there, so a
      // longer ceiling costs nothing in the fast/common path.
      waitForSelector(4000);
    } else {
      // Even with no explicit targetScreen/targetTab, this effect can run
      // on the SAME tick `activeScreen` just caught up to a step's
      // targetScreen (its own previous run started the navigation, then
      // re-ran once the prop updated) — before the destination screen's
      // OWN async data-load effects have painted the target element. A
      // synchronous resolveAndPosition() here saw an empty DOM and
      // auto-skipped every remaining step in one tick, closing the tour
      // instantly. waitForSelector() short-circuits to the same immediate
      // resolution when the element is already there (the common case),
      // so this costs nothing in the steady state.
      waitForSelector(2000);
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [tour, stepIndex, currentStep, activeScreen, onNavigate, updatePositions]);

  /**
   * `advanceOn` event binding. When a step declares `advanceOn`, attach
   * a listener to the bound selector. When the event fires on that
   * element, advance the step WITHOUT requiring a tooltip click.
   *
   * A step with `advanceOn` commonly ALSO carries `targetScreen` (its
   * button lives on a screen the tour just navigated to). This effect's
   * dependencies don't include `activeScreen`, so on the very first run —
   * while still on the OLD screen, before navigation lands — the target
   * doesn't exist yet and the effect gave up permanently (`if (!target)
   * return`), never re-attempting once the destination screen mounted.
   * A MutationObserver here waits for the target the same way
   * `waitForSelector` does in the effect above.
   */
  useEffect(() => {
    if (!tour || !currentStep?.advanceOn) return;

    let target: HTMLElement | null = null;
    let observer: MutationObserver | null = null;

    const handler = () => {
      setStepIndex((prev) => {
        if (!tour) return prev;
        return Math.min(prev + 1, tour.length);
      });
    };

    const attach = () => {
      target = document.querySelector(
        currentStep.advanceOn!.selector,
      ) as HTMLElement | null;
      if (!target) return false;
      target.addEventListener(currentStep.advanceOn!.event, handler);
      return true;
    };

    if (!attach()) {
      observer = new MutationObserver(() => {
        if (attach()) observer?.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
      target?.removeEventListener(currentStep.advanceOn!.event, handler);
    };
  }, [tour, currentStep, stepIndex]);

  // Re-position on viewport resize / scroll.
  useEffect(() => {
    if (!tour) return;
    window.addEventListener("resize", updatePositions);
    window.addEventListener("scroll", updatePositions, {
      capture: true,
      passive: true,
    } as EventListenerOptions);
    return () => {
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions, {
        capture: true,
      } as EventListenerOptions);
    };
  }, [tour, updatePositions]);

  // Escape key dismisses the tour.
  useEffect(() => {
    if (!tour) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tour, onClose]);

  const goNext = useCallback(() => {
    if (!tour) return;
    setStepIndex((prev) => {
      if (prev >= tour.length - 1) {
        // Last step: close the orchestrator.
        onClose();
        return prev;
      }
      return prev + 1;
    });
  }, [tour, onClose]);

  const goPrevious = useCallback(() => {
    setStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  if (!tour || !currentStep) return null;

  const totalSteps = tour.length;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === tour.length - 1;

  return (
    <>
      {/* Dark overlay with spotlight cutout — same technique as
          OnboardingOrchestrator. clipPath is preferred over a separate
          border div so the cutout respects the element's actual bounds
          including page scroll. */}
      <div
        className="fixed inset-0 z-[9000] pointer-events-none transition-all duration-300"
        style={{
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
          clipPath: spotlightRect
            ? `polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, ${spotlightRect.left}px ${spotlightRect.top}px, ${spotlightRect.left + spotlightRect.width}px ${spotlightRect.top}px, ${spotlightRect.left + spotlightRect.width}px ${spotlightRect.top + spotlightRect.height}px, ${spotlightRect.left}px ${spotlightRect.top + spotlightRect.height}px, ${spotlightRect.left}px ${spotlightRect.top}px)`
            : "none",
        }}
      />

      {/* Spotlight border on top of the cutout for visual emphasis. */}
      {spotlightRect && (
        <div
          className="fixed z-[9001] pointer-events-none transition-all duration-300"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
            border: "2px solid rgba(167,139,250,0.9)",
            borderRadius: "8px",
            boxShadow: "0 0 15px rgba(167,139,250,0.4)",
          }}
        />
      )}

      {/* Dismiss (×) — same affordance as OnboardingOrchestrator. */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[9100] p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
        aria-label="Cerrar tour"
      >
        <X size={18} />
      </button>

      {/* Tooltip card — same glassmorphic look as OnboardingOrchestrator.
          `key={stepIndex}` forces a remount on every step so the CSS
          entrance animation replays. This intentionally does NOT depend on
          an imperative animejs call: that approach left the card stuck at
          `opacity: 0` (invisible, but still in the DOM) whenever the
          animation effect fired before the ref was attached — a real
          race that made the whole tour look like "does nothing" even
          though the content was there the whole time. */}
      <div
        key={stepIndex}
        ref={tooltipRef}
        className="fixed z-[9100] pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-250"
        style={tooltipPos}
      >
        <div className="bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 dark:border-zinc-700/50 overflow-hidden w-80">
          {/* Header */}
          <div className="bg-violet-500 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">
                {currentStep.title}
              </span>
              <span className="text-xs text-violet-200">
                {stepIndex + 1} / {totalSteps}
              </span>
            </div>
            <div className="mt-3 h-1 bg-violet-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Body */}
          <div className="px-4 py-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {currentStep.content}
            </p>
          </div>

          {/* Footer — `advanceOn` steps hide the "Siguiente" button to
              force the user through the bound event; otherwise the
              next button advances manually. The last step says
              "Listo" and triggers onClose. */}
          <div className="px-4 pb-4 flex items-center justify-between gap-2">
            <button
              onClick={onClose}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              Omitir tour
            </button>
            <div className="flex gap-2">
              {!isFirst && (
                <button
                  onClick={goPrevious}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <ChevronLeft size={14} />
                  Atrás
                </button>
              )}
              {!currentStep.advanceOn && (
                <button
                  onClick={goNext}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500 text-white hover:bg-violet-600 transition-colors"
                >
                  {isLast ? "Listo" : "Siguiente"}
                  {!isLast && <ChevronRight size={14} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
