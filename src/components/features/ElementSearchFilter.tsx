// ============================================================
// ChemFusion AI — Element Search & Filter Controls
// ============================================================
import { useState } from "react";
import { ElementCategory } from "@/types";
import { ELEMENT_CATEGORIES } from "@/constants/periodicTableData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Search, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOptions {
  searchTerm: string;
  category: ElementCategory | null;
  state: "solid" | "liquid" | "gas" | null;
  hasData: boolean;
}

interface ElementSearchFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  activeFilterCount?: number;
}

export default function ElementSearchFilter({
  onFilterChange,
  onClearFilters,
  activeFilterCount = 0,
}: ElementSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<ElementCategory | null>(null);
  const [state, setState] = useState<"solid" | "liquid" | "gas" | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFilterChange({ searchTerm: value, category, state, hasData: true });
  };

  const handleCategoryChange = (value: string) => {
    const newCategory = (value === "all" ? null : value) as ElementCategory | null;
    setCategory(newCategory);
    onFilterChange({ searchTerm, category: newCategory, state, hasData: true });
  };

  const handleStateChange = (value: string) => {
    const newState = (value === "all" ? null : value) as
      | "solid"
      | "liquid"
      | "gas"
      | null;
    setState(newState);
    onFilterChange({ searchTerm, category, state: newState, hasData: true });
  };

  const handleReset = () => {
    setSearchTerm("");
    setCategory(null);
    setState(null);
    onClearFilters();
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Search & Filter
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground">
              {activeFilterCount} active
            </span>
          )}
        </h2>
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or symbol (e.g., Gold, Au)..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 py-2"
        />
        {searchTerm && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Category</label>
          <Select value={category || "all"} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {Object.entries(ELEMENT_CATEGORIES).map(([key, cat]) => (
                <SelectItem key={key} value={key}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* State Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">State</label>
          <Select value={state || "all"} onValueChange={handleStateChange}>
            <SelectTrigger>
              <SelectValue placeholder="All states" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="liquid">Liquid</SelectItem>
              <SelectItem value="gas">Gas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || category || state) && (
        <div className="p-3 rounded-lg bg-muted border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Active Filters:
          </p>
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <FilterTag label={`Search: "${searchTerm}"`} />
            )}
            {category && (
              <FilterTag label={`Category: ${ELEMENT_CATEGORIES[category].name}`} />
            )}
            {state && (
              <FilterTag label={`State: ${state.charAt(0).toUpperCase() + state.slice(1)}`} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface FilterTagProps {
  label: string;
}

function FilterTag({ label }: FilterTagProps) {
  return (
    <span className="px-2 py-1 rounded text-xs font-medium bg-accent bg-opacity-20 text-accent-foreground border border-accent border-opacity-30">
      {label}
    </span>
  );
}
