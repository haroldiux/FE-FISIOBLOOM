import { useOnboarding } from './OnboardingContext';
import { useAuth } from '../../context/AuthContext';
import { X, CheckCircle, Circle, PlayCircle } from 'lucide-react';

export function OnboardingChecklist() {
  const {
    isChecklistOpen,
    closeChecklist,
    flow,
    currentPhaseIndex,
    currentStepIndex,
    isActive,
    resume,
    complete,
  } = useOnboarding();
  const { user } = useAuth();

  if (!isChecklistOpen) return null;

  const isPhaseCompleted = (i: number) => isActive && i < currentPhaseIndex;
  const isPhaseActive    = (i: number) => i === currentPhaseIndex && isActive;

  return (
    <div
      className="fixed inset-0 z-[8000] flex items-stretch justify-end pointer-events-auto bg-black/10 backdrop-blur-[1px]"
      onClick={closeChecklist}
    >
      <div
        className="relative h-full w-80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl border-l border-white/20 dark:border-zinc-700/50 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-700 px-4 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Onboarding</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Rol: {user?.role}</p>
          </div>
          <button
            onClick={closeChecklist}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Phases */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {flow.map((phase, phaseIdx) => {
            const completed = isPhaseCompleted(phaseIdx);
            const active    = isPhaseActive(phaseIdx);

            return (
              <div
                key={phase.id}
                className={[
                  'rounded-xl border p-3 transition-all',
                  active    ? 'border-violet-400 bg-violet-50 dark:bg-violet-950/20' :
                  completed ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20' :
                  'border-zinc-200 dark:border-zinc-700',
                ].join(' ')}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">
                    {completed ? <CheckCircle size={16} className="text-emerald-500" /> :
                     active    ? <PlayCircle  size={16} className="text-violet-500" />  :
                                 <Circle      size={16} className="text-zinc-300 dark:text-zinc-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {phase.icon} {phase.title}
                      </span>
                      {!completed && !active && (
                        <button
                          onClick={() => resume(phaseIdx)}
                          className="text-xs text-violet-500 hover:text-violet-700 transition-colors shrink-0"
                        >
                          Ir
                        </button>
                      )}
                      {active && <span className="text-xs text-violet-500 font-medium shrink-0">En curso</span>}
                    </div>
                    <div className="mt-1.5 space-y-1">
                      {phase.steps.map((step, stepIdx) => {
                        const stepDone   = phaseIdx < currentPhaseIndex || (phaseIdx === currentPhaseIndex && stepIdx < currentStepIndex);
                        const stepActive = phaseIdx === currentPhaseIndex && stepIdx === currentStepIndex && isActive;
                        return (
                          <div key={step.id} className="flex items-center gap-1.5">
                            <div className={[
                              'w-1.5 h-1.5 rounded-full shrink-0',
                              stepDone   ? 'bg-emerald-400' :
                              stepActive ? 'bg-violet-400'  :
                              'bg-zinc-300 dark:bg-zinc-600',
                            ].join(' ')} />
                            <span className={[
                              'text-xs',
                              stepDone   ? 'text-zinc-400 line-through' :
                              stepActive ? 'text-violet-600 dark:text-violet-400 font-medium' :
                              'text-zinc-500',
                            ].join(' ')}>
                              {step.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 dark:border-zinc-700 px-4 py-3 shrink-0">
          <button
            onClick={complete}
            className="w-full text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors py-1"
          >
            Marcar todo como completado
          </button>
        </div>
      </div>
    </div>
  );
}
