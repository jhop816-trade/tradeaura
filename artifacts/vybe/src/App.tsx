import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import LandingPage from "@/pages/LandingPage";
import ExplorePage from "@/pages/ExplorePage";
import ProviderProfilePage from "@/pages/ProviderProfilePage";
import BookingFlowPage from "@/pages/BookingFlowPage";
import BookingConfirmPage from "@/pages/BookingConfirmPage";
import ProviderDashboard from "@/pages/ProviderDashboard";
import ClientDashboard from "@/pages/ClientDashboard";
import ProviderOnboarding from "@/pages/ProviderOnboarding";
import ClientOnboarding from "@/pages/ClientOnboarding";
import WorkingHoursPage from "@/pages/WorkingHoursPage";
import EditProfilePage from "@/pages/EditProfilePage";
import NotFoundPage from "@/pages/NotFoundPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
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
    <ErrorBoundary>
      <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? ""}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Switch>
              <Route path="/" component={LandingPage} />
              <Route path="/explore" component={ExplorePage} />

              {/* Onboarding */}
              <Route path="/onboarding/provider">
                <ProtectedRoute><ProviderOnboarding /></ProtectedRoute>
              </Route>
              <Route path="/onboarding/client">
                <ProtectedRoute><ClientOnboarding /></ProtectedRoute>
              </Route>

              {/* Booking flow */}
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

              {/* Provider routes */}
              <Route path="/dashboard/provider">
                <ProtectedRoute><ProviderDashboard /></ProtectedRoute>
              </Route>
              <Route path="/dashboard/provider/hours">
                <ProtectedRoute><WorkingHoursPage /></ProtectedRoute>
              </Route>
              <Route path="/dashboard/provider/edit">
                <ProtectedRoute><EditProfilePage /></ProtectedRoute>
              </Route>

              {/* Client routes */}
              <Route path="/dashboard/client">
                <ProtectedRoute><ClientDashboard /></ProtectedRoute>
              </Route>

              {/* Public provider profile — must be last dynamic route */}
              <Route path="/@:username">
                {(params) => <ProviderProfilePage username={params.username} />}
              </Route>

              <Route component={NotFoundPage} />
            </Switch>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
