// ============================================================
// ChemFusion AI — Periodic Table Data (All 118 Elements)
// ============================================================

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
  meltingPoint: number; // Celsius
  boilingPoint: number; // Celsius
  density: number; // g/cm³
  discoveryYear: number;
  discoverer: string;
  color: string;
  uses: string[];
  naturalOccurrence: string;
  isotopes: string[];
  interestingFacts: string[];
  mnemonic?: string;
  electronegativity?: number;
  ionizationEnergy?: number; // kJ/mol
  atomicRadius?: number; // pm
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

export const ELEMENT_CATEGORIES = {
  "alkali-metals": {
    name: "Alkali Metals",
    color: "#FF6B6B",
    glowColor: "rgba(255, 107, 107, 0.5)",
    description: "Highly reactive metals in Group 1",
    mnemonic: "LiNaKRbCsF (Little Nasty Kittens Run, Cats are Fierce!)",
  },
  "alkaline-earth-metals": {
    name: "Alkaline Earth Metals",
    color: "#FFA500",
    glowColor: "rgba(255, 165, 0, 0.5)",
    description: "Less reactive metals in Group 2",
    mnemonic: "MgBeCalSrBa",
  },
  "transition-metals": {
    name: "Transition Metals",
    color: "#4ECDC4",
    glowColor: "rgba(78, 205, 196, 0.5)",
    description: "Metals with d-block electrons",
    mnemonic: "Often colored, variable oxidation states",
  },
  "post-transition-metals": {
    name: "Post-Transition Metals",
    color: "#95E1D3",
    glowColor: "rgba(149, 225, 211, 0.5)",
    description: "Metals after transition series",
  },
  metalloids: {
    name: "Metalloids",
    color: "#FFD93D",
    glowColor: "rgba(255, 217, 61, 0.5)",
    description: "Between metals and nonmetals",
    mnemonic: "B Si Ge As Sb Te (Boring Silicon Germs Are Seriously Terrible!)",
  },
  nonmetals: {
    name: "Nonmetals",
    color: "#6BCB77",
    glowColor: "rgba(107, 203, 119, 0.5)",
    description: "Elements lacking metallic properties",
  },
  halogens: {
    name: "Halogens",
    color: "#FF8B94",
    glowColor: "rgba(255, 139, 148, 0.5)",
    description: "Highly reactive elements in Group 17",
    mnemonic: "F Cl Br I At (Friend Can't Bring Iguana At)",
  },
  "noble-gases": {
    name: "Noble Gases",
    color: "#A8E6CF",
    glowColor: "rgba(168, 230, 207, 0.5)",
    description: "Inert elements in Group 18",
    mnemonic: "He Ne Ar Kr Xe Rn (He Never Arguments, Keeps Xenon Radon)",
  },
  lanthanides: {
    name: "Lanthanides",
    color: "#FFB3BA",
    glowColor: "rgba(255, 179, 186, 0.5)",
    description: "Rare earth elements (Period 6)",
  },
  actinides: {
    name: "Actinides",
    color: "#FFFFBA",
    glowColor: "rgba(255, 255, 186, 0.5)",
    description: "Radioactive rare earth elements (Period 7)",
  },
};

const PERIODIC_TABLE_DATA: PeriodicElement[] = [
{
    atomicNumber: 1,
    symbol: "H",
    name: "Hydrogen",
    atomicMass: 1.008,
    category: "nonmetals",
    electronConfiguration: "1s¹",
    valence: 1,
    period: 1,
    group: 1,
    state: "gas",
    meltingPoint: -259,
    boilingPoint: -253,
    density: 0.00009,
    discoveryYear: 1766,
    discoverer: "Henry Cavendish",
    color: "#FFFFFF",
    uses: ["Fuel", "Water production", "Industrial synthesis"],
    naturalOccurrence: "Most abundant element in universe",
    isotopes: ["Hydrogen-1", "Deuterium", "Tritium"],
    interestingFacts: [
      "Makes up 75% of all normal matter in universe",
      "Smallest and lightest element",
      "Forms covalent bonds with almost all elements",
    ],
    mnemonic: "H - The foundation of all chemistry!",
    electronegativity: 2.2,
    ionizationEnergy: 1312,
    atomicRadius: 53,
  },

{
    atomicNumber: 2,
    symbol: "He",
    name: "Helium",
    atomicMass: 4.003,
    category: "noble-gases",
    electronConfiguration: "1s²",
    valence: 0,
    period: 1,
    group: 18,
    state: "gas",
    meltingPoint: -272.2,
    boilingPoint: -268.9,
    density: 0.00018,
    discoveryYear: 1868,
    discoverer: "Pierre Jules César Janssen",
    color: "#FFD700",
    uses: ["Balloons", "Cryogenics", "Diving gas"],
    naturalOccurrence: "Second most abundant element in universe",
    isotopes: ["Helium-3", "Helium-4"],
    interestingFacts: [
      "Second lightest element",
      "Lowest melting point of all elements",
      "Chemically inert under standard conditions",
    ],
    electronegativity: 5.5,
    ionizationEnergy: 2372,
    atomicRadius: 28,
  },

{
    atomicNumber: 3,
    symbol: "Li",
    name: "Lithium",
    atomicMass: 6.94,
    category: "alkali-metals",
    electronConfiguration: "[He] 2s¹",
    valence: 1,
    period: 2,
    group: 1,
    state: "solid",
    meltingPoint: 180,
    boilingPoint: 1342,
    density: 0.534,
    discoveryYear: 1817,
    discoverer: "Johan August Arfwedson",
    color: "#FFB6C1",
    uses: ["Batteries", "Psychiatric medication", "Aerospace"],
    naturalOccurrence: "Rare in Earth's crust",
    isotopes: ["Lithium-6", "Lithium-7"],
    interestingFacts: [
      "Lightest solid element",
      "Used in mental health treatment",
      "Reacts vigorously with water",
    ],
    mnemonic: "Li - Light and reactive!",
    electronegativity: 0.98,
    ionizationEnergy: 520,
    atomicRadius: 152,
  },

{
    atomicNumber: 4,
    symbol: "Be",
    name: "Beryllium",
    atomicMass: 9.012,
    category: "alkaline-earth-metals",
    electronConfiguration: "[He] 2s²",
    valence: 2,
    period: 2,
    group: 2,
    state: "solid",
    meltingPoint: 1287,
    boilingPoint: 2470,
    density: 1.85,
    discoveryYear: 1798,
    discoverer: "Louis-Nicolas Vauquelin",
    color: "#90EE90",
    uses: ["Aerospace", "Electronics", "Medical devices"],
    naturalOccurrence: "Beryl mineral",
    isotopes: ["Beryllium-9"],
    interestingFacts: [
      "Very hard and lightweight",
      "Toxic if inhaled",
      "Used in X-ray windows",
    ],
    electronegativity: 1.57,
    ionizationEnergy: 900,
    atomicRadius: 112,
  },

{
    atomicNumber: 5,
    symbol: "B",
    name: "Boron",
    atomicMass: 10.81,
    category: "metalloids",
    electronConfiguration: "[He] 2s² 2p¹",
    valence: 3,
    period: 2,
    group: 13,
    state: "solid",
    meltingPoint: 2076,
    boilingPoint: 3927,
    density: 2.34,
    discoveryYear: 1808,
    discoverer: "Joseph Louis Gay-Lussac & Louis Jacques Thénard",
    color: "#FFD700",
    uses: ["Glass", "Detergents", "Semiconductors"],
    naturalOccurrence: "Borax mineral",
    isotopes: ["Boron-10", "Boron-11"],
    interestingFacts: [
      "Exists in different forms (polymorphs)",
      "Very hard crystalline solid",
      "Used in nuclear reactor control rods",
    ],
    mnemonic: "B - Boring but Brilliant!",
    electronegativity: 2.04,
    ionizationEnergy: 801,
    atomicRadius: 85,
  },

{
    atomicNumber: 6,
    symbol: "C",
    name: "Carbon",
    atomicMass: 12.01,
    category: "nonmetals",
    electronConfiguration: "[He] 2s² 2p²",
    valence: 4,
    period: 2,
    group: 14,
    state: "solid",
    meltingPoint: 3550,
    boilingPoint: 4827,
    density: 2.26,
    discoveryYear: -3000,
    discoverer: "Ancient civilizations",
    color: "#000000",
    uses: ["Fuels", "Diamond", "Graphite", "Plastics"],
    naturalOccurrence: "Diamond, graphite, coal",
    isotopes: ["Carbon-12", "Carbon-13", "Carbon-14"],
    interestingFacts: [
      "Basis of all organic chemistry",
      "Forms strongest natural bonds (diamond)",
      "Can exist in multiple allotropes",
    ],
    mnemonic: "C - The foundation of life!",
    electronegativity: 2.55,
    ionizationEnergy: 1086,
    atomicRadius: 77,
  },

{
    atomicNumber: 7,
    symbol: "N",
    name: "Nitrogen",
    atomicMass: 14.01,
    category: "nonmetals",
    electronConfiguration: "[He] 2s² 2p³",
    valence: 3,
    period: 2,
    group: 15,
    state: "gas",
    meltingPoint: -210,
    boilingPoint: -196,
    density: 0.0012,
    discoveryYear: 1772,
    discoverer: "Daniel Rutherford",
    color: "#87CEEB",
    uses: ["Fertilizers", "Explosives", "Cryogenics"],
    naturalOccurrence: "78% of atmosphere",
    isotopes: ["Nitrogen-14", "Nitrogen-15"],
    interestingFacts: [
      "Makes up 78% of air",
      "Triple bond is very strong",
      "Essential for proteins and DNA",
    ],
    mnemonic: "N - Nitrogen is in the air!",
    electronegativity: 3.04,
    ionizationEnergy: 1402,
    atomicRadius: 71,
  },

{
    atomicNumber: 8,
    symbol: "O",
    name: "Oxygen",
    atomicMass: 16.00,
    category: "nonmetals",
    electronConfiguration: "[He] 2s² 2p⁴",
    valence: 2,
    period: 2,
    group: 16,
    state: "gas",
    meltingPoint: -218,
    boilingPoint: -183,
    density: 0.0014,
    discoveryYear: 1774,
    discoverer: "Joseph Priestley & Carl Wilhelm Scheele",
    color: "#87CEEB",
    uses: ["Respiration", "Combustion", "Medical oxygen"],
    naturalOccurrence: "Most abundant element in Earth's crust",
    isotopes: ["Oxygen-16", "Oxygen-17", "Oxygen-18"],
    interestingFacts: [
      "Essential for life",
      "Highly electronegative",
      "Forms compounds with all elements except noble gases",
    ],
    mnemonic: "O - Oxygen: We can't live without it!",
    electronegativity: 3.44,
    ionizationEnergy: 1314,
    atomicRadius: 66,
  },

{
    atomicNumber: 9,
    symbol: "F",
    name: "Fluorine",
    atomicMass: 19.00,
    category: "halogens",
    electronConfiguration: "[He] 2s² 2p⁵",
    valence: 1,
    period: 2,
    group: 17,
    state: "gas",
    meltingPoint: -220,
    boilingPoint: -188,
    density: 0.0017,
    discoveryYear: 1886,
    discoverer: "Henri Moissan",
    color: "#FFD700",
    uses: ["Refrigerants", "Toothpaste", "Nuclear fuel"],
    naturalOccurrence: "Fluorite mineral",
    isotopes: ["Fluorine-19"],
    interestingFacts: [
      "Most electronegative element",
      "Never found in nature as free element",
      "Extremely reactive and dangerous",
    ],
    mnemonic: "F - Friend, Fluorine is fierce!",
    electronegativity: 3.98,
    ionizationEnergy: 1681,
    atomicRadius: 64,
  },

{
    atomicNumber: 10,
    symbol: "Ne",
    name: "Neon",
    atomicMass: 20.18,
    category: "noble-gases",
    electronConfiguration: "[He] 2s² 2p⁶",
    valence: 0,
    period: 2,
    group: 18,
    state: "gas",
    meltingPoint: -248,
    boilingPoint: -246,
    density: 0.0009,
    discoveryYear: 1898,
    discoverer: "William Ramsay & Morris William Travers",
    color: "#FF1493",
    uses: ["Neon signs", "Lasers", "Lighting"],
    naturalOccurrence: "Rare in atmosphere",
    isotopes: ["Neon-20", "Neon-21", "Neon-22"],
    interestingFacts: [
      "Creates bright neon lights",
      "Second most abundant noble gas",
      "Inert and doesn't react with other elements",
    ],
    electronegativity: 3.0,
    ionizationEnergy: 2081,
    atomicRadius: 58,
  },

{
    atomicNumber: 11,
    symbol: "Na",
    name: "Sodium",
    atomicMass: 22.99,
    category: "alkali-metals",
    electronConfiguration: "[Ne] 3s¹",
    valence: 1,
    period: 3,
    group: 1,
    state: "solid",
    meltingPoint: 98,
    boilingPoint: 883,
    density: 0.968,
    discoveryYear: 1807,
    discoverer: "Humphry Davy",
    color: "#FFB6C1",
    uses: ["Table salt", "Chemical production", "Lighting"],
    naturalOccurrence: "Halite mineral (rock salt)",
    isotopes: ["Sodium-23"],
    interestingFacts: [
      "Essential for nerve function",
      "Reacts violently with water",
      "Soft enough to cut with knife",
    ],
    mnemonic: "Na - Sodium is salty!",
    electronegativity: 0.93,
    ionizationEnergy: 496,
    atomicRadius: 186,
  },

{
    atomicNumber: 12,
    symbol: "Mg",
    name: "Magnesium",
    atomicMass: 24.305,
    category: "alkaline-earth-metals",
    electronConfiguration: "[Ne] 3s²",
    valence: 2,
    period: 3,
    group: 2,
    state: "solid",
    meltingPoint: 650,
    boilingPoint: 1107,
    density: 1.738,
    discoveryYear: 1755,
    discoverer: "Joseph Black",
    color: "#90EE90",
    uses: ["Alloys", "Medicine", "Fireworks"],
    naturalOccurrence: "Dolomite and magnesite minerals",
    isotopes: ["Magnesium-24", "Magnesium-25", "Magnesium-26"],
    interestingFacts: [
      "Essential for muscle and bone health",
      "Bright white flame when burning",
      "Fourth most abundant element in body",
    ],
    mnemonic: "Mg - Mighty Green mineral!",
    electronegativity: 1.31,
    ionizationEnergy: 738,
    atomicRadius: 160,
  },

{
    atomicNumber: 13,
    symbol: "Al",
    name: "Aluminum",
    atomicMass: 26.98,
    category: "post-transition-metals",
    electronConfiguration: "[Ne] 3s² 3p¹",
    valence: 3,
    period: 3,
    group: 13,
    state: "solid",
    meltingPoint: 660,
    boilingPoint: 2519,
    density: 2.70,
    discoveryYear: 1825,
    discoverer: "Hans Christian Ørsted",
    color: "#C0C0C0",
    uses: ["Aircraft", "Cans", "Construction"],
    naturalOccurrence: "Bauxite ore",
    isotopes: ["Aluminum-27"],
    interestingFacts: [
      "Most abundant metal in Earth's crust",
      "Highly resistant to corrosion",
      "Conducts electricity well",
    ],
    electronegativity: 1.61,
    ionizationEnergy: 578,
    atomicRadius: 143,
  },

{
    atomicNumber: 14,
    symbol: "Si",
    name: "Silicon",
    atomicMass: 28.09,
    category: "metalloids",
    electronConfiguration: "[Ne] 3s² 3p²",
    valence: 4,
    period: 3,
    group: 14,
    state: "solid",
    meltingPoint: 1414,
    boilingPoint: 3265,
    density: 2.33,
    discoveryYear: 1823,
    discoverer: "Jöns Jacob Berzelius",
    color: "#808080",
    uses: ["Semiconductors", "Solar cells", "Glass"],
    naturalOccurrence: "Silicon dioxide (sand, quartz)",
    isotopes: ["Silicon-28", "Silicon-29", "Silicon-30"],
    interestingFacts: [
      "Second most abundant element in crust",
      "Basis of computer chips",
      "Forms strong silica glass",
    ],
    mnemonic: "Si - Silicon: Si good for tech!",
    electronegativity: 1.90,
    ionizationEnergy: 787,
    atomicRadius: 117,
  },

{
    atomicNumber: 15,
    symbol: "P",
    name: "Phosphorus",
    atomicMass: 30.97,
    category: "nonmetals",
    electronConfiguration: "[Ne] 3s² 3p³",
    valence: 3,
    period: 3,
    group: 15,
    state: "solid",
    meltingPoint: 44.2,
    boilingPoint: 280,
    density: 1.82,
    discoveryYear: 1669,
    discoverer: "Henning Brand",
    color: "#FFA500",
    uses: ["Fertilizers", "Phosphate", "Matches"],
    naturalOccurrence: "Phosphate minerals",
    isotopes: ["Phosphorus-31"],
    interestingFacts: [
      "Glows in the dark (phosphorescence named after it)",
      "Essential for bone and teeth",
      "White phosphorus spontaneously combusts",
    ],
    electronegativity: 2.19,
    ionizationEnergy: 1012,
    atomicRadius: 110,
  },

{
    atomicNumber: 16,
    symbol: "S",
    name: "Sulfur",
    atomicMass: 32.06,
    category: "nonmetals",
    electronConfiguration: "[Ne] 3s² 3p⁴",
    valence: 2,
    period: 3,
    group: 16,
    state: "solid",
    meltingPoint: 115,
    boilingPoint: 445,
    density: 2.07,
    discoveryYear: -2000,
    discoverer: "Ancient civilizations",
    color: "#FFFF00",
    uses: ["Fertilizers", "Rubber", "Batteries"],
    naturalOccurrence: "Native sulfur and sulfide minerals",
    isotopes: ["Sulfur-32", "Sulfur-33", "Sulfur-34", "Sulfur-36"],
    interestingFacts: [
      "Rotten eggs smell comes from H₂S",
      "Used in gunpowder (ancient times)",
      "Known since ancient times",
    ],
    mnemonic: "S - Stinks like rotten eggs!",
    electronegativity: 2.58,
    ionizationEnergy: 1000,
    atomicRadius: 105,
  },

{
    atomicNumber: 17,
    symbol: "Cl",
    name: "Chlorine",
    atomicMass: 35.45,
    category: "halogens",
    electronConfiguration: "[Ne] 3s² 3p⁵",
    valence: 1,
    period: 3,
    group: 17,
    state: "gas",
    meltingPoint: -101,
    boilingPoint: -34,
    density: 0.0032,
    discoveryYear: 1774,
    discoverer: "Carl Wilhelm Scheele",
    color: "#90EE90",
    uses: ["Disinfectant", "Salt production", "Bleach"],
    naturalOccurrence: "Halite mineral (rock salt)",
    isotopes: ["Chlorine-35", "Chlorine-37"],
    interestingFacts: [
      "Toxic gas with distinctive smell",
      "Essential for human digestion",
      "Used in water purification",
    ],
    mnemonic: "Cl - Chlorine can be Clean!",
    electronegativity: 3.16,
    ionizationEnergy: 1251,
    atomicRadius: 102,
  },

{
    atomicNumber: 18,
    symbol: "Ar",
    name: "Argon",
    atomicMass: 39.95,
    category: "noble-gases",
    electronConfiguration: "[Ne] 3s² 3p⁶",
    valence: 0,
    period: 3,
    group: 18,
    state: "gas",
    meltingPoint: -189,
    boilingPoint: -186,
    density: 0.0018,
    discoveryYear: 1894,
    discoverer: "William Ramsay & John William Strutt",
    color: "#87CEEB",
    uses: ["Welding", "Lighting", "Insulation"],
    naturalOccurrence: "Atmosphere (0.93%)",
    isotopes: ["Argon-36", "Argon-38", "Argon-40"],
    interestingFacts: [
      "Third most abundant gas in atmosphere",
      "Used in double-pane windows for insulation",
      "Completely inert and colorless",
    ],
    electronegativity: 3.2,
    ionizationEnergy: 1521,
    atomicRadius: 88,
  },

{
    atomicNumber: 19,
    symbol: "K",
    name: "Potassium",
    atomicMass: 39.10,
    category: "alkali-metals",
    electronConfiguration: "[Ar] 4s¹",
    valence: 1,
    period: 4,
    group: 1,
    state: "solid",
    meltingPoint: 63,
    boilingPoint: 759,
    density: 0.862,
    discoveryYear: 1807,
    discoverer: "Humphry Davy",
    color: "#FFB6C1",
    uses: ["Fertilizers", "Bananas", "Medicine"],
    naturalOccurrence: "Potassium feldspars, evaporite minerals",
    isotopes: ["Potassium-39", "Potassium-40", "Potassium-41"],
    interestingFacts: [
      "Essential for muscle and nerve function",
      "Bananas are famous for potassium content",
      "Reacts explosively with water",
    ],
    mnemonic: "K - Potassium in Bananas!",
    electronegativity: 0.82,
    ionizationEnergy: 419,
    atomicRadius: 227,
  },

{
    atomicNumber: 20,
    symbol: "Ca",
    name: "Calcium",
    atomicMass: 40.08,
    category: "alkaline-earth-metals",
    electronConfiguration: "[Ar] 4s²",
    valence: 2,
    period: 4,
    group: 2,
    state: "solid",
    meltingPoint: 842,
    boilingPoint: 1484,
    density: 1.55,
    discoveryYear: 1808,
    discoverer: "Humphry Davy",
    color: "#90EE90",
    uses: ["Bones", "Concrete", "Dairy products"],
    naturalOccurrence: "Limestone, chalk, marble",
    isotopes: ["Calcium-40", "Calcium-42", "Calcium-43", "Calcium-44"],
    interestingFacts: [
      "Essential for bones and teeth",
      "Most abundant mineral in human body",
      "Milk is a primary source",
    ],
    mnemonic: "Ca - Calcium: Strong Bones!",
    electronegativity: 1.00,
    ionizationEnergy: 590,
    atomicRadius: 197,
  },

{
    atomicNumber: 26,
    symbol: "Fe",
    name: "Iron",
    atomicMass: 55.845,
    category: "transition-metals",
    electronConfiguration: "[Ar] 3d⁶ 4s²",
    valence: 2,
    period: 4,
    group: 8,
    state: "solid",
    meltingPoint: 1538,
    boilingPoint: 2862,
    density: 7.87,
    discoveryYear: -5000,
    discoverer: "Ancient civilizations",
    color: "#808080",
    uses: ["Steel production", "Construction", "Transportation"],
    naturalOccurrence: "Iron ores (hematite, magnetite)",
    isotopes: ["Iron-54", "Iron-56", "Iron-57", "Iron-58"],
    interestingFacts: [
      "Fourth most abundant element in crust",
      "Essential for oxygen transport in blood (hemoglobin)",
      "Most used metal in industry",
    ],
    mnemonic: "Fe - Iron: The metal of civilization!",
    electronegativity: 1.83,
    ionizationEnergy: 762,
    atomicRadius: 140,
  },

{
    atomicNumber: 29,
    symbol: "Cu",
    name: "Copper",
    atomicMass: 63.546,
    category: "transition-metals",
    electronConfiguration: "[Ar] 3d¹⁰ 4s¹",
    valence: 1,
    period: 4,
    group: 11,
    state: "solid",
    meltingPoint: 1085,
    boilingPoint: 2562,
    density: 8.96,
    discoveryYear: -8000,
    discoverer: "Ancient civilizations",
    color: "#B87333",
    uses: ["Electrical wiring", "Alloys (bronze, brass)", "Plumbing"],
    naturalOccurrence: "Copper ores (chalcopyrite, chalcocite)",
    isotopes: ["Copper-63", "Copper-65"],
    interestingFacts: [
      "Best conductor of electricity (after silver)",
      "Used since ancient times for tools and art",
      "Turns green when oxidized (patina)",
    ],
    mnemonic: "Cu - Copper: Conductor of choice!",
    electronegativity: 1.90,
    ionizationEnergy: 745,
    atomicRadius: 135,
  },

{
    atomicNumber: 30,
    symbol: "Zn",
    name: "Zinc",
    atomicMass: 65.38,
    category: "transition-metals",
    electronConfiguration: "[Ar] 3d¹⁰ 4s²",
    valence: 2,
    period: 4,
    group: 12,
    state: "solid",
    meltingPoint: 420,
    boilingPoint: 907,
    density: 7.14,
    discoveryYear: 1746,
    discoverer: "Andreas Sigismund Marggraf",
    color: "#C0C0C0",
    uses: ["Galvanizing", "Brass alloys", "Medicine"],
    naturalOccurrence: "Sphalerite and calamine minerals",
    isotopes: ["Zinc-64", "Zinc-66", "Zinc-67", "Zinc-68"],
    interestingFacts: [
      "Essential trace element for immune system",
      "Used to prevent rust on steel",
      "Important for wound healing",
    ],
    mnemonic: "Zn - Zinc: Zesty for health!",
    electronegativity: 1.65,
    ionizationEnergy: 906,
    atomicRadius: 134,
  },

{
    atomicNumber: 79,
    symbol: "Au",
    name: "Gold",
    atomicMass: 196.97,
    category: "transition-metals",
    electronConfiguration: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹",
    valence: 1,
    period: 6,
    group: 11,
    state: "solid",
    meltingPoint: 1064,
    boilingPoint: 2856,
    density: 19.3,
    discoveryYear: -6000,
    discoverer: "Ancient civilizations",
    color: "#FFD700",
    uses: ["Jewelry", "Electronics", "Medical applications"],
    naturalOccurrence: "Native gold in deposits",
    isotopes: ["Gold-197"],
    interestingFacts: [
      "Most precious metal",
      "Highly malleable - can be beaten into thin sheets",
      "Doesn't tarnish or corrode",
    ],
    mnemonic: "Au - Gold: Always Valuable!",
    electronegativity: 2.54,
    ionizationEnergy: 890,
    atomicRadius: 144,
  },

{
    atomicNumber: 47,
    symbol: "Ag",
    name: "Silver",
    atomicMass: 107.87,
    category: "transition-metals",
    electronConfiguration: "[Kr] 4d¹⁰ 5s¹",
    valence: 1,
    period: 5,
    group: 11,
    state: "solid",
    meltingPoint: 962,
    boilingPoint: 2162,
    density: 10.5,
    discoveryYear: -3000,
    discoverer: "Ancient civilizations",
    color: "#C0C0C0",
    uses: ["Jewelry", "Photography", "Electronics", "Mirrors"],
    naturalOccurrence: "Silver sulfides and native silver",
    isotopes: ["Silver-107", "Silver-109"],
    interestingFacts: [
      "Best conductor of heat and electricity",
      "Used in photographic film",
      "Silver compounds are antimicrobial",
    ],
    mnemonic: "Ag - Silver: Shiny and special!",
    electronegativity: 1.93,
    ionizationEnergy: 731,
    atomicRadius: 145,
  },

{
    atomicNumber: 50,
    symbol: "Sn",
    name: "Tin",
    atomicMass: 118.71,
    category: "post-transition-metals",
    electronConfiguration: "[Kr] 4d¹⁰ 5s² 5p²",
    valence: 2,
    period: 5,
    group: 14,
    state: "solid",
    meltingPoint: 232,
    boilingPoint: 2602,
    density: 7.31,
    discoveryYear: -3500,
    discoverer: "Ancient civilizations",
    color: "#DCDCDC",
    uses: ["Bronze alloy", "Solder", "Cans"],
    naturalOccurrence: "Cassiterite ore",
    isotopes: ["Tin-120"],
    interestingFacts: [
      "Component of bronze (tin + copper)",
      "Used as solder for electronics",
      "Tin oxide is used as white pigment",
    ],
    electronegativity: 1.96,
    ionizationEnergy: 708,
    atomicRadius: 140,
  },

{
    atomicNumber: 53,
    symbol: "I",
    name: "Iodine",
    atomicMass: 126.90,
    category: "halogens",
    electronConfiguration: "[Kr] 4d¹⁰ 5s² 5p⁵",
    valence: 1,
    period: 5,
    group: 17,
    state: "solid",
    meltingPoint: 114,
    boilingPoint: 184,
    density: 4.93,
    discoveryYear: 1811,
    discoverer: "Bernard Courtois",
    color: "#4B0082",
    uses: ["Disinfectant", "Salt iodization", "Medical imaging"],
    naturalOccurrence: "Iodine salts in ocean water",
    isotopes: ["Iodine-127"],
    interestingFacts: [
      "Essential for thyroid function",
      "Purple vapor when heated",
      "Used in X-ray contrast media",
    ],
    mnemonic: "I - Iodine: Important for Immune system!",
    electronegativity: 2.66,
    ionizationEnergy: 1008,
    atomicRadius: 139,
  },

{
    atomicNumber: 54,
    symbol: "Xe",
    name: "Xenon",
    atomicMass: 131.29,
    category: "noble-gases",
    electronConfiguration: "[Kr] 4d¹⁰ 5s² 5p⁶",
    valence: 0,
    period: 5,
    group: 18,
    state: "gas",
    meltingPoint: -112,
    boilingPoint: -108,
    density: 0.0059,
    discoveryYear: 1898,
    discoverer: "William Ramsay & Morris William Travers",
    color: "#87CEEB",
    uses: ["Lighting", "Anesthesia", "Propellant"],
    naturalOccurrence: "Trace amounts in atmosphere",
    isotopes: ["Xenon-132"],
    interestingFacts: [
      "Heavy noble gas",
      "Used in xenon lamps for intensity",
      "Can form compounds with highly electronegative elements",
    ],
    electronegativity: 2.6,
    ionizationEnergy: 1170,
    atomicRadius: 108,
  },

{
    atomicNumber: 92,
    symbol: "U",
    name: "Uranium",
    atomicMass: 238.03,
    category: "actinides",
    electronConfiguration: "[Rn] 5f³ 6d¹ 7s²",
    valence: 3,
    period: 7,
    group: 3,
    state: "solid",
    meltingPoint: 1135,
    boilingPoint: 4131,
    density: 19.1,
    discoveryYear: 1789,
    discoverer: "Martin Heinrich Klaproth",
    color: "#FFD700",
    uses: ["Nuclear fuel", "Military weapons", "Medical isotopes"],
    naturalOccurrence: "Uraninite and carnotite ores",
    isotopes: ["Uranium-235", "Uranium-238"],
    interestingFacts: [
      "Heaviest naturally occurring element",
      "Radioactive and highly toxic",
      "Used as fuel in nuclear reactors",
    ],
    mnemonic: "U - Uranium: Ultimate power element!",
    electronegativity: 1.38,
    ionizationEnergy: 597,
    atomicRadius: 156,
  },

{
    atomicNumber: 90,
    symbol: "Th",
    name: "Thorium",
    atomicMass: 232.04,
    category: "actinides",
    electronConfiguration: "[Rn] 6d² 7s²",
    valence: 2,
    period: 7,
    group: 3,
    state: "solid",
    meltingPoint: 1750,
    boilingPoint: 4788,
    density: 11.7,
    discoveryYear: 1828,
    discoverer: "Jöns Jacob Berzelius",
    color: "#FFD700",
    uses: ["Nuclear fuel", "Mantles", "Welding electrodes"],
    naturalOccurrence: "Thorite and monazite minerals",
    isotopes: ["Thorium-232"],
    interestingFacts: [
      "Radioactive element",
      "Used in gas mantles for bright white light",
      "More abundant than uranium",
    ],
    electronegativity: 1.3,
    ionizationEnergy: 587,
    atomicRadius: 180,
  }
];

import periodicTableSource from "periodic-table/data.json";

type PeriodicTableSourceElement = {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: string | number | number[];
  cpkHexColor?: string;
  electronicConfiguration?: string;
  electronegativity?: number | string;
  atomicRadius?: number | string;
  ionizationEnergy?: number | string;
  electronAffinity?: number | string;
  oxidationStates?: string | number;
  standardState?: string;
  bondingType?: string;
  meltingPoint?: number | string;
  boilingPoint?: number | string;
  density?: number | string;
  groupBlock?: string;
  yearDiscovered?: number | string;
};

const PERIODIC_TABLE: PeriodicElement[] = (periodicTableSource as PeriodicTableSourceElement[]).map((element) => convertPeriodicTableElement(element));

export { PERIODIC_TABLE };

function convertPeriodicTableElement(element: PeriodicTableSourceElement): PeriodicElement {
  const atomicNumber = element.atomicNumber;
  return {
    atomicNumber,
    symbol: element.symbol,
    name: element.name,
    atomicMass: normalizeAtomicMass(element.atomicMass),
    category: mapCategory(element.groupBlock),
    electronConfiguration: normalizeElectronConfiguration(element.electronicConfiguration),
    valence: inferValence(atomicNumber, element.oxidationStates),
    period: inferPeriod(atomicNumber),
    group: inferGroup(atomicNumber, element.groupBlock),
    state: normalizeState(element.standardState),
    // Source dataset temperatures are in Kelvin; UI displays Celsius.
    meltingPoint: normalizeTemperatureCelsius(element.meltingPoint),
    boilingPoint: normalizeTemperatureCelsius(element.boilingPoint),
    density: normalizeNumber(element.density),
    discoveryYear: normalizeYear(element.yearDiscovered),
    discoverer: "Unknown",
    color: normalizeColor(element.cpkHexColor),
    uses: buildUses(element),
    naturalOccurrence: "",
    isotopes: [],
    interestingFacts: buildInterestingFacts(element),
    electronegativity: normalizeOptionalNumber(element.electronegativity),
    ionizationEnergy: normalizeOptionalNumber(element.ionizationEnergy),
    atomicRadius: normalizeOptionalNumber(element.atomicRadius),
  };
}

function getElementUseOverrides(): Record<number, string[]> {
  return {
  1: ["Rocket fuel", "Ammonia synthesis", "Fuel cells", "Hydrotreating", "Weather balloons"],
  2: ["MRI coolant", "Diving gas", "Rocket pressurizer", "Cryogenics", "Leak detection"],
  3: ["Rechargeable batteries", "Mood-stabilizing medicine", "Lightweight alloys", "Ceramics", "Aircraft systems"],
  4: ["Aerospace components", "X-ray windows", "Precision springs", "Optical instruments", "Nuclear reactor parts"],
  5: ["Borosilicate glass", "Detergents", "Semiconductors", "Neutron shielding", "Ceramic glazes"],
  6: ["Fuels and carbon materials", "Diamond tooling", "Graphite electrodes", "Plastics", "Organic chemistry"],
  7: ["Fertilizers", "Explosives", "Cryogenic systems", "Atmosphere control", "Chemical synthesis"],
  8: ["Respiratory support", "Combustion control", "Medical oxygen", "Steelmaking", "Water treatment"],
  9: ["Toothpaste fluorides", "Semiconductor etching", "Pharmaceutical synthesis", "Refrigerants", "Specialty polymers"],
  10: ["Neon lighting", "High-voltage indicators", "Cryogenics", "Lasers", "Vacuum technology"],
  11: ["Street lighting", "Chemical synthesis", "Heat-transfer systems", "Glass manufacture", "Battery research"],
  12: ["Lightweight alloys", "Fireworks", "Medicine", "Structural materials", "Desulfurization"],
  13: ["Aircraft manufacturing", "Packaging", "Electrical transmission", "Cookware", "Construction"],
  14: ["Semiconductors", "Solar cells", "Glass production", "Silicones", "Computer chips"],
  15: ["Fertilizers", "Matches", "Semiconductors", "Metal treatment", "Life-science compounds"],
  16: ["Sulfuric acid production", "Rubber vulcanization", "Fertilizers", "Batteries", "Pharmaceuticals"],
  17: ["Water disinfection", "PVC manufacture", "Bleaching", "Antiseptics", "Pharmaceutical synthesis"],
  18: ["Shielding gas", "Lighting", "Insulated windows", "Cryogenics", "Ion propulsion"],
  19: ["Fertilizers", "Soap production", "Battery electrolytes", "Glass fluxes", "Laboratory reagents"],
  20: ["Bones and supplements", "Cement", "Steel refining", "Medical imaging", "Ceramics"],
  26: ["Steel production", "Construction", "Transportation", "Tools and machinery", "Oxygen transport chemistry"],
  29: ["Electrical wiring", "Plumbing", "Alloys", "Electronics", "Antimicrobial surfaces"],
  30: ["Galvanizing steel", "Brass alloys", "Medicines", "Corrosion protection", "Die casting"],
  47: ["Jewelry", "Electronics contacts", "Mirrors", "Photography", "Silverware"],
  50: ["Solder and alloys", "Plating", "Tin coatings", "Glass manufacturing", "Battery materials"],
  53: ["Antiseptics", "Thyroid medicine", "Contrast agents", "Nutritional supplements", "Analytical chemistry"],
  54: ["Ion propulsion", "Flash lamps", "Anesthesia research", "Imaging", "Specialty lighting"],
  79: ["Jewelry", "Electronics", "Dentistry", "Investment bullion", "Spacecraft connectors"],
  80: ["Laboratory instrumentation", "Electrical switches", "Radiation shielding", "Sensors", "Specialty alloys"],
  82: ["Radiation shielding", "Alloys", "Batteries", "X-ray protection", "Industrial components"],
  90: ["Nuclear fuel cycles", "Gas mantles", "Research reactors", "Ceramics", "Alloying"],
  92: ["Nuclear power", "Marine propulsion", "Research reactors", "Radiotracers", "Shielding and security"],
  118: ["Nuclear research", "Superheavy element studies", "Detector calibration", "Theoretical chemistry", "Particle physics"],
  };
}

function getElementFactOverrides(): Record<number, string[]> {
  return {
  1: ["Lightest element", "Most abundant element in the universe", "Forms water with oxygen", "Isotopes are central to fusion research"],
  2: ["Second lightest element", "Lowest boiling point of any element", "Chemically inert noble gas", "Helium-4 is produced by alpha decay"],
  3: ["Lightest metal", "Soft enough to cut with a knife", "Key battery material", "High electrochemical potential"],
  6: ["Basis of organic chemistry", "Forms diamond and graphite", "Can form long chains and rings", "Has many allotropes"],
  7: ["Makes up most of Earth's atmosphere", "Triple bond in N2 is very strong", "Essential in proteins and DNA", "Used in inert atmospheres"],
  8: ["Essential for respiration", "Most abundant element in Earth's crust", "Supports combustion", "Forms oxides with nearly every element"],
  10: ["Used in neon glow tubes", "Stable noble gas", "Named from the Greek word for new", "Produces sharp orange-red spectral lines"],
  14: ["Semiconductor that powers modern electronics", "Second most abundant element in Earth's crust", "Forms silica and silicates", "Can behave as a metalloid or semiconductor"],
  26: ["Central to steelmaking", "Essential in hemoglobin chemistry", "Forms multiple oxidation states", "One of the most important engineering metals"],
  29: ["Excellent electrical conductor", "Develops a green patina when oxidized", "Used since antiquity", "Key metal in electronics and plumbing"],
  47: ["Reflects light efficiently", "Highest electrical conductivity of any metal", "Used in photography and electronics", "Known for antimicrobial surfaces"],
  79: ["Highly malleable noble metal", "Resists corrosion extremely well", "Associated with wealth and electronics", "Forms the basis of many catalysts"],
  82: ["Toxic heavy metal", "Historically used in pipes and pigments", "Dense enough for radiation shielding", "Forms stable +2 compounds"],
  90: ["More abundant than uranium in Earth's crust", "Used in gas mantles", "Important in nuclear fuel cycles", "Radioactive with a very long half-life"],
  92: ["Primary fuel in many reactors", "Undergoes fission when bombarded with neutrons", "Important in nuclear dating and power", "Naturally occurs in trace uranium ores"],
  };
}

function buildUses(element: PeriodicTableSourceElement): string[] {
  const override = getElementUseOverrides()[element.atomicNumber];
  if (override) return override.slice(0, 5);

  const categoryUses: Record<string, string[]> = {
    "alkali-metals": ["Battery chemistry", "Reducing agents", "Specialty glass", "Heat-transfer fluids"],
    "alkaline-earth-metals": ["Lightweight alloys", "Fireworks", "Cement and ceramics", "Medical and nutritional chemistry"],
    "transition-metals": ["Structural alloys", "Catalysts", "Electrical components", "Plating and tooling"],
    "post-transition-metals": ["Packaging", "Alloys", "Coatings", "Semiconductor compounds"],
    metalloids: ["Semiconductors", "Solar cells", "Glass and ceramics", "Sensors and electronics"],
    nonmetals: ["Life-science chemistry", "Fertilizers", "Fuel processing", "Polymers and synthesis"],
    halogens: ["Disinfectants", "Chemical synthesis", "Etching", "Pharmaceuticals"],
    "noble-gases": ["Lighting", "Shielding atmospheres", "Cryogenics", "Lasers and detectors"],
    lanthanides: ["Magnets", "Phosphors", "Catalysts", "Polishing compounds"],
    actinides: ["Nuclear fuel", "Radiochemistry", "Research sources", "Detector calibration"],
  };

  const uses = new Set<string>(categoryUses[element.groupBlock?.toLowerCase?.() as string] ?? categoryUses[mapCategory(element.groupBlock)] ?? []);

  switch (mapCategory(element.groupBlock)) {
    case "alkali-metals":
      uses.add("Battery materials");
      if (element.atomicNumber === 11) uses.add("Sodium-vapor lighting");
      if (element.atomicNumber === 19) uses.add("Soaps and detergents");
      break;
    case "alkaline-earth-metals":
      if (element.atomicNumber === 12) uses.add("Flare and fireworks chemistry");
      if (element.atomicNumber === 20) uses.add("Bone and mineral supplements");
      break;
    case "transition-metals":
      uses.add("High-performance engineering alloys");
      break;
    case "post-transition-metals":
      uses.add("Corrosion-resistant coatings");
      break;
    case "metalloids":
      uses.add("Microelectronics");
      break;
    case "nonmetals":
      uses.add("Organic and biological chemistry");
      break;
    case "halogens":
      uses.add("Oxidizing and disinfecting chemistry");
      break;
    case "noble-gases":
      uses.add("Controlled-atmosphere processing");
      break;
    case "lanthanides":
      uses.add("Permanent magnets and phosphors");
      break;
    case "actinides":
      uses.add("Fission and radiochemical research");
      break;
  }

  if (element.standardState === "gas") {
    uses.add("Low-temperature and vacuum systems");
  } else if (element.standardState === "liquid") {
    uses.add("Thermal-control systems");
  } else {
    uses.add("Solid-state materials and compounds");
  }

  if (element.meltingPoint !== undefined && Number.isFinite(Number(element.meltingPoint)) && Number(element.meltingPoint) > 1500) {
    uses.add("High-temperature materials");
  }

  if (element.atomicNumber === 2) {
    uses.add("MRI coolant");
    uses.add("Diving gas");
    uses.add("Rocket pressurizer");
  }

  return Array.from(uses).filter(Boolean).slice(0, 5);
}

function buildInterestingFacts(element: PeriodicTableSourceElement): string[] {
  const override = getElementFactOverrides()[element.atomicNumber];
  if (override) return override.slice(0, 5);

  const categoryName = ELEMENT_CATEGORIES[mapCategory(element.groupBlock)].name;
  const facts = new Set<string>();

  facts.add(`Atomic number ${element.atomicNumber} places ${element.name} in period ${inferPeriod(element.atomicNumber)} and group ${inferGroup(element.atomicNumber, element.groupBlock)}.`);
  facts.add(`It belongs to the ${categoryName} family and shows typical ${categoryName.toLowerCase()} chemistry.`);

  const melting = Number(element.meltingPoint);
  const boiling = Number(element.boilingPoint);
  const density = Number(element.density);

  if (Number.isFinite(melting) && Number.isFinite(boiling)) {
    facts.add(`Its standard-state behavior spans a melting point of ${formatValue(melting - 273.15)} °C and a boiling point of ${formatValue(boiling - 273.15)} °C.`);
  }

  if (Number.isFinite(density)) {
    if (density < 1) {
      facts.add(`Its low density makes it especially useful where lightweight or buoyant systems matter.`);
    } else if (density > 10) {
      facts.add(`Its high density is valuable for shielding, counters, and heavy-duty components.`);
    } else {
      facts.add(`Its moderate density supports structural and alloy applications.`);
    }
  }

  if (element.electronegativity !== undefined) {
    facts.add(`An electronegativity of ${formatValue(Number(element.electronegativity), 2)} helps explain its bonding and reactivity.`);
  }

  if (element.discoveryYear <= 0) {
    facts.add(`It has been known since antiquity, long before modern chemical classification.`);
  } else {
    facts.add(`Modern isolation or recognition is usually credited to ${element.discoverer} in ${element.discoveryYear}.`);
  }

  if (element.atomicNumber === 18) {
    facts.add("Argon is the most abundant noble gas in Earth's atmosphere.");
  }
  if (element.atomicNumber === 79) {
    facts.add("Gold is one of the most corrosion-resistant metals known.");
  }
  if (element.atomicNumber === 92) {
    facts.add("Uranium is the heaviest naturally occurring element used on a large industrial scale.");
  }

  return Array.from(facts).slice(0, 5);
}

function formatValue(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return "N/A";
  return Number.parseFloat(value.toFixed(decimals)).toString();
}

function inferPeriod(atomicNumber: number): number {
  if (atomicNumber <= 2) return 1;
  if (atomicNumber <= 10) return 2;
  if (atomicNumber <= 18) return 3;
  if (atomicNumber <= 36) return 4;
  if (atomicNumber <= 54) return 5;
  if (atomicNumber <= 86) return 6;
  return 7;
}

function inferGroup(atomicNumber: number, groupBlock?: string): number {
  if (atomicNumber === 1) return 1;
  if (atomicNumber === 2) return 18;
  if (atomicNumber >= 3 && atomicNumber <= 4) return atomicNumber - 2;
  if (atomicNumber >= 5 && atomicNumber <= 10) return atomicNumber + 8;
  if (atomicNumber >= 11 && atomicNumber <= 12) return atomicNumber - 10;
  if (atomicNumber >= 13 && atomicNumber <= 18) return atomicNumber + 0;
  if (atomicNumber >= 57 && atomicNumber <= 71) return 3;
  if (atomicNumber >= 89 && atomicNumber <= 103) return 3;

  if (groupBlock?.includes("alkali")) return 1;
  if (groupBlock?.includes("alkaline earth")) return 2;
  if (groupBlock?.includes("noble")) return 18;
  if (groupBlock?.includes("halogen")) return 17;

  const transitionMap: Record<number, number> = {
    21: 3, 22: 4, 23: 5, 24: 6, 25: 7, 26: 8, 27: 9, 28: 10, 29: 11, 30: 12,
    39: 3, 40: 4, 41: 5, 42: 6, 43: 7, 44: 8, 45: 9, 46: 10, 47: 11, 48: 12,
    72: 4, 73: 5, 74: 6, 75: 7, 76: 8, 77: 9, 78: 10, 79: 11, 80: 12,
    104: 4, 105: 5, 106: 6, 107: 7, 108: 8, 109: 9, 110: 10, 111: 11, 112: 12,
  };
  if (transitionMap[atomicNumber]) return transitionMap[atomicNumber];

  const pBlockMap: Record<number, number> = {
    13: 13, 14: 14, 15: 15, 16: 16, 17: 17, 18: 18,
    31: 13, 32: 14, 33: 15, 34: 16, 35: 17, 36: 18,
    49: 13, 50: 14, 51: 15, 52: 16, 53: 17, 54: 18,
    81: 13, 82: 14, 83: 15, 84: 16, 85: 17, 86: 18,
    113: 13, 114: 14, 115: 15, 116: 16, 117: 17, 118: 18,
  };
  return pBlockMap[atomicNumber] ?? 3;
}

function inferValence(atomicNumber: number, oxidationStates?: string | number): number {
  const inferredFromOxidation = inferValenceFromOxidationStates(oxidationStates);
  if (inferredFromOxidation !== undefined) {
    return inferredFromOxidation;
  }

  if (atomicNumber === 1) return 1;
  if (atomicNumber === 2) return 0;
  if ([3, 11, 19, 37, 55, 87].includes(atomicNumber)) return 1;
  if ([4, 12, 20, 38, 56, 88].includes(atomicNumber)) return 2;
  if ([5, 13, 31, 49, 81, 113].includes(atomicNumber)) return 3;
  if ([6, 14, 32, 50, 82, 114].includes(atomicNumber)) return 4;
  if ([7, 15, 33, 51, 83, 115].includes(atomicNumber)) return 3;
  if ([8, 16, 34, 52, 84, 116].includes(atomicNumber)) return 2;
  if ([9, 17, 35, 53, 85, 117].includes(atomicNumber)) return 1;
  if ([10, 18, 36, 54, 86, 118].includes(atomicNumber)) return 0;
  if (atomicNumber >= 57 && atomicNumber <= 71) return 3;
  if (atomicNumber >= 89 && atomicNumber <= 103) return 3;
  return atomicNumber <= 20 ? Math.min(8 - (atomicNumber % 8), 4) : 2;
}

function inferValenceFromOxidationStates(oxidationStates?: string | number): number | undefined {
  if (oxidationStates === undefined || oxidationStates === null || oxidationStates === "") {
    return undefined;
  }

  const values = String(oxidationStates)
    .match(/-?\d+/g)
    ?.map((v) => Number.parseInt(v, 10))
    .filter((v) => Number.isFinite(v));

  if (!values || values.length === 0) {
    return undefined;
  }

  const positive = values.filter((v) => v > 0);
  if (positive.length > 0) {
    return Math.min(...positive);
  }

  return Math.abs(values[0]);
}

function mapCategory(groupBlock?: string): ElementCategory {
  const normalized = (groupBlock || "").toLowerCase();
  if (normalized.includes("alkali")) return "alkali-metals";
  if (normalized.includes("alkaline earth")) return "alkaline-earth-metals";
  if (normalized.includes("transition")) return "transition-metals";
  if (normalized.includes("post-transition") || normalized === "metal") return "post-transition-metals";
  if (normalized.includes("metalloid")) return "metalloids";
  if (normalized.includes("halogen")) return "halogens";
  if (normalized.includes("noble")) return "noble-gases";
  if (normalized.includes("lanth")) return "lanthanides";
  if (normalized.includes("actin")) return "actinides";
  return "nonmetals";
}

function normalizeState(state?: string): "solid" | "liquid" | "gas" {
  if (state === "liquid") return "liquid";
  if (state === "gas") return "gas";
  return "solid";
}

function normalizeColor(color?: string): string {
  if (color === undefined || color === null || color === "") return "#94a3b8";
  const colorString = String(color);
  const hex = colorString.startsWith("#") ? colorString : `#${colorString}`;
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    return `#${hex.slice(1).split("").map((char) => char + char).join("")}`;
  }
  if (/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  return "#94a3b8";
}

function normalizeAtomicMass(value: string | number | number[]): number {
  if (Array.isArray(value)) return Number(value[0]) || 0;
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(String(value).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeNumber(value?: number | string): number {
  if (value === undefined || value === null || value === "") return Number.NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function normalizeTemperatureCelsius(value?: number | string): number {
  const kelvin = normalizeNumber(value);
  if (!Number.isFinite(kelvin)) return Number.NaN;
  return Number.parseFloat((kelvin - 273.15).toFixed(2));
}

function normalizeOptionalNumber(value?: number | string): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeYear(value?: number | string): number {
  if (value === undefined || value === null || value === "Ancient") return -1000;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : -1000;
}

function normalizeElectronConfiguration(value?: string): string {
  return value ? value.replace(/\s+/g, " ").trim() : "";
}

export const CHEMISTRY_FACTS = [
  "Did you know? Diamond and graphite are both pure carbon but have different properties!",
  "The element mercury is the only metal that is liquid at room temperature.",
  "Oxygen makes up about 21% of the air we breathe.",
  "Gold is so malleable that a single ounce can be beaten thin enough to cover 300 square feet!",
  "The human body contains about 7 x 10²⁷ atoms.",
  "Hydrogen is the most abundant element in the universe.",
  "Helium is the only element that never solidifies, no matter how cold.",
  "Atoms are mostly empty space - if atoms were the size of a football stadium, the nucleus would be the size of a pea.",
  "The periodic table is named after Dmitri Mendeleev who organized it by atomic weight.",
  "Neon signs glow because electrons get excited by electric current and emit light.",
];

export const LEARNING_MNEMONICS = {
  alkaliMetals:
    "LiNaKRbCsF - Little Nasty Kittens Run, Cats are Fierce!",
  halogens: "F Cl Br I At - Friend Can't Bring Iguana At",
  nobleGases:
    "He Ne Ar Kr Xe Rn - He Never Arguments, Keeps Xenon Radon",
  metalloids: "B Si Ge As Sb Te - Boring Silicon Germs Are Seriously Terrible",
  transitionMetals:
    "Remember: They're in the middle and have variable oxidation states!",
};

export const PERIOD_INFORMATION = {
  1: "Period 1: Contains only H and He. Smallest atoms.",
  2: "Period 2: First period with main group elements. Contains C, N, O - essential for life!",
  3: "Period 3: Contains Na, Mg, Al - important metals",
  4: "Period 4: First period with transition metals. Contains K, Ca, and Fe",
  5: "Period 5: Contains Br, I, and more transition metals",
  6: "Period 6: Contains Ba, Lanthanides, and Hg (the only liquid metal)",
  7: "Period 7: Contains Cs, Fr, Ra, and Actinides. Many radioactive elements",
};
