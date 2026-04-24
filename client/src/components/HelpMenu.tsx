import React, { useState } from 'react';
import { useOnboarding, ONBOARDING_TOURS } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HelpCircle, BookOpen, MessageSquare, Play } from 'lucide-react';
import { useLocation } from 'wouter';

export const HelpMenu: React.FC = () => {
  const { startTour } = useOnboarding();
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleStartTour = (tourId: string) => {
    startTour(tourId);
    setIsOpen(false);
  };

  const handleViewAllTutorials = () => {
    navigate('/onboarding');
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title="Help & Tutorials"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Help & Tutorials
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Quick Start Tutorials */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground py-2">
          Quick Start
        </DropdownMenuLabel>
        {ONBOARDING_TOURS.slice(0, 3).map((tour) => (
          <DropdownMenuItem
            key={tour.id}
            onClick={() => handleStartTour(tour.id)}
            className="cursor-pointer flex items-center gap-2"
          >
            <Play className="w-4 h-4 text-tealime" />
            <span className="text-sm">{tour.name}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* All Tutorials */}
        <DropdownMenuItem
          onClick={handleViewAllTutorials}
          className="cursor-pointer flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-sm">View All Tutorials</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Support */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground py-2">
          Support
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => window.open('https://help.legal-os.com', '_blank')}
          className="cursor-pointer flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm">Documentation</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => window.open('https://support.legal-os.com', '_blank')}
          className="cursor-pointer flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm">Contact Support</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
