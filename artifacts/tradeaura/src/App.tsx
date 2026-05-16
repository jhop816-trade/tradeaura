import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import JournalPage from "@/pages/trades";
import NewTradePage from "@/pages/new-trade";
import TradeDetailPage from "@/pages/trade-detail";
import CalendarPage from "@/pages/calendar";
import StatsPage from "@/pages/analytics";
import ReviewPage from "@/pages/review";
import InstrumentsPage from "@/pages/instruments";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AuthRedirect() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Redirect to="/" />;
  return <LoginPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={AuthRedirect} />
      <Route path="/">
        <ProtectedRoute><DashboardPage /></ProtectedRoute>
      </Route>
      <Route path="/journal">
        <ProtectedRoute><JournalPage /></ProtectedRoute>
      </Route>
      <Route path="/trades/new">
        <ProtectedRoute><NewTradePage /></ProtectedRoute>
      </Route>
      <Route path="/trades/:id">
        <ProtectedRoute><TradeDetailPage /></ProtectedRoute>
      </Route>
      <Route path="/trades">
        <ProtectedRoute><JournalPage /></ProtectedRoute>
      </Route>
      <Route path="/calendar">
        <ProtectedRoute><CalendarPage /></ProtectedRoute>
      </Route>
      <Route path="/stats">
        <ProtectedRoute><StatsPage /></ProtectedRoute>
      </Route>
      <Route path="/analytics">
        <ProtectedRoute><StatsPage /></ProtectedRoute>
      </Route>
      <Route path="/review">
        <ProtectedRoute><ReviewPage /></ProtectedRoute>
      </Route>
      <Route path="/instruments">
        <ProtectedRoute><InstrumentsPage /></ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
