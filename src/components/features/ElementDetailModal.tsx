// ============================================================
// ChemFusion AI — Element Detail Modal
// ============================================================
import { useState, useEffect } from "react";
import { PeriodicElement } from "@/types";
import { ELEMENT_CATEGORIES } from "@/constants/periodicTableData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Zap,
  Thermometer,
  Droplet,
  Calendar,
  Users,
  Lightbulb,
  Atom,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ElementDetailModalProps {
  element: PeriodicElement | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (element: PeriodicElement) => void;
  allElements?: PeriodicElement[];
}

export default function ElementDetailModal({
  element,
  isOpen,
  onClose,
  onNext,
  onPrev,
  isFavorite = false,
  onToggleFavorite,
  allElements = [],
}: ElementDetailModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAtomModel, setShowAtomModel] = useState(false);

  useEffect(() => {
    if (isOpen && element) {
      setIsAnimating(true);
      setShowAtomModel(false);
      const timer = setTimeout(() => setShowAtomModel(true), 300);
      return () => clearTimeout(timer);
    }
  }, [element, isOpen]);

  if (!element) return null;

  const categoryInfo = ELEMENT_CATEGORIES[element.category];
  const currentIndex = allElements.findIndex((e) => e.atomicNumber === element.atomicNumber);

  const handleShare = () => {
    const text = `${element.name} (${element.symbol}) - Atomic Number: ${element.atomicNumber} - Join me exploring chemistry on ChemFusion AI!`;
    if (navigator.share) {
      navigator.share({
        title: `${element.name} - ChemFusion AI`,
        text,
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Element info copied to clipboard!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-background to-muted p-6">
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-2xl font-bold">{element.name}</DialogTitle>
        </DialogHeader>

        {/* Navigation Buttons */}
        {allElements.length > 0 && (
          <div className="flex gap-2 justify-between items-center absolute top-6 right-20">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="rounded-full w-10 h-10 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1} / {allElements.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={currentIndex === allElements.length - 1}
              className="rounded-full w-10 h-10 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleFavorite?.(element)}
            className={cn(
              isFavorite && "bg-yellow-400 bg-opacity-20 border-yellow-400"
            )}
          >
            <Heart className="w-4 h-4 mr-2" fill={isFavorite ? "currentColor" : "none"} />
            {isFavorite ? "Favorited" : "Add to Favorites"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Left Column - Element Symbol and Basic Info */}
          <div className="flex flex-col gap-4">
            {/* Large Symbol Display */}
            <div
              className={cn(
                "relative rounded-xl p-8 h-64 flex items-center justify-center",
                "backdrop-blur-md border-2 transition-all duration-500",
                "overflow-hidden group"
              )}
              style={{
                backgroundColor: `rgba(${hexToRgb(categoryInfo.color)}, 0.15)`,
                borderColor: categoryInfo.color,
              }}
            >
              {/* Animated background */}
              <div
                className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-500"
                )}
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, ${categoryInfo.glowColor}, transparent)`,
                }}
              />

              {/* Rotating rings (atom model animation) */}
              {showAtomModel && (
                <>
                  <div className="absolute w-32 h-32 border border-opacity-20 rounded-full animate-spin"
                    style={{
                      borderColor: categoryInfo.color,
                      animationDuration: "8s",
                    }}
                  />
                  <div className="absolute w-48 h-48 border border-opacity-10 rounded-full animate-spin"
                    style={{
                      borderColor: categoryInfo.color,
                      animationDuration: "12s",
                      animationDirection: "reverse",
                    }}
                  />
                </>
              )}

              {/* Symbol */}
              <div
                className={cn(
                  "text-7xl font-bold relative z-10 transition-all duration-500",
                  isAnimating && "scale-100"
                )}
                style={{ color: categoryInfo.color }}
              >
                {element.symbol}
              </div>
            </div>

            {/* Basic Properties */}
            <div className="grid grid-cols-2 gap-3">
              <PropertyBox label="Atomic Number" value={element.atomicNumber} />
              <PropertyBox label="Atomic Mass" value={element.atomicMass.toFixed(3)} />
              <PropertyBox label="Valence" value={element.valence} />
              <PropertyBox label="Period" value={element.period} />
              <PropertyBox label="Group" value={element.group} />
              <PropertyBox label="State" value={element.state} />
            </div>

            {/* Category Badge */}
            <div
              className="px-4 py-2 rounded-lg text-center font-medium text-sm"
              style={{
                backgroundColor: `rgba(${hexToRgb(categoryInfo.color)}, 0.2)`,
                color: categoryInfo.color,
                borderLeft: `4px solid ${categoryInfo.color}`,
              }}
            >
              {categoryInfo.name}
            </div>
          </div>

          {/* Right Column - Detailed Properties */}
          <div className="flex flex-col gap-4">
            {/* Electron Configuration */}
            <DetailSection title="Electron Configuration" icon={<Atom className="w-4 h-4" />}>
              <code className="text-sm bg-muted p-2 rounded break-all">
                {element.electronConfiguration}
              </code>
            </DetailSection>

            {/* Physical Properties */}
            <DetailSection title="Physical Properties" icon={<Thermometer className="w-4 h-4" />}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Melting Point:</span>
                  <span className="font-medium">{element.meltingPoint}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Boiling Point:</span>
                  <span className="font-medium">{element.boilingPoint}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Density:</span>
                  <span className="font-medium">{element.density} g/cm³</span>
                </div>
              </div>
            </DetailSection>

            {/* Advanced Properties */}
            {(element.electronegativity || element.ionizationEnergy) && (
              <DetailSection title="Advanced Properties" icon={<Zap className="w-4 h-4" />}>
                <div className="space-y-2 text-sm">
                  {element.electronegativity && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Electronegativity:</span>
                      <span className="font-medium">{element.electronegativity}</span>
                    </div>
                  )}
                  {element.ionizationEnergy && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ionization Energy:</span>
                      <span className="font-medium">{element.ionizationEnergy} kJ/mol</span>
                    </div>
                  )}
                  {element.atomicRadius && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Atomic Radius:</span>
                      <span className="font-medium">{element.atomicRadius} pm</span>
                    </div>
                  )}
                </div>
              </DetailSection>
            )}

            {/* Discovery Info */}
            <DetailSection title="Discovery" icon={<Calendar className="w-4 h-4" />}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Year:</span>
                  <span className="font-medium">{element.discoveryYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discoverer:</span>
                  <span className="font-medium text-right">{element.discoverer}</span>
                </div>
              </div>
            </DetailSection>
          </div>
        </div>

        {/* Full Width Sections */}
        <div className="space-y-4 py-4 border-t border-border">
          {/* Uses */}
          <DetailSection title="Common Uses" icon={<Lightbulb className="w-4 h-4" />} fullWidth>
            <div className="flex flex-wrap gap-2">
              {element.uses.map((use, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `rgba(${hexToRgb(categoryInfo.color)}, 0.2)`,
                    color: categoryInfo.color,
                  }}
                >
                  {use}
                </span>
              ))}
            </div>
          </DetailSection>

          {/* Natural Occurrence */}
          <DetailSection title="Natural Occurrence" icon={<Droplet className="w-4 h-4" />} fullWidth>
            <p className="text-sm text-foreground">{element.naturalOccurrence}</p>
          </DetailSection>

          {/* Isotopes */}
          <DetailSection title="Isotopes" icon={<Zap className="w-4 h-4" />} fullWidth>
            <div className="flex flex-wrap gap-2">
              {element.isotopes.map((isotope, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-muted border border-border"
                >
                  {isotope}
                </span>
              ))}
            </div>
          </DetailSection>

          {/* Interesting Facts */}
          <DetailSection title="Interesting Facts" icon={<Lightbulb className="w-4 h-4" />} fullWidth>
            <ul className="space-y-2">
              {element.interestingFacts.map((fact, idx) => (
                <li key={idx} className="flex gap-2 text-sm">
                  <span className="text-accent-foreground">•</span>
                  <span className="text-foreground">{fact}</span>
                </li>
              ))}
            </ul>
          </DetailSection>

          {/* Learning Mnemonic */}
          {element.mnemonic && (
            <DetailSection title="Learning Tip" icon={<Users className="w-4 h-4" />} fullWidth>
              <div className="p-3 rounded-lg bg-accent bg-opacity-10 border border-accent border-opacity-20">
                <p className="text-sm italic text-foreground">{element.mnemonic}</p>
              </div>
            </DetailSection>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper Components
interface PropertyBoxProps {
  label: string;
  value: string | number;
}

function PropertyBox({ label, value }: PropertyBoxProps) {
  return (
    <div className="p-3 rounded-lg bg-muted border border-border hover:border-primary transition-colors duration-200">
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
      <div className="text-lg font-bold text-foreground mt-1">{value}</div>
    </div>
  );
}

interface DetailSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}

function DetailSection({ title, icon, children, fullWidth }: DetailSectionProps) {
  return (
    <div className={fullWidth ? "w-full" : ""}>
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-accent">{icon}</span>}
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
      result[3],
      16
    )}`;
  }
  return "0, 0, 0";
}
