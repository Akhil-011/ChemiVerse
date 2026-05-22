// ============================================================
// ChemFusion AI — 3D Molecule Viewer Page
// ============================================================
import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Atom, RotateCw, ZoomIn, Eye, EyeOff, Info,
  Thermometer, Layers, Tag, ChevronRight, Zap, Search, Loader2
} from "lucide-react";
import { toast } from "sonner";
import MoleculeScene from "@/components/features/MoleculeScene";
import PubChemViewer from "@/components/features/PubChemViewer";
import QuizLauncher from "@/components/features/QuizLauncher";
import { MOLECULES } from "@/constants/chemistry";
import { saveToStorage, loadFromStorage } from "@/lib/utils";
import { useAuth } from "@/hooks/use-supabase";
import { safeTrackActivity } from "@/lib/activity";

const BOND_TYPE_COLORS: Record<string, string> = {
  single: "text-gray-400",
  double: "text-cyan-400",
  triple: "text-purple-400",
  aromatic: "text-orange-400",
};

export default function MoleculeViewer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const initial = MOLECULES.find((m) => m.id === id) ?? MOLECULES[0];
  const [selected, setSelected] = useState(initial);
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeTab, setActiveTab] = useState<"atoms" | "bonds" | "properties">("atoms");
  const [viewerType, setViewerType] = useState<"react3f" | "3dmol">("react3f");
  
  // Search feature state
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { user } = useAuth();

  const quizContext = useMemo(
    () => ({
      selectedMolecule: selected,
      recentMolecules: loadFromStorage<string[]>("recent_molecules", [])
        .map((moleculeId) => MOLECULES.find((entry) => entry.id === moleculeId))
        .filter(Boolean) as (typeof MOLECULES)[number][],
    }),
    [selected]
  );

  const handleSelect = useCallback((m: typeof MOLECULES[0]) => {
    setSelected(m);
    navigate(`/molecules/${m.id}`, { replace: true });
    // Save to recent activity
    const recent = loadFromStorage<string[]>("recent_molecules", []);
    const updated = [m.id, ...recent.filter((r) => r !== m.id)].slice(0, 10);
    saveToStorage("recent_molecules", updated);
    safeTrackActivity(user?.id, {
      eventType: "molecule_view",
      module: "molecules",
      title: `Viewed ${m.name}`,
      description: m.formula,
      route: `/molecules/${m.id}`,
      payload: { moleculeId: m.id, name: m.name, formula: m.formula, category: m.category },
    });
    toast.success(`Loaded ${m.name} (${m.formula})`);
  }, [navigate]);

  const handleMoleculeSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const query = searchInput.trim();
    if (!query) {
      setSearchError("Please enter a molecule name");
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      console.log(`[MoleculeSearch] Searching for: ${query}`);
      
      // Try to find in existing molecules first
      const existingMol = MOLECULES.find(
        (m) => m.name.toLowerCase() === query.toLowerCase() || 
               m.formula.toLowerCase() === query.toLowerCase()
      );

      if (existingMol) {
        handleSelect(existingMol);
        setSearchInput("");
        toast.success(`Found ${existingMol.name} in database`);
        safeTrackActivity(user?.id, {
          eventType: "search",
          module: "molecules",
          title: "Molecule search",
          description: query,
          route: "/molecules",
          payload: { query, result: existingMol.name, source: "local" },
        });
      } else {
        // Fetch from PubChem to validate the molecule exists
        const response = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/property/MolecularWeight,MolecularFormula,Title/JSON`
        );

        if (!response.ok) {
          throw new Error(`Molecule "${query}" not found in PubChem`);
        }

        const data = await response.json();
        if (!data.properties || data.properties.length === 0) {
          throw new Error(`No results for "${query}"`);
        }

        const mol = data.properties[0];
        const moleculeName = mol.Title || query;
        const formula = mol.MolecularFormula || "Unknown";
        const molarMass = mol.MolecularWeight ? Math.round(mol.MolecularWeight * 100) / 100 : 0;

        // Create a virtual molecule object for the viewer
        const customMol = {
          id: `search_${Date.now()}`,
          name: moleculeName,
          formula: formula,
          description: `Molecule fetched from PubChem: ${moleculeName}`,
          color: "#00d4ff",
          category: "Custom" as const,
          molarMass: molarMass,
          boilingPoint: "N/A",
          meltingPoint: "N/A",
          properties: ["From PubChem API"],
          atoms: [],
          bonds: [],
        };

        setSelected(customMol);
        setViewerType("3dmol"); // Switch to 3Dmol for better PubChem visualization
        setSearchInput("");
        toast.success(`Loaded ${moleculeName} from PubChem`);
        console.log(`[MoleculeSearch] Successfully loaded: ${moleculeName}`);
        safeTrackActivity(user?.id, {
          eventType: "search",
          module: "molecules",
          title: "Molecule search",
          description: query,
          route: "/molecules",
          payload: { query, result: moleculeName, source: "pubchem" },
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || "Failed to search molecule";
      setSearchError(errorMsg);
      console.error("[MoleculeSearch] Error:", errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSearching(false);
    }
  }, [searchInput, handleSelect, user?.id]);

  return (
    <div className="min-h-screen pt-4 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <span className="section-label mb-1 block">3D Molecule Viewer</span>
          <h1 className="font-display font-bold text-3xl text-foreground">
            Interactive Molecular <span className="gradient-text">Visualization</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr_280px] gap-5">

          {/* ── Molecule Selector ──────────────────────────── */}
          <aside className="glass-card p-4 h-fit lg:sticky lg:top-24">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Select Molecule
            </h2>

            {/* Search Section */}
            <form onSubmit={handleMoleculeSearch} className="mb-4 pb-4 border-b border-slate-700/50 space-y-2">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setSearchError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleMoleculeSearch();
                    }
                  }}
                  placeholder="Search molecule..."
                  className="flex-1 px-2.5 py-2 rounded-lg bg-muted/40 border border-slate-700/30 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:bg-muted/60 transition-colors"
                  disabled={isSearching}
                />
                <button
                  type="submit"
                  onClick={() => handleMoleculeSearch()}
                  disabled={isSearching}
                  className="px-2.5 py-2 rounded-lg bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  title="Search for molecule"
                >
                  {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                </button>
              </div>
              {searchError && (
                <div className="text-[10px] text-red-400/80 px-2 py-1 rounded bg-red-500/10 border border-red-500/20">
                  {searchError}
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">
                Search any molecule name or formula
              </p>
            </form>

            <div className="space-y-1.5">
              {MOLECULES.map((mol) => (
                <button
                  key={mol.id}
                  onClick={() => handleSelect(mol)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all duration-200 group ${
                    selected.id === mol.id
                      ? "border-[rgba(0,212,255,0.4)] bg-[rgba(0,212,255,0.07)] text-[#00d4ff]"
                      : "border-transparent hover:bg-muted text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{mol.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{mol.formula}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: mol.color }}
                      />
                      <ChevronRight size={12} className="text-muted-foreground group-hover:text-foreground" />
                    </div>
                  </div>
                  <div className="mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {mol.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* ── 3D Viewer ─────────────────────────────────── */}
          <div className="space-y-4">
            {/* Controls toolbar */}
            <div className="glass-card px-4 py-2.5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Atom size={16} className="text-[#00d4ff]" />
                <span className="font-display font-semibold text-foreground">{selected.name}</span>
                <span className="text-muted-foreground font-mono text-sm">({selected.formula})</span>
                <span
                  className="atom-badge text-[10px]"
                  style={{ color: selected.color, borderColor: `${selected.color}40`, background: `${selected.color}12` }}
                >
                  {selected.category}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {viewerType === "react3f" && (
                  <>
                    <button
                      onClick={() => setShowLabels(!showLabels)}
                      title="Toggle labels"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${showLabels ? "bg-[rgba(0,212,255,0.12)] text-[#00d4ff]" : "hover:bg-muted text-muted-foreground"}`}
                    >
                      {showLabels ? <Eye size={13} /> : <EyeOff size={13} />}
                      Labels
                    </button>
                    <button
                      onClick={() => setAutoRotate(!autoRotate)}
                      title="Toggle rotation"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${autoRotate ? "bg-[rgba(0,212,255,0.12)] text-[#00d4ff]" : "hover:bg-muted text-muted-foreground"}`}
                    >
                      <RotateCw size={13} className={autoRotate ? "animate-spin-slow" : ""} />
                      Rotate
                    </button>
                  </>
                )}
                <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-700/50">
                  <QuizLauncher module="molecules" context={quizContext} compact />
                  <button
                    onClick={() => setViewerType("react3f")}
                    title="Switch to React Three Fiber viewer"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${viewerType === "react3f" ? "bg-purple-600/20 text-purple-300" : "hover:bg-muted text-muted-foreground"}`}
                  >
                    <Zap size={13} />
                    R3F
                  </button>
                  <button
                    onClick={() => setViewerType("3dmol")}
                    title="Switch to 3Dmol interactive viewer"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${viewerType === "3dmol" ? "bg-cyan-600/20 text-cyan-300" : "hover:bg-muted text-muted-foreground"}`}
                  >
                    <Zap size={13} />
                    3Dmol
                  </button>
                </div>
              </div>
            </div>

            {/* 3D Canvas */}
            <div className="glass-card overflow-hidden" style={{ background: "rgba(5,10,20,0.6)" }}>
              {viewerType === "react3f" ? (
                <MoleculeScene
                  molecule={selected}
                  showLabels={showLabels}
                  autoRotate={autoRotate}
                  height="500px"
                />
              ) : (
                <PubChemViewer
                  moleculeName={selected.name}
                  height="500px"
                  autoSpin={true}
                />
              )}
            </div>

            {/* Hint */}
            <p className="text-center text-xs text-muted-foreground">
              <ZoomIn size={12} className="inline mr-1" />
              {viewerType === "react3f" 
                ? "Scroll to zoom · Click & drag to rotate · Right-click to pan" 
                : "Scroll to zoom · Drag to rotate · Right-click to pan"}
            </p>
          </div>

          {/* ── Info Panel ────────────────────────────────── */}
          <aside className="space-y-4">
            {/* Tabs */}
            <div className="glass-card p-1 flex gap-1">
              {(["atoms", "bonds", "properties"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? "bg-[rgba(0,212,255,0.12)] text-[#00d4ff]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Atoms Tab */}
            {activeTab === "atoms" && (
              <div className="glass-card p-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Atoms ({selected.atoms.length})
                </h3>
                {selected.atoms.map((atom) => (
                  <div key={atom.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: atom.color, color: atom.color === "#ffffff" || atom.color === "#e0e0e0" ? "#000" : "#fff" }}
                    >
                      {atom.symbol}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{atom.element}</p>
                      <p className="text-[10px] text-muted-foreground">
                        #{atom.atomicNumber} · Z={atom.position.map(n => n.toFixed(1)).join(",")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bonds Tab */}
            {activeTab === "bonds" && (
              <div className="glass-card p-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Bonds ({selected.bonds.length})
                </h3>
                {selected.bonds.map((bond, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/30 text-xs">
                    <Layers size={13} className="text-muted-foreground flex-shrink-0" />
                    <span className="font-mono text-foreground">
                      {bond.from} — {bond.to}
                    </span>
                    <span className={`ml-auto capitalize font-semibold ${BOND_TYPE_COLORS[bond.type]}`}>
                      {bond.type}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Properties Tab */}
            {activeTab === "properties" && (
              <div className="glass-card p-4 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Properties
                </h3>
                <div className="space-y-2.5 text-xs">
                  {[
                    { label: "Molar Mass", value: `${selected.molarMass} g/mol`, icon: <Tag size={12} /> },
                    { label: "Boiling Point", value: selected.boilingPoint, icon: <Thermometer size={12} /> },
                    { label: "Melting Point", value: selected.meltingPoint, icon: <Thermometer size={12} /> },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        {icon} {label}
                      </span>
                      <span className="font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-1">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Info size={11} /> Key Properties
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.properties.map((p) => (
                      <span key={p} className="atom-badge text-[10px]">{p}</span>
                    ))}
                  </div>
                </div>

                <div className="pt-1">
                  <p className="text-xs text-muted-foreground mb-2">Description</p>
                  <p className="text-xs text-foreground leading-relaxed">{selected.description}</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
