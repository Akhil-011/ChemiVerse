# IBM RXN for Chemistry API Setup

## Overview
IBM RXN for Chemistry is a dedicated AI engine for chemical reaction prediction. This setup keeps it **completely isolated** from:
- AI Tutor (Groq/Chat)
- Molecule Viewer
- Other existing modules

## Step 1: Get IBM RXN API Credentials

1. Visit [IBM RXN for Chemistry](https://rxn.res.ibm.com/)
2. Sign up for a free account
3. Go to **Profile/Settings** → **API Key**
4. Copy your API key

## Step 2: Add to `.env.local`

```
# IBM RXN for Chemistry (Reaction Prediction only)
VITE_IBM_RXN_API_KEY=your_ibm_rxn_key_here
VITE_IBM_RXN_API_URL=https://rxn.res.ibm.com/rxn/api/v1
```

## Step 3: Project Structure

```
src/
├── services/
│   ├── api.ts                    (AI Tutor - Groq) ← UNCHANGED
│   └── reactionPredictionService.ts (NEW - IBM RXN) ← ISOLATED
├── pages/
│   ├── ChemTutor.tsx             (Chat) ← UNCHANGED
│   ├── ReactionPredictor.tsx      (Uses new service)
│   └── MoleculeViewer.tsx         (Unchanged)
```

## Step 4: Module Isolation

**`reactionPredictionService.ts`** is completely independent:
- ✅ Own API initialization
- ✅ Own error handling
- ✅ No dependencies on Groq/ChatMessage types
- ✅ Exports only chemistry reaction functions
- ✅ Zero impact on other modules

**`api.ts` (AI Tutor)** remains untouched:
- Groq client initialization
- `sendTutorMessage()` function
- Molecule database functions

## API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `/predict` | Predict reaction products |
| `/rxn` | Get reaction details |
| `/status/{rxn_id}` | Check prediction status |

## Key Benefits

🔒 **Modular** — Completely separate service
⚡ **Fast** — IBM RXN is specialized for chemistry
🎯 **Focused** — Only for reaction prediction
🛡️ **Safe** — No accidental interference with other features
📦 **Maintainable** — Can update/replace independently

---

**Learn More**: [IBM RXN API Docs](https://github.com/IBM/rxn-docs)
