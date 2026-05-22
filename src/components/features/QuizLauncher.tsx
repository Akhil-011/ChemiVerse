import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/hooks/use-supabase";
import {
  buildQuizSession,
  evaluateQuizAnswer,
  getDashboardTopicLabel,
  getQuizDuration,
  loadQuizHistory,
  persistQuizAttempt,
  summarizeWeakTopics,
  type DashboardTopic,
  type QuizContext,
  type QuizDifficulty,
  type QuizModule,
  type QuizQuestion,
  type QuizSession,
} from "@/lib/quizSystem";
import { Sparkles, ChevronLeft, ChevronRight, Trophy, Timer, RotateCcw, CheckCircle2, XCircle, History, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { modalVariants, itemVariants, listVariants } from "@/lib/animationVariants";
import { cardTransition, modalTransition, springTapTransition } from "@/lib/motionPresets";

interface QuizLauncherProps {
  module: QuizModule;
  context?: QuizContext;
  className?: string;
  compact?: boolean;
  onCompleted?: (summary: Awaited<ReturnType<typeof persistQuizAttempt>>) => void;
}

interface FeedbackState {
  correct: boolean;
  message: string;
}

type MatchResponse = Record<string, string>;

const DIFFICULTY_OPTIONS: { value: QuizDifficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const DASHBOARD_TOPICS: { value: DashboardTopic; label: string }[] = [
  { value: "mixed", label: "Mixed" },
  { value: "organic", label: "Organic" },
  { value: "inorganic", label: "Inorganic" },
  { value: "physical", label: "Physical" },
  { value: "periodic", label: "Periodic" },
  { value: "bonding", label: "Bonding" },
  { value: "reactions", label: "Reactions" },
  { value: "lab", label: "Lab" },
];

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function evaluateMatchResponse(question: QuizQuestion, response: MatchResponse) {
  return evaluateQuizAnswer(question, response);
}

export default function QuizLauncher({ module, context, className, compact = false, onCompleted }: QuizLauncherProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium");
  const [topic, setTopic] = useState<DashboardTopic>("mixed");
  const [session, setSession] = useState<QuizSession | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | boolean | MatchResponse>>({});
  const [feedback, setFeedback] = useState<Record<string, FeedbackState>>({});
  const [completedSummary, setCompletedSummary] = useState<Awaited<ReturnType<typeof persistQuizAttempt>> | null>(null);
  const [history, setHistory] = useState(() => loadQuizHistory());
  const [isSaving, setIsSaving] = useState(false);
  const savedCompletionRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setHistory(loadQuizHistory());
  }, [open]);

  useEffect(() => {
    if (!session || startedAt === null || completedSummary) return;

    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(session.durationSeconds - elapsed, 0);
      setTimeLeft(remaining);

      if (remaining === 0) {
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [session, startedAt, completedSummary]);

  useEffect(() => {
    if (timeLeft === 0 && session && startedAt !== null && !completedSummary) {
      void finishQuiz(true);
    }
  }, [timeLeft, session, startedAt, completedSummary]);

  const historyPreview = useMemo(() => history.filter((entry) => entry.module === module).slice(0, 3), [history, module]);
  const isDashboard = module === "dashboard";
  const currentQuestion = session?.questions[currentIndex] ?? null;
  const totalQuestions = session?.questions.length ?? 0;
  const answeredCount = Object.keys(feedback).length;
  const correctCount = Object.values(feedback).filter((entry) => entry.correct).length;
  const progressValue = totalQuestions ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const startQuiz = () => {
    const builtSession = buildQuizSession({ module, difficulty, context, topic: isDashboard ? topic : undefined });
    setSession(builtSession);
    setCurrentIndex(0);
    setResponses({});
    setFeedback({});
    setCompletedSummary(null);
    setStartedAt(Date.now());
    setTimeLeft(getQuizDuration(difficulty));
    savedCompletionRef.current = false;
  };

  const closeQuiz = () => {
    setOpen(false);
    setSession(null);
    setStartedAt(null);
    setTimeLeft(0);
    setCurrentIndex(0);
    setResponses({});
    setFeedback({});
    setCompletedSummary(null);
    savedCompletionRef.current = false;
  };

  const setMatchValue = (questionId: string, leftKey: string, rightValue: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...((prev[questionId] as MatchResponse) ?? {}),
        [leftKey]: rightValue,
      },
    }));
  };

  const evaluateCurrentQuestion = (question: QuizQuestion) => {
    const response = responses[question.id];
    const isCorrect = question.type === "match" ? evaluateMatchResponse(question, response as MatchResponse) : evaluateQuizAnswer(question, response);
    const message = isCorrect ? `Correct. ${question.explanation}` : `Not quite. ${question.explanation}`;
    setFeedback((prev) => ({ ...prev, [question.id]: { correct: isCorrect, message } }));

    if (isCorrect) {
      toast.success("Answer recorded");
    } else {
      toast.error("Try another answer or review the explanation");
    }
  };

  const goNext = () => {
    if (!session) return;
    setCurrentIndex((prev) => Math.min(prev + 1, session.questions.length - 1));
  };

  const goPrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const finishQuiz = async (expired = false) => {
    if (!session || savedCompletionRef.current) return;

    const results = session.questions.map((question) => {
      const response = responses[question.id];
      const correct = question.type === "match" ? evaluateMatchResponse(question, response as MatchResponse) : evaluateQuizAnswer(question, response);
      return { question, correct };
    });

    const score = results.filter((entry) => entry.correct).length;
    const elapsed = startedAt ? Math.max(Math.floor((Date.now() - startedAt) / 1000), 1) : session.durationSeconds;
    const weakTopics = summarizeWeakTopics(results);
    savedCompletionRef.current = true;
    setIsSaving(true);

    const summary = await persistQuizAttempt({
      userId: user?.id,
      session,
      score,
      completedAt: new Date().toISOString(),
      timeSpentSeconds: expired ? session.durationSeconds : elapsed,
      weakTopics,
    });

    setCompletedSummary(summary);
    setHistory(loadQuizHistory());
    setIsSaving(false);
    onCompleted?.(summary);
    toast.success(expired ? "Quiz ended when the timer ran out" : "Quiz completed");
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    if (currentQuestion.type === "mcq" || currentQuestion.type === "true_false") {
      return (
        <div className="space-y-2">
          {currentQuestion.options?.map((option) => {
            const selected = responses[currentQuestion.id] === option;
            return (
              <button
                key={option}
                onClick={() => setResponses((prev) => ({ ...prev, [currentQuestion.id]: option }))}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                  selected
                    ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
                    : "border-border/60 bg-background/50 text-foreground hover:border-cyan-400/20 hover:bg-muted/50"
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      );
    }

    if (currentQuestion.type === "fill_blank") {
      return (
        <Input
          value={(responses[currentQuestion.id] as string) ?? ""}
          onChange={(event) => setResponses((prev) => ({ ...prev, [currentQuestion.id]: event.target.value }))}
          placeholder="Type your answer"
          className="bg-background/70"
        />
      );
    }

    return (
      <div className="space-y-3">
        {currentQuestion.matchPairs?.map((pair) => {
          const allChoices = currentQuestion.matchPairs?.map((entry) => entry.right) ?? [];
          const selectedValue = ((responses[currentQuestion.id] as MatchResponse) ?? {})[pair.left] ?? "";

          return (
            <div key={pair.left} className="grid gap-3 rounded-xl border border-border/60 bg-background/50 p-3 sm:grid-cols-[1fr_1fr] sm:items-center">
              <div className="text-sm font-medium text-foreground">{pair.left}</div>
              <select
                value={selectedValue}
                onChange={(event) => setMatchValue(currentQuestion.id, pair.left, event.target.value)}
                className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm text-foreground outline-none transition focus:border-cyan-400/40"
              >
                <option value="">Choose a match</option>
                {allChoices.map((choice) => (
                  <option key={choice} value={choice}>
                    {choice}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    );
  };

  const currentFeedback = currentQuestion ? feedback[currentQuestion.id] : undefined;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : closeQuiz())}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          className={cn(
            "group gap-2 border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:border-cyan-400/35 hover:bg-cyan-400/15 hover:text-cyan-50",
            className
          )}
        >
          <Sparkles className="h-4 w-4" />
          Quiz
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden border-border/60 bg-background p-0">
        <motion.div className="contents">
        <div className="grid max-h-[90vh] lg:grid-cols-[1.05fr_0.42fr]">
          <motion.div className="flex min-h-0 flex-col gap-5 overflow-y-auto p-6 sm:p-7" initial="initial" animate="animate" variants={listVariants}>
            <DialogHeader className="text-left">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-cyan-400/30 text-cyan-200">
                  {session?.title ?? (module === "dashboard" ? "Chemistry Quiz" : module === "molecules" ? "3D Molecule Quiz" : module === "periodic-table" ? "Periodic Table Quiz" : "Virtual Lab Quiz")}
                </Badge>
                <Badge variant="outline" className="border-border/60 text-muted-foreground">
                  {isDashboard ? getDashboardTopicLabel(topic) : "Module quiz"}
                </Badge>
                <Badge variant="outline" className="border-border/60 text-muted-foreground">
                  {difficulty}
                </Badge>
              </div>
              <DialogTitle className="text-2xl text-foreground">
                {session?.contextLabel ?? "Open a smart chemistry quiz"}
              </DialogTitle>
              <DialogDescription>
                Dynamic questions are generated from the current module state, recent interactions, and your activity history.
              </DialogDescription>
            </DialogHeader>

            {!session ? (
              <div className="space-y-5">
                  <motion.div className="grid gap-4 rounded-3xl border border-border/60 bg-muted/20 p-5 sm:grid-cols-2" variants={itemVariants} transition={cardTransition}>
                    <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Difficulty</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <motion.button
                          key={option.value}
                          onClick={() => setDifficulty(option.value)}
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.96 }}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-sm transition-colors",
                            difficulty === option.value
                              ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
                              : "border-border/60 bg-background/60 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {option.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {isDashboard && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Topic</p>
                      <motion.select
                        value={topic}
                        onChange={(event) => setTopic(event.target.value as DashboardTopic)}
                        whileFocus={{ scale: 1.01 }}
                        className="mt-3 h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm text-foreground outline-none transition focus:border-cyan-400/40"
                      >
                        {DASHBOARD_TOPICS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </motion.select>
                    </div>
                  )}
                </motion.div>

                <motion.div className="grid gap-4 sm:grid-cols-3" variants={listVariants}>
                  <motion.div className="rounded-2xl border border-border/60 bg-background/70 p-4" variants={itemVariants} transition={cardTransition}>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Timer</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{formatSeconds(getQuizDuration(difficulty))}</p>
                  </motion.div>
                  <motion.div className="rounded-2xl border border-border/60 bg-background/70 p-4" variants={itemVariants} transition={cardTransition}>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Questions</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">5</p>
                  </motion.div>
                  <motion.div className="rounded-2xl border border-border/60 bg-background/70 p-4" variants={itemVariants} transition={cardTransition}>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">History</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{historyPreview.length}</p>
                  </motion.div>
                </motion.div>

                <motion.div className="rounded-3xl border border-border/60 bg-gradient-to-br from-cyan-400/10 via-background to-background p-5" variants={itemVariants} transition={cardTransition}>
                  <div className="flex items-center gap-2 text-cyan-200">
                    <WandSparkles className="h-4 w-4" />
                    <span className="text-sm font-semibold">Smart generation</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The quiz pulls from the active molecule, selected element, current lab setup, or dashboard history so it stays contextual.
                  </p>
                </motion.div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={startQuiz} className="gap-2 bg-cyan-500 text-white hover:bg-cyan-400" asChild={false}>
                    <Sparkles className="h-4 w-4" />
                    Start Quiz
                  </Button>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Close
                  </Button>
                </div>

                <motion.div className="space-y-3 rounded-3xl border border-border/60 bg-background/60 p-5" variants={itemVariants} transition={cardTransition}>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    <History className="h-4 w-4" />
                    Recent attempts
                  </div>
                  {historyPreview.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No quiz attempts yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {historyPreview.map((attempt) => (
                        <motion.div key={attempt.id} className="rounded-2xl border border-border/60 bg-muted/20 p-3 text-sm" whileHover={{ y: -2 }} transition={cardTransition}>
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium text-foreground">{attempt.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {attempt.topic} · {attempt.difficulty} · {attempt.accuracy}%
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(new Date(attempt.completedAt))}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            ) : completedSummary ? (
              <div className="space-y-5">
                <motion.div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5" variants={itemVariants} transition={cardTransition}>
                  <div className="flex items-center gap-2 text-cyan-100">
                    <Trophy className="h-5 w-5" />
                    <span className="text-sm font-semibold">Quiz complete</span>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <MetricCard label="Score" value={`${completedSummary.score}/${completedSummary.totalQuestions}`} />
                    <MetricCard label="Accuracy" value={`${completedSummary.accuracy}%`} />
                    <MetricCard label="Time" value={formatSeconds(completedSummary.timeSpentSeconds)} />
                  </div>
                  <p className="mt-4 text-sm text-cyan-50/80">
                    Weak topics: {completedSummary.weakTopics.length > 0 ? completedSummary.weakTopics.join(", ") : "None"}
                  </p>
                </motion.div>

                <motion.div className="space-y-4" variants={listVariants}>
                  {session.questions.map((question) => {
                    const result = feedback[question.id];
                    return (
                      <motion.div key={question.id} className="rounded-3xl border border-border/60 bg-background/70 p-4" variants={itemVariants} transition={cardTransition}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{question.topic}</p>
                            <p className="mt-1 font-medium text-foreground">{question.prompt}</p>
                          </div>
                          {result?.correct ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-rose-400" />}
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">{question.explanation}</p>
                      </motion.div>
                    );
                  })}
                </motion.div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={startQuiz} className="gap-2 bg-cyan-500 text-white hover:bg-cyan-400">
                    <RotateCcw className="h-4 w-4" />
                    Retry Quiz
                  </Button>
                  <Button variant="outline" onClick={closeQuiz}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <motion.div className="space-y-3 rounded-3xl border border-border/60 bg-background/70 p-5" variants={itemVariants} transition={cardTransition}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-cyan-200">
                      <Timer className="h-4 w-4" />
                      <span className="text-sm font-semibold">{formatSeconds(timeLeft || session.durationSeconds)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Question {currentIndex + 1} of {totalQuestions}
                    </span>
                  </div>
                  <Progress value={progressValue} className="h-2" />
                </motion.div>

                <motion.div className="rounded-3xl border border-border/60 bg-muted/20 p-5" variants={itemVariants} transition={cardTransition}>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-border/60 text-muted-foreground">
                      {currentQuestion?.topic}
                    </Badge>
                    <Badge variant="outline" className="border-border/60 text-muted-foreground">
                      {currentQuestion?.difficulty}
                    </Badge>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{currentQuestion?.prompt}</p>
                  <div className="mt-5">{renderQuestion()}</div>

                  {currentFeedback && (
                    <div className={cn("mt-4 rounded-2xl border px-4 py-3 text-sm", currentFeedback.correct ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100" : "border-rose-400/20 bg-rose-400/10 text-rose-100") }>
                      {currentFeedback.message}
                    </div>
                  )}
                </motion.div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button variant="outline" onClick={goPrevious} disabled={currentIndex === 0} className="gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => currentQuestion && evaluateCurrentQuestion(currentQuestion)}
                      disabled={!currentQuestion || isSaving}
                      className="gap-2"
                    >
                      Check Answer
                    </Button>
                    <Button
                      onClick={() => {
                        if (!currentQuestion) return;
                        if (currentIndex === totalQuestions - 1) {
                          void finishQuiz(false);
                          return;
                        }
                        goNext();
                      }}
                      disabled={isSaving || !currentQuestion}
                      className="gap-2 bg-cyan-500 text-white hover:bg-cyan-400"
                    >
                      {currentIndex === totalQuestions - 1 ? "Finish" : "Next"}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <motion.div className="rounded-3xl border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground" variants={itemVariants} transition={cardTransition}>
                  Answered {answeredCount} question{answeredCount === 1 ? "" : "s"} · Correct {correctCount}
                </motion.div>
              </div>
            )}
          </motion.div>

          <motion.div className="min-h-0 border-t border-border/60 bg-muted/10 p-6 lg:border-l lg:border-t-0" variants={itemVariants} transition={cardTransition}>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">History</p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">Recent quiz attempts</h3>
              </div>

              {historyPreview.length === 0 ? (
                <p className="text-sm text-muted-foreground">Your quiz history will appear here after your first attempt.</p>
              ) : (
                <div className="space-y-3">
                  {historyPreview.map((attempt) => (
                    <motion.div key={attempt.id} className="rounded-2xl border border-border/60 bg-background/70 p-4" whileHover={{ y: -2 }} transition={cardTransition}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-foreground">{attempt.title}</p>
                          <p className="text-xs text-muted-foreground">{attempt.contextLabel}</p>
                        </div>
                        <Badge variant="outline" className="border-border/60 text-muted-foreground">
                          {attempt.accuracy}%
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{attempt.score}/{attempt.totalQuestions} correct</span>
                        <span>{formatRelativeTime(new Date(attempt.completedAt))}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
