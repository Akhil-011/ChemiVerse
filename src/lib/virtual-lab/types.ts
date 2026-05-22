export type LabCategory =
  | "Acid"
  | "Base"
  | "Salt"
  | "Indicator"
  | "Oxidizer"
  | "Organic Compound"
  | "Metal"
  | "Gas"
  | "Solvent";

export type LabPhysicalState = "Solid" | "Liquid" | "Gas";

export interface LabChemical {
  id: string;
  name: string;
  formula: string;
  category: LabCategory;
  physicalState: LabPhysicalState;
  color: string;
  molarMass: number;
  acidityBasicity: string;
  reactivityTags: string[];
  hazards: string[];
  iconColor: string;
  description: string;
}

export interface LabReactionRule {
  id: string;
  reactants: string[];
  products: string[];
  balancedEquation: string;
  type: string;
  observations: string[];
  energy: "Exothermic" | "Endothermic" | "Neutral";
  gas?: string;
  precipitate?: string;
  temperatureChange?: string;
  colorChange?: string;
  safetyWarnings: string[];
}

export interface LabBeakerItem {
  instanceId: string;
  chemical: LabChemical;
}

export interface LabReactionResult {
  status: "possible" | "no-reaction" | "undetermined";
  title: string;
  reason?: string;
  reaction?: LabReactionRule;
  reactants: LabChemical[];
  products: string[];
  balancedEquation: string;
  reactionType: string;
  observations: string[];
  energy: "Exothermic" | "Endothermic" | "Neutral";
  gas?: string;
  precipitate?: string;
  temperatureChange?: string;
  colorChange?: string;
  safetyWarnings: string[];
  aiSuggested?: boolean;
}
