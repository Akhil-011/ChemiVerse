/**
 * ChemVerse Backend Proxy Server
 * Handles OpenRouter API requests (DeepSeek for Reaction Prediction)
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const app = express();
const PORT = process.env.VITE_BACKEND_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

const OPENROUTER_URL = process.env.VITE_OPENROUTER_API_URL || "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.VITE_OPENROUTER_MODEL || "openrouter/free";

console.log("[DeepSeek Proxy] Initializing OpenRouter Backend Proxy");
console.log(`[DeepSeek Proxy] OpenRouter Model: ${OPENROUTER_MODEL}`);
console.log(`[DeepSeek Proxy] OpenRouter API Key loaded: ${OPENROUTER_API_KEY ? "✓ Yes" : "✗ NO"}`);

if (!OPENROUTER_API_KEY) {
  console.error("⚠️  CRITICAL: VITE_OPENROUTER_API_KEY not found in .env.local");
  console.error("⚠️  Make sure VITE_OPENROUTER_API_KEY is set in .env.local");
}

/**
 * POST /api/rxn/predict
 * Proxy endpoint for OpenRouter DeepSeek reaction prediction
 */
app.post("/api/rxn/predict", async (req, res) => {
  try {
    const { reactants } = req.body;

    if (!reactants) {
      return res.status(400).json({ error: "reactants parameter required" });
    }

    if (!OPENROUTER_API_KEY) {
      console.error("[DeepSeek Proxy] API KEY NOT CONFIGURED - Cannot proceed");
      return res.status(500).json({ 
        error: "OpenRouter API key not configured. Check VITE_OPENROUTER_API_KEY in .env.local" 
      });
    }

    console.log(`[DeepSeek Proxy] Predicting reaction for: ${reactants}`);

    const prompt = `You are a chemistry expert. Predict the reaction for the given reactants and provide the response in this EXACT JSON format:
{
  "balancedEquation": "complete balanced equation here",
  "products": ["product1", "product2"],
  "reactionType": "type of reaction",
  "energyChange": "exothermic/endothermic/unknown",
  "enthalpy": "enthalpy value or N/A",
  "mechanism": "brief explanation of mechanism",
  "conditions": ["condition1", "condition2"],
  "industrialUses": ["use1", "use2"],
  "safetyNotes": ["safety1", "safety2"]
}

Reactants: ${reactants}

Provide ONLY the JSON response, no other text.`;

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "ChemVerse"
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[DeepSeek Proxy] OpenRouter error (${response.status}):`, error);
      return res.status(response.status).json({ 
        error: `OpenRouter API error (${response.status}): ${error}`
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log(`[DeepSeek Proxy] AI Response received`);
    
    // Parse the JSON response from DeepSeek
    let prediction;
    try {
      prediction = JSON.parse(aiResponse);
    } catch (e) {
      console.error("[DeepSeek Proxy] Failed to parse AI response:", aiResponse);
      prediction = {
        balancedEquation: aiResponse.substring(0, 100),
        products: ["Unknown products"],
        reactionType: "Unknown",
        energyChange: "unknown",
        enthalpy: "N/A",
        mechanism: "Unable to parse mechanism",
        conditions: [],
        industrialUses: [],
        safetyNotes: ["Verify predictions with domain experts"]
      };
    }

    // Format response similar to IBM RXN
    res.json({
      rxnId: `deepseek-${Date.now()}`,
      reactants: reactants,
      products: prediction.products?.join(", ") || "Unknown",
      confidence: 0.85,
      ...prediction
    });
  } catch (error) {
    console.error("[DeepSeek Proxy] Request failed:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/rxn/health
 * Health check endpoint
 */
app.get("/api/rxn/health", async (req, res) => {
  res.json({ 
    status: OPENROUTER_API_KEY ? "healthy" : "unhealthy",
    service: "DeepSeek via OpenRouter",
    model: OPENROUTER_MODEL
  });
});

/**
 * Server startup with error handling
 */
const server = app.listen(PORT, () => {
  console.log(`✅ ChemVerse Backend Proxy running on http://localhost:${PORT}`);
  console.log(`🤖 DeepSeek Model: ${OPENROUTER_MODEL}`);
  console.log(`🔐 API Key configured: ${OPENROUTER_API_KEY ? "Yes" : "No"}`);
});

// Handle port already in use error
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error(`Please kill the existing process or use a different port.`);
    console.error(`\nTo find and kill the process on Windows:`);
    console.error(`  netstat -ano | findstr ":${PORT}"`);
    console.error(`  taskkill /PID <PID> /F\n`);
    process.exit(1);
  } else {
    console.error("Server error:", err);
    process.exit(1);
  }
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n🛑 Server shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
