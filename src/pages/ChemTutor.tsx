// ============================================================
// ChemFusion AI — AI Chemistry Tutor (Chat Interface)
// Mocked AI responses using pattern matching
// ============================================================
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Sparkles, BookOpen, RotateCcw, Mic, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { sendTutorMessage } from "@/services/api";
import { TUTOR_RESPONSES } from "@/constants/chemistry";
import { generateId, formatRelativeTime, hasSpeechRecognition } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-supabase";
import { safeTrackActivity } from "@/lib/activity";

const SUGGESTED_QUESTIONS = [
  "What is a mole?",
  "Explain oxidation",
  "What is entropy?",
  "pH scale",
  "Covalent bond",
  "Ionic bond",
  "Periodic table",
  "Hydrogen bond",
];

const GREETING: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hello! 👋 I'm **ChemFusion AI Tutor**, your personal chemistry assistant. I can help you understand chemical concepts, explain reactions, and answer your science questions.\n\nTry asking me about: *the mole concept, pH scale, oxidation, chemical bonds,* or any chemistry topic you're studying!",
  timestamp: new Date(),
};

function formatMessage(text: string) {
  // Simple markdown-like formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-muted text-cyan-400 text-[11px] font-mono">$1</code>')
    .replace(/\n/g, '<br />');
}

export default function ChemTutor() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const getAIResponse = (query: string): string => {
    const lower = query.toLowerCase().trim();
    const key = Object.keys(TUTOR_RESPONSES).find((k) => lower.includes(k));
    if (key) return TUTOR_RESPONSES[key];

    // Chemistry keyword detection
    if (lower.includes("acid") || lower.includes("base")) {
      return "Acids donate protons (H⁺) while bases accept them — this is the Brønsted-Lowry definition. The strength of an acid is measured by its Ka value. Strong acids (HCl, H₂SO₄) fully dissociate; weak acids (acetic acid) only partially dissociate. Ask me about a specific acid/base topic!";
    }
    if (lower.includes("electron") || lower.includes("orbital")) {
      return "Electrons occupy **atomic orbitals** (s, p, d, f) around the nucleus. The Aufbau principle states electrons fill lowest-energy orbitals first. Hund's rule says electrons spread across equal-energy orbitals before pairing. Pauli exclusion: no two electrons can have identical quantum numbers.";
    }
    if (lower.includes("catalyst")) {
      return "A **catalyst** speeds up a chemical reaction without being consumed. It works by lowering the activation energy (Ea) — creating an alternative reaction pathway. Example: iron catalyst in the Haber process (N₂ + 3H₂ → 2NH₃). Enzymes are biological catalysts!";
    }
    if (lower.includes("reaction rate") || lower.includes("kinetics")) {
      return "**Reaction rate** depends on: (1) Concentration — more particles, more collisions; (2) Temperature — higher T = more energy = faster; (3) Surface area — smaller particles react faster; (4) Catalyst — lowers activation energy; (5) Pressure (for gases). Rate law: Rate = k[A]ᵐ[B]ⁿ";
    }
    if (lower.includes("equilibrium")) {
      return "**Chemical equilibrium** occurs when forward and reverse reaction rates are equal. Le Chatelier's Principle: if a system at equilibrium is disturbed, it shifts to counteract the change. The equilibrium constant K = [products]/[reactants] (each raised to stoichiometric coefficients). K > 1 favors products.";
    }

    return TUTOR_RESPONSES.default;
  };

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text || input).trim();
    if (!content) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      // Build message history for Gemini
      const messageHistory = messages
        .concat(userMsg)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Call Gemini API
      const response = await sendTutorMessage(messageHistory);

      const aiMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      safeTrackActivity(user?.id, {
        eventType: "ai_interaction",
        module: "tutor",
        title: "Tutor message sent",
        description: content,
        route: "/tutor",
        payload: { userMessage: content, assistantMessage: response },
      });
    } catch (error) {
      console.error("Chat error:", error);
      
      // Fallback: use mocked responses if API fails
      const fallbackResponse = getAIResponse(content);
      const aiMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: `⚠️ **Using offline mode** (API not available)\n\n${fallbackResponse}`,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMsg]);
      safeTrackActivity(user?.id, {
        eventType: "ai_interaction",
        module: "tutor",
        title: "Tutor fallback response",
        description: content,
        route: "/tutor",
        payload: { userMessage: content, offline: true },
      });
      toast.error("Using offline responses — check API configuration");
    } finally {
      setTyping(false);
    }
  }, [input, messages]);

  const clearChat = () => {
    setMessages([GREETING]);
    setInput("");
    toast("Conversation cleared");
  };

  const startVoiceInput = () => {
    if (!hasSpeechRecognition()) {
      toast.error("Speech recognition not supported.");
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[0][0].transcript;
      setInput(text);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="min-h-screen pt-4 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <span className="section-label mb-1 block">AI Chemistry Tutor</span>
          <h1 className="font-display font-bold text-3xl text-foreground">
            Your Personal <span className="gradient-text">Chemistry AI</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_260px] gap-5">

          {/* ── Chat Interface ─────────────────────────────── */}
          <div className="flex flex-col glass-card overflow-hidden" style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}>
            {/* Chat Header */}
            <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600">
                  <Bot size={16} className="text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-background" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">ChemFusion Tutor</p>
                  <p className="text-[10px] text-emerald-400">Online · Ready to help</p>
                </div>
              </div>
              <button onClick={clearChat} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Clear chat">
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                      msg.role === "assistant"
                        ? "bg-gradient-to-br from-cyan-500 to-blue-600"
                        : "bg-gradient-to-br from-purple-500 to-pink-600"
                    )}
                  >
                    {msg.role === "assistant" ? <Bot size={14} className="text-white" /> : <User size={14} className="text-white" />}
                  </div>

                  {/* Bubble */}
                  <div className={cn("max-w-[80%] space-y-1", msg.role === "user" ? "items-end" : "items-start")}>
                    <div
                      className={cn("px-4 py-3 rounded-2xl text-sm leading-relaxed", msg.role === "user" ? "chat-user rounded-tr-sm" : "chat-ai rounded-tl-sm")}
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                    />
                    <p className="text-[10px] text-muted-foreground px-1">
                      {formatRelativeTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-cyan-500 to-blue-600">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="chat-ai px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border/40 flex-shrink-0">
              <div className="flex gap-2 items-center">
                <button
                  onClick={startVoiceInput}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-xl border transition-colors flex-shrink-0",
                    isListening
                      ? "border-red-400/50 bg-red-400/10 text-red-400"
                      : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  title="Voice input"
                >
                  <Mic size={15} className={isListening ? "animate-pulse" : ""} />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !typing && sendMessage()}
                  placeholder="Ask a chemistry question..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#00d4ff] text-sm"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={typing || !input.trim()}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-xl transition-all flex-shrink-0",
                    input.trim() && !typing
                      ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Sidebar ────────────────────────────────────── */}
          <aside className="space-y-4">
            {/* Suggested questions */}
            <div className="glass-card p-4">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                <Sparkles size={12} />
                Suggested Topics
              </h3>
              <div className="space-y-1.5">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    disabled={typing}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:border-[rgba(0,212,255,0.3)] hover:bg-muted transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="glass-card p-4">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                <BookOpen size={12} />
                About the Tutor
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ChemFusion Tutor uses advanced AI to explain chemistry concepts at any level — from high school basics to university-level topics.
              </p>
              <div className="mt-3 space-y-1.5">
                {["General Chemistry", "Organic Chemistry", "Thermodynamics", "Electrochemistry", "Quantum Chemistry"].map((topic) => (
                  <div key={topic} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    {topic}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
