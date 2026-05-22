// ============================================================
// ChemFusion AI — App Router
// ============================================================
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VoiceControl from "@/components/features/VoiceControl";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AuthPage from "@/pages/Auth";
import { useAuth } from "@/hooks/use-supabase";
import { routeToActivityMeta, safeTrackActivity } from "@/lib/activity";
import PwaManager from "@/components/pwa/PwaManager";

import Home from "@/pages/Home";
import MoleculeViewer from "@/pages/MoleculeViewer";
import ChemLab from "@/pages/ChemLab";
import ReactionPredictor from "@/pages/ReactionPredictor";
import ChemTutor from "@/pages/ChemTutor";
import Dashboard from "@/pages/Dashboard";
import PeriodicTable from "@/pages/PeriodicTable";
import NotFound from "@/pages/NotFound";
import { pageVariants } from "@/lib/animationVariants";
import { pageTransition } from "@/lib/motionPresets";

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("chemfusion_theme") as "dark" | "light") || "dark";
  });

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    localStorage.setItem("chemfusion_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <AppShell theme={theme} onToggleTheme={toggleTheme} />
        <AnimatedRoutes />
        {/* Render footer only on the landing page */}
        <ConditionalFooter />
        <VoiceControl />
        <PwaManager />
        <Toaster
          position="bottom-right"
          theme={theme}
          toastOptions={{
            style: {
              background: "rgba(13, 27, 42, 0.9)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              color: "#e2e8f0",
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

function AppShell({ theme, onToggleTheme }: { theme: "dark" | "light"; onToggleTheme: () => void }) {
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    if (location.pathname === "/auth") return;

    const meta = routeToActivityMeta(location.pathname);
    safeTrackActivity(user.id, {
      eventType: meta.eventType,
      module: meta.module,
      title: meta.title,
      description: `Opened ${meta.title}`,
      route: location.pathname,
      payload: { search: location.search },
    });
  }, [loading, location.pathname, location.search, user]);

  return <Navbar theme={theme} onToggleTheme={onToggleTheme} />;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <main className="flex-1">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="min-h-full"
        >
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/molecules" element={<ProtectedRoute><MoleculeViewer /></ProtectedRoute>} />
            <Route path="/molecules/:id" element={<ProtectedRoute><MoleculeViewer /></ProtectedRoute>} />
            <Route path="/lab" element={<ProtectedRoute><ChemLab /></ProtectedRoute>} />
            <Route path="/predictor" element={<ProtectedRoute><ReactionPredictor /></ProtectedRoute>} />
            <Route path="/tutor" element={<ProtectedRoute><ChemTutor /></ProtectedRoute>} />
            <Route path="/periodic-table" element={<ProtectedRoute><PeriodicTable /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

function ConditionalFooter() {
  const location = useLocation();
  // Show footer only on the landing page root path
  if (location.pathname === "/") return <Footer />;
  return null;
}
