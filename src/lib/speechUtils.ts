export function normalizeTranscript(transcript: string): string {
  return transcript
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function speakText(message: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export function getSpeechRecognitionConstructor(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;

  return (window.SpeechRecognition || window.webkitSpeechRecognition || null) as (new () => SpeechRecognition) | null;
}

export function hasNativeSpeechRecognition(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}