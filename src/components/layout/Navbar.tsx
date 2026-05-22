// ============================================================
// ChemiVerse — Navbar
// ============================================================
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Atom, FlaskConical, Zap, Bot, LayoutDashboard,
  Sun, Moon, Menu, X, Mic, Grid3x3
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-supabase";
import { signOut } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { modalVariants, sidebarVariants } from "@/lib/animationVariants";
import { cardTransition, pageTransition, springTapTransition } from "@/lib/motionPresets";

const MotionLink = motion.create(Link);

interface NavbarProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

const NAV_LINKS = [
  { href: "/molecules", label: "3D Molecules", icon: Atom },
  { href: "/periodic-table", label: "Periodic Table", icon: Grid3x3 },
  { href: "/lab", label: "Lab", icon: FlaskConical },
  { href: "/predictor", label: "AI Predictor", icon: Zap },
  { href: "/tutor", label: "AI Tutor", icon: Bot },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const displayName =
    user?.user_metadata?.display_name?.trim() ||
    user?.user_metadata?.full_name?.trim() ||
    user?.email ||
    "User";

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Signed out");
    } catch (error: any) {
      toast.error(error?.message || "Failed to sign out");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur-xl bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <MotionLink
            to="/"
            className="flex items-center gap-2.5 group"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={springTapTransition}
          >
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
              <Atom className="relative w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="font-display font-bold text-lg">
              <span className="gradient-text">ChemiVerse</span>
            </span>
          </MotionLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = location.pathname === href || location.pathname.startsWith(href + "/");
              return (
                <MotionLink
                  key={href}
                  to={href}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={cardTransition}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    active
                      ? "text-[#00d4ff] bg-[rgba(0,212,255,0.08)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon size={14} />
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                  )}
                </MotionLink>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <motion.button
              onClick={onToggleTheme}
              whileTap={{ scale: 0.96 }}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            {/* CTA */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <span className="max-w-[140px] truncate rounded-lg border border-border/40 bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                  {displayName}
                </span>
                <motion.button onClick={handleLogout} whileTap={{ scale: 0.96 }} className="btn-ghost-neon px-4 py-2 text-xs">
                  Logout
                </motion.button>
              </div>
            ) : (
              <MotionLink to="/auth" whileTap={{ scale: 0.96 }} className="hidden sm:block btn-neon text-white text-xs py-2 px-4">
                Login / Signup
              </MotionLink>
            )}

            {/* Mobile Menu */}
            <motion.button
              onClick={() => setMobileOpen(!mobileOpen)}
              whileTap={{ scale: 0.96 }}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            variants={sidebarVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl"
          >
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = location.pathname === href;
              return (
                <MotionLink
                  key={href}
                  to={href}
                  onClick={() => setMobileOpen(false)}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ x: 2 }}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    active
                      ? "bg-[rgba(0,212,255,0.08)] text-[#00d4ff]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon size={16} />
                  {label}
                </MotionLink>
              );
            })}
            <div className="mt-2 pt-2 border-t border-border/40">
              {user ? (
                <motion.button
                  onClick={async () => {
                    setMobileOpen(false);
                    await handleLogout();
                  }}
                  whileTap={{ scale: 0.96 }}
                  className="btn-ghost-neon w-full justify-center"
                >
                  Logout
                </motion.button>
              ) : (
                <MotionLink
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  whileTap={{ scale: 0.96 }}
                  className="btn-neon text-white w-full flex justify-center"
                >
                  Login / Signup
                </MotionLink>
              )}
            </div>
          </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
