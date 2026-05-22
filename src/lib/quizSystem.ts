import { MOLECULES } from "@/constants/chemistry";
import { PERIODIC_TABLE } from "@/constants/periodicTableData";
import { safeTrackActivity } from "@/lib/activity";
import { supabase } from "@/lib/supabase";
import { loadFromStorage, saveToStorage } from "@/lib/utils";
import type { LabBeakerItem, LabReactionResult } from "@/lib/virtual-lab/types";
import type { Molecule, PeriodicElement } from "@/types";

export type QuizModule = "molecules" | "periodic-table" | "lab" | "dashboard";
export type QuizDifficulty = "easy" | "medium" | "hard";
export type DashboardTopic =
  | "mixed"
  | "organic"
  | "inorganic"
  | "physical"
  | "periodic"
  | "bonding"
  | "reactions"
  | "lab";
export type QuizQuestionType = "mcq" | "true_false" | "fill_blank" | "match";

export interface MatchPair {
  left: string;
  right: string;
}

export interface QuizQuestion {
  id: string;
  module: QuizModule;
  topic: string;
  difficulty: QuizDifficulty;
  type: QuizQuestionType;
  prompt: string;
  options?: string[];
  answer: string | boolean;
  acceptedAnswers?: string[];
  explanation: string;
  matchPairs?: MatchPair[];
}

export interface QuizSession {
  id: string;
  module: QuizModule;
  topic: string;
  title: string;
  contextLabel: string;
  difficulty: QuizDifficulty;
  durationSeconds: number;
  questions: QuizQuestion[];
}

export interface QuizAttemptSummary {
  id: string;
  module: QuizModule;
  topic: string;
  title: string;
  contextLabel: string;
  difficulty: QuizDifficulty;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeSpentSeconds: number;
  completedAt: string;
  weakTopics: string[];
  questionIds: string[];
}

export interface MoleculeQuizContext {
  selectedMolecule?: Molecule | null;
  recentMolecules?: Molecule[];
}

export interface PeriodicQuizContext {
  selectedElement?: PeriodicElement | null;
  recentElements?: PeriodicElement[];
  favoriteElements?: PeriodicElement[];
}

export interface LabQuizContext {
  beakerItems: LabBeakerItem[];
  history?: { equation: string; reactionType: string; status: LabReactionResult["status"] }[];
  reactionResult?: LabReactionResult | null;
}

export interface DashboardQuizContext {
  viewedMolecules?: Molecule[];
  favoriteElements?: PeriodicElement[];
  recentElements?: PeriodicElement[];
  recentLabItems?: LabBeakerItem[];
  labHistory?: { equation: string; reactionType: string; status: LabReactionResult["status"] }[];
  selectedMolecule?: Molecule | null;
  selectedElement?: PeriodicElement | null;
}

export type QuizContext = MoleculeQuizContext | PeriodicQuizContext | LabQuizContext | DashboardQuizContext;

const QUIZ_HISTORY_KEY = "chemiverse_quiz_history";
const QUIZ_SEEN_KEY = "chemiverse_quiz_seen_questions";

const MOLECULE_GEOMETRY: Record<string, { geometry: string; hybridization: string; focus: string }> = {
  water: { geometry: "bent", hybridization: "sp3", focus: "oxygen" },
  methane: { geometry: "tetrahedral", hybridization: "sp3", focus: "carbon" },
  benzene: { geometry: "planar aromatic ring", hybridization: "sp2", focus: "ring carbons" },
  ethanol: { geometry: "tetrahedral around carbon atoms", hybridization: "sp3", focus: "carbon atoms" },
  ammonia: { geometry: "trigonal pyramidal", hybridization: "sp3", focus: "nitrogen" },
  carbon_dioxide: { geometry: "linear", hybridization: "sp", focus: "carbon" },
  acetic_acid: { geometry: "trigonal planar around the carbonyl carbon", hybridization: "sp2", focus: "carbonyl carbon" },
  glucose: { geometry: "multiple tetrahedral centers", hybridization: "sp3", focus: "carbon chain" },
};

const DASHBOARD_TOPICS: Record<DashboardTopic, string> = {
  mixed: "Mixed Topic",
  organic: "Organic Chemistry",
  inorganic: "Inorganic Chemistry",
  physical: "Physical Chemistry",
  periodic: "Periodic Table",
  bonding: "Chemical Bonding",
  reactions: "Reactions",
  lab: "Laboratory Concepts",
};

const QUIZ_DURATION_SECONDS: Record<QuizDifficulty, number> = {
  easy: 120,
  medium: 150,
  hard: 180,
};

function createSeededRandom(seedInput: string) {
  let seed = 0x811c9dc5;
  for (let index = 0; index < seedInput.length; index += 1) {
    seed ^= seedInput.charCodeAt(index);
    seed = Math.imul(seed, 0x01000193);
  }

  return () => {
    seed += 0x6d2b79f5;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], seed: string) {
  const rng = createSeededRandom(seed);
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function makeQuestionId(module: QuizModule, topic: string, seed: string) {
  return `${module}:${topic}:${seed}`;
}

function pickAlternativeValues(values: string[], correct: string, count: number, seed: string) {
  const alternatives = values.filter((value) => normalizeText(value) !== normalizeText(correct));
  return shuffle(uniqueStrings(alternatives), seed).slice(0, count);
}

function buildMcqQuestion(params: {
  module: QuizModule;
  topic: string;
  difficulty: QuizDifficulty;
  seed: string;
  prompt: string;
  correctAnswer: string;
  pool: string[];
  explanation: string;
}): QuizQuestion {
  const distractors = pickAlternativeValues(params.pool, params.correctAnswer, 3, `${params.seed}:distractors`);
  const options = shuffle(uniqueStrings([params.correctAnswer, ...distractors]), `${params.seed}:options`);

  return {
    id: makeQuestionId(params.module, params.topic, params.seed),
    module: params.module,
    topic: params.topic,
    difficulty: params.difficulty,
    type: "mcq",
    prompt: params.prompt,
    options,
    answer: params.correctAnswer,
    explanation: params.explanation,
  };
}

function buildTrueFalseQuestion(params: {
  module: QuizModule;
  topic: string;
  difficulty: QuizDifficulty;
  seed: string;
  prompt: string;
  answer: boolean;
  explanation: string;
}): QuizQuestion {
  return {
    id: makeQuestionId(params.module, params.topic, params.seed),
    module: params.module,
    topic: params.topic,
    difficulty: params.difficulty,
    type: "true_false",
    prompt: params.prompt,
    options: ["True", "False"],
    answer: params.answer,
    explanation: params.explanation,
  };
}

function buildFillBlankQuestion(params: {
  module: QuizModule;
  topic: string;
  difficulty: QuizDifficulty;
  seed: string;
  prompt: string;
  answer: string;
  acceptedAnswers?: string[];
  explanation: string;
}): QuizQuestion {
  return {
    id: makeQuestionId(params.module, params.topic, params.seed),
    module: params.module,
    topic: params.topic,
    difficulty: params.difficulty,
    type: "fill_blank",
    prompt: params.prompt,
    answer: params.answer,
    acceptedAnswers: params.acceptedAnswers,
    explanation: params.explanation,
  };
}

function buildMatchQuestion(params: {
  module: QuizModule;
  topic: string;
  difficulty: QuizDifficulty;
  seed: string;
  prompt: string;
  pairs: MatchPair[];
  explanation: string;
}): QuizQuestion {
  return {
    id: makeQuestionId(params.module, params.topic, params.seed),
    module: params.module,
    topic: params.topic,
    difficulty: params.difficulty,
    type: "match",
    prompt: params.prompt,
    answer: JSON.stringify(params.pairs),
    matchPairs: params.pairs,
    explanation: params.explanation,
  };
}

function getMoleculeProfile(molecule: Molecule) {
  return MOLECULE_GEOMETRY[molecule.id] ?? {
    geometry: "molecular geometry based on its bond arrangement",
    hybridization: molecule.bonds.some((bond) => bond.type === "triple") ? "sp" : molecule.bonds.some((bond) => bond.type === "double" || bond.type === "aromatic") ? "sp2" : "sp3",
    focus: molecule.name.toLowerCase(),
  };
}

function getPeriodicPool(elements: PeriodicElement[], selected: PeriodicElement) {
  return uniqueStrings([
    selected.symbol,
    selected.name,
    selected.atomicNumber.toString(),
    selected.group.toString(),
    selected.period.toString(),
    selected.category.replace(/-/g, " "),
    selected.electronConfiguration,
    ...elements.map((element) => element.symbol),
    ...elements.map((element) => element.name),
  ]);
}

function questionPoolFromMolecules(context: MoleculeQuizContext, difficulty: QuizDifficulty) {
  const molecule = context.selectedMolecule ?? context.recentMolecules?.[0] ?? MOLECULES[0];
  const profile = getMoleculeProfile(molecule);
  const moleculePool = uniqueStrings(MOLECULES.flatMap((entry) => [entry.name, entry.formula, entry.category]));
  const bond = molecule.bonds[0];
  const bondLabel = `${bond.from} to ${bond.to}`;
  const bondAnswer = bond.type;

  return [
    buildMcqQuestion({
      module: "molecules",
      topic: "Compound identification",
      difficulty,
      seed: `${molecule.id}:formula`,
      prompt: `Which molecular formula belongs to ${molecule.name}?`,
      correctAnswer: molecule.formula,
      pool: moleculePool,
      explanation: `${molecule.name} is represented by ${molecule.formula}.`,
    }),
    buildMcqQuestion({
      module: "molecules",
      topic: "Bond types",
      difficulty,
      seed: `${molecule.id}:bond`,
      prompt: `What bond type connects ${bondLabel} in ${molecule.name}?`,
      correctAnswer: bondAnswer,
      pool: ["single", "double", "triple", "aromatic"],
      explanation: `The first bond in ${molecule.name} is a ${bondAnswer} bond.`,
    }),
    buildMcqQuestion({
      module: "molecules",
      topic: "Molecular geometry",
      difficulty,
      seed: `${molecule.id}:geometry`,
      prompt: `Which geometry best describes ${molecule.name}?`,
      correctAnswer: profile.geometry,
      pool: [
        "linear",
        "bent",
        "tetrahedral",
        "trigonal pyramidal",
        "trigonal planar",
        "planar aromatic ring",
        "octahedral",
      ],
      explanation: `${molecule.name} is best described as having ${profile.geometry} geometry.`,
    }),
    buildFillBlankQuestion({
      module: "molecules",
      topic: "Hybridization",
      difficulty,
      seed: `${molecule.id}:hybridization`,
      prompt: `Fill in the blank: The dominant hybridization pattern for ${molecule.name} is ______.`,
      answer: profile.hybridization,
      acceptedAnswers: [profile.hybridization, profile.hybridization.toUpperCase()],
      explanation: `${molecule.name} is most closely associated with ${profile.hybridization} hybridization in this quiz model.`,
    }),
    buildMatchQuestion({
      module: "molecules",
      topic: "Structure matching",
      difficulty,
      seed: `${molecule.id}:match`,
      prompt: `Match the structural description with ${molecule.name}.`,
      pairs: [
        { left: "Formula", right: molecule.formula },
        { left: "Geometry", right: profile.geometry },
        { left: "Hybridization", right: profile.hybridization },
      ],
      explanation: `These core structure clues describe ${molecule.name} accurately.`,
    }),
  ];
}

function questionPoolFromPeriodicTable(context: PeriodicQuizContext, difficulty: QuizDifficulty) {
  const selected = context.selectedElement ?? context.recentElements?.[0] ?? context.favoriteElements?.[0] ?? PERIODIC_TABLE[0];
  const elementPool = getPeriodicPool(PERIODIC_TABLE, selected);

  return [
    buildMcqQuestion({
      module: "periodic-table",
      topic: "Element symbols",
      difficulty,
      seed: `${selected.atomicNumber}:symbol`,
      prompt: `Which symbol belongs to ${selected.name}?`,
      correctAnswer: selected.symbol,
      pool: elementPool,
      explanation: `${selected.name} is represented by the symbol ${selected.symbol}.`,
    }),
    buildMcqQuestion({
      module: "periodic-table",
      topic: "Atomic number",
      difficulty,
      seed: `${selected.atomicNumber}:atomic-number`,
      prompt: `What is the atomic number of ${selected.name}?`,
      correctAnswer: String(selected.atomicNumber),
      pool: PERIODIC_TABLE.map((element) => String(element.atomicNumber)),
      explanation: `${selected.name} has atomic number ${selected.atomicNumber}.`,
    }),
    buildMcqQuestion({
      module: "periodic-table",
      topic: "Groups and periods",
      difficulty,
      seed: `${selected.atomicNumber}:group`,
      prompt: `In which group is ${selected.name} placed?`,
      correctAnswer: String(selected.group),
      pool: PERIODIC_TABLE.map((element) => String(element.group)),
      explanation: `${selected.name} belongs to group ${selected.group}.`,
    }),
    buildFillBlankQuestion({
      module: "periodic-table",
      topic: "Electron configuration",
      difficulty,
      seed: `${selected.atomicNumber}:electron-configuration`,
      prompt: `Fill in the blank: The electron configuration of ${selected.name} is ______.`,
      answer: selected.electronConfiguration,
      acceptedAnswers: [selected.electronConfiguration],
      explanation: `${selected.name} follows the electron configuration ${selected.electronConfiguration}.`,
    }),
    buildMatchQuestion({
      module: "periodic-table",
      topic: "Element matching",
      difficulty,
      seed: `${selected.atomicNumber}:match`,
      prompt: `Match the property with the selected element.`,
      pairs: [
        { left: "Symbol", right: selected.symbol },
        { left: "Atomic number", right: String(selected.atomicNumber) },
        { left: "Group", right: String(selected.group) },
        { left: "Period", right: String(selected.period) },
      ],
      explanation: `These core facts describe ${selected.name}.`,
    }),
  ];
}

function questionPoolFromLab(context: LabQuizContext, difficulty: QuizDifficulty) {
  const beakerItems = context.beakerItems ?? [];
  const history = context.history ?? [];
  const selectedChemical = beakerItems[0]?.chemical ?? {
    id: "lab-knowledge",
    name: "Hydrochloric Acid",
    formula: "HCl",
    category: "Acid" as const,
    physicalState: "Liquid" as const,
    color: "#00d4ff",
    molarMass: 36.46,
    acidityBasicity: "Acidic",
    reactivityTags: ["corrosive"],
    hazards: ["corrosive"],
    iconColor: "#00d4ff",
    description: "A common acid used as a reference for lab safety questions.",
  };
  const latestExperiment = history[0];

  return [
    buildMcqQuestion({
      module: "lab",
      topic: "Experiment setup",
      difficulty,
      seed: `${beakerItems.length}:count`,
      prompt: `How many chemicals are currently in the beaker?`,
      correctAnswer: String(beakerItems.length),
      pool: ["0", "1", "2", "3", "4", "5", "6"],
      explanation: `The current beaker contains ${beakerItems.length} chemical${beakerItems.length === 1 ? "" : "s"}.`,
    }),
    buildMcqQuestion({
      module: "lab",
      topic: "Chemical roles",
      difficulty,
      seed: `${selectedChemical.id}:category`,
      prompt: `What category best matches ${selectedChemical.name}?`,
      correctAnswer: selectedChemical.category,
      pool: ["Acid", "Base", "Salt", "Indicator", "Oxidizer", "Organic Compound", "Metal", "Gas", "Solvent"],
      explanation: `${selectedChemical.name} is classified as ${selectedChemical.category}.`,
    }),
    buildTrueFalseQuestion({
      module: "lab",
      topic: "Lab safety",
      difficulty,
      seed: `${selectedChemical.id}:safety`,
      prompt: "True or False: Review hazards and protective equipment before running a reaction.",
      answer: true,
      explanation: "Safe lab workflows begin with hazard review and protective equipment.",
    }),
    buildFillBlankQuestion({
      module: "lab",
      topic: "Reaction review",
      difficulty,
      seed: `${latestExperiment?.equation ?? "no-history"}:reaction`,
      prompt: "Fill in the blank: The last recorded reaction equation was ______.",
      answer: latestExperiment?.equation ?? "No recorded reaction",
      acceptedAnswers: latestExperiment ? [latestExperiment.equation] : ["No recorded reaction"],
      explanation: latestExperiment
        ? `The latest experiment recorded ${latestExperiment.equation}.`
        : "There is no recorded experiment yet, so the quiz uses a placeholder answer.",
    }),
    buildMatchQuestion({
      module: "lab",
      topic: "Chemical matching",
      difficulty,
      seed: `${selectedChemical.id}:match`,
      prompt: `Match the chemical profile for ${selectedChemical.name}.`,
      pairs: [
        { left: "Formula", right: selectedChemical.formula },
        { left: "Category", right: selectedChemical.category },
        { left: "State", right: selectedChemical.physicalState },
        { left: "Hazard clue", right: selectedChemical.hazards[0] ?? "None" },
      ],
      explanation: `${selectedChemical.name} is best identified by its formula, category, state, and hazard profile.`,
    }),
  ];
}

function questionPoolFromDashboard(context: DashboardQuizContext, difficulty: QuizDifficulty, topic: DashboardTopic) {
  const molecule = context.selectedMolecule ?? context.viewedMolecules?.[0] ?? MOLECULES[0];
  const element = context.selectedElement ?? context.recentElements?.[0] ?? PERIODIC_TABLE[0];
  const selectedTopic = DASHBOARD_TOPICS[topic];

  if (topic === "organic" || topic === "bonding") {
    return questionPoolFromMolecules({ selectedMolecule: molecule, recentMolecules: context.viewedMolecules }, difficulty).map((question) => ({
      ...question,
      topic: selectedTopic,
    }));
  }

  if (topic === "periodic") {
    return questionPoolFromPeriodicTable({ selectedElement: element, recentElements: context.recentElements, favoriteElements: context.favoriteElements }, difficulty).map((question) => ({
      ...question,
      topic: selectedTopic,
    }));
  }

  if (topic === "reactions" || topic === "lab") {
    return questionPoolFromLab(
      {
        beakerItems: context.recentLabItems ?? [],
        history: context.labHistory,
      },
      difficulty
    ).map((question) => ({
      ...question,
      topic: selectedTopic,
    }));
  }

  if (topic === "inorganic") {
    const inorganicElement = context.selectedElement ?? context.favoriteElements?.find((entry) => ["noble-gases", "halogens", "alkali-metals", "alkaline-earth-metals"].includes(entry.category)) ?? element;
    return questionPoolFromPeriodicTable({ selectedElement: inorganicElement, recentElements: context.recentElements, favoriteElements: context.favoriteElements }, difficulty).map((question) => ({
      ...question,
      topic: selectedTopic,
    }));
  }

  if (topic === "physical") {
    const question = buildMcqQuestion({
      module: "dashboard",
      topic: selectedTopic,
      difficulty,
      seed: `${molecule.id}:physical`,
      prompt: `Which property most directly describes how easily ${molecule.name} vaporizes?`,
      correctAnswer: "Boiling point",
      pool: ["Atomic number", "Boiling point", "Symbol", "Electronegativity"],
      explanation: "Boiling point is the physical property that measures vaporization under standard conditions.",
    });
    const match = buildMatchQuestion({
      module: "dashboard",
      topic: selectedTopic,
      difficulty,
      seed: `${molecule.id}:physical-match`,
      prompt: "Match each physical property to the chemistry focus.",
      pairs: [
        { left: "Boiling point", right: "Phase change" },
        { left: "Density", right: "Mass per volume" },
        { left: "Molar mass", right: "Mass of one mole" },
      ],
      explanation: "These physical chemistry terms describe measurable bulk properties.",
    });
    return [question, match];
  }

  return [
    ...questionPoolFromMolecules({ selectedMolecule: molecule, recentMolecules: context.viewedMolecules }, difficulty).map((question) => ({
      ...question,
      topic: selectedTopic,
    })),
    ...questionPoolFromPeriodicTable({ selectedElement: element, recentElements: context.recentElements, favoriteElements: context.favoriteElements }, difficulty).map((question) => ({
      ...question,
      topic: selectedTopic,
    })),
  ].slice(0, 5);
}

function getRecentQuizQuestionIds(module: QuizModule) {
  const history = loadFromStorage<QuizAttemptSummary[]>(QUIZ_HISTORY_KEY, []);
  return history.filter((entry) => entry.module === module).flatMap((entry) => entry.questionIds).slice(0, 30);
}

export function loadQuizHistory() {
  return loadFromStorage<QuizAttemptSummary[]>(QUIZ_HISTORY_KEY, []);
}

export function getQuizDuration(difficulty: QuizDifficulty) {
  return QUIZ_DURATION_SECONDS[difficulty];
}

export function buildQuizSession(params: {
  module: QuizModule;
  difficulty: QuizDifficulty;
  context?: QuizContext;
  topic?: DashboardTopic;
}) {
  const seed = `${params.module}:${params.difficulty}:${params.topic ?? "default"}:${Date.now()}`;
  const seenQuestionIds = new Set([...getRecentQuizQuestionIds(params.module), ...(loadFromStorage<string[]>(QUIZ_SEEN_KEY, []) ?? [])]);

  const pool =
    params.module === "molecules"
      ? questionPoolFromMolecules((params.context as MoleculeQuizContext | undefined) ?? {}, params.difficulty)
      : params.module === "periodic-table"
        ? questionPoolFromPeriodicTable((params.context as PeriodicQuizContext | undefined) ?? {}, params.difficulty)
        : params.module === "lab"
          ? questionPoolFromLab((params.context as LabQuizContext | undefined) ?? { beakerItems: [] }, params.difficulty)
          : questionPoolFromDashboard((params.context as DashboardQuizContext | undefined) ?? {}, params.difficulty, params.topic ?? "mixed");

  const freshQuestions = pool.filter((question) => !seenQuestionIds.has(question.id));
  const selectedQuestions = shuffle((freshQuestions.length >= 5 ? freshQuestions : pool).slice(), seed).slice(0, 5);
  const title =
    params.module === "dashboard"
      ? `${DASHBOARD_TOPICS[params.topic ?? "mixed"]} Quiz`
      : params.module === "molecules"
        ? "3D Molecule Quiz"
        : params.module === "periodic-table"
          ? "Periodic Table Quiz"
          : "Virtual Lab Quiz";

  const contextLabel =
    params.module === "molecules"
      ? (params.context as MoleculeQuizContext | undefined)?.selectedMolecule?.name ?? "Molecule focus"
      : params.module === "periodic-table"
        ? (params.context as PeriodicQuizContext | undefined)?.selectedElement?.name ?? "Element focus"
        : params.module === "lab"
          ? `${((params.context as LabQuizContext | undefined)?.beakerItems ?? []).length} reactants`
          : "Mixed chemistry focus";

  const session: QuizSession = {
    id: `quiz_${Date.now()}`,
    module: params.module,
    topic: params.topic ?? (params.module === "dashboard" ? "mixed" : "mixed"),
    title,
    contextLabel,
    difficulty: params.difficulty,
    durationSeconds: getQuizDuration(params.difficulty),
    questions: selectedQuestions,
  };

  saveToStorage(QUIZ_SEEN_KEY, uniqueStrings([...Array.from(seenQuestionIds), ...selectedQuestions.map((question) => question.id)]).slice(-50));
  return session;
}

export function evaluateQuizAnswer(question: QuizQuestion, response: unknown) {
  if (question.type === "mcq" || question.type === "true_false") {
    const expected = typeof question.answer === "boolean" ? String(question.answer) : String(question.answer);
    return normalizeText(String(response ?? "")) === normalizeText(expected);
  }

  if (question.type === "fill_blank") {
    const responseText = normalizeText(String(response ?? ""));
    const answers = [question.answer, ...(question.acceptedAnswers ?? [])].map((value) => normalizeText(String(value)));
    return answers.includes(responseText);
  }

  if (question.type === "match") {
    try {
      const parsedResponse = typeof response === "string" ? JSON.parse(response) : response;
      const expectedPairs = question.matchPairs ?? [];
      return expectedPairs.every((pair) => normalizeText(String(parsedResponse?.[pair.left] ?? "")) === normalizeText(pair.right));
    } catch {
      return false;
    }
  }

  return false;
}

export function summarizeWeakTopics(results: Array<{ question: QuizQuestion; correct: boolean }>) {
  return uniqueStrings(results.filter((entry) => !entry.correct).map((entry) => entry.question.topic));
}

export async function persistQuizAttempt(params: {
  userId?: string;
  session: QuizSession;
  score: number;
  completedAt: string;
  timeSpentSeconds: number;
  weakTopics: string[];
}) {
  const summary: QuizAttemptSummary = {
    id: params.session.id,
    module: params.session.module,
    topic: params.session.topic,
    title: params.session.title,
    contextLabel: params.session.contextLabel,
    difficulty: params.session.difficulty,
    score: params.score,
    totalQuestions: params.session.questions.length,
    accuracy: params.session.questions.length ? Math.round((params.score / params.session.questions.length) * 100) : 0,
    timeSpentSeconds: params.timeSpentSeconds,
    completedAt: params.completedAt,
    weakTopics: params.weakTopics,
    questionIds: params.session.questions.map((question) => question.id),
  };

  const history = loadQuizHistory();
  saveToStorage(QUIZ_HISTORY_KEY, [summary, ...history].slice(0, 100));

  if (!params.userId) {
    return summary;
  }

  const payload = {
    user_id: params.userId,
    quiz_id: params.session.id,
    module: params.session.module,
    topic: params.session.topic,
    title: params.session.title,
    context_label: params.session.contextLabel,
    difficulty: params.session.difficulty,
    score: params.score,
    total_questions: params.session.questions.length,
    accuracy: summary.accuracy,
    time_spent_seconds: params.timeSpentSeconds,
    completed_at: params.completedAt,
    weak_topics: params.weakTopics,
    question_ids: params.session.questions.map((question) => question.id),
  };

  try {
    await supabase.from("user_quiz_attempts").insert([payload]);
  } catch {
    // Keep the quiz usable even if the table has not been created yet.
  }

  try {
    await supabase.from("quiz_history").insert([payload]);
  } catch {
    // Same fallback as above.
  }

  try {
    await safeTrackActivity(params.userId, {
      eventType: "quiz_attempt",
      module: params.session.module,
      title: params.session.title,
      description: `${params.score}/${params.session.questions.length} correct`,
      route: params.session.module === "dashboard" ? "/dashboard" : params.session.module === "molecules" ? "/molecules" : params.session.module === "periodic-table" ? "/periodic-table" : "/lab",
      payload,
    });
  } catch {
    // Activity logging is optional here.
  }

  return summary;
}

export function getDashboardTopicLabel(topic: DashboardTopic) {
  return DASHBOARD_TOPICS[topic];
}
