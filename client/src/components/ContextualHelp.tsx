import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ContextualHelpProps {
  title: string;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  title,
  content,
  side = 'top',
  className = '',
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className={`inline-flex items-center justify-center ${className}`}>
            <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-tealime transition-colors" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">{content}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface HelpSectionProps {
  title: string;
  description: string;
  tips?: string[];
  className?: string;
}

export const HelpSection: React.FC<HelpSectionProps> = ({
  title,
  description,
  tips,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`p-4 bg-muted/50 border border-border rounded-lg ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start gap-3 hover:opacity-80 transition-opacity"
      >
        <HelpCircle className="w-5 h-5 text-tealime flex-shrink-0 mt-0.5" />
        <div className="text-left">
          <h4 className="font-semibold text-sm">{title}</h4>
          {!isExpanded && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </button>
      {isExpanded && (
        <div className="mt-3 pl-8 space-y-2">
          <p className="text-sm text-muted-foreground">{description}</p>
          {tips && tips.length > 0 && (
            <ul className="space-y-1">
              {tips.map((tip, index) => (
                <li key={index} className="text-xs text-muted-foreground flex gap-2">
                  <span className="text-tealime">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

interface InlineHelpProps {
  children: React.ReactNode;
  helpText: string;
  helpTitle?: string;
}

export const InlineHelp: React.FC<InlineHelpProps> = ({
  children,
  helpText,
  helpTitle = 'Help',
}) => {
  return (
    <div className="flex items-center gap-2">
      {children}
      <ContextualHelp title={helpTitle} content={helpText} />
    </div>
  );
};
