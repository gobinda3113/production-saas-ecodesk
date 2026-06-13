import { Component, type ReactNode, type ErrorInfo } from "react";
import { Button } from "@/components/ui";

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="font-display text-3xl font-bold text-on-background">Something went wrong</h1>
            <p className="text-secondary text-sm mt-2">{this.state.error?.message ?? "An unexpected error occurred."}</p>
            <Button className="mt-6" onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = "/"; }}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
