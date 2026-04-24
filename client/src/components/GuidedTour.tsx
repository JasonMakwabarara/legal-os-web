import React, { useEffect, useRef } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, HelpCircle } from 'lucide-react';

export const GuidedTour: React.FC = () => {
  const { activeTour, currentStep, isOnboarding, nextStep, previousStep, skipTour, completeTour } = useOnboarding();
  const spotlightRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOnboarding || !activeTour) return;

    const step = activeTour.steps[currentStep];
    if (!step || !step.targetElement) {
      // No target element, show centered tooltip
      if (tooltipRef.current) {
        tooltipRef.current.style.position = 'fixed';
        tooltipRef.current.style.top = '50%';
        tooltipRef.current.style.left = '50%';
        tooltipRef.current.style.transform = 'translate(-50%, -50%)';
      }
      return;
    }

    // Find target element
    const targetElement = document.querySelector(step.targetElement) as HTMLElement;
    if (!targetElement) return;

    // Get element position
    const rect = targetElement.getBoundingClientRect();
    const padding = step.highlightPadding || 8;

    // Update spotlight
    if (spotlightRef.current) {
      spotlightRef.current.style.display = 'block';
      spotlightRef.current.style.left = `${rect.left - padding}px`;
      spotlightRef.current.style.top = `${rect.top - padding}px`;
      spotlightRef.current.style.width = `${rect.width + padding * 2}px`;
      spotlightRef.current.style.height = `${rect.height + padding * 2}px`;
    }

    // Position tooltip
    if (tooltipRef.current) {
      const tooltipWidth = 320;
      const tooltipHeight = 200;
      let top = rect.top - tooltipHeight - 16;
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;

      // Adjust if out of bounds
      if (top < 16) {
        top = rect.bottom + 16;
      }
      if (left < 16) {
        left = 16;
      }
      if (left + tooltipWidth > window.innerWidth - 16) {
        left = window.innerWidth - tooltipWidth - 16;
      }

      tooltipRef.current.style.position = 'fixed';
      tooltipRef.current.style.top = `${top}px`;
      tooltipRef.current.style.left = `${left}px`;
    }
  }, [isOnboarding, activeTour, currentStep]);

  if (!isOnboarding || !activeTour) return null;

  const step = activeTour.steps[currentStep];
  const isLastStep = currentStep === activeTour.steps.length - 1;
  const progress = ((currentStep + 1) / activeTour.steps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 pointer-events-none" />

      {/* Spotlight */}
      {step.targetElement && (
        <div
          ref={spotlightRef}
          className="fixed border-2 border-tealime rounded-lg z-40 pointer-events-none transition-all duration-300"
          style={{
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed bg-card border border-border rounded-lg shadow-lg z-50 w-80 p-6 pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-tealime" />
            <h3 className="font-semibold text-card-foreground">{step.title}</h3>
          </div>
          <button
            onClick={skipTour}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-6">{step.description}</p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {activeTour.steps.length}
            </span>
            <span className="text-xs font-medium text-tealime">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-tealime transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={previousStep}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={skipTour}
            className="flex-1"
          >
            Skip
          </Button>
          <Button
            size="sm"
            onClick={isLastStep ? completeTour : nextStep}
            className="flex-1 bg-tealime hover:bg-tealime/90"
          >
            {isLastStep ? 'Done' : 'Next'}
            {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </>
  );
};
