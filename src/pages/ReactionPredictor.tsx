// ============================================================
// ChemFusion AI — AI Reaction Predictor
// Real-time predictions using IBM RXN for Chemistry API
// ============================================================
import { useState } from "react";
import { Zap, Search, AlertCircle, ChevronRight, History, Sparkles, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { AI_PREDICTION_TEMPLATES, MOCK_PREDICTIONS } from "@/constants/chemistry";
import { getEnergyInfo, saveToStorage, loadFromStorage, generateId, formatRelativeTime } from "@/lib/utils";
import type { AIReactionPrediction } from "@/types";
import { cn } from "@/lib/utils";
import { predictReaction, parseReactionInput } from "@/services/reactionPredictionService";
import { useAuth } from "@/hooks/use-supabase";
import { safeTrackActivity } from "@/lib/activity";

const QUICK_EXAMPLES = [
  { label: "Hydrogen + Oxygen", input: "H₂ + O₂" },
  { label: "Methane combustion", input: "CH₄ + O₂" },
  { label: "Acid-base neutralization", input: "NaOH + HCl" },
  { label: "Iron rusting", input: "Fe + O₂" },
  { label: "Haber process (ammonia)", input: "N₂ + H₂" },
];

interface HistoryEntry {
  id: string;
  input: string;
  date: string;
  type: string;
}

export default function ReactionPredictor() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIReactionPrediction | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(
    () => loadFromStorage<HistoryEntry[]>("prediction_history", [])
  );
  const { user } = useAuth();

  const findPrediction = (query: string): AIReactionPrediction => {
    const lower = query.toLowerCase();
    
    // Normalize the query by replacing subscript numbers with regular numbers
    const normalized = lower.replace(/₂|₃|₄/g, (match) => {
      const map: Record<string, string> = { "₂": "2", "₃": "3", "₄": "4" };
      return map[match] || match;
    });
    
    const match = AI_PREDICTION_TEMPLATES.find((t) => {
      const templateLower = t.input.toLowerCase();
      // Normalize template too
      const templateNormalized = templateLower.replace(/₂|₃|₄/g, (match) => {
        const map: Record<string, string> = { "₂": "2", "₃": "3", "₄": "4" };
        return map[match] || match;
      });
      
      // Check if any part of the template matches the query
      return (
        templateNormalized.includes(normalized) ||
        normalized.includes(templateNormalized) ||
        templateNormalized === normalized
      );
    });
    
    if (match) {
      return { ...match, input: query };
    }
    
    // Generic fallback
    return {
      ...MOCK_PREDICTIONS.default,
      input: query,
      balancedEquation: `${query} → [Predicted Products]`,
    };
  };

  const handlePredict = async () => {
    if (!input.trim()) {
      toast.error("Please enter a reaction to predict.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Send raw input to DeepSeek (no SMILES conversion needed)
      const apiResult = await predictReaction(input.trim());
      
      // Transform API response to UI format
      const products = apiResult.products ? 
        (typeof apiResult.products === 'string' 
          ? apiResult.products.split(",").map(p => p.trim()).filter(Boolean)
          : apiResult.products) 
        : ["Products predicted"];
        
      const prediction: AIReactionPrediction = {
        input: input.trim(),
        balancedEquation: apiResult.balancedEquation || `${input.trim()} → Products`,
        products,
        reactionType: apiResult.reactionType || "Predicted",
        energyChange: apiResult.energyChange || "unknown",
        enthalpy: apiResult.enthalpy || "N/A",
        conditions: apiResult.conditions || [],
        industrialUses: apiResult.industrialUses || [],
        mechanism: apiResult.mechanism || "Mechanism details available",
        safetyNotes: apiResult.safetyNotes || ["Always verify predictions with domain experts"],
      };
      
      setResult(prediction);
      
      // Save to history
      const entry: HistoryEntry = {
        id: generateId(),
        input: input.trim(),
        date: new Date().toISOString(),
        type: "DeepSeek Prediction",
      };
      const updated = [entry, ...history].slice(0, 15);
      setHistory(updated);
      saveToStorage("prediction_history", updated);
      safeTrackActivity(user?.id, {
        eventType: "prediction",
        module: "predictor",
        title: "Reaction predicted",
        description: entry.input,
        route: "/predictor",
        payload: { input: entry.input, type: entry.type, result: prediction.balancedEquation },
      });
      
      toast.success("Prediction complete!");
    } catch (error) {
      console.error("Prediction error:", error);
      
      // Fallback to mocked prediction if API fails
      const fallback = findPrediction(input.trim());
      if (fallback && fallback.balancedEquation !== `${input.trim()} → [Predicted Products]`) {
        setResult(fallback);
        toast.warning("Using demo prediction as fallback.");
      } else {
        toast.error("Failed to predict. Try one of the demo examples.");
        setResult(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickExample = (ex: typeof QUICK_EXAMPLES[0]) => {
    setInput(ex.input);
    setResult(null);
    safeTrackActivity(user?.id, {
      eventType: "search",
      module: "predictor",
      title: "Prediction example selected",
      description: ex.input,
      route: "/predictor",
      payload: { label: ex.label, input: ex.input },
    });
  };

  const energyInfo = result ? getEnergyInfo(result.energyChange) : null;

  return (
    <div className="min-h-screen pt-4 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <span className="section-label mb-1 block">AI Reaction Predictor</span>
          <h1 className="font-display font-bold text-3xl text-foreground">
            Predict Chemical <span className="gradient-text">Reactions</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Enter any reactants and let our AI predict products, balance equations, and explain the chemistry.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-5">
          <div className="space-y-5">

            {/* Input Card */}
            <div className="glass-card p-5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-3">
                Enter Reaction
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePredict()}
                    placeholder="e.g., H₂ + O₂ or NaOH + HCl..."
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#00d4ff] text-sm font-mono"
                  />
                </div>
                <button
                  onClick={handlePredict}
                  disabled={loading}
                  className={cn("btn-neon text-white flex items-center gap-2 px-5 py-3", loading && "opacity-70 cursor-not-allowed")}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Predict
                    </>
                  )}
                </button>
              </div>

              {/* Quick examples */}
              <div className="mt-3">
                <p className="text-[10px] text-muted-foreground mb-2">Quick examples:</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_EXAMPLES.map((ex) => (
                    <button
                      key={ex.label}
                      onClick={() => handleQuickExample(ex)}
                      className="text-[10px] px-2.5 py-1 rounded-full border border-border/60 text-muted-foreground hover:text-[#00d4ff] hover:border-[rgba(0,212,255,0.3)] transition-colors"
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="glass-card p-6 space-y-3 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-[#00d4ff]" />
                  <span className="text-sm text-[#00d4ff]">AI is analyzing your reaction...</span>
                </div>
                {[80, 60, 90, 50, 70].map((w, i) => (
                  <div key={i} className="h-3 rounded-full bg-muted shimmer" style={{ width: `${w}%` }} />
                ))}
              </div>
            )}

            {/* Prediction Result */}
            {result && !loading && (
              <div className="space-y-4 animate-slide-up">
                {/* Balanced equation hero */}
                <div className="glass-card p-6 glow-border-cyan text-center">
                  <p className="section-label mb-2">Balanced Equation</p>
                  <p className="font-display font-bold text-2xl sm:text-3xl text-foreground font-mono">
                    {result.balancedEquation}
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border", energyInfo?.bg, energyInfo?.color)}>
                      {energyInfo?.icon} {energyInfo?.label}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-purple-400/30 bg-purple-400/10 text-purple-400">
                      {result.reactionType}
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Products */}
                  <div className="glass-card p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Products</h3>
                    <ul className="space-y-2">
                      {result.products.map((p) => (
                        <li key={p} className="flex items-center gap-2 text-sm text-foreground">
                          <ChevronRight size={13} className="text-emerald-400 flex-shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Energy */}
                  <div className="glass-card p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Energy Data</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Enthalpy (ΔH)</span>
                        <span className="font-mono font-semibold text-foreground">{result.enthalpy}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type</span>
                        <span className={cn("font-semibold", energyInfo?.color)}>{energyInfo?.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Conditions */}
                  <div className="glass-card p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Conditions</h3>
                    <ul className="space-y-1.5">
                      {result.conditions.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-xs text-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Industrial Uses */}
                  <div className="glass-card p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Industrial Uses</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {result.industrialUses.map((u) => (
                        <span key={u} className="atom-badge text-[10px]">{u}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mechanism */}
                <div className="glass-card p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <BookOpen size={12} />
                    Reaction Mechanism
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">{result.mechanism}</p>
                </div>

                {/* Safety */}
                <div className="glass-card p-5 border border-amber-500/20">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-1.5">
                    <AlertCircle size={12} />
                    Safety Notes
                  </h3>
                  <ul className="space-y-1.5">
                    {result.safetyNotes.map((note) => (
                      <li key={note} className="flex items-start gap-2 text-xs text-foreground">
                        <span className="text-amber-400 flex-shrink-0">⚠️</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* ── History Sidebar ───────────────────────────── */}
          <aside className="glass-card p-4 h-fit">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              <History size={12} />
              Recent Predictions
            </h2>
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No predictions yet.</p>
            ) : (
              <div className="space-y-1.5">
                {history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => { setInput(h.input); setResult(null); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-muted transition-colors"
                  >
                    <p className="text-xs font-mono text-foreground truncate">{h.input}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-purple-400">{h.type}</span>
                      <span className="text-[10px] text-muted-foreground">{formatRelativeTime(new Date(h.date))}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
