import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import ImportDay from "./pages/ImportDay";
import Login from "./pages/Login";
import Schedules from "./pages/Schedules";
import Activities from "./pages/Activities";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gecko-bg">
        <div className="text-center">
          <span className="text-5xl animate-bounce block mb-4">🦎</span>
          <p className="text-gecko-green font-semibold">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Home} />} />
      <Route path="/schedules" component={() => <ProtectedRoute component={Schedules} />} />
      <Route path="/activities" component={() => <ProtectedRoute component={Activities} />} />
      <Route path="/import" component={() => <ProtectedRoute component={ImportDay} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster theme="dark" />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
