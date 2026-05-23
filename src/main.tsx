import React from "react";
import ReactDOM from "react-dom/client";
import { Suspense } from "react";
import App from "./App.tsx";
import "./index.css";
import AppErrorBoundary from "@/components/errors/AppErrorBoundary";

function AppBootstrapFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="glass-card max-w-sm px-6 py-5 text-center shadow-2xl">
        <p className="text-sm font-semibold">Loading ChemiVerse...</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Initializing the application shell and cached assets.
        </p>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <Suspense fallback={<AppBootstrapFallback />}>
        <App />
      </Suspense>
    </AppErrorBoundary>
  </React.StrictMode>
);
