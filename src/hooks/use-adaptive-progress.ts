"use client";

import { useCallback, useSyncExternalStore } from "react";
import { emptyProgress, parseProgress, PROGRESS_KEY } from "@/lib/adaptive/progress";
import type { ProgressState } from "@/lib/adaptive/types";

const serverProgress = emptyProgress();
let cachedRaw: string | null | undefined;
let cachedProgress = serverProgress;

function readProgress() {
  const raw = window.localStorage.getItem(PROGRESS_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedProgress = parseProgress(raw);
  }
  return cachedProgress;
}

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("mastery-progress", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("mastery-progress", listener);
  };
}

function subscribeHydration() { return () => undefined; }

export function useAdaptiveProgress() {
  const progress = useSyncExternalStore(subscribe, readProgress, () => serverProgress);
  const ready = useSyncExternalStore(subscribeHydration, () => true, () => false);

  const setProgress = useCallback((next: ProgressState | ((current: ProgressState) => ProgressState)) => {
    const current = readProgress();
    const value = typeof next === "function" ? next(current) : next;
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(value));
    cachedRaw = undefined;
    window.dispatchEvent(new CustomEvent("mastery-progress"));
  }, []);

  const reset = useCallback(() => {
    window.localStorage.removeItem(PROGRESS_KEY);
    cachedRaw = undefined;
    window.dispatchEvent(new CustomEvent("mastery-progress"));
  }, []);

  return { progress, setProgress, reset, ready };
}
