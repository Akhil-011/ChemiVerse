import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AppErrorBoundary, AppLoadingFallback } from "@/components/errors/AppErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <React.Suspense fallback={<AppLoadingFallback />}>
        <App />
      </React.Suspense>
    </AppErrorBoundary>
  </React.StrictMode>
);
