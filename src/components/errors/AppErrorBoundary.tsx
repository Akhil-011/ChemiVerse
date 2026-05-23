import { Component, type ErrorInfo, type ReactNode } from "react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[app] Unhandled rendering error", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
          <div className="glass-card w-full max-w-xl border border-border/60 p-6 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Application error</p>
            <h1 className="mt-3 text-2xl font-semibold">ChemiVerse could not load this screen.</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The app hit an unexpected runtime error. Reloading usually clears stale client state or a bad cached asset.
            </p>
            {this.state.error && (
              <pre className="mt-4 overflow-auto rounded-2xl border border-border/60 bg-muted/40 p-4 text-xs text-muted-foreground">
                {this.state.error.message}
              </pre>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn-neon px-4 py-2 text-sm text-white" onClick={this.handleReload}>
                Reload App
              </button>
              <button className="rounded-xl border border-border/60 px-4 py-2 text-sm text-foreground hover:bg-muted" onClick={() => (window.location.href = "/") }>
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