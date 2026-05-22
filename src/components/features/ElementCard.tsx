// ============================================================
// ChemFusion AI — Periodic Table Element Card
// ============================================================
import { PeriodicElement } from "@/types";
import { ELEMENT_CATEGORIES } from "@/constants/periodicTableData";
import { cn } from "@/lib/utils";

interface ElementCardProps {
  element: PeriodicElement;
  onClick: (element: PeriodicElement) => void;
  isFavorite?: boolean;
  isHighlighted?: boolean;
}

export default function ElementCard({
  element,
  onClick,
  isFavorite = false,
  isHighlighted = false,
}: ElementCardProps) {
  const categoryInfo = ELEMENT_CATEGORIES[element.category];

  return (
    <div
      onClick={() => onClick(element)}
      className={cn(
        "relative group cursor-pointer h-full min-h-[120px] p-3 rounded-lg",
        "transition-all duration-300 transform hover:scale-105",
        "border border-transparent hover:border-opacity-100",
        "backdrop-blur-sm bg-opacity-20 hover:bg-opacity-40",
        "overflow-hidden",
        isHighlighted && "ring-2 ring-offset-2 ring-offset-background scale-105 shadow-lg"
      )}
      style={{
        backgroundColor: `rgba(${hexToRgb(categoryInfo.color)}, ${isHighlighted ? 0.3 : 0.15})`,
        borderColor: categoryInfo.color,
        ringColor: isHighlighted ? categoryInfo.color : "transparent",
      }}
    >
      {/* Animated background glow - stronger when highlighted */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-300",
          isHighlighted ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          "blur-xl"
        )}
        style={{
          backgroundColor: categoryInfo.glowColor,
        }}
      />

      {/* Favorite star */}
      {isFavorite && (
        <div className="absolute top-2 right-2 text-yellow-400 text-lg z-10">
          ★
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Atomic Number */}
        <div className="text-xs font-light text-muted-foreground mb-1">
          {element.atomicNumber}
        </div>

        {/* Element Symbol (Large and bold) */}
        <div
          className={cn(
            "font-bold mb-2 transition-all duration-300",
            isHighlighted ? "text-2xl scale-110" : "text-2xl"
          )}
          style={{ color: categoryInfo.color }}
        >
          {element.symbol}
        </div>

        {/* Element Name */}
        <div className="text-xs font-medium text-foreground line-clamp-2">
          {element.name}
        </div>

        {/* Atomic Mass */}
        <div className="text-xs text-muted-foreground mt-1">
          {element.atomicMass.toFixed(2)}
        </div>
      </div>

      {/* Bottom accent line - stronger when highlighted */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 transition-all duration-300",
          isHighlighted ? "h-1.5 opacity-100" : "h-1 opacity-0 group-hover:opacity-100"
        )}
        style={{ backgroundColor: categoryInfo.color }}
      />
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
