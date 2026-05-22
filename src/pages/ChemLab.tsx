import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Beaker,
  CheckCircle2,
  ChevronRight,
  Filter,
  FlaskConical,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn, generateId, getEnergyInfo, loadFromStorage, saveToStorage } from "@/lib/utils";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QuizLauncher from "@/components/features/QuizLauncher";
import { LAB_CHEMICALS, LAB_REACTIONS, LAB_CATEGORY_FILTERS, type LabFilter } from "@/lib/virtual-lab/data";
import { evaluateReaction, findBestReaction, searchChemicals } from "@/lib/virtual-lab/engine";
import type { LabBeakerItem, LabChemical, LabReactionResult } from "@/lib/virtual-lab/types";
import { useAuth } from "@/hooks/use-supabase";
import { safeTrackActivity } from "@/lib/activity";

interface ExperimentHistoryEntry {
  id: string;
  equation: string;
  reactionType: string;
  status: LabReactionResult["status"];
  date: string;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function ChemLab() {
  const [beakerItems, setBeakerItems] = useState<LabBeakerItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<LabFilter>("All");
  const [isReacting, setIsReacting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [reactionResult, setReactionResult] = useState<LabReactionResult | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [history, setHistory] = useState<ExperimentHistoryEntry[]>(() =>
    loadFromStorage<ExperimentHistoryEntry[]>("lab_history", [])
  );
  const { user } = useAuth();

  const visibleChemicals = useMemo(
    () => searchChemicals(LAB_CHEMICALS, searchTerm, activeFilter),
    [searchTerm, activeFilter]
  );

  const suggestions = useMemo(() => visibleChemicals.slice(0, 6), [visibleChemicals]);
  const beakerChemicals = useMemo(() => beakerItems.map((item) => item.chemical), [beakerItems]);
  const exactReaction = useMemo(
    () => findBestReaction(beakerChemicals, LAB_REACTIONS),
    [beakerChemicals]
  );

  const liveStatus = useMemo(() => {
    if (beakerChemicals.length < 2) {
      return {
        status: "undetermined" as const,
        label: "Add more reactants",
        tone: "text-slate-300",
        bg: "bg-slate-500/10 border-slate-500/20",
        icon: <Filter className="h-4 w-4" />,
      };
    }

    if (exactReaction) {
      return {
        status: "possible" as const,
        label: "Reaction possible",
        tone: "text-emerald-300",
        bg: "bg-emerald-500/10 border-emerald-500/20",
        icon: <CheckCircle2 className="h-4 w-4" />,
      };
    }

    const hasReactiveChemicals = beakerChemicals.some((chemical) =>
      ["Acid", "Base", "Oxidizer", "Metal"].includes(chemical.category)
    );

    return {
      status: hasReactiveChemicals ? ("undetermined" as const) : ("no-reaction" as const),
      label: hasReactiveChemicals ? "Reaction cannot be determined" : "No significant reaction",
      tone: hasReactiveChemicals ? "text-amber-300" : "text-sky-300",
      bg: hasReactiveChemicals ? "bg-amber-500/10 border-amber-500/20" : "bg-sky-500/10 border-sky-500/20",
      icon: <AlertTriangle className="h-4 w-4" />,
    };
  }, [beakerChemicals, exactReaction]);

  const displayedStatus = reactionResult?.status ?? (exactReaction ? "possible" : liveStatus.status);

  const addChemical = (chemical: LabChemical) => {
    const entry: LabBeakerItem = {
      instanceId: generateId(),
      chemical,
    };
    setBeakerItems((prev) => [...prev, entry]);
    setReactionResult(null);
    toast.success(`${chemical.name} added to the beaker`);
    safeTrackActivity(user?.id, {
      eventType: "lab_activity",
      module: "lab",
      title: "Chemical added",
      description: chemical.name,
      route: "/lab",
      payload: { chemicalId: chemical.id, name: chemical.name, formula: chemical.formula },
    });
  };

  const removeChemical = (instanceId: string) => {
    setBeakerItems((prev) => prev.filter((item) => item.instanceId !== instanceId));
    setReactionResult(null);
    safeTrackActivity(user?.id, {
      eventType: "lab_activity",
      module: "lab",
      title: "Chemical removed",
      description: instanceId,
      route: "/lab",
      payload: { instanceId },
    });
  };

  const clearBeaker = () => {
    setBeakerItems([]);
    setReactionResult(null);
    toast("Beaker cleared");
    safeTrackActivity(user?.id, {
      eventType: "lab_activity",
      module: "lab",
      title: "Beaker cleared",
      route: "/lab",
    });
  };

  const handleDragStart = (event: React.DragEvent, chemicalId: string) => {
    event.dataTransfer.setData("chemical-id", chemicalId);
    event.dataTransfer.effectAllowed = "copy";
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const chemicalId = event.dataTransfer.getData("chemical-id");
    const chemical = LAB_CHEMICALS.find((entry) => entry.id === chemicalId);
    if (chemical) {
      addChemical(chemical);
    }
  };

  const runReaction = async () => {
    const enableAiFallback = import.meta.env.VITE_LAB_AI_FALLBACK === "true";
    const result = await evaluateReaction(beakerChemicals, LAB_REACTIONS, enableAiFallback);
    setIsReacting(true);
    setReactionResult(result);
    await wait(900);
    setIsReacting(false);

    if (result.status === "possible") {
      toast.success("Reaction detected and simulated");
      const historyEntry: ExperimentHistoryEntry = {
        id: generateId(),
        equation: result.balancedEquation,
        reactionType: result.reactionType,
        status: result.status,
        date: new Date().toISOString(),
      };
      const updated = [historyEntry, ...history].slice(0, 12);
      setHistory(updated);
      saveToStorage("lab_history", updated);
      safeTrackActivity(user?.id, {
        eventType: "experiment",
        module: "lab",
        title: "Reaction simulated",
        description: result.balancedEquation,
        route: "/lab",
        payload: {
          equation: result.balancedEquation,
          reactionType: result.reactionType,
          status: result.status,
          chemicals: beakerChemicals.map((chemical) => chemical.name),
        },
      });
      return;
    }

    if (result.status === "no-reaction") {
      toast.info("No reaction possible with selected chemicals.");
      return;
    }

    toast.warning("Reaction cannot be determined.");
  };

  return (
    <div className="min-h-screen pt-4 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <span className="section-label block">Virtual Chemistry Lab</span>
            <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Dynamic <span className="gradient-text">Reaction Studio</span>
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
              Search chemicals instantly, drag them into the beaker, and run rule-based simulations that identify valid reactions,
              impossible combinations, and realistic observations.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
            <QuizLauncher
              module="lab"
              context={{
                beakerItems,
                history,
                reactionResult,
              }}
              compact
            />
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-400/35 hover:bg-cyan-400/15 xl:hidden"
            >
              <Filter className="h-4 w-4" />
              Open Chemicals
            </button>
          </div>
        </div>

        <div className="pb-2">
          <div className="grid gap-6 xl:grid-cols-[minmax(320px,360px)_minmax(0,1fr)] xl:items-start">
            <div className="hidden xl:block">
              <SidebarPanel
                visibleChemicals={visibleChemicals}
                suggestions={suggestions}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                addChemical={addChemical}
                handleDragStart={handleDragStart}
                beakerItems={beakerItems}
                totalCount={LAB_CHEMICALS.length}
                onRequestClose={() => setIsSidebarOpen(false)}
                mobile={false}
              />
            </div>

            <section className="min-w-0 space-y-5 xl:pl-2">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                "glass-card rounded-3xl border-2 border-dashed p-6 transition-all duration-300 sm:p-7",
                isDragOver ? "border-cyan-400 bg-cyan-400/5" : "border-border/60"
              )}
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Beaker className="h-5 w-5 text-cyan-300" />
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground">Virtual Beaker</h2>
                    <p className="text-xs text-muted-foreground">Unlimited reactant slots with live reaction analysis</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium", liveStatus.bg, liveStatus.tone)}>
                    {liveStatus.icon}
                    {liveStatus.label}
                  </span>
                  {beakerItems.length > 0 && (
                    <button
                      onClick={clearBeaker}
                      className="rounded-xl border border-border bg-background/60 p-2 text-muted-foreground transition hover:border-cyan-400/30 hover:text-foreground"
                      title="Clear beaker"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={runReaction}
                    className="btn-neon inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={beakerItems.length < 2 || isReacting}
                  >
                    <Zap className="h-4 w-4" />
                    {isReacting ? "Simulating..." : "Run Reaction"}
                  </button>
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)]">
                <div className="flex min-h-[520px] flex-col rounded-3xl border border-border/60 bg-background/50 p-5 sm:p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Beaker View</div>
                    <div className="text-xs text-muted-foreground">{beakerItems.length} chemicals</div>
                  </div>

                  <div className="relative flex-1 overflow-hidden rounded-[2rem] border border-cyan-400/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                    <div
                      className={cn(
                        "absolute inset-x-0 bottom-0 transition-all duration-700",
                        isReacting ? "animate-pulse" : ""
                      )}
                      style={{
                        height: `${Math.min(beakerItems.length * 7, 85)}%`,
                        background: beakerItems.length
                          ? `linear-gradient(180deg, ${beakerItems
                              .slice(0, 5)
                              .map((item) => `${item.chemical.color}cc`)
                              .join(", ")})`
                          : "linear-gradient(180deg, rgba(14,165,233,0.22), rgba(15,23,42,0.4))",
                        boxShadow: isReacting ? "0 0 30px rgba(34, 211, 238, 0.24)" : undefined,
                      }}
                    />

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_55%)]" />
                    <div className="absolute inset-x-8 bottom-0 top-8 rounded-b-[2rem] border-2 border-cyan-400/20" />

                    {isReacting && reactionResult?.status === "possible" && (
                      <div className="absolute inset-0 flex items-end justify-around pb-5">
                        {Array.from({ length: 10 }).map((_, index) => (
                          <span
                            key={index}
                            className="h-2 w-2 rounded-full bg-white/50"
                            style={{ animation: `float 1.6s ease-in-out ${index * 0.12}s infinite` }}
                          />
                        ))}
                      </div>
                    )}

                    {isReacting && reactionResult?.status !== "possible" && (
                      <div className="absolute inset-0 flex items-start justify-center pt-6">
                        <div className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-medium text-amber-200 shadow-lg shadow-amber-400/10">
                          Reaction under review
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4 max-h-36 overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-sm">
                      {beakerItems.length === 0 ? (
                        <div className="flex h-28 flex-col items-center justify-center text-center text-muted-foreground">
                          <FlaskConical className="mb-3 h-12 w-12 text-cyan-300/30" />
                          <p className="text-sm">Drag or click chemicals to start an experiment</p>
                          <p className="mt-1 text-xs">Unlimited chemicals, dynamic reactions, real observations</p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {beakerItems.map((item) => (
                            <motion.div
                              key={item.instanceId}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs text-foreground"
                            >
                              <span className="font-mono" style={{ color: item.chemical.iconColor }}>
                                {item.chemical.formula}
                              </span>
                              <button
                                onClick={() => removeChemical(item.instanceId)}
                                className="text-muted-foreground transition hover:text-red-300"
                                title="Remove chemical"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 xl:pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass-card rounded-2xl border border-border/60 p-3">
                      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Reactants</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{beakerItems.length}</p>
                    </div>
                    <div className="glass-card rounded-2xl border border-border/60 p-3">
                      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Database matches</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{visibleChemicals.length}</p>
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl border border-border/60 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">Reaction Status</h3>
                      <span className={cn("rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.25em]", liveStatus.bg, liveStatus.tone)}>
                        {liveStatus.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reactionResult?.title ?? liveStatus.label}
                    </p>
                    <div className="mt-3 rounded-2xl border border-border/60 bg-background/50 p-3 text-xs text-muted-foreground">
                      {reactionResult?.reason ?? "Add reactants to see a live rule-based determination of the mixture."}
                    </div>
                  </div>

                  <AnimatePresence>
                    {(reactionResult || exactReaction) && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        className="glass-card rounded-3xl border border-cyan-400/20 p-4"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                              <h3 className="font-semibold text-foreground">Reaction Result</h3>
                            </div>
                            <p className="font-mono text-sm text-cyan-200">{reactionResult?.balancedEquation || exactReaction?.balancedEquation}</p>
                          </div>
                          <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", getEnergyInfo((reactionResult?.energy || exactReaction?.energy || "Neutral").toLowerCase()).bg, getEnergyInfo((reactionResult?.energy || exactReaction?.energy || "Neutral").toLowerCase()).color)}>
                            {getEnergyInfo((reactionResult?.energy || exactReaction?.energy || "Neutral").toLowerCase()).icon} {(reactionResult?.energy || exactReaction?.energy || "Neutral")}
                          </span>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <InfoTile label="Reaction Type" value={reactionResult?.reactionType || exactReaction?.type || "Unknown"} />
                          <InfoTile label="Classification" value={displayedStatus === "possible" ? "Reaction Possible" : displayedStatus === "no-reaction" ? "No Significant Reaction" : "Undetermined"} />
                          <InfoTile label="Gas Evolution" value={reactionResult?.gas || exactReaction?.gas || "None"} />
                          <InfoTile label="Precipitate" value={reactionResult?.precipitate || exactReaction?.precipitate || "None"} />
                          <InfoTile label="Temperature" value={reactionResult?.temperatureChange || exactReaction?.temperatureChange || "Stable"} />
                          <InfoTile label="Color Change" value={reactionResult?.colorChange || exactReaction?.colorChange || "No major change"} />
                        </div>

                        <div className="mt-4 space-y-3">
                          <SectionHeading label="Reactants" />
                          <ChipList items={beakerChemicals.map((chemical) => `${chemical.formula} • ${chemical.name}`)} accent="cyan" />

                          <SectionHeading label="Products" />
                          <ChipList items={reactionResult?.products || exactReaction?.products || []} accent="emerald" />

                          <SectionHeading label="Observations" />
                          <CardList items={reactionResult?.observations || exactReaction?.observations || []} icon={<Sparkles className="h-4 w-4" />} />

                          <SectionHeading label="Safety Warnings" />
                          <CardList items={reactionResult?.safetyWarnings || exactReaction?.safetyWarnings || []} icon={<AlertTriangle className="h-4 w-4" />} tone="warning" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="glass-card rounded-3xl border border-border/60 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-cyan-300" />
                  <h3 className="text-sm font-semibold text-foreground">Recent Experiments</h3>
                </div>
                <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No reactions run yet.</p>
                  ) : (
                    history.map((entry) => (
                      <div key={entry.id} className="rounded-2xl border border-border/60 bg-background/50 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-mono text-sm text-foreground">{entry.equation}</p>
                          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                            {entry.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{entry.reactionType}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            </section>
          </div>
        </div>

        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="w-[92vw] max-w-sm border-border/60 bg-background p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Chemical Database</SheetTitle>
              <SheetDescription>Search and filter chemicals in the virtual lab drawer.</SheetDescription>
            </SheetHeader>
            <SidebarPanel
              visibleChemicals={visibleChemicals}
              suggestions={suggestions}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              addChemical={addChemical}
              handleDragStart={handleDragStart}
              beakerItems={beakerItems}
              totalCount={LAB_CHEMICALS.length}
              onRequestClose={() => setIsSidebarOpen(false)}
              mobile
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

function SidebarPanel({
  visibleChemicals,
  suggestions,
  searchTerm,
  setSearchTerm,
  activeFilter,
  setActiveFilter,
  addChemical,
  handleDragStart,
  beakerItems,
  totalCount,
  onRequestClose,
  mobile,
}: {
  visibleChemicals: LabChemical[];
  suggestions: LabChemical[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  activeFilter: LabFilter;
  setActiveFilter: (filter: LabFilter) => void;
  addChemical: (chemical: LabChemical) => void;
  handleDragStart: (event: React.DragEvent, chemicalId: string) => void;
  beakerItems: LabBeakerItem[];
  totalCount: number;
  onRequestClose?: () => void;
  mobile?: boolean;
}) {
  return (
    <aside className={cn(
      "glass-card flex h-full flex-col overflow-hidden border border-border/60",
      mobile ? "min-h-screen rounded-none p-4" : "min-h-[calc(100vh-2rem)] rounded-3xl p-4 xl:sticky xl:top-4"
    )}>
      <div className="flex items-center justify-between gap-3 pb-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Chemical Database</h2>
          <p className="mt-1 text-xs text-muted-foreground">{visibleChemicals.length} chemicals available</p>
        </div>
        <div className="rounded-full border border-border/70 bg-muted px-3 py-1 text-[11px] text-muted-foreground">
          {totalCount} total
        </div>
      </div>

      <div className="sticky top-0 z-10 space-y-3 border-b border-border/60 bg-background/95 pb-4 backdrop-blur-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search chemicals..."
            className="w-full rounded-2xl border border-border bg-background/80 py-3 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
          />
        </div>

        {searchTerm.trim() && (
          <div className="space-y-2 rounded-2xl border border-border bg-background/50 p-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Suggestions
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((chemical) => (
                <button
                  key={chemical.id}
                  onClick={() => setSearchTerm(chemical.name)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-foreground transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
                >
                  {chemical.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 rounded-2xl border border-border bg-background/50 p-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Categories
          </div>
          <Select value={activeFilter} onValueChange={(value) => setActiveFilter(value as LabFilter)}>
            <SelectTrigger className="h-11 w-full rounded-2xl border-border bg-background/80 text-sm text-foreground shadow-none transition focus:ring-1 focus:ring-cyan-400/30">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="border-border bg-background/98 text-foreground shadow-[0_20px_45px_rgba(0,0,0,0.45)] backdrop-blur-md">
              {LAB_CATEGORY_FILTERS.map((filter) => (
                <SelectItem key={filter} value={filter}>
                  {filter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto pr-1">
        <div className="space-y-2">
          <AnimatePresence>
            {visibleChemicals.map((chemical) => {
              const isInBeaker = beakerItems.some((item) => item.chemical.id === chemical.id);
              return (
                <motion.div
                  key={chemical.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={cn(
                    "group rounded-2xl border p-3 transition-all duration-200",
                    isInBeaker
                      ? "border-cyan-400/30 bg-cyan-400/8 opacity-70"
                      : "border-border/60 bg-background/55 hover:border-cyan-400/35 hover:bg-background/80 hover:shadow-[0_0_24px_rgba(34,211,238,0.08)]"
                  )}
                >
                  <button
                    draggable
                    onDragStart={(event) => handleDragStart(event, chemical.id)}
                    onClick={() => {
                      addChemical(chemical);
                      onRequestClose?.();
                    }}
                    title={`${chemical.name} (${chemical.formula}) - ${chemical.category}`}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 h-8 w-8 flex-shrink-0 rounded-xl border transition-transform duration-200 group-hover:scale-105"
                        style={{ backgroundColor: `${chemical.color}22`, borderColor: chemical.iconColor, boxShadow: `0 0 0 1px ${chemical.iconColor}25` }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="truncate text-sm font-semibold text-foreground">{chemical.name}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">{chemical.formula}</p>
                          </div>
                          <span className="rounded-full border border-border bg-muted/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                            {chemical.physicalState}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {chemical.reactivityTags.slice(0, 2).map((tag) => (
                            <span key={tag} className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-2">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{chemical.category}</span>
                    <button
                      onClick={() => {
                        addChemical(chemical);
                        onRequestClose?.();
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100 transition hover:bg-cyan-400/15"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

    </aside>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Lab data</span>
    </div>
  );
}

function ChipList({ items, accent }: { items: string[]; accent: "cyan" | "emerald" }) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">No data available.</p>;
  }

  const accentClasses = accent === "cyan"
    ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
    : "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <motion.span
          key={item}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("rounded-full border px-3 py-1 text-xs", accentClasses)}
        >
          {item}
        </motion.span>
      ))}
    </div>
  );
}

function CardList({
  items,
  icon,
  tone = "default",
}: {
  items: string[];
  icon: React.ReactNode;
  tone?: "default" | "warning";
}) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">No data available.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item}
          className={cn(
            "flex gap-3 rounded-2xl border p-3 text-sm",
            tone === "warning"
              ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
              : "border-border/60 bg-background/60 text-foreground"
          )}
        >
          <div className={cn("mt-0.5", tone === "warning" ? "text-amber-300" : "text-cyan-300")}>{icon}</div>
          <p>{item}</p>
        </div>
      ))}
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/50 p-3">
      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/50 p-3">
      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
