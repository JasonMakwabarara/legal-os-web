import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Legal OS demo',
    description: 'You\'re signed in as Rivera & Hale LLP, a seeded demo firm. Everything you see lives in this browser — nothing is sent to a server.',
  },
  {
    id: 'cockpit',
    title: 'The contract cockpit',
    description: 'Active reviews, risk summary, and agent activity at a glance. Click the TechCorp Service Agreement to see the full review.',
    target: 'nav-cockpit',
  },
  {
    id: 'contract',
    title: 'Risks and redlines',
    description: 'Each contract shows a side-by-side original vs. redline with risk cards, estimated exposure, and an approval flow.',
    target: 'nav-documents',
  },
  {
    id: 'matters',
    title: 'Matters and clients built in',
    description: 'Attach every review to a client and matter — light practice management without a second subscription.',
    target: 'nav-matters',
  },
  {
    id: 'assistant',
    title: 'Grounded assistant',
    description: 'Ask about liability, indemnity, or termination. Answers are grounded in the contracts in this workspace.',
    target: 'nav-assistant',
  },
  {
    id: 'playbook',
    title: 'Your firm\'s playbook',
    description: 'Standard positions — liability caps, indemnity limits, termination mechanics — that every review redlines toward.',
    target: 'nav-playbook',
  },
  {
    id: 'complete',
    title: 'You\'re all set',
    description: 'Try uploading your own NDA from the cockpit, or reset the demo data any time from the banner above.',
  },
];

interface OnboardingTourProps {
  onComplete?: () => void;
  isOpen?: boolean;
}

export function OnboardingTour({ onComplete, isOpen = true }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(isOpen);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const step = TOUR_STEPS[currentStep];

  useEffect(() => {
    if (isVisible && step.target) {
      const element = document.getElementById(step.target);
      setHighlightRect(element ? element.getBoundingClientRect() : null);
    } else {
      setHighlightRect(null);
    }
  }, [currentStep, isVisible, step.target]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('legal-os-onboarding-completed', 'true');
    onComplete?.();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Highlight Box */}
      {highlightRect && (
        <div
          className="fixed border-2 border-accent rounded-lg z-40 pointer-events-none transition-all duration-300"
          style={{
            top: `${highlightRect.top - 6}px`,
            left: `${highlightRect.left - 6}px`,
            width: `${highlightRect.width + 12}px`,
            height: `${highlightRect.height + 12}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      {/* Tour Card */}
      <div
        className="fixed z-50 bg-card text-card-foreground border border-border rounded-lg shadow-2xl p-6 max-w-sm"
        style={{
          bottom: '40px',
          right: '40px',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        {/* Close Button */}
        <button
          onClick={handleSkip}
          aria-label="Close tour"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="pr-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {step.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {step.description}
          </p>

          {/* Progress Indicator */}
          <div className="flex gap-1 mb-4">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-accent'
                    : index < currentStep
                      ? 'bg-accent/50'
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-2 justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-1"
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkip}
              >
                Skip
              </Button>
            </div>
            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1"
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
              {currentStep < TOUR_STEPS.length - 1 && <ChevronRight size={16} />}
            </Button>
          </div>
        </div>

        {/* Step Counter */}
        <div className="absolute bottom-4 left-6 text-xs text-muted-foreground">
          {currentStep + 1} / {TOUR_STEPS.length}
        </div>
      </div>
    </>
  );
}

/** Fired by HelpMenu to relaunch the tour on demand. */
export const START_TOUR_EVENT = 'legal-os:start-tour';

/**
 * Hook to check if onboarding should be shown
 */
export function useOnboarding() {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('legal-os-onboarding-completed');
    setShouldShowOnboarding(!completed);

    const handleStart = () => {
      localStorage.removeItem('legal-os-onboarding-completed');
      setShouldShowOnboarding(true);
    };
    window.addEventListener(START_TOUR_EVENT, handleStart);
    return () => window.removeEventListener(START_TOUR_EVENT, handleStart);
  }, []);

  return {
    shouldShowOnboarding,
    completeOnboarding: () => {
      localStorage.setItem('legal-os-onboarding-completed', 'true');
      setShouldShowOnboarding(false);
    },
    resetOnboarding: () => {
      localStorage.removeItem('legal-os-onboarding-completed');
      setShouldShowOnboarding(true);
    },
  };
}
