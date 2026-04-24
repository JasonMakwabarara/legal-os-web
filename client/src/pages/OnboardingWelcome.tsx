import React, { useState } from 'react';
import { useOnboarding, ONBOARDING_TOURS } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

export default function OnboardingWelcome() {
  const { completedTours, startTour } = useOnboarding();
  const [, navigate] = useLocation();
  const [selectedTour, setSelectedTour] = useState<string | null>(null);

  const handleStartTour = (tourId: string) => {
    startTour(tourId);
    navigate('/dashboard');
  };

  const handleSkipAll = () => {
    navigate('/dashboard');
  };

  const completionPercentage = Math.round((completedTours.length / ONBOARDING_TOURS.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-dusk via-charge to-dusk py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to Legal OS</h1>
          <p className="text-white/80 text-lg">Master your legal operations with interactive tutorials</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Progress Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Your Learning Progress</h2>
            <span className="text-3xl font-bold text-tealime">{completionPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-tealime to-charge transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {completedTours.length} of {ONBOARDING_TOURS.length} tutorials completed
          </p>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {ONBOARDING_TOURS.map((tour) => {
            const isCompleted = completedTours.includes(tour.id);
            const isSelected = selectedTour === tour.id;

            return (
              <Card
                key={tour.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-tealime border-tealime'
                    : 'hover:border-tealime/50'
                } ${isCompleted ? 'opacity-75' : ''}`}
                onClick={() => setSelectedTour(tour.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {tour.name}
                        {isCompleted && (
                          <CheckCircle2 className="w-5 h-5 text-charge" />
                        )}
                      </CardTitle>
                      <CardDescription>{tour.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{tour.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{tour.steps.length} steps</span>
                    </div>
                    {isCompleted && (
                      <div className="text-xs font-medium text-charge">✓ Completed</div>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartTour(tour.id);
                      }}
                      className={`w-full ${
                        isCompleted
                          ? 'bg-muted text-muted-foreground hover:bg-muted'
                          : 'bg-tealime hover:bg-tealime/90'
                      }`}
                      disabled={isCompleted}
                    >
                      {isCompleted ? 'Completed' : 'Start Tutorial'}
                      {!isCompleted && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handleSkipAll}
            className="px-8"
          >
            Skip All Tutorials
          </Button>
          <Button
            onClick={() => {
              if (selectedTour) {
                handleStartTour(selectedTour);
              }
            }}
            disabled={!selectedTour}
            className="px-8 bg-tealime hover:bg-tealime/90"
          >
            Start Selected Tutorial
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Help Section */}
        <div className="mt-16 p-8 bg-muted/50 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
          <p className="text-muted-foreground mb-4">
            You can access tutorials anytime from the help menu in the top navigation bar. Each tutorial takes just a few minutes and covers one main feature.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium mb-1">💡 Tips</p>
              <p className="text-muted-foreground">Hover over question marks to see contextual help</p>
            </div>
            <div>
              <p className="font-medium mb-1">⌨️ Shortcuts</p>
              <p className="text-muted-foreground">Use Cmd+K (Mac) or Ctrl+K (Windows) for global search</p>
            </div>
            <div>
              <p className="font-medium mb-1">📚 Documentation</p>
              <p className="text-muted-foreground">Visit our help center for detailed documentation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
