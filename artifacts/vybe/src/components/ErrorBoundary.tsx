import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
        <div className="max-w-sm">
          <p className="text-5xl mb-4">⚠️</p>
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground text-sm mb-6 font-mono">
            {this.state.error?.message ?? "Unknown error"}
          </p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }
}
