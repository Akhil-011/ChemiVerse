import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[boot] App render error", error, errorInfo);
      return;
    }

    console.error("[boot] App render error captured; showing fallback UI.");
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
          <div className="glass-card w-full max-w-xl border border-border/60 p-6 text-center shadow-2xl sm:p-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10 text-red-300">
              <AlertTriangle size={22} />
            </div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Something went wrong</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              The application failed to render. Reloading usually clears a stale deployment or transient runtime issue.
            </p>
            {import.meta.env.DEV && this.state.error ? (
              <pre className="mt-4 overflow-auto rounded-2xl border border-border/60 bg-background/80 p-4 text-left text-xs text-muted-foreground">
                {this.state.error.stack || this.state.error.message}
              </pre>
            ) : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={this.handleReset}
                className="btn-neon inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white"
              >
                <RefreshCcw size={16} />
                Reload App
              </button>
              <button
                onClick={() => window.location.assign("/")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/60 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                <Home size={16} />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function AppLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card flex items-center gap-3 px-5 py-4 text-sm text-muted-foreground">
        <span className="h-3 w-3 animate-pulse rounded-full bg-cyan-400" />
        Loading ChemiVerse...
      </div>
    </div>
  );
}