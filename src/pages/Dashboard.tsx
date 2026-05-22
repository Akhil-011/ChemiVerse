// ============================================================
// ChemFusion AI — Dashboard
// Recent activity, saved experiments, prediction history
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Atom, FlaskConical, Zap, Bot,
  Clock, Trash2, ArrowRight, TrendingUp, BookOpen,
  Star, Activity
} from "lucide-react";
import { toast } from "sonner";

import { MOLECULES } from "@/constants/chemistry";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-supabase";
import { supabase } from "@/lib/supabase";
import { formatRelativeTime } from "@/lib/utils";
import QuizLauncher from "@/components/features/QuizLauncher";
import { loadQuizHistory, type QuizAttemptSummary } from "@/lib/quizSystem";
import { cardVariants, itemVariants, listVariants, sectionVariants } from "@/lib/animationVariants";
import { cardTransition, pageTransition, springTapTransition } from "@/lib/motionPresets";

const MotionLink = motion.create(Link);

interface ActivityEvent {
  id: string;
  user_id: string;
  event_type: string;
  module: string | null;
  title: string;
  description: string | null;
  route: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

const STAT_CARDS = [
  {
    label: "Molecules Viewed",
    icon: <Atom size={18} />,
    key: "recent_molecules",
    color: "from-cyan-500 to-blue-600",
    href: "/molecules",
  },
  {
    label: "Predictions Made",
    icon: <Zap size={18} />,
    key: "prediction_history",
    color: "from-purple-500 to-violet-600",
    href: "/predictor",
  },
  {
    label: "Experiments Run",
    icon: <FlaskConical size={18} />,
    key: "experiment_history",
    color: "from-emerald-500 to-teal-600",
    href: "/lab",
  },
];

const QUICK_ACTIONS = [
  { label: "3D Molecules", icon: <Atom size={16} />, href: "/molecules", color: "from-cyan-500 to-blue-600" },
  { label: "Virtual Lab", icon: <FlaskConical size={16} />, href: "/lab", color: "from-purple-500 to-pink-600" },
  { label: "AI Predictor", icon: <Zap size={16} />, href: "/predictor", color: "from-emerald-500 to-teal-600" },
  { label: "AI Tutor", icon: <Bot size={16} />, href: "/tutor", color: "from-orange-500 to-amber-600" },
];

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizAttemptSummary[]>(() => loadQuizHistory());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadActivities = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("user_activity_events")
        .select("id,user_id,event_type,module,title,description,route,payload,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setActivities([]);
      } else {
        setActivities((data ?? []) as ActivityEvent[]);
      }

      setLoading(false);
    };

    void loadActivities();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const { recentMolecules, predictions, experiments, labActivities, voiceCommands, moduleOpens } = useMemo(() => {
    const moleculeIds = new Set<string>();
    const predictionRows: ActivityEvent[] = [];
    const experimentRows: ActivityEvent[] = [];
    const labRows: ActivityEvent[] = [];
    const voiceRows: ActivityEvent[] = [];
    const moduleRows: ActivityEvent[] = [];

    for (const activity of activities) {
      const moduleName = activity.module ?? "";

      if (activity.event_type === "molecule_view") {
        const moleculeId = (activity.payload?.moleculeId as string | undefined) || "";
        if (moleculeId) moleculeIds.add(moleculeId);
      }

      if (activity.event_type === "prediction") predictionRows.push(activity);
      if (activity.event_type === "experiment") experimentRows.push(activity);
      if (activity.event_type === "lab_activity") labRows.push(activity);
      if (activity.event_type === "voice_command") voiceRows.push(activity);
      if (activity.event_type === "page_view" || activity.event_type === "module_open") moduleRows.push(activity);

      if (moduleName === "lab" && activity.event_type !== "module_open") {
        labRows.push(activity);
      }
    }

    return {
      recentMolecules: Array.from(moleculeIds),
      predictions: predictionRows,
      experiments: experimentRows,
      labActivities: labRows,
      voiceCommands: voiceRows,
      moduleOpens: moduleRows,
    };
  }, [activities]);

  const viewedMolecules = recentMolecules
    .map((id) => MOLECULES.find((m) => m.id === id))
    .filter(Boolean);

  const quizContext = useMemo(
    () => ({
      viewedMolecules: viewedMolecules.filter(Boolean) as (typeof MOLECULES)[number][],
    }),
    [viewedMolecules]
  );

  const recentQuizAttempts = useMemo(() => quizHistory.slice(0, 5), [quizHistory]);

  const totalActivity = activities.length;

  const handleClearHistory = async (scope: "predictions" | "experiments") => {
    if (!user) return;

    const eventTypes = scope === "predictions" ? ["prediction"] : ["experiment", "lab_activity"];

    const { error: deleteError } = await supabase
      .from("user_activity_events")
      .delete()
      .eq("user_id", user.id)
      .in("event_type", eventTypes);

    if (deleteError) {
      toast.error(deleteError.message);
      return;
    }

    toast.success("History cleared");
    setActivities((prev) => prev.filter((activity) => !eventTypes.includes(activity.event_type)));
  };

  return (
    <div className="min-h-screen pt-4 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <span className="section-label mb-1 block">Research Dashboard</span>
          <h1 className="font-display font-bold text-3xl text-foreground">
            Your Chemistry <span className="gradient-text">Journey</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Track your experiments, predictions, and learning progress.</p>
        </div>

        {/* ── Stat Cards ───────────────────────────────────── */}
          <motion.div className="grid sm:grid-cols-3 gap-4 mb-6" variants={listVariants} initial="initial" animate="animate">
          {STAT_CARDS.map((card) => {
            const count =
              card.key === "recent_molecules"
                ? recentMolecules.length
                : card.key === "prediction_history"
                  ? predictions.length
                  : experiments.length;
            return (
              <MotionLink key={card.key} to={card.href} className="glass-card-hover p-5 flex items-center gap-4" variants={cardVariants} whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.96 }} transition={springTapTransition}>
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br text-white", card.color)}>
                  {card.icon}
                </div>
                <div>
                  <p className="font-display font-bold text-2xl text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </div>
                <ArrowRight size={14} className="ml-auto text-muted-foreground" />
              </MotionLink>
            );
          })}
          </motion.div>

        {/* ── Activity Overview ─────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          {/* Total Activity */}
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600 text-white">
              <Activity size={18} />
            </div>
            <div>
              <p className="font-display font-bold text-2xl text-foreground">{totalActivity}</p>
              <p className="text-xs text-muted-foreground">Total Activities</p>
            </div>
          </div>

          {/* Streak */}
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <Star size={18} />
            </div>
            <div>
              <p className="font-display font-bold text-2xl text-foreground">1</p>
              <p className="text-xs text-muted-foreground">Day Streak 🔥</p>
            </div>
          </div>

          {/* Level */}
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="font-display font-bold text-2xl text-foreground">{voiceCommands.length > 10 ? "Advanced" : voiceCommands.length > 3 ? "Intermediate" : "Beginner"}</p>
              <p className="text-xs text-muted-foreground">Chemistry Level</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_1fr_280px] gap-5">

          {/* ── Prediction History ───────────────────────── */}
          <motion.div className="glass-card p-5" variants={itemVariants} transition={cardTransition} whileHover={{ y: -3 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
                <Zap size={14} className="text-purple-400" />
                AI Predictions
              </h2>
              {predictions.length > 0 && (
                <button onClick={() => void handleClearHistory("predictions")} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            {predictions.length === 0 ? (
              <div className="text-center py-8">
                <Zap size={28} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No predictions yet.</p>
                <Link to="/predictor" className="text-xs text-[#00d4ff] hover:underline mt-1 inline-block">
                  Try the predictor →
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {predictions.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <p className="text-xs font-mono text-foreground truncate">{p.input}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-purple-400">{p.type}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock size={9} />
                        {formatRelativeTime(new Date(p.date))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Experiment History ───────────────────────── */}
          <motion.div className="glass-card p-5" variants={itemVariants} transition={cardTransition} whileHover={{ y: -3 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
                <FlaskConical size={14} className="text-emerald-400" />
                Experiments
              </h2>
              {experiments.length > 0 && (
                <button onClick={() => void handleClearHistory("experiments")} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            {experiments.length === 0 ? (
              <div className="text-center py-8">
                <FlaskConical size={28} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No experiments yet.</p>
                <Link to="/lab" className="text-xs text-[#00d4ff] hover:underline mt-1 inline-block">
                  Open Virtual Lab →
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {experiments.map((e) => (
                  <div key={e.id} className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <p className="text-xs text-foreground truncate font-mono">{e.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock size={9} />
                      {formatRelativeTime(new Date(e.date))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Right Column ─────────────────────────────── */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <motion.div className="glass-card p-4" variants={itemVariants} transition={cardTransition} whileHover={{ y: -2 }}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Quick Access</h2>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <MotionLink
                    key={action.label}
                    to={action.href}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border/40 hover:border-[rgba(0,212,255,0.3)] hover:bg-muted transition-all group"
                  >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br text-white", action.color)}>
                      {action.icon}
                    </div>
                    <span className="text-[10px] text-muted-foreground group-hover:text-foreground text-center leading-tight">{action.label}</span>
                  </MotionLink>
                ))}
              </div>
            </motion.div>

            {/* Chemistry Quiz */}
            <div className="glass-card p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Chemistry Quiz</h2>
                  <p className="text-xs text-muted-foreground">Timed, topic-aware practice with saved results.</p>
                </div>
                <QuizLauncher
                  module="dashboard"
                  context={quizContext}
                  compact
                  onCompleted={() => setQuizHistory(loadQuizHistory())}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="rounded-xl border border-border/40 bg-muted/30 p-3">
                  <p className="uppercase tracking-[0.25em]">Topics</p>
                  <p className="mt-1 text-foreground">Mixed + topic-wise</p>
                </div>
                <div className="rounded-xl border border-border/40 bg-muted/30 p-3">
                  <p className="uppercase tracking-[0.25em]">History</p>
                  <p className="mt-1 text-foreground">{quizHistory.length} attempts</p>
                </div>
              </div>

              <div className="space-y-2">
                {recentQuizAttempts.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No quiz attempts yet.</p>
                ) : (
                  recentQuizAttempts.map((attempt) => (
                    <div key={attempt.id} className="rounded-xl border border-border/40 bg-muted/20 p-3 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-foreground">{attempt.title}</span>
                        <span className="text-muted-foreground">{attempt.accuracy}%</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-muted-foreground">
                        <span>{attempt.score}/{attempt.totalQuestions}</span>
                        <span>{formatRelativeTime(new Date(attempt.completedAt))}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recently Viewed Molecules */}
            <motion.div className="glass-card p-4" variants={itemVariants} transition={cardTransition} whileHover={{ y: -2 }}>
              <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                <BookOpen size={11} />
                Recent Molecules
              </h2>
              {viewedMolecules.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">None yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {viewedMolecules.slice(0, 5).map((mol) => mol && (
                    <Link
                      key={mol.id}
                      to={`/molecules/${mol.id}`}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: mol.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{mol.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{mol.formula}</p>
                      </div>
                      <ArrowRight size={10} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
