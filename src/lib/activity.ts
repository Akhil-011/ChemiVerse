import { supabase } from "@/lib/supabase";

export type ActivityEventType =
  | "page_view"
  | "search"
  | "prediction"
  | "experiment"
  | "ai_interaction"
  | "molecule_view"
  | "voice_command"
  | "lab_activity"
  | "command"
  | "module_open";

export interface TrackActivityInput {
  eventType: ActivityEventType;
  title: string;
  description?: string;
  module?: string;
  route?: string;
  payload?: Record<string, unknown>;
}

export async function trackActivity(userId: string, input: TrackActivityInput) {
  const { error } = await supabase.from("user_activity_events").insert({
    user_id: userId,
    event_type: input.eventType,
    title: input.title,
    description: input.description ?? null,
    module: input.module ?? null,
    route: input.route ?? null,
    payload: input.payload ?? {},
  });

  if (error) {
    throw error;
  }
}

export function safeTrackActivity(userId: string | null | undefined, input: TrackActivityInput) {
  if (!userId) return;

  void trackActivity(userId, input).catch((error) => {
    console.warn("[activity] failed to track event", error);
  });
}

export function routeToActivityMeta(pathname: string) {
  const normalized = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

  if (normalized.startsWith("/molecules")) {
    return { module: "molecules", title: "Molecule Viewer", eventType: "module_open" as const };
  }
  if (normalized.startsWith("/lab")) {
    return { module: "lab", title: "Virtual Chemistry Lab", eventType: "module_open" as const };
  }
  if (normalized.startsWith("/predictor")) {
    return { module: "predictor", title: "AI Reaction Predictor", eventType: "module_open" as const };
  }
  if (normalized.startsWith("/tutor")) {
    return { module: "tutor", title: "AI Chemistry Tutor", eventType: "module_open" as const };
  }
  if (normalized.startsWith("/periodic-table")) {
    return { module: "periodic-table", title: "Periodic Table", eventType: "module_open" as const };
  }
  if (normalized.startsWith("/dashboard")) {
    return { module: "dashboard", title: "Dashboard", eventType: "page_view" as const };
  }

  return { module: "home", title: "Home", eventType: "page_view" as const };
}