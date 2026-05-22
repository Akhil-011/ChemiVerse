// ============================================================
// ChemFusion AI — Voice Command Controller
// Web Speech API voice commands
// ============================================================
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, Mic, MicOff, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { executeCommand, openMolecule } from "@/lib/commandRouter";
import { matchCommand } from "@/lib/commandMatcher";
import { getSpeechRecognitionConstructor, hasNativeSpeechRecognition, normalizeTranscript, speakText } from "@/lib/speechUtils";
import { useAuth } from "@/hooks/use-supabase";
import { safeTrackActivity } from "@/lib/activity";
import { micPulseVariants, modalVariants, transcriptVariants } from "@/lib/animationVariants";
import { cardTransition, modalTransition, springTapTransition } from "@/lib/motionPresets";

export default function VoiceControl() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const listeningRef = useRef(false);
  const lastProcessedRef = useRef<{ text: string; at: number } | null>(null);

  const feedback = useMemo(
    () => ({
      speak: speakText,
      notify: (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
        if (type === "success") toast.success(message);
        if (type === "error") toast.error(message);
        if (type === "info") toast.info(message);
        if (type === "warning") toast.warning(message);
      },
    }),
    []
  );

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    setIsListening(false);

    const recognition = recognitionRef.current;
    recognitionRef.current = null;

    try {
      recognition?.abort();
    } catch {
      recognition?.stop();
    }

    setTranscript("");
  }, []);

  const handleFinalTranscript = useCallback(
    (finalTranscript: string) => {
      const cleaned = finalTranscript.trim();
      if (!cleaned) return;

      console.log("[VoiceControl] Final Heard:", cleaned);
      setTranscript(cleaned);

      const normalized = normalizeTranscript(cleaned);
      const now = Date.now();
      const lastProcessed = lastProcessedRef.current;
      if (lastProcessed && lastProcessed.text === normalized && now - lastProcessed.at < 1500) {
        return;
      }

      const matchedCommand = matchCommand(cleaned);
      console.log("[VoiceControl] Matched Command:", matchedCommand ? matchedCommand.id : "none");

      if (!matchedCommand) {
        console.log("No valid command detected");
        return;
      }

      lastProcessedRef.current = { text: normalized, at: now };
      setLastCommand(matchedCommand.command.label);

      console.log("[VoiceControl] Executing Action:", matchedCommand.id);
      safeTrackActivity(user?.id, {
        eventType: "voice_command",
        module: "voice",
        title: matchedCommand.command.label,
        description: cleaned,
        route: window.location.pathname,
        payload: { commandId: matchedCommand.id, transcript: cleaned },
      });

      if (matchedCommand.id.startsWith("SHOW_") && matchedCommand.command.moleculeId) {
        openMolecule(matchedCommand.command.moleculeId, navigate, feedback);
        return;
      }

      executeCommand(matchedCommand, navigate, feedback);
    },
    [feedback, navigate, user?.id]
  );

  const startListening = useCallback(() => {
    if (!hasNativeSpeechRecognition()) {
      toast.error("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    listeningRef.current = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("Listening...");
    };

    recognition.onresult = (event) => {
      const result = event.results[event.resultIndex];
      if (!result?.isFinal) return;

      const finalResults = Array.from(event.results).filter((item) => item.isFinal);
      if (!finalResults.length) return;

      const finalText = finalResults
        .map((item) => item[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (finalText) {
        handleFinalTranscript(finalText);
      }
    };

    recognition.onerror = (event) => {
      const speechEvent = event as SpeechRecognitionErrorEvent;
      console.log("[VoiceControl] Recognition error:", speechEvent.error ?? "unknown");

      if (speechEvent.error === "no-speech") {
        return;
      }

      if (speechEvent.error === "not-allowed" || speechEvent.error === "service-not-allowed") {
        listeningRef.current = false;
        setIsListening(false);
        toast.error("Microphone access is required for voice commands.");
        return;
      }

      toast.error("Voice recognition error. Please try again.");
    };

    recognition.onend = () => {
      recognitionRef.current = null;

      if (listeningRef.current) {
        window.setTimeout(() => {
          if (listeningRef.current && !recognitionRef.current) {
            startListening();
          }
        }, 200);
        return;
      }

      setIsListening(false);
      window.setTimeout(() => setTranscript(""), 1500);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error("[VoiceControl] Start failed:", error);
      listeningRef.current = false;
      recognitionRef.current = null;
      setIsListening(false);
      toast.error("Unable to start voice recognition.");
    }
  }, [handleFinalTranscript]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
      return;
    }

    startListening();
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      listeningRef.current = false;
      try {
        recognitionRef.current?.abort();
      } catch {
        recognitionRef.current?.stop();
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
        <AnimatePresence>
        {showPanel && (
          <motion.div
            key="voice-panel"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={modalTransition}
            className="glass-card max-w-[280px] px-3 py-2 text-xs text-foreground"
          >
            <div className="font-semibold text-cyan-300">{isListening ? "Listening..." : "Voice Ready"}</div>
            <div className="mt-1 text-muted-foreground">Current speech transcript: {transcript || "—"}</div>
            <div className="mt-1 text-muted-foreground">Last recognized command: {lastCommand || "—"}</div>
            {isListening && (
              <div className="mt-2 flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <motion.span
                    key={index}
                    className="h-2 w-1.5 rounded-full bg-cyan-400"
                    animate={{ scaleY: [0.6, 1.2, 0.7], opacity: [0.45, 1, 0.55] }}
                    transition={{ repeat: Infinity, duration: 1 + index * 0.08, delay: index * 0.08 }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setShowHelp((value) => !value)}
            whileTap={{ scale: 0.96 }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground backdrop-blur-md transition-colors hover:text-foreground"
            title="Voice commands help"
          >
            <HelpCircle size={15} />
          </motion.button>

          <motion.button
            onClick={() => {
              setShowPanel((v) => !v);
              toggleListening();
            }}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300",
              isListening
                ? "scale-110 bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                : "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]"
            )}
            title={isListening ? "Stop listening" : "Start voice command"}
            whileTap={{ scale: 0.96 }}
            animate={isListening ? "listening" : "idle"}
            variants={micPulseVariants}
            transition={cardTransition}
          >
            {isListening ? <MicOff size={20} className="animate-pulse" /> : <Mic size={20} />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
      {showHelp && (
        <motion.div
          key="voice-help"
          variants={transcriptVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={modalTransition}
          className="fixed bottom-24 left-6 z-50 glass-card w-80 border border-border/60 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Voice Commands</h3>
            <motion.button onClick={() => setShowHelp(false)} whileTap={{ scale: 0.96 }} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </motion.button>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <div>Periodic table, tutor, predictor, lab, and molecule commands are supported.</div>
            <div>Examples: open periodic table, open chat, start experiment, predict reaction, open H2O.</div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}