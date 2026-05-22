import { VOICE_COMMANDS, type VoiceCommandDefinition, type VoiceCommandId } from "./voiceCommands";
import { normalizeTranscript } from "./speechUtils";

export interface MatchedVoiceCommand {
  id: VoiceCommandId;
  command: VoiceCommandDefinition;
  matchedAlias: string;
  transcript: string;
}

function scoreCommand(transcript: string, command: VoiceCommandDefinition): number {
  let score = 0;

  for (const alias of command.aliases) {
    const normalizedAlias = normalizeTranscript(alias);
    if (!normalizedAlias) continue;

    if (transcript === normalizedAlias) {
      score = Math.max(score, 100);
    }

    if (transcript.includes(normalizedAlias)) {
      score = Math.max(score, 80 + normalizedAlias.length);
    }
  }

  for (const regex of command.regexes) {
    if (regex.test(transcript)) {
      score = Math.max(score, 75);
    }
  }

  if (command.id === "OPEN_PERIODIC_TABLE" && (transcript.includes("periodic") || transcript.includes("element"))) {
    score = Math.max(score, 95);
  }

  if (command.id === "OPEN_CHAT" && (transcript.includes("tutor") || transcript.includes("chat"))) {
    score = Math.max(score, 95);
  }

  return score;
}

export function matchCommand(transcript: string): MatchedVoiceCommand | null {
  const normalized = normalizeTranscript(transcript);
  if (!normalized) return null;

  const winners = VOICE_COMMANDS
    .map((command) => {
      const matchedAlias = command.aliases.find((alias) => normalized.includes(normalizeTranscript(alias))) ?? command.aliases[0];
      return {
        command,
        score: scoreCommand(normalized, command),
        matchedAlias,
      };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score);

  const winner = winners[0];
  if (!winner) return null;

  return {
    id: winner.command.id,
    command: winner.command,
    matchedAlias: winner.matchedAlias,
    transcript: normalized,
  };
}