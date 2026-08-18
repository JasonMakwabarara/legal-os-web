import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HelpCircle, BookOpen, Play } from 'lucide-react';
import { START_TOUR_EVENT } from '@/components/OnboardingTour';

export const HelpMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStartTour = () => {
    window.dispatchEvent(new Event(START_TOUR_EVENT));
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
          aria-label="Help & Tutorials"
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
        <DropdownMenuItem
          onClick={handleStartTour}
          className="cursor-pointer flex items-center gap-2"
        >
          <Play className="w-4 h-4 text-tealime" />
          <span className="text-sm">Take the product tour</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
