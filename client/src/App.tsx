import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import ContractDetail from "./pages/ContractDetail";
import CaseManagement from "./pages/CaseManagement";
import ClientManagement from "./pages/ClientManagement";
import DocumentManagement from "./pages/DocumentManagement";
import NotFound from "./pages/NotFound";

/**
 * Legal OS Application Router
 * Design Philosophy: Modern Professional with Legal Authority
 * - Deep Navy primary (#1a2847) for trust and authority
 * - Tealime accents (#56CCF2) for AI intelligence
 * - Clean, professional layout with command-driven interface
 * 
 * Routes:
 * / - Dashboard (main cockpit)
 * /contract/:id - Contract detail and analysis
 * /cases - Case management
 * /clients - Client management
 * /documents - Document management
 */
function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/contract/:id"} component={ContractDetail} />
      <Route path={"/cases"} component={CaseManagement} />
      <Route path={"/clients"} component={ClientManagement} />
      <Route path={"/documents"} component={DocumentManagement} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
