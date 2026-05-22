import type { NavigateFunction } from "react-router-dom";
import type { MatchedVoiceCommand } from "./commandMatcher";
import { speakText } from "./speechUtils";

type VoiceFeedback = {
  speak: (message: string) => void;
  notify: (message: string, type?: "success" | "error" | "info" | "warning") => void;
};

function getRouteForCommand(command: MatchedVoiceCommand): string {
  switch (command.id) {
    case "SHOW_WATER":
    case "SHOW_METHANE":
    case "SHOW_BENZENE":
    case "SHOW_ETHANOL":
      return command.command.route ?? "/molecules";
    case "OPEN_PERIODIC_TABLE":
      return "/periodic-table";
    case "OPEN_CHAT":
      return "/tutor";
    case "START_EXPERIMENT":
      return "/lab";
    case "PREDICT_REACTION":
      return "/predictor";
    default:
      return "/";
  }
}

export function executeCommand(
  command: MatchedVoiceCommand,
  navigate: NavigateFunction,
  feedback?: Partial<VoiceFeedback>
): boolean {
  const route = getRouteForCommand(command);
  console.log("[VoiceControl] Executing Action:", command.id);
  console.log("[VoiceControl] Navigation:", route);

  navigate(route);
  feedback?.notify?.(command.command.label, "success");
  feedback?.speak?.(command.command.speech);
  return true;
}

export function openMolecule(moleculeId: string, navigate: NavigateFunction, feedback?: Partial<VoiceFeedback>): boolean {
  const route = `/molecules/${moleculeId}`;
  console.log("[VoiceControl] Executing Action:", `OPEN_${moleculeId.toUpperCase()}`);
  console.log("[VoiceControl] Navigation:", route);
  navigate(route);
  feedback?.notify?.(`Opening ${moleculeId}`, "success");
  feedback?.speak?.(
    moleculeId === "water"
      ? "Opening Water Molecule"
      : moleculeId === "methane"
        ? "Opening Methane Molecule"
        : moleculeId === "benzene"
          ? "Opening Benzene Molecule"
          : "Opening Ethanol Molecule"
  );
  return true;
}

export { speakText };