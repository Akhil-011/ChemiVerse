// ============================================================
// ChemFusion AI — Periodic Table Grid
// ============================================================
import { motion } from "framer-motion";
import { PeriodicElement } from "@/types";
import { PERIODIC_TABLE, ELEMENT_CATEGORIES } from "@/constants/periodicTableData";
import { cn } from "@/lib/utils";

interface PeriodicTableGridProps {
  selectedCategory: string | null;
  favorites: number[];
  onElementClick: (element: PeriodicElement) => void;
}

// Fixed column width to preserve academic alignment on desktop
const COLUMN_SIZE_PX = 72;

export default function PeriodicTableGrid({
  selectedCategory,
  favorites,
  onElementClick,
}: PeriodicTableGridProps) {
  // Build a map period -> array[18] with elements or null for exact placement
  const gridByPeriod = buildGridPlacement();

  return (
    <div className="w-full">
      <div className="mx-auto" style={{ maxWidth: `${COLUMN_SIZE_PX * 18 + 160}px` }}>
        <div className="overflow-x-auto sm:overflow-visible">
          <div className="p-4">
            {/* Render periods 1-7 as precise 18-column grid rows */}
            {Array.from({ length: 7 }).map((_, idx) => {
              const period = idx + 1;
              const row = gridByPeriod[period];

              return (
                <motion.div
                  key={`period-${period}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="mb-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 flex items-center justify-center text-xs font-semibold text-muted-foreground">{period}</div>
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: `repeat(18, ${COLUMN_SIZE_PX}px)`,
                        columnGap: 8,
                        rowGap: 8,
                      }}
                    >
                      {row.map((cell, colIndex) => {
                        // empty cell placeholder
                        if (!cell || cell.type === "empty") {
                          return <div key={`p${period}-c${colIndex}`} className="w-[72px] h-[96px]" />;
                        }

                        if (cell.type === "placeholder") {
                          return <PlaceholderTile key={`p${period}-c${colIndex}`} label={cell.label} />;
                        }

                        // element cell
                        const element = (cell as { type: string; element: PeriodicElement }).element;
                        if (!element) return <div key={`p${period}-c${colIndex}`} className="w-[72px] h-[96px]" />;

                        const isHighlighted = selectedCategory && element.category === selectedCategory;
                        const isFavorite = favorites.includes(element.atomicNumber);

                        return (
                          <PeriodicTableCard
                            key={element.atomicNumber}
                            element={element}
                            isHighlighted={isHighlighted}
                            isFavorite={isFavorite}
                            onClick={() => onElementClick(element)}
                          />
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Lanthanides row (centered) */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-6">
              <div className="flex items-center gap-4">
                <div className="w-8 text-xs font-semibold text-muted-foreground">*</div>
                <div className="mx-auto" style={{ maxWidth: `${COLUMN_SIZE_PX * 15 + 8 * 14}px` }}>
                  <div className="grid grid-flow-col auto-cols-[72px] gap-2 justify-center">
                    {PERIODIC_TABLE.filter((el) => el.category === "lanthanides").filter(Boolean).map((element) =>
                      element ? (
                        <PeriodicTableCard
                          key={element.atomicNumber}
                          element={element}
                          isHighlighted={selectedCategory === element.category}
                          isFavorite={favorites.includes(element.atomicNumber)}
                          onClick={() => onElementClick(element)}
                        />
                      ) : null
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Actinides row (centered) */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} className="mt-3">
              <div className="flex items-center gap-4">
                <div className="w-8 text-xs font-semibold text-muted-foreground">**</div>
                <div className="mx-auto" style={{ maxWidth: `${COLUMN_SIZE_PX * 15 + 8 * 14}px` }}>
                  <div className="grid grid-flow-col auto-cols-[72px] gap-2 justify-center">
                    {PERIODIC_TABLE.filter((el) => el.category === "actinides").filter(Boolean).map((element) =>
                      element ? (
                        <PeriodicTableCard
                          key={element.atomicNumber}
                          element={element}
                          isHighlighted={selectedCategory === element.category}
                          isFavorite={favorites.includes(element.atomicNumber)}
                          onClick={() => onElementClick(element)}
                        />
                      ) : null
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PeriodicTableCardProps {
  element: PeriodicElement;
  isHighlighted: boolean;
  isFavorite: boolean;
  onClick: () => void;
  compact?: boolean;
}

function PeriodicTableCard({
  element,
  isHighlighted,
  isFavorite,
  onClick,
  compact = false,
}: PeriodicTableCardProps) {
  const categoryInfo = ELEMENT_CATEGORIES[element.category];

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        "relative rounded-lg border-2 transition-all duration-300 cursor-pointer",
        "backdrop-blur-sm bg-opacity-30 hover:bg-opacity-50",
        "flex flex-col items-center justify-center",
        "text-xs sm:text-sm",
        "w-16 h-20 sm:w-20 sm:h-28",
        isHighlighted && "ring-2 ring-offset-2 ring-offset-background scale-110 shadow-xl z-20"
      )}
        style={{
          backgroundColor: `rgba(${hexToRgb(categoryInfo.color)}, ${isHighlighted ? 0.4 : 0.2})`,
          borderColor: categoryInfo.color,
          ringColor: isHighlighted ? categoryInfo.color : "transparent",
          boxShadow: isHighlighted ? `0 8px 24px ${categoryInfo.glowColor}` : undefined,
        }}
    >
      {/* Background glow when highlighted */}
      {isHighlighted && (
        <div
          className="absolute inset-0 rounded-lg blur-lg opacity-50"
          style={{
            backgroundColor: categoryInfo.glowColor,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-1 p-2">
        {/* Atomic number */}
        <div className="text-xs font-light text-muted-foreground self-start">
          {element.atomicNumber}
        </div>

        {/* Symbol */}
        <div
          className={cn(
            "font-bold transition-all duration-300",
            isHighlighted ? "text-lg sm:text-2xl" : "text-base sm:text-lg"
          )}
          style={{ color: categoryInfo.color }}
        >
          {element.symbol}
        </div>

        {/* Name (visible on larger screens) */}
        {!compact && (
          <div className="text-xs font-semibold text-foreground line-clamp-1">
            {element.name}
          </div>
        )}

        {/* Atomic mass */}
        <div className="text-xs text-muted-foreground">
          {element.atomicMass.toFixed(1)}
        </div>
      </div>

      {/* Favorite indicator */}
      {isFavorite && (
        <div className="absolute top-1 right-1 text-yellow-400 text-xs">
          ★
        </div>
      )}

      {/* Highlight accent line */}
      {isHighlighted && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: categoryInfo.color }}
        />
      )}
    </motion.button>
  );
}

function groupElementsByPosition(): Record<number, PeriodicElement[]> {
  const grouped: Record<number, PeriodicElement[]> = {};

  PERIODIC_TABLE.forEach((element) => {
    if (!grouped[element.period]) {
      grouped[element.period] = [];
    }
    grouped[element.period].push(element);
  });

  return grouped;
}

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

// Grid helpers for precise placement
type GridCell =
  | { type: "empty" }
  | { type: "element"; element: PeriodicElement }
  | { type: "placeholder"; label: string };

function PlaceholderTile({ label }: { label: string }) {
  return (
    <div className="w-[72px] h-[96px] rounded-lg border border-dashed border-muted-foreground/30 bg-transparent flex items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function buildGridPlacement(): Record<number, GridCell[]> {
  const map: Record<number, GridCell[]> = {};

  // initialize periods 1-7 with 18 empty slots
  for (let p = 1; p <= 7; p++) {
    map[p] = Array.from({ length: 18 }).map(() => ({ type: "empty" } as GridCell));
  }

  // place real elements by period and group
  PERIODIC_TABLE.forEach((el) => {
    if (el.period >= 1 && el.period <= 7 && el.group >= 1 && el.group <= 18) {
      map[el.period][el.group - 1] = { type: "element", element: el };
    }
  });

  // Insert Lanthanum and Actinium placeholders in main table (period 6 & 7 group 3)
  map[6][2] = { type: "placeholder", label: "La*" };
  map[7][2] = { type: "placeholder", label: "Ac*" };

  return map;
}
