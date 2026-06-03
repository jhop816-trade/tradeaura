import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "@/pages/LandingPage";
import ExplorePage from "@/pages/ExplorePage";
import ProviderProfilePage from "@/pages/ProviderProfilePage";
import BookingFlowPage from "@/pages/BookingFlowPage";
import BookingConfirmPage from "@/pages/BookingConfirmPage";
import ProviderDashboard from "@/pages/ProviderDashboard";
import ClientDashboard from "@/pages/ClientDashboard";
import NotFoundPage from "@/pages/NotFoundPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? ""}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/explore" component={ExplorePage} />
            <Route path="/book/:username">
              {(params) => (
                <ProtectedRoute>
                  <BookingFlowPage username={params.username} />
                </ProtectedRoute>
              )}
            </Route>
            <Route path="/booking/:id">
              {(params) => (
                <ProtectedRoute>
                  <BookingConfirmPage bookingId={params.id} />
                </ProtectedRoute>
              )}
            </Route>
            <Route path="/dashboard/provider">
              <ProtectedRoute><ProviderDashboard /></ProtectedRoute>
            </Route>
            <Route path="/dashboard/client">
              <ProtectedRoute><ClientDashboard /></ProtectedRoute>
            </Route>
            <Route path="/@:username">
              {(params) => <ProviderProfilePage username={params.username} />}
            </Route>
            <Route component={NotFoundPage} />
          </Switch>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
