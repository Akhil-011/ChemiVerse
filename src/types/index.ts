// ============================================================
// ChemFusion AI — TypeScript Types
// ============================================================

export interface Molecule {
  id: string;
  name: string;
  formula: string;
  description: string;
  atoms: Atom[];
  bonds: Bond[];
  color: string;
  category: string;
  molarMass: number;
  boilingPoint: string;
  meltingPoint: string;
  properties: string[];
}

export interface Atom {
  id: string;
  element: string;
  symbol: string;
  position: [number, number, number];
  radius: number;
  color: string;
  atomicNumber: number;
}

export interface Bond {
  from: string;
  to: string;
  type: "single" | "double" | "triple" | "aromatic";
}

export interface Chemical {
  id: string;
  name: string;
  formula: string;
  color: string;
  state: "liquid" | "solid" | "gas";
  hazard: "safe" | "caution" | "danger";
  description: string;
}

export interface Reaction {
  id: string;
  reactants: string[];
  products: string[];
  equation: string;
  type: string;
  observation: string;
  safetyWarning: string;
  energyChange: "exothermic" | "endothermic" | "neutral";
  color: string;
  gas?: string;
  precipitate?: string;
}

export interface AIReactionPrediction {
  input: string;
  balancedEquation: string;
  products: string[];
  reactionType: string;
  industrialUses: string[];
  energyChange: "exothermic" | "endothermic" | "neutral";
  enthalpy: string;
  mechanism: string;
  conditions: string[];
  safetyNotes: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface DashboardActivity {
  id: string;
  type: "molecule" | "experiment" | "prediction" | "chat";
  title: string;
  description: string;
  timestamp: Date;
  data?: unknown;
}

export interface VoiceCommand {
  command: string;
  action: string;
  description: string;
}

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  href: string;
  badge?: string;
}

export interface Experiment {
  id: string;
  title: string;
  chemicals: string[];
  result: string;
  date: Date;
  status: "success" | "in-progress" | "failed";
}

export interface PeriodicElement {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number;
  category: ElementCategory;
  electronConfiguration: string;
  valence: number;
  period: number;
  group: number;
  state: "solid" | "liquid" | "gas";
  meltingPoint: number;
  boilingPoint: number;
  density: number;
  discoveryYear: number;
  discoverer: string;
  color: string;
  uses: string[];
  naturalOccurrence: string;
  isotopes: string[];
  interestingFacts: string[];
  mnemonic?: string;
  electronegativity?: number;
  ionizationEnergy?: number;
  atomicRadius?: number;
}

export type ElementCategory =
  | "alkali-metals"
  | "alkaline-earth-metals"
  | "transition-metals"
  | "post-transition-metals"
  | "metalloids"
  | "nonmetals"
  | "halogens"
  | "noble-gases"
  | "lanthanides"
  | "actinides";

export interface UserPreferences {
  favoriteElements: number[];
  recentlyViewed: number[];
  quizMode: "easy" | "medium" | "hard";
  darkMode: boolean;
}
