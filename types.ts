export interface ScriptData {
  title: string;
  content: string; // The full script text
  timestamp: number;
}

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  audioBuffer: AudioBuffer | null;
  error: string | null;
}

export enum Tone {
  NEUTRAL = "Neutral Analysis",
  HYPED = "Maximum Hype",
  CRITICAL = "Harsh Critic",
  FUNNY = "Meme Heavy"
}