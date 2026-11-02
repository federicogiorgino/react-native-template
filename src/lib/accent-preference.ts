import { useSyncExternalStore } from "react";
import { Uniwind } from "uniwind";

import { readSetting, writeSetting } from "./flags";

/**
 * Accent presets. Red, green and amber are left out on purpose: they carry meaning in the
 * design system (danger, success, warning). `blue` matches the HeroUI Native default.
 * `foreground` is the text/icon colour used on top of the accent. Values are hex because
 * React Native style props do not understand `oklch()`.
 */
export const ACCENTS = {
  blue: { accent: "#0485F7", foreground: "#FCFCFC" },
  indigo: { accent: "#6262FA", foreground: "#FCFCFC" },
  violet: { accent: "#8C52FF", foreground: "#FCFCFC" },
  pink: { accent: "#ED3593", foreground: "#FCFCFC" },
  teal: { accent: "#00B5B5", foreground: "#18181B" },
} as const;

export type AccentId = keyof typeof ACCENTS;

export const ACCENT_IDS = Object.keys(ACCENTS) as AccentId[];

const SETTING = "accent";
const THEMES = ["light", "dark"] as const;

function isAccentId(value: string | null): value is AccentId {
  return value != null && value in ACCENTS;
}

let current: AccentId = (() => {
  const stored = readSetting(SETTING);
  return isAccentId(stored) ? stored : "blue";
})();

const listeners = new Set<() => void>();

function applyAccent(id: AccentId): void {
  const { accent, foreground } = ACCENTS[id];
  for (const theme of THEMES) {
    // `--focus` and the hover/soft shades are derived from these two, so they follow.
    Uniwind.updateCSSVariables(theme, { "--accent": accent, "--accent-foreground": foreground });
  }
}

/** Persists the choice and applies it immediately. */
export function setAccentPreference(id: AccentId): void {
  current = id;
  writeSetting(SETTING, id);
  applyAccent(id);
  listeners.forEach((listener) => listener());
}

/** Call once at startup, before the first render, so the saved accent is used from frame one. */
export function applyStoredAccent(): void {
  if (current !== "blue") applyAccent(current);
}

/** The selected accent; re-renders the component when it changes. */
export function useAccentPreference(): AccentId {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current
  );
}
