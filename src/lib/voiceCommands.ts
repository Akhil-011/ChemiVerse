export type VoiceCommandId =
  | "OPEN_PERIODIC_TABLE"
  | "OPEN_CHAT"
  | "PREDICT_REACTION"
  | "START_EXPERIMENT"
  | "SHOW_WATER"
  | "SHOW_METHANE"
  | "SHOW_BENZENE"
  | "SHOW_ETHANOL";

export interface VoiceCommandDefinition {
  id: VoiceCommandId;
  label: string;
  aliases: string[];
  regexes: RegExp[];
  speech: string;
  route?: string;
  moleculeId?: string;
}

export const VOICE_COMMANDS: VoiceCommandDefinition[] = [
  {
    id: "OPEN_PERIODIC_TABLE",
    label: "Open Periodic Table",
    aliases: ["periodic table", "open periodic table", "show periodic table", "open elements", "show elements"],
    regexes: [/\bperiodic\s+table\b/i, /\belements?\b/i],
    speech: "Opening periodic table",
    route: "/periodic-table",
  },
  {
    id: "OPEN_CHAT",
    label: "Open AI Tutor",
    aliases: ["open chat", "open ai tutor", "chemistry tutor", "chat"],
    regexes: [/\bopen\s+chat\b/i, /\bopen\s+ai\s+tutor\b/i, /\bchemistry\s+tutor\b/i, /\bchat\b/i],
    speech: "Opening AI Chemistry Tutor",
    route: "/tutor",
  },
  {
    id: "PREDICT_REACTION",
    label: "Predict Reaction",
    aliases: ["predict reaction", "reaction predictor", "chemistry reaction"],
    regexes: [/\bpredict\s+reaction\b/i, /\breaction\s+predictor\b/i, /\bchemistry\s+reaction\b/i],
    speech: "Opening AI Reaction Predictor",
    route: "/predictor",
  },
  {
    id: "START_EXPERIMENT",
    label: "Start Experiment",
    aliases: ["start experiment", "open lab", "chemistry lab", "virtual lab"],
    regexes: [/\bstart\s+experiment\b/i, /\bopen\s+lab\b/i, /\bchemistry\s+lab\b/i, /\bvirtual\s+lab\b/i],
    speech: "Starting Virtual Chemistry Lab",
    route: "/lab",
  },
  {
    id: "SHOW_WATER",
    label: "Open Water Molecule",
    aliases: ["water", "h2o", "water molecule", "open water", "show water"],
    regexes: [/\bwater\b/i, /\bh2o\b/i, /\bwater\s+molecule\b/i],
    speech: "Opening Water Molecule",
    route: "/molecules/water",
    moleculeId: "water",
  },
  {
    id: "SHOW_METHANE",
    label: "Open Methane Molecule",
    aliases: ["methane", "ch4", "open methane", "show methane"],
    regexes: [/\bmethane\b/i, /\bch4\b/i],
    speech: "Opening Methane Molecule",
    route: "/molecules/methane",
    moleculeId: "methane",
  },
  {
    id: "SHOW_BENZENE",
    label: "Open Benzene Molecule",
    aliases: ["benzene", "c6h6", "open benzene", "show benzene"],
    regexes: [/\bbenzene\b/i, /\bc6h6\b/i],
    speech: "Opening Benzene Molecule",
    route: "/molecules/benzene",
    moleculeId: "benzene",
  },
  {
    id: "SHOW_ETHANOL",
    label: "Open Ethanol Molecule",
    aliases: ["ethanol", "alcohol molecule", "alcohol", "open ethanol", "show ethanol"],
    regexes: [/\bethanol\b/i, /\balcohol\s+molecule\b/i, /\balcohol\b/i],
    speech: "Opening Ethanol Molecule",
    route: "/molecules/ethanol",
    moleculeId: "ethanol",
  },
];