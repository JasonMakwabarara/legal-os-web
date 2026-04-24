import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type TutorialStep = {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  action?: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
  highlightPadding?: number;
};

export type OnboardingTour = {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
  icon?: string;
  estimatedTime?: number;
};

interface OnboardingContextType {
  activeTour: OnboardingTour | null;
  currentStep: number;
  completedTours: string[];
  isOnboarding: boolean;
  startTour: (tourId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  getTourProgress: (tourId: string) => number;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const ONBOARDING_TOURS: OnboardingTour[] = [
  {
    id: 'dashboard-tour',
    name: 'Dashboard Overview',
    description: 'Learn how to navigate your dashboard and track contracts',
    estimatedTime: 3,
    steps: [
      {
        id: 'dashboard-welcome',
        title: 'Welcome to Legal OS',
        description: 'Your command center for legal operations. Here you can see all your contracts, cases, and important metrics at a glance.',
        position: 'bottom',
      },
      {
        id: 'dashboard-cockpit',
        title: 'Cockpit Overview',
        description: 'The cockpit displays real-time metrics including total contracts, active cases, and risk summary.',
        targetElement: '.cockpit-section',
        position: 'bottom',
      },
      {
        id: 'dashboard-search',
        title: 'Global Search',
        description: 'Use Cmd+K (Mac) or Ctrl+K (Windows) to quickly search for any contract, case, or client.',
        targetElement: '.global-search',
        position: 'bottom',
      },
      {
        id: 'dashboard-notifications',
        title: 'Stay Updated',
        description: 'Check your notification center for important deadlines, case updates, and collaboration alerts.',
        targetElement: '.notification-icon',
        position: 'bottom',
      },
    ],
  },
  {
    id: 'contracts-tour',
    name: 'Contract Management',
    description: 'Master contract analysis and collaboration',
    estimatedTime: 4,
    steps: [
      {
        id: 'contracts-intro',
        title: 'Contract Management',
        description: 'Manage all your legal contracts in one place with AI-powered analysis.',
        position: 'bottom',
      },
      {
        id: 'contracts-list',
        title: 'View Contracts',
        description: 'See all contracts with their status, risk level, and key dates.',
        targetElement: '.contracts-list',
        position: 'right',
      },
      {
        id: 'contracts-analysis',
        title: 'AI Analysis',
        description: 'Click on any contract to see AI-powered analysis including risks, key clauses, and recommendations.',
        targetElement: '.contract-detail',
        position: 'right',
      },
      {
        id: 'contracts-collaboration',
        title: 'Team Collaboration',
        description: 'Collaborate with your team in real-time. See who\'s viewing the contract and add comments.',
        targetElement: '.collaboration-panel',
        position: 'left',
      },
    ],
  },
  {
    id: 'cases-tour',
    name: 'Case Management',
    description: 'Track and manage your legal cases',
    estimatedTime: 3,
    steps: [
      {
        id: 'cases-intro',
        title: 'Case Management',
        description: 'Organize and track all your legal cases with detailed information and status updates.',
        position: 'bottom',
      },
      {
        id: 'cases-create',
        title: 'Create a Case',
        description: 'Click the "New Case" button to create a new case and assign it to team members.',
        targetElement: '.new-case-button',
        position: 'bottom',
      },
      {
        id: 'cases-filter',
        title: 'Filter Cases',
        description: 'Use filters to view cases by status, priority, or assigned lawyer.',
        targetElement: '.case-filters',
        position: 'right',
      },
      {
        id: 'cases-outcomes',
        title: 'Historical Outcomes',
        description: 'View similar cases and their outcomes to inform your strategy.',
        targetElement: '.case-outcomes',
        position: 'left',
      },
    ],
  },
  {
    id: 'ai-assistant-tour',
    name: 'AI Legal Assistant',
    description: 'Get instant legal advice and document analysis',
    estimatedTime: 3,
    steps: [
      {
        id: 'ai-intro',
        title: 'AI Legal Assistant',
        description: 'Your intelligent assistant for legal research, document analysis, and case strategy.',
        position: 'bottom',
      },
      {
        id: 'ai-chat',
        title: 'Ask Questions',
        description: 'Type any legal question and get instant answers powered by AI and your firm\'s knowledge base.',
        targetElement: '.ai-chat-input',
        position: 'top',
      },
      {
        id: 'ai-documents',
        title: 'Document Analysis',
        description: 'Upload or select documents to get AI-powered summaries and key clause extraction.',
        targetElement: '.ai-document-analysis',
        position: 'right',
      },
      {
        id: 'ai-suggestions',
        title: 'Suggested Follow-ups',
        description: 'After each response, see suggested follow-up questions to dive deeper.',
        targetElement: '.ai-suggestions',
        position: 'left',
      },
    ],
  },
  {
    id: 'documents-tour',
    name: 'Document Management',
    description: 'Organize and manage legal documents',
    estimatedTime: 3,
    steps: [
      {
        id: 'docs-intro',
        title: 'Document Management',
        description: 'Centralized repository for all your legal documents with version control and e-signatures.',
        position: 'bottom',
      },
      {
        id: 'docs-upload',
        title: 'Upload Documents',
        description: 'Drag and drop or click to upload documents. They\'ll be automatically categorized and analyzed.',
        targetElement: '.file-upload-area',
        position: 'bottom',
      },
      {
        id: 'docs-search',
        title: 'Find Documents',
        description: 'Use the search and filter options to quickly find any document.',
        targetElement: '.document-search',
        position: 'right',
      },
      {
        id: 'docs-esignature',
        title: 'E-Signatures',
        description: 'Sign documents securely with e-signatures. All signatures are timestamped and verified.',
        targetElement: '.esignature-button',
        position: 'left',
      },
    ],
  },
  {
    id: 'notifications-tour',
    name: 'Notifications & Alerts',
    description: 'Stay on top of important updates',
    estimatedTime: 2,
    steps: [
      {
        id: 'notif-intro',
        title: 'Notification Center',
        description: 'Aggregated alerts for deadlines, case updates, and team collaboration.',
        position: 'bottom',
      },
      {
        id: 'notif-types',
        title: 'Notification Types',
        description: 'Filter by type: Deadlines, Case Updates, Contract Reviews, Collaboration, and System alerts.',
        targetElement: '.notification-tabs',
        position: 'bottom',
      },
      {
        id: 'notif-custom',
        title: 'Custom Notifications',
        description: 'Create custom alerts for important dates, milestones, or team reminders.',
        targetElement: '.custom-notification-button',
        position: 'right',
      },
    ],
  },
];

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTour, setActiveTour] = useState<OnboardingTour | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTours, setCompletedTours] = useState<string[]>(() => {
    const saved = localStorage.getItem('completedTours');
    return saved ? JSON.parse(saved) : [];
  });
  const [isOnboarding, setIsOnboarding] = useState(false);

  const startTour = useCallback((tourId: string) => {
    const tour = ONBOARDING_TOURS.find(t => t.id === tourId);
    if (tour) {
      setActiveTour(tour);
      setCurrentStep(0);
      setIsOnboarding(true);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (activeTour && currentStep < activeTour.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [activeTour, currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    setActiveTour(null);
    setCurrentStep(0);
    setIsOnboarding(false);
  }, []);

  const completeTour = useCallback(() => {
    if (activeTour && !completedTours.includes(activeTour.id)) {
      const updated = [...completedTours, activeTour.id];
      setCompletedTours(updated);
      localStorage.setItem('completedTours', JSON.stringify(updated));
    }
    skipTour();
  }, [activeTour, completedTours, skipTour]);

  const getTourProgress = useCallback((tourId: string) => {
    const tour = ONBOARDING_TOURS.find(t => t.id === tourId);
    if (!tour) return 0;
    if (completedTours.includes(tourId)) return 100;
    return 0;
  }, [completedTours]);

  const value: OnboardingContextType = {
    activeTour,
    currentStep,
    completedTours,
    isOnboarding,
    startTour,
    nextStep,
    previousStep,
    skipTour,
    completeTour,
    getTourProgress,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
