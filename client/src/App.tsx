import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import ContractDetail from "./pages/ContractDetail";
import CaseManagement from "./pages/CaseManagement";
import ClientManagement from "./pages/ClientManagement";
import DocumentManagement from "./pages/DocumentManagement";
import AIChatPage from "./pages/AIChatPage";
import Home from "./pages/Home";

/**
 * Legal OS Application Router
 * Design Philosophy: Modern Professional with Legal Authority
 * - Deep Navy primary (#1a2847) for trust and authority
 * - Tealime accents (#56CCF2) for AI intelligence
 * - Clean, professional layout with command-driven interface
 * 
 * Routes:
 * / - Landing page (unauthenticated) / Dashboard (authenticated)
 * /dashboard - Dashboard (authenticated)
 * /contract/:id - Contract detail and analysis
 * /cases - Case management
 * /clients - Client management
 * /documents - Document management
 * /ai-chat - AI legal assistant
 */
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/contract/:id"} component={ContractDetail} />
      <Route path={"/cases"} component={CaseManagement} />
      <Route path={"/clients"} component={ClientManagement} />
      <Route path={"/documents"} component={DocumentManagement} />
      <Route path={"/ai-chat"} component={AIChatPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
