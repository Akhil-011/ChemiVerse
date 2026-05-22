// ============================================================
// ChemFusion AI — Learning Features (Mnemonics & Facts)
// ============================================================
import { useState, useEffect } from "react";
import { CHEMISTRY_FACTS, LEARNING_MNEMONICS } from "@/constants/periodicTableData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, RefreshCw, Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type LearningMode = "facts" | "mnemonics" | "quiz";

export default function LearningFeatures() {
  const [mode, setMode] = useState<LearningMode>("facts");
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Auto-cycle through facts
  useEffect(() => {
    if (mode === "facts") {
      const interval = setInterval(() => {
        setCurrentFactIndex((prev) => (prev + 1) % CHEMISTRY_FACTS.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [mode]);

  const currentFact = CHEMISTRY_FACTS[currentFactIndex];

  const mnemonicEntries = Object.entries(LEARNING_MNEMONICS);

  return (
    <div className="w-full space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => setMode("facts")}
          variant={mode === "facts" ? "default" : "outline"}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Daily Facts
        </Button>
        <Button
          onClick={() => setMode("mnemonics")}
          variant={mode === "mnemonics" ? "default" : "outline"}
          className="gap-2"
        >
          <Brain className="w-4 h-4" />
          Memory Tricks
        </Button>
        <Button
          onClick={() => setMode("quiz")}
          variant={mode === "quiz" ? "default" : "outline"}
          className="gap-2"
        >
          <Lightbulb className="w-4 h-4" />
          Quick Quiz
        </Button>
      </div>

      {/* Facts Mode */}
      {mode === "facts" && (
        <Card className="p-6 bg-gradient-to-br from-accent from-20% to-accent-foreground to-80% text-accent-foreground border-0">
          <div className="flex items-start gap-4">
            <Sparkles className="w-6 h-6 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Did You Know?</h3>
              <p className="text-sm leading-relaxed">{currentFact}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-accent-foreground border-opacity-20">
            <span className="text-xs opacity-75">
              {currentFactIndex + 1} / {CHEMISTRY_FACTS.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFactIndex((prev) => (prev + 1) % CHEMISTRY_FACTS.length)}
              className="text-accent-foreground hover:bg-accent-foreground hover:bg-opacity-20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Next Fact
            </Button>
          </div>
        </Card>
      )}

      {/* Mnemonics Mode */}
      {mode === "mnemonics" && (
        <div className="space-y-3">
          {mnemonicEntries.map(([key, mnemonic]) => (
            <Card
              key={key}
              className={cn(
                "p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-accent",
                "bg-gradient-to-r from-muted to-muted-foreground from-50%",
                isFlipped && "scale-105"
              )}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </h4>
                <p className="text-sm text-foreground italic">{mnemonic}</p>
                <p className="text-xs text-muted-foreground">💡 Click to explore more</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quiz Mode */}
      {mode === "quiz" && (
        <Card className="p-6 bg-muted border-primary border-2">
          <div className="space-y-6">
            <div className="text-center">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                Quick Chemistry Quiz
              </h3>
              <p className="text-sm text-muted-foreground">
                Test your chemistry knowledge with fun questions!
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-background border border-border">
                <p className="font-semibold text-foreground mb-3">
                  Question: What is the symbol for Gold?
                </p>
                <div className="space-y-2">
                  {["Au", "Gd", "Go", "Gl"].map((option) => (
                    <Button
                      key={option}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        if (option === "Au") {
                          alert("✅ Correct! Au comes from the Latin word 'aurum'");
                        } else {
                          alert("❌ Try again!");
                        }
                      }}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-accent bg-opacity-10 border border-accent border-opacity-30">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Hint:</strong> The element symbol comes from its Latin name!
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
