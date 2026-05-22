// ============================================================
// Reaction Prediction Service
// Uses OpenRouter API with DeepSeek Model for AI predictions
// ============================================================

const BACKEND_API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// ============================================================
// Type Definitions
// ============================================================

export interface ReactionPredictionInput {
  reactants: string; // e.g., "H2 + O2"
}

export interface ReactionPredictionResult {
  rxnId: string;
  reactants: string;
  products: string;
  confidence: number;
  reactionType?: string;
  yield?: number;
  conditions?: string;
}

export interface ReactionDetails {
  rxnId: string;
  reactants: string[];
  products: string[];
  conditions: {
    temperature?: string;
    pressure?: string;
    solvent?: string;
    time?: string;
    catalyst?: string;
  };
  yield: number;
  selectivity: number;
}

// ============================================================
// Public API Functions (Reaction Prediction)
// ============================================================

/**
 * Predict reaction products from reactants using DeepSeek via OpenRouter backend
 * @param reactants - Chemical reactants string (e.g., "H2 + O2")
 * @returns Predicted reaction details
 */
export async function predictReaction(
  reactants: string
): Promise<ReactionPredictionResult> {
  if (!reactants || reactants.trim() === "") {
    throw new Error("Reactants cannot be empty");
  }

  try {
    // Send raw reactants directly to backend (which uses DeepSeek/OpenRouter)
    console.log("[Reaction Predictor] Sending reactants:", reactants);

    const predictionResponse = await fetch(`${BACKEND_API_URL}/rxn/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reactants }),
    });

    if (!predictionResponse.ok) {
      const error = await predictionResponse.text();
      throw new Error(`Backend error: ${error}`);
    }

    const prediction = await predictionResponse.json();
    console.log("[Reaction Predictor] Prediction received:", prediction);

    return prediction;
  } catch (error) {
    console.error("[Reaction Predictor] Prediction error:", error);
    throw error;
  }
}

/**
 * Poll for prediction status until complete (via backend proxy)
 * (Not used for DeepSeek - immediate response)
 */

/**
 * Get detailed reaction information
 */
export async function getReactionDetails(
  rxnId: string
): Promise<ReactionDetails> {
  // Not needed for DeepSeek
  throw new Error("Not implemented for DeepSeek");
}

/**
 * Common chemical formulas/symbols to SMILES mapping
 * (Kept for backward compatibility, not used for DeepSeek)
 */
const FORMULA_TO_SMILES: Record<string, string> = {
  // Elements (single atoms)
  "H": "[H]",
  "C": "C",
  "N": "N",
  "O": "O",
  "Cl": "Cl",
  "Br": "Br",
  "I": "I",
  "F": "F",
  "S": "S",
  "P": "P",
  "Na": "[Na]",
  "K": "[K]",
  "Ca": "[Ca]",
  "Mg": "[Mg]",
  "Fe": "[Fe]",
  "Cu": "[Cu]",
  "Zn": "[Zn]",
  "Li": "[Li]",
  "B": "[B]",
  "As": "[As]",
  // Common diatomic molecules
  "H2": "[H][H]",
  "O2": "O=O",
  "N2": "N#N",
  "Cl2": "Cl-Cl",
  "Br2": "Br-Br",
  "F2": "F-F",
  "I2": "I-I",
  "S2": "S-S",
  "P2": "P-P",
  // Common compounds
  "H2O": "O",
  "CO2": "C(=O)=O",
  "NH3": "N",
  "CH4": "C",
  "NaCl": "[Na+].[Cl-]",
  "HCl": "Cl",
  "NaOH": "[Na+].[OH-]",
  "H2SO4": "OS(=O)(=O)O",
  "HNO3": "[H+].[O-][N+](=O)[O-]",
  "CH3COOH": "CC(=O)O",
  "KOH": "[K+].[OH-]",
  "Ca(OH)2": "[Ca+2].[OH-].[OH-]",
  "Na2CO3": "[Na+].[Na+].[O-]C(=O)[O-]",
};

/**
 * Convert chemical formula to SMILES notation
 * Tries lookup table first, then PubChem API as fallback
 */
export async function formulaToSmiles(formula: string): Promise<string> {
  const trimmed = formula.trim();

  if (!trimmed) {
    throw new Error("Formula cannot be empty");
  }

  // Check lookup table first (case-insensitive)
  const lookupKey = Object.keys(FORMULA_TO_SMILES).find(
    (key) => key.toLowerCase() === trimmed.toLowerCase()
  );
  
  if (lookupKey) {
    const smiles = FORMULA_TO_SMILES[lookupKey];
    console.log(`Found SMILES for "${trimmed}": ${smiles}`);
    return smiles;
  }

  // Try PubChem API as fallback
  try {
    const response = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(
        trimmed
      )}/property/CanonicalSMILES/JSON`
    );

    if (response.ok) {
      const data = await response.json();
      const smiles = data.PropertyTable?.Properties?.[0]?.CanonicalSMILES;
      if (smiles) {
        console.log(`PubChem converted "${trimmed}" to SMILES: ${smiles}`);
        return smiles;
      }
    }
  } catch (error) {
    console.warn(`PubChem conversion failed for "${trimmed}":`, error);
  }

  // If all else fails, return the raw formula as fallback
  console.warn(`No SMILES conversion found for "${trimmed}", using raw input`);
  return trimmed;
}

/**
 * Parse reaction string (for DeepSeek, just normalize and return)
 * DeepSeek understands chemistry notation, so we don't need SMILES conversion
 */
export async function parseReactionInput(input: string): Promise<string> {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("Input cannot be empty");
  }

  // Just return the input as-is (DeepSeek will understand it)
  console.log("[Reaction Predictor] Input:", trimmed);
  return trimmed;
}

// ============================================================
// Health Check
// ============================================================

export async function checkIBMRXNHealth(): Promise<boolean> {
  // Not used for DeepSeek - backend handles health checks
  return true;
}
