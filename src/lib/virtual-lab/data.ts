import chemicalSeed from "@/data/virtualLabChemicals.json";
import reactionSeed from "@/data/virtualLabReactions.json";
import type { LabChemical, LabReactionRule } from "./types";

export const LAB_CHEMICALS = chemicalSeed as LabChemical[];
export const LAB_REACTIONS = reactionSeed as LabReactionRule[];

export const LAB_CATEGORY_FILTERS = [
  "All",
  "Solids",
  "Liquids",
  "Gases",
  "Acids",
  "Bases",
  "Salts",
  "Indicators",
  "Metals",
  "Organic Compounds",
] as const;

export type LabFilter = (typeof LAB_CATEGORY_FILTERS)[number];
