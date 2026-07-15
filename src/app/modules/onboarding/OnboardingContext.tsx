import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { adminFlow } from './flows/adminFlow';
import { receptionistFlow } from './flows/receptionistFlow';
import { therapistFlow } from './flows/therapistFlow';
import { superAdminFlow } from './flows/superAdminFlow';
import type { OnboardingPhase, OnboardingStep } from './flows/adminFlow';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

interface OnboardingProgress {
  id: string;
  userId: string;
  role: string;
  currentPhase: number;
  currentStep: number;
  completed: boolean;
  dismissed: boolean;
}

interface OnboardingContextType {
  isActive: boolean;
  isVisible: boolean;
  currentPhase: OnboardingPhase | null;
  currentStep: OnboardingStep | null;
  currentPhaseIndex: number;
  currentStepIndex: number;
  totalPhases: number;
  flow: OnboardingPhase[];
  requiredScreen: string | null;
  next: () => void;
  previous: () => void;
  dismiss: () => void;
  complete: () => void;
  resume: (phaseIndex: number, stepIndex?: number) => void;
  openChecklist: () => void;
  closeChecklist: () => void;
  isChecklistOpen: boolean;
  promptTutorialForCurrentScreen: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

function getFlowForRole(role: string): OnboardingPhase[] {
  switch (role) {
    case 'ADMIN': return adminFlow;
    case 'RECEPTIONIST': return receptionistFlow;
    case 'PHYSIO':
    case 'AESTHETICIAN': return therapistFlow;
    case 'SUPER_ADMIN': return superAdminFlow;
    default: return [];
  }
}

export function OnboardingProvider({
  children,
  onNavigate,
  activeScreen,
}: {
  children: ReactNode;
  onNavigate: (screen: string) => void;
  activeScreen?: string;
}) {
  const { user, isAuthenticated } = useAuth();
  const [flow, setFlow] = useState<OnboardingPhase[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [promptPhaseIndex, setPromptPhaseIndex] = useState<number | null>(null);

  // Load flow + check progress on auth
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const roleFlow = getFlowForRole(user.role);
    setFlow(roleFlow);
    if (roleFlow.length === 0) { return; }

    api.get<OnboardingProgress | null>('/onboarding')
      .then((data) => {
        if (!data || (!data.completed && !data.dismissed)) {
          const cp = data?.currentPhase ?? 0;
          const cs = data?.currentStep ?? 0;
          setCurrentPhaseIndex(cp);
          setCurrentStepIndex(cs);
          if (cs > 0) {
            setIsActive(true);
            setIsVisible(true);
          }
        }
      })
      .catch((e) => {
        console.error('Failed to load onboarding progress, falling back to local storage:', e);
        const localDataRaw = localStorage.getItem(`onboarding_${user.id}`);
        if (localDataRaw) {
          try {
            const localData = JSON.parse(localDataRaw) as OnboardingProgress;
            if (!localData.completed && !localData.dismissed) {
              const cp = localData.currentPhase ?? 0;
              const cs = localData.currentStep ?? 0;
              setCurrentPhaseIndex(cp);
              setCurrentStepIndex(cs);
              if (cs > 0) {
                setIsActive(true);
                setIsVisible(true);
              }
            }
          } catch(err) {}
        } else {
          // default start if no local data
          setCurrentPhaseIndex(0);
          setCurrentStepIndex(0);
        }
      });
  }, [isAuthenticated, user]);

  const saveProgress = useCallback(
    async (phaseIdx: number, stepIdx: number, completed = false, dismissed = false) => {
      if (!user) return;
      const progressData = {
        role: user.role,
        currentPhase: phaseIdx,
        currentStep: stepIdx,
        completed,
        dismissed,
      };
      
      try {
        localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(progressData));
        await api.put('/onboarding', progressData);
      } catch (e) {
        console.error('Failed to save onboarding progress to API, saved locally:', e);
      }
    },
    [user]
  );

  const currentPhase = flow[currentPhaseIndex] ?? null;
  const currentStep = currentPhase?.steps[currentStepIndex] ?? null;

  // Navigate to the required screen whenever the active phase changes
  useEffect(() => {
    if (isActive && currentPhase && currentPhase.screen !== activeScreen) {
      onNavigate(currentPhase.screen);
    }
  }, [isActive, currentPhaseIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = useCallback(() => {
    if (!currentPhase) return;
    const stepsInPhase = currentPhase.steps.length;

    if (currentStepIndex < stepsInPhase - 1) {
      const ns = currentStepIndex + 1;
      setCurrentStepIndex(ns);
      saveProgress(currentPhaseIndex, ns);
    } else {
      // End of module/phase
      setIsActive(false);
      setIsVisible(false);
      
      if (currentPhaseIndex < flow.length - 1) {
        // Mark current phase as completed by advancing index, but keep tour inactive
        const np = currentPhaseIndex + 1;
        setCurrentPhaseIndex(np);
        setCurrentStepIndex(0);
        saveProgress(np, 0);
      } else {
        // End of all modules
        complete();
      }
    }
  }, [currentPhase, currentStepIndex, currentPhaseIndex, flow.length]); // eslint-disable-line

  const previous = useCallback(() => {
    if (currentStepIndex > 0) {
      const ps = currentStepIndex - 1;
      setCurrentStepIndex(ps);
      saveProgress(currentPhaseIndex, ps);
    } else if (currentPhaseIndex > 0) {
      const pp = currentPhaseIndex - 1;
      const lastStep = flow[pp].steps.length - 1;
      setCurrentPhaseIndex(pp);
      setCurrentStepIndex(lastStep);
      saveProgress(pp, lastStep);
    }
  }, [currentStepIndex, currentPhaseIndex, flow]); // eslint-disable-line

  const dismiss = useCallback(() => {
    setIsActive(false);
    setIsVisible(false);
    saveProgress(currentPhaseIndex, currentStepIndex, false, true);
  }, [currentPhaseIndex, currentStepIndex]); // eslint-disable-line

  const complete = useCallback(() => {
    setIsActive(false);
    setIsVisible(false);
    saveProgress(flow.length > 0 ? flow.length - 1 : 0, 0, true, false);
  }, [flow.length]); // eslint-disable-line

  const resume = useCallback(
    (phaseIndex: number, stepIndex = 0) => {
      setCurrentPhaseIndex(phaseIndex);
      setCurrentStepIndex(stepIndex);
      setIsActive(true);
      setIsVisible(true);
      setIsChecklistOpen(false);
      saveProgress(phaseIndex, stepIndex);
    },
    [] // eslint-disable-line
  );

  const openChecklist = useCallback(() => setIsChecklistOpen(true), []);
  const closeChecklist = useCallback(() => setIsChecklistOpen(false), []);

  const promptTutorialForCurrentScreen = useCallback(() => {
    if (!activeScreen) return;
    const phaseIndex = flow.findIndex(p => p.screen === activeScreen);
    if (phaseIndex !== -1) {
      setPromptPhaseIndex(phaseIndex);
    } else {
      setIsChecklistOpen(true);
    }
  }, [activeScreen, flow]);

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        isVisible,
        currentPhase,
        currentStep,
        currentPhaseIndex,
        currentStepIndex,
        totalPhases: flow.length,
        flow,
        requiredScreen: currentPhase?.screen ?? null,
        next,
        previous,
        dismiss,
        complete,
        resume,
        openChecklist,
        closeChecklist,
        isChecklistOpen,
        promptTutorialForCurrentScreen,
      }}
    >
      {children}
      
      <AlertDialog open={promptPhaseIndex !== null} onOpenChange={(open) => !open && setPromptPhaseIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Iniciar tutorial?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Deseas iniciar el recorrido interactivo para este módulo ({promptPhaseIndex !== null ? flow[promptPhaseIndex]?.title : ''})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPromptPhaseIndex(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (promptPhaseIndex !== null) {
                resume(promptPhaseIndex, 0);
                setPromptPhaseIndex(null);
              }
            }}>
              Sí, iniciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
