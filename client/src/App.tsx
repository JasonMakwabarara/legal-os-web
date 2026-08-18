import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Route, Switch, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { OnboardingTour, useOnboarding } from "./components/OnboardingTour";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const ContractDetail = lazy(() => import("./pages/ContractDetail"));
const AcceptInvitation = lazy(() => import("./pages/AcceptInvitation"));
const CaseManagement = lazy(() => import("./pages/CaseManagement"));
const ClientManagement = lazy(() => import("./pages/ClientManagement"));
const DocumentManagement = lazy(() => import("./pages/DocumentManagement"));
const AIChatPage = lazy(() => import("./pages/AIChatPage"));
const FirmSetup = lazy(() => import("./pages/FirmSetup"));
const ClauseTemplateBuilder = lazy(() =>
  import("./components/ClauseTemplateBuilder").then(m => ({ default: m.ClauseTemplateBuilder })),
);
const TemplateApprovalDashboard = lazy(() =>
  import("./components/TemplateApprovalDashboard").then(m => ({ default: m.TemplateApprovalDashboard })),
);
const BlogResources = lazy(() => import("./pages/BlogResources"));
const AdvancedSearchPage = lazy(() => import("./pages/AdvancedSearchPage"));
const OCRProcessingPage = lazy(() => import("./pages/OCRProcessingPage"));
const ClauseComparisonPage = lazy(() => import("./pages/ClauseComparisonPage"));
const TemplateLibraryPage = lazy(() => import("./pages/TemplateLibraryPage"));
const Timesheets = lazy(() => import("./pages/Timesheets").then(m => ({ default: m.Timesheets })));
const Integrations = lazy(() => import("./pages/Integrations").then(m => ({ default: m.Integrations })));
const Reports = lazy(() => import("./pages/Reports").then(m => ({ default: m.Reports })));
const TeamPage = lazy(() => import("./pages/TeamPage"));

function AppShell({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
    </div>
  );
}

function HomeRoute() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (!loading && isAuthenticated) setLocation("/dashboard");
  }, [isAuthenticated, loading, setLocation]);
  if (loading || isAuthenticated) return null;
  return <LandingPage />;
}

/**
 * Legal OS Application Router
 * Design Philosophy: Modern Professional with Legal Authority
 * - Deep Navy primary (#1a2847) for trust and authority
 * - Tealime accents (#56CCF2) for AI intelligence
 * - Clean, professional layout with command-driven interface
 */
function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/login" component={Login} />
      <Route path="/firm-setup" component={FirmSetup} />
      <Route path="/dashboard">{() => <AppShell><Dashboard /></AppShell>}</Route>
      <Route path="/contract/:id">{() => <AppShell><ContractDetail /></AppShell>}</Route>
      <Route path="/search" component={AdvancedSearchPage} />
      <Route path="/ocr" component={OCRProcessingPage} />
      <Route path="/comparison" component={ClauseComparisonPage} />
      <Route path="/cases">{() => <AppShell><CaseManagement /></AppShell>}</Route>
      <Route path="/clients">{() => <AppShell><ClientManagement /></AppShell>}</Route>
      <Route path="/documents">{() => <AppShell><DocumentManagement /></AppShell>}</Route>
      <Route path="/ai-chat">{() => <AppShell><AIChatPage /></AppShell>}</Route>
      <Route path="/template-builder">{() => <AppShell><ClauseTemplateBuilder /></AppShell>}</Route>
      <Route path="/approvals">{() => <AppShell><TemplateApprovalDashboard /></AppShell>}</Route>
      <Route path="/blog" component={BlogResources} />
      <Route path="/templates">{() => <AppShell><TemplateLibraryPage /></AppShell>}</Route>
      <Route path="/timesheets">{() => <AppShell><Timesheets /></AppShell>}</Route>
      <Route path="/integrations">{() => <AppShell><Integrations /></AppShell>}</Route>
      <Route path="/reports">{() => <AppShell><Reports /></AppShell>}</Route>
      <Route path="/team" component={TeamPage} />
      <Route path="/accept-invitation/:code" component={AcceptInvitation} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function AppContent() {
  const { shouldShowOnboarding, completeOnboarding } = useOnboarding();
  const { isAuthenticated, loading } = useAuth();

  // Only show onboarding for authenticated users
  const showOnboarding = shouldShowOnboarding && isAuthenticated && !loading;

  return (
    <>
      {showOnboarding && (
        <OnboardingTour onComplete={completeOnboarding} />
      )}
      <Router />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
