import { create } from "zustand";

export const STORY_STEPS = [
  { id: "sketch", label: "Sketch" },
  { id: "plan", label: "Plan" },
  { id: "build", label: "Build" },
  { id: "furnish", label: "Furnish" },
  { id: "light", label: "Light" },
] as const;

type StoryState = {
  /** Scroll progress through the blueprint story, 0 → 1. */
  progress: number;
  /** Index into STORY_STEPS for the step currently in view. Each step is one
   *  screen tall, so step i is centred at progress i / (steps - 1). */
  step: number;
  setProgress: (progress: number) => void;
};

// The 3D scene reads `progress` every frame through getState() so scrolling
// never re-renders React; UI subscribes to `step`, which changes rarely.
export const useStoryStore = create<StoryState>((set) => ({
  progress: 0,
  step: 0,
  setProgress: (progress) =>
    set({
      progress,
      step: Math.round(progress * (STORY_STEPS.length - 1)),
    }),
}));
