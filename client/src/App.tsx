import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import PublicPage from "@/pages/PublicPage";
import PayloadsPage from "@/pages/PayloadsPage";
import AdminLogin from "@/pages/AdminLogin";
import AdminPanel from "@/pages/AdminPanel";
import ScanLines from "@/components/ScanLines";
import Terms from "@/pages/Terms"
import { useAuth, AuthProvider } from "@/contexts/AuthContext";
import { useEffect } from "react";

function Router() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect from admin panel if not authenticated
  useEffect(() => {
    if (!isLoading && location.startsWith("/admin") && 
        !location.includes("/admin/login") && 
        !isAuthenticated) {
      // Use setLocation instead of direct window.location for cleaner navigation
      setLocation("/admin/login");
    }
  }, [location, isAuthenticated, isLoading, setLocation]);

  // Protected routes for admin area
  return (
    <Switch>
      <Route path="/" component={PublicPage} />
      <Route path="/payloads" component={PayloadsPage} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="prevent-select min-h-screen">
            <ScanLines />
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
