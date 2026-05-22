import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a Date as "Jan 15, 2025 · 3:42 PM" */
export function formatDateTime(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) + " · " + date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Format a Date as relative time ("2 hours ago") */
export function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/** Generate a unique ID */
export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Get energy change display info */
export function getEnergyInfo(change: string) {
  if (change === "exothermic") {
    return { label: "Exothermic", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20", icon: "🔥" };
  }
  if (change === "endothermic") {
    return { label: "Endothermic", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20", icon: "❄️" };
  }
  return { label: "Neutral", color: "text-gray-400", bg: "bg-gray-400/10 border-gray-400/20", icon: "⚖️" };
}

/** Get hazard level display info */
export function getHazardInfo(hazard: string) {
  if (hazard === "danger") return { label: "Danger", color: "text-red-400", bg: "bg-red-500/10", icon: "☠️" };
  if (hazard === "caution") return { color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Caution", icon: "⚠️" };
  return { label: "Safe", color: "text-green-400", bg: "bg-green-500/10", icon: "✅" };
}

/** Save data to localStorage */
export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`chemfusion_${key}`, JSON.stringify(data));
  } catch {
    console.warn("localStorage save failed:", key);
  }
}

/** Load data from localStorage */
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`chemfusion_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Check if browser supports Speech Recognition */
export function hasSpeechRecognition(): boolean {
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
}
