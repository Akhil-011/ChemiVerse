import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Atom, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";

import { isSupabaseConfigured, signIn, signUp } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-supabase";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const authUnavailable = !isSupabaseConfigured;

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, navigate, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (authUnavailable) {
      const message = "Authentication is unavailable in this deployment until Supabase env vars are configured.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!email.trim() || !password.trim() || (mode === "signup" && !name.trim())) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
        toast.success("Signed in successfully");
      } else {
        await signUp(email.trim(), password, name.trim());
        toast.success("Account created. Check your email if confirmation is enabled.");
      }

      navigate((location.state as { from?: string } | null)?.from || "/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Authentication failed.");
      toast.error(err?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass-card px-5 py-4 text-sm text-muted-foreground">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden px-6 py-12 sm:px-10 lg:flex lg:flex-col lg:justify-center lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_30%)]" />
          <div className="absolute inset-0 chem-grid-bg opacity-20" />

          <div className="relative z-10 max-w-xl space-y-6">
            <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2 text-sm text-foreground backdrop-blur-md">
              <Atom size={16} className="text-cyan-400" />
              ChemFusion AI
            </Link>

            <div className="space-y-4">
              <span className="section-label block">Secure access</span>
              <h1 className="font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                Sign in to your chemistry workspace
              </h1>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                Use email and password authentication with persistent Supabase sessions. Your experiments, predictions, voice commands, and lab history stay linked to your account.
              </p>
            </div>

            {authUnavailable && import.meta.env.DEV && (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Authentication is disabled in this deployment because Supabase environment variables are missing. Configure <span className="font-mono">VITE_SUPABASE_URL</span> and <span className="font-mono">VITE_SUPABASE_ANON_KEY</span> in Vercel to enable login.
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Persistent sessions",
                "Per-user activity history",
                "Protected dashboard access",
                "Sign out anytime",
              ].map((item) => (
                <div key={item} className="glass-card border border-border/50 px-4 py-3 text-sm text-foreground/90">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-12">
          <div className="w-full max-w-md">
            <div className="glass-card border border-border/60 p-6 shadow-2xl shadow-cyan-500/10 sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Account</p>
                  <h2 className="mt-1 text-2xl font-semibold text-foreground">
                    {mode === "signin" ? "Welcome back" : "Create your account"}
                  </h2>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
                  <Lock size={20} />
                </div>
              </div>

              <div className="mb-5 grid grid-cols-2 rounded-2xl border border-border/60 bg-background/60 p-1">
                <button
                  onClick={() => setMode("signin")}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-medium transition",
                    mode === "signin" ? "bg-cyan-400/15 text-cyan-200" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode("signup")}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-medium transition",
                    mode === "signup" ? "bg-cyan-400/15 text-cyan-200" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Sign Up
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <label className="block space-y-2">
                  <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Email</span>
                  <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/80 px-4 py-3 focus-within:border-cyan-400/50">
                    <Mail size={16} className="text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </label>

                {mode === "signup" && (
                  <label className="block space-y-2">
                    <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Name</span>
                    <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/80 px-4 py-3 focus-within:border-cyan-400/50">
                      <User size={16} className="text-muted-foreground" />
                      <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Your display name"
                        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </label>
                )}

                <label className="block space-y-2">
                  <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Password</span>
                  <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/80 px-4 py-3 focus-within:border-cyan-400/50">
                    <Lock size={16} className="text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                {error && <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || authUnavailable}
                  className="btn-neon flex w-full items-center justify-center gap-2 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {authUnavailable ? "Auth Unavailable" : loading ? "Processing..." : mode === "signin" ? "Sign In" : "Create Account"}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}