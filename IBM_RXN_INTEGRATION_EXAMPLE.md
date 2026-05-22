// ============================================================
// INTEGRATION EXAMPLE: How to use reactionPredictionService
// Place this logic in your ReactionPredictor.tsx component
// ============================================================

import {
  predictReaction,
  getReactionDetails,
  parseReactionInput,
  checkIBMRXNHealth,
  type ReactionPredictionResult,
} from "@/services/reactionPredictionService";

// ============================================================
// Example Hook: useReactionPredictor
// ============================================================

export function useReactionPredictor() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReactionPredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const predictChemicalReaction = async (
    reactantsInput: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Parse input (convert formula to SMILES if needed)
      const smilesInput = await parseReactionInput(reactantsInput);
      console.log("Input as SMILES:", smilesInput);

      // Call IBM RXN prediction
      const prediction = await predictReaction(smilesInput);
      setResult(prediction);

      // Optionally get more details
      const details = await getReactionDetails(prediction.rxnId);
      console.log("Full reaction details:", details);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      console.error("Prediction failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    result,
    error,
    predictChemicalReaction,
  };
}

// ============================================================
// Example Component Usage
// ============================================================

/*
import { useReactionPredictor } from "@/hooks/useReactionPredictor";

export function MyReactionPredictorComponent() {
  const { loading, result, error, predictChemicalReaction } = useReactionPredictor();

  const handlePredict = async () => {
    // Can accept either formula or SMILES
    await predictChemicalReaction("H₂ + O₂");
    // Or: await predictChemicalReaction("C.O");  // SMILES format
  };

  return (
    <div>
      <button onClick={handlePredict} disabled={loading}>
        {loading ? "Predicting..." : "Predict Reaction"}
      </button>

      {result && (
        <div>
          <h3>Reaction ID: {result.rxnId}</h3>
          <p>Products: {result.products}</p>
          <p>Confidence: {(result.confidence * 100).toFixed(1)}%</p>
        </div>
      )}

      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}
*/

// ============================================================
// Key Integration Points
// ============================================================

/*
✅ ISOLATED - No dependencies on:
   - AI Tutor (Groq) - separate service
   - ChemTutor component - separate module
   - Molecule Viewer - independent
   - Any chat/message types

✅ MODULAR - Can be used anywhere:
   - ReactionPredictor.tsx
   - ChemLab.tsx
   - Dashboard.tsx
   - Any page needing reaction prediction

✅ REUSABLE - Single function call:
   const result = await predictReaction(smilesString);

✅ SAFE - Zero impact on existing code:
   - AI Tutor still uses Groq
   - Molecule Viewer unchanged
   - All other modules unaffected
*/
