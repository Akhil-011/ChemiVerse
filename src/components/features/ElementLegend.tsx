// ============================================================
// ChemFusion AI — Periodic Table Legend
// ============================================================
import { ELEMENT_CATEGORIES, ElementCategory } from "@/constants/periodicTableData";
import { cn } from "@/lib/utils";

interface ElementLegendProps {
  onCategoryClick?: (category: ElementCategory) => void;
  selectedCategory?: ElementCategory | null;
}

export default function ElementLegend({
  onCategoryClick,
  selectedCategory,
}: ElementLegendProps) {
  const categories = Object.entries(ELEMENT_CATEGORIES) as [
    ElementCategory,
    (typeof ELEMENT_CATEGORIES)[ElementCategory]
  ][];

  return (
    <div className="w-full">
      {/* Legend Title */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Element Categories
        </h2>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map(([key, category]) => (
            <button
              key={key}
              onClick={() => onCategoryClick?.(key)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                "transition-all duration-300 transform hover:scale-105",
                "border border-transparent hover:border-opacity-100",
                "backdrop-blur-sm bg-opacity-20 hover:bg-opacity-40",
                "group cursor-pointer",
                selectedCategory === key && "ring-2 ring-offset-2 ring-offset-background"
              )}
              style={{
                backgroundColor: `rgba(${hexToRgb(category.color)}, 0.1)`,
                borderColor: category.color,
                ringColor: selectedCategory === key ? category.color : "transparent",
              }}
            >
              {/* Color Indicator */}
              <div
                className={cn(
                  "w-4 h-4 rounded-full transition-all duration-300",
                  "group-hover:shadow-lg group-hover:scale-125"
                )}
                style={{
                  backgroundColor: category.color,
                  boxShadow: selectedCategory === key 
                    ? `0 0 12px ${category.color}` 
                    : "none",
                }}
              />

              {/* Category Name */}
              <span className="text-sm font-medium text-foreground line-clamp-2">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Legend Info */}
      <div className="mt-6 p-4 rounded-lg bg-muted border border-border">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Click on any element card to see detailed information,
          or filter by category to explore specific groups of elements.
        </p>
      </div>
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
