// ============================================================
// ChemFusion AI — API Service Layer
// Groq API Integration for AI Tutor
// ============================================================

import Groq from "groq-sdk";

// ============================================================
// Environment Variables
// ============================================================

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// ============================================================
// Groq AI Initialization
// ============================================================

let groq: Groq | null = null;

if (GROQ_API_KEY && GROQ_API_KEY !== "your_groq_api_key_here") {
  groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });
  console.log("[API] Groq AI initialized successfully");
} else {
  console.warn(
    "[API] Groq API key missing. Add VITE_GROQ_API_KEY to .env.local"
  );
}

// ============================================================
// HTTP Request Helper
// ============================================================

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  console.log(`[API] ${options?.method ?? "GET"} ${url}`);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(
      `API Error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// ============================================================
// Reaction Predictor API
// ============================================================

export async function predictReaction(input: string) {
  console.log("[API] Predicting reaction:", input);

  // Future backend integration placeholder
  throw new Error(
    "Reaction prediction backend not implemented yet."
  );
}

// ============================================================
// Molecule Database API (PubChem)
// ============================================================

export async function fetchMoleculeByName(name: string) {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(
      name
    )}/JSON`;

    console.log("[API] Fetching molecule:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Molecule not found");
    }

    return await response.json();
  } catch (error) {
    console.error("[API] PubChem Error:", error);
    throw error;
  }
}

// ============================================================
// AI Tutor API — Groq
// ============================================================

export async function sendTutorMessage(
  messages: { role: string; content: string }[]
) {
  if (!groq) {
    throw new Error(
      "Groq API not configured. Add VITE_GROQ_API_KEY to .env.local"
    );
  }

  try {
    // Get the latest user message
    const latestMessage = messages[messages.length - 1];

    if (!latestMessage?.content) {
      throw new Error("No message content found");
    }

    // System prompt for chemistry tutor
    const systemPrompt = `You are ChemFusion AI Tutor, an expert chemistry teacher helping students understand:
- Organic Chemistry
- Inorganic Chemistry
- Physical Chemistry
- Chemical Reactions
- Thermodynamics
- Molecular Structures
- Laboratory Concepts

Rules:
- Explain clearly and simply using student-friendly language
- Give examples where helpful
- Keep responses educational and concise (2-3 paragraphs max)
- Focus only on chemistry topics
- If asked non-chemistry questions, politely redirect to chemistry

Your goal is to help students learn chemistry effectively.`;

    // Call Groq API with chat completion
    // Note: Groq requires system prompt as the first message, not as a separate parameter
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: latestMessage.content,
        },
      ],
      model: "llama-3.1-8b-instant", // Fast, free model on Groq
      temperature: 0.7,
      max_tokens: 1024,
    });

    const responseText =
      completion.choices[0]?.message?.content || "No response generated";

    return responseText;
  } catch (error) {
    console.error("[API] Groq Error:", error);
    throw error;
  }
}

// ============================================================
// Experiments API (Mock)
// ============================================================

export async function saveExperiment(data: {
  chemicals: string[];
  reaction: string;
}) {
  console.log("[API] Experiment saved:", data);

  return {
    success: true,
    message: "Experiment saved successfully",
  };
}

export async function fetchExperiments() {
  console.log("[API] Fetching experiments");

  return [];
}

// ============================================================
// User Progress API (Mock)
// ============================================================

export async function saveProgress(data: {
  action: string;
  data: unknown;
}) {
  console.log("[API] Progress saved:", data);

  return {
    success: true,
  };
}
