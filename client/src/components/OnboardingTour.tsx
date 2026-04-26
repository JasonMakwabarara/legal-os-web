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
    title: 'Welcome to Legal OS',
    description: 'Your AI-powered legal practice management platform. Let\'s take a quick tour to get you started.',
    position: 'bottom',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'View your active cases, contracts, and upcoming deadlines at a glance. This is your command center.',
    target: 'dashboard-section',
    position: 'right',
  },
  {
    id: 'contracts',
    title: 'Contract Management',
    description: 'Manage all your contracts with AI-powered analysis, risk assessment, and collaboration features.',
    target: 'contracts-nav',
    position: 'right',
  },
  {
    id: 'cases',
    title: 'Case Management',
    description: 'Track cases, assign tasks, and manage case workflows efficiently.',
    target: 'cases-nav',
    position: 'right',
  },
  {
    id: 'ai-chat',
    title: 'AI Legal Assistant',
    description: 'Chat with our AI assistant for contract analysis, legal research, and document generation.',
    target: 'ai-chat-nav',
    position: 'right',
  },
  {
    id: 'collaboration',
    title: 'Real-Time Collaboration',
    description: 'Share documents with team members and collaborate in real-time with WebSocket support.',
    position: 'bottom',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Stay updated with real-time notifications for deadlines, case updates, and collaborations.',
    target: 'notifications-icon',
    position: 'left',
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'You\'re ready to start using Legal OS. Explore the platform and discover all its features.',
    position: 'bottom',
  },
];

interface OnboardingTourProps {
  onComplete?: () => void;
  isOpen?: boolean;
}

export function OnboardingTour({ onComplete, isOpen = true }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(isOpen);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const step = TOUR_STEPS[currentStep];

  useEffect(() => {
    if (isVisible && step.target) {
      const element = document.getElementById(step.target);
      setHighlightedElement(element);
    } else {
      setHighlightedElement(null);
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
      {/* Overlay */}
      {highlightedElement && (
        <div className="fixed inset-0 bg-black/50 z-40 pointer-events-none" />
      )}

      {/* Highlight Box */}
      {highlightedElement && (
        <div
          className="fixed border-2 border-blue-500 rounded-lg z-40 pointer-events-none transition-all duration-300"
          style={{
            top: `${highlightedElement.offsetTop - 8}px`,
            left: `${highlightedElement.offsetLeft - 8}px`,
            width: `${highlightedElement.offsetWidth + 16}px`,
            height: `${highlightedElement.offsetHeight + 16}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      {/* Tour Card */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-2xl p-6 max-w-sm"
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
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="pr-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {step.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {step.description}
          </p>

          {/* Progress Indicator */}
          <div className="flex gap-1 mb-4">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-blue-500'
                    : index < currentStep
                      ? 'bg-blue-300'
                      : 'bg-gray-200'
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
              className="gap-1 bg-blue-500 hover:bg-blue-600"
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
              {currentStep < TOUR_STEPS.length - 1 && <ChevronRight size={16} />}
            </Button>
          </div>
        </div>

        {/* Step Counter */}
        <div className="absolute bottom-4 left-6 text-xs text-gray-400">
          {currentStep + 1} / {TOUR_STEPS.length}
        </div>
      </div>
    </>
  );
}

/**
 * Hook to check if onboarding should be shown
 */
export function useOnboarding() {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('legal-os-onboarding-completed');
    setShouldShowOnboarding(!completed);
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
