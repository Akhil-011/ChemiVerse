// ============================================================
// ChemFusion AI — 3D Element Detail View
// ============================================================
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PeriodicElement } from "@/types";
import { ELEMENT_CATEGORIES } from "@/constants/periodicTableData";
import AtomViewer3D from "./AtomViewer3D";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  X,
  Atom,
  Zap,
  Thermometer,
  Droplet,
  Calendar,
  Lightbulb,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Element3DViewProps {
  element: PeriodicElement | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (element: PeriodicElement) => void;
  allElements?: PeriodicElement[];
}

export default function Element3DView({
  element,
  isOpen,
  onClose,
  onNext,
  onPrev,
  isFavorite = false,
  onToggleFavorite,
  allElements = [],
}: Element3DViewProps) {
  const [selectedTab, setSelectedTab] = useState<"properties" | "facts" | "config">("properties");
  
  if (!element) return null;

  const categoryInfo = ELEMENT_CATEGORIES[element.category];
  const currentIndex = allElements.findIndex((e) => e.atomicNumber === element.atomicNumber);

  const handleShare = () => {
    const text = `${element.name} (${element.symbol}) - Atomic Number: ${element.atomicNumber} on ChemFusion AI`;
    if (navigator.share) {
      navigator.share({ title: `${element.name}`, text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-background via-background to-muted"
          >
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-border bg-background/40 backdrop-blur-xl px-6 py-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-3xl font-bold">
                  <span style={{ color: categoryInfo.color }}>{element.symbol}</span>
                  <span className="ml-3 text-xl text-muted-foreground font-normal">
                    {element.name}
                  </span>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {categoryInfo.name} • Atomic Number {element.atomicNumber}
                </p>
              </motion.div>

              <div className="flex items-center gap-2">
                {allElements.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onPrev}
                      disabled={currentIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground min-w-12 text-center">
                      {currentIndex + 1}/{allElements.length}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onNext}
                      disabled={currentIndex === allElements.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onToggleFavorite?.(element)}
                  className={cn(
                    isFavorite && "bg-yellow-400 bg-opacity-20 border-yellow-400"
                  )}
                >
                  <Heart
                    className="w-4 h-4"
                    fill={isFavorite ? "currentColor" : "none"}
                  />
                </Button>

                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>

                <Button variant="outline" size="icon" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex gap-6 p-6">
              {/* 3D Viewer Section */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 rounded-xl overflow-hidden border border-border bg-gradient-to-br from-muted/50 to-background/50 backdrop-blur-sm"
              >
                <AtomViewer3D element={element} />
              </motion.div>

              {/* Details Section */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="w-96 flex flex-col gap-4 overflow-y-auto"
              >
                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Atomic Mass" value={element.atomicMass.toFixed(3)} />
                  <StatCard label="Density" value={`${element.density} g/cm³`} />
                  <StatCard label="Valence" value={element.valence} />
                  <StatCard
                    label="State"
                    value={element.state.charAt(0).toUpperCase() + element.state.slice(1)}
                  />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 rounded-lg bg-muted border border-border">
                  {(["properties", "config", "facts"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedTab(tab)}
                      className={cn(
                        "flex-1 py-2 px-3 rounded text-sm font-medium transition-all duration-200",
                        selectedTab === tab
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab === "properties"
                        ? "Properties"
                        : tab === "config"
                        ? "Config"
                        : "Facts"}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto space-y-3">
                  {selectedTab === "properties" && (
                    <PropertiesTab element={element} />
                  )}
                  {selectedTab === "config" && (
                    <ConfigTab element={element} />
                  )}
                  {selectedTab === "facts" && (
                    <FactsTab element={element} />
                  )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-border text-xs text-muted-foreground space-y-1">
                  <p>
                    Discovered by <strong>{element.discoverer}</strong> in{" "}
                    <strong>{element.discoveryYear}</strong>
                  </p>
                  <p>{element.naturalOccurrence}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
      <div className="text-lg font-bold text-foreground mt-1 flex items-center gap-2">
        {icon}
        {value}
      </div>
    </div>
  );
}

interface PropertiesTabProps {
  element: PeriodicElement;
}

function PropertiesTab({ element }: PropertiesTabProps) {
  const meltingPoint = formatNumberWithUnit(element.meltingPoint, "°C");
  const boilingPoint = formatNumberWithUnit(element.boilingPoint, "°C");
  const density = formatNumberWithUnit(element.density, "g/cm³");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-3"
    >
      <PropertyRow icon={<Thermometer className="w-4 h-4" />} label="Melting Point" value={meltingPoint} />
      <PropertyRow icon={<Thermometer className="w-4 h-4" />} label="Boiling Point" value={boilingPoint} />
      <PropertyRow icon={<Droplet className="w-4 h-4" />} label="Density" value={density} />

      {element.electronegativity && (
        <PropertyRow icon={<Zap className="w-4 h-4" />} label="Electronegativity" value={element.electronegativity} />
      )}

      {element.ionizationEnergy && (
        <PropertyRow icon={<Zap className="w-4 h-4" />} label="Ionization Energy" value={`${element.ionizationEnergy} kJ/mol`} />
      )}

      {element.atomicRadius && (
        <PropertyRow icon={<Atom className="w-4 h-4" />} label="Atomic Radius" value={`${element.atomicRadius} pm`} />
      )}

      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-foreground">Uses</p>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Applications</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {element.uses.slice(0, 5).map((use, idx) => {
            const UseIcon = [Atom, Zap, Droplet, Lightbulb, Thermometer][idx % 5];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="flex items-start gap-3 rounded-xl border border-border bg-background/60 p-3 shadow-sm"
              >
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <UseIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{use}</p>
                  <p className="text-[11px] text-muted-foreground">Real-world application</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

interface ConfigTabProps {
  element: PeriodicElement;
}

function ConfigTab({ element }: ConfigTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-3"
    >
      <div className="p-3 rounded-lg bg-muted border border-border">
        <p className="text-xs text-muted-foreground mb-2">Electron Configuration</p>
        <code className="text-sm font-mono text-accent break-all">
          {element.electronConfiguration}
        </code>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="p-2 rounded-lg bg-muted border border-border">
          <div className="text-xs text-muted-foreground">Period</div>
          <div className="font-bold text-foreground">{element.period}</div>
        </div>
        <div className="p-2 rounded-lg bg-muted border border-border">
          <div className="text-xs text-muted-foreground">Group</div>
          <div className="font-bold text-foreground">{element.group}</div>
        </div>
      </div>

      <div className="pt-3 border-t border-border">
        <p className="text-xs font-semibold text-foreground mb-2">Isotopes</p>
        <div className="space-y-1">
          {element.isotopes.slice(0, 3).map((isotope, idx) => (
            <div key={idx} className="text-xs text-muted-foreground">
              • {isotope}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

interface FactsTabProps {
  element: PeriodicElement;
}

function FactsTab({ element }: FactsTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground">Facts</p>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Science notes</span>
      </div>
      <div className="space-y-2">
        {element.interestingFacts.map((fact, idx) => {
          const FactIcon = [Lightbulb, Calendar, Atom, Zap, Thermometer][idx % 5];
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="flex gap-3 rounded-xl border border-border bg-background/60 p-3 shadow-sm"
            >
              <div className="rounded-lg bg-accent/10 p-2 text-accent">
                <FactIcon className="h-4 w-4" />
              </div>
              <p className="text-sm text-foreground leading-relaxed">{fact}</p>
            </motion.div>
          );
        })}

        {element.mnemonic && (
          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-xs font-semibold text-accent mb-1">Learning Tip</p>
            <p className="text-sm text-foreground italic">{element.mnemonic}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface PropertyRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function PropertyRow({ icon, label, value }: PropertyRowProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted border border-border hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function formatNumberWithUnit(value: number, unit: string): string {
  if (!Number.isFinite(value)) return "N/A";
  const rounded = Number.parseFloat(value.toFixed(2));
  return `${rounded} ${unit}`;
}
