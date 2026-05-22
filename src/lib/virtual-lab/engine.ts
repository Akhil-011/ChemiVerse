import { predictReaction as predictReactionViaBackend } from "@/services/reactionPredictionService";
import type {
  LabBeakerItem,
  LabChemical,
  LabReactionResult,
  LabReactionRule,
  LabFilter,
} from "./types";

const SPECTATOR_CATEGORIES = new Set(["Indicator", "Solvent"]);
const SPECTATOR_FORMULAS = new Set(["H2O", "Litmus"]);

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (digit) => "0123456789"["₀₁₂₃₄₅₆₇₈₉".indexOf(digit)])
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9()+\-]/g, "");
}

export function formatFormula(formula: string): string {
  return formula.replace(/\s+/g, "").trim();
}

export function matchesFilter(chemical: LabChemical, filter: LabFilter): boolean {
  if (filter === "All") return true;
  if (filter === "Solids") return chemical.physicalState === "Solid";
  if (filter === "Liquids") return chemical.physicalState === "Liquid";
  if (filter === "Gases") return chemical.physicalState === "Gas";
  if (filter === "Acids") return chemical.category === "Acid";
  if (filter === "Bases") return chemical.category === "Base";
  if (filter === "Salts") return chemical.category === "Salt";
  if (filter === "Indicators") return chemical.category === "Indicator";
  if (filter === "Metals") return chemical.category === "Metal";
  if (filter === "Organic Compounds") return chemical.category === "Organic Compound";
  return true;
}

export function searchChemicals(chemicals: LabChemical[], query: string, filter: LabFilter): LabChemical[] {
  const normalizedQuery = normalizeText(query);
  const items = chemicals.filter((chemical) => matchesFilter(chemical, filter));
  if (!normalizedQuery) return items;

  return items
    .map((chemical) => {
      const name = normalizeText(chemical.name);
      const formula = normalizeText(chemical.formula);
      const description = normalizeText(chemical.description);
      const tags = chemical.reactivityTags.map((tag) => normalizeText(tag)).join("");
      const category = normalizeText(chemical.category);

      let score = 0;
      if (name === normalizedQuery || formula === normalizedQuery) score += 100;
      if (name.includes(normalizedQuery)) score += 60;
      if (formula.includes(normalizedQuery)) score += 70;
      if (category.includes(normalizedQuery)) score += 45;
      if (tags.includes(normalizedQuery)) score += 35;
      if (description.includes(normalizedQuery)) score += 15;

      return { chemical, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.chemical);
}

function countFormulas(items: LabChemical[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = normalizeText(formatFormula(item.formula));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function isSpectatorChemical(chemical: LabChemical): boolean {
  return SPECTATOR_CATEGORIES.has(chemical.category) || SPECTATOR_FORMULAS.has(formatFormula(chemical.formula));
}

function ruleMatches(rule: LabReactionRule, beakerChemicals: LabChemical[]): boolean {
  const counts = countFormulas(beakerChemicals);
  const requiredCounts = new Map<string, number>();
  for (const reactant of rule.reactants) {
    const key = normalizeText(formatFormula(reactant));
    requiredCounts.set(key, (requiredCounts.get(key) ?? 0) + 1);
  }

  for (const [formula, required] of requiredCounts.entries()) {
    if ((counts.get(formula) ?? 0) < required) return false;
  }

  const extraCount = beakerChemicals.length - rule.reactants.length;
  if (extraCount <= 0) return true;

  const extras = beakerChemicals.filter((chemical) => {
    const normalized = normalizeText(formatFormula(chemical.formula));
    const required = requiredCounts.get(normalized) ?? 0;
    if (required > 0) {
      requiredCounts.set(normalized, required - 1);
      return false;
    }
    return true;
  });

  return extras.length <= 2 && extras.every(isSpectatorChemical);
}

export function findBestReaction(beakerChemicals: LabChemical[], reactions: LabReactionRule[]): LabReactionRule | null {
  const sorted = [...reactions].sort((a, b) => b.reactants.length - a.reactants.length);
  return sorted.find((reaction) => ruleMatches(reaction, beakerChemicals)) ?? null;
}

function hasUnknownBehavior(beakerChemicals: LabChemical[]): boolean {
  if (beakerChemicals.length < 2) return false;
  const categories = new Set(beakerChemicals.map((chemical) => chemical.category));
  const containsReactive = beakerChemicals.some((chemical) =>
    ["Acid", "Base", "Oxidizer", "Metal"].includes(chemical.category)
  );
  return categories.size > 3 || containsReactive;
}

export async function evaluateReaction(
  beakerChemicals: LabChemical[],
  reactions: LabReactionRule[],
  enableAiFallback = false
): Promise<LabReactionResult> {
  if (beakerChemicals.length < 2) {
    return {
      status: "undetermined",
      title: "Add at least two chemicals",
      reason: "The beaker needs two or more chemicals before a reaction can be evaluated.",
      reactants: beakerChemicals,
      products: [],
      balancedEquation: "",
      reactionType: "None",
      observations: ["Select at least two chemicals."],
      energy: "Neutral",
      safetyWarnings: ["Add more reactants before running the simulation."],
    };
  }

  const reaction = findBestReaction(beakerChemicals, reactions);
  if (reaction) {
    return {
      status: "possible",
      title: "Reaction possible",
      reaction,
      reactants: beakerChemicals,
      products: reaction.products,
      balancedEquation: reaction.balancedEquation,
      reactionType: reaction.type,
      observations: reaction.observations,
      energy: reaction.energy,
      gas: reaction.gas,
      precipitate: reaction.precipitate,
      temperatureChange: reaction.temperatureChange,
      colorChange: reaction.colorChange,
      safetyWarnings: reaction.safetyWarnings,
    };
  }

  const hasUnknown = beakerChemicals.some((chemical) => !chemical.formula || !chemical.name);
  if (hasUnknown) {
    return {
      status: "undetermined",
      title: "Reaction cannot be determined",
      reason: "One or more compounds could not be identified.",
      reactants: beakerChemicals,
      products: [],
      balancedEquation: "",
      reactionType: "Unknown",
      observations: ["Reaction cannot be determined."],
      energy: "Neutral",
      safetyWarnings: ["Check the identity of each compound and try again."],
    };
  }

  if (enableAiFallback) {
    try {
      const backendResult = await predictReactionViaBackend(
        beakerChemicals.map((item) => item.formula).join(" + ")
      );
      return {
        status: "possible",
        title: "AI-suggested reaction",
        aiSuggested: true,
        reactants: beakerChemicals,
        products: backendResult.products || [],
        balancedEquation: backendResult.products
          ? `${backendResult.reactants} -> ${backendResult.products}`
          : `${beakerChemicals.map((item) => item.formula).join(" + ")} -> predicted products`,
        reactionType: backendResult.reactionType || "Predicted",
        observations: ["AI fallback suggestion generated."],
        energy: backendResult.yield && backendResult.yield > 0 ? "Exothermic" : "Neutral",
        safetyWarnings: ["AI output should be verified with real chemistry references."],
      };
    } catch {
      // fall through to manual invalid result
    }
  }

  if (!hasUnknownBehavior(beakerChemicals)) {
    return {
      status: "no-reaction",
      title: "No reaction possible with selected chemicals.",
      reason: "No rule-based reaction matched this combination.",
      reactants: beakerChemicals,
      products: [],
      balancedEquation: "No reaction",
      reactionType: "No Reaction",
      observations: ["No reaction possible with selected chemicals."],
      energy: "Neutral",
      safetyWarnings: ["This is a stable or non-reactive mixture under standard lab conditions."],
    };
  }

  return {
    status: "undetermined",
    title: "Reaction cannot be determined.",
    reason: "The mixture contains incompatible or unsupported compounds.",
    reactants: beakerChemicals,
    products: [],
    balancedEquation: "Reaction cannot be determined.",
    reactionType: "Undetermined",
    observations: ["Reaction cannot be determined."],
    energy: "Neutral",
    safetyWarnings: ["Reduce the number of chemicals or use a known reaction pair."],
  };
}
