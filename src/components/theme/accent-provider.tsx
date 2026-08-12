"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ACCENT_STORAGE_KEY, DEFAULT_ACCENT } from "@/lib/accent-themes";

interface AccentContextValue {
  accent: string;
  setAccent: (id: string) => void;
}

const AccentContext = createContext<AccentContextValue | null>(null);

function applyAccent(id: string) {
  if (id === DEFAULT_ACCENT) {
    document.documentElement.removeAttribute("data-accent");
  } else {
    document.documentElement.setAttribute("data-accent", id);
  }
}

export function AccentProvider({ children }: { children: React.ReactNode }) {
  // Starts at the default on both server and the first client render so hydration
  // always matches, then syncs from localStorage post-mount (client-only, one extra
  // render) — the same tradeoff next-themes makes for light/dark.
  const [accent, setAccentState] = useState(DEFAULT_ACCENT);

  useEffect(() => {
    const stored = localStorage.getItem(ACCENT_STORAGE_KEY);
    if (stored && stored !== DEFAULT_ACCENT) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe localStorage read, mount-only
      setAccentState(stored);
    }
  }, []);

  useEffect(() => {
    applyAccent(accent);
  }, [accent]);

  function setAccent(id: string) {
    setAccentState(id);
    localStorage.setItem(ACCENT_STORAGE_KEY, id);
  }

  return <AccentContext.Provider value={{ accent, setAccent }}>{children}</AccentContext.Provider>;
}

export function useAccent() {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error("useAccent must be used within AccentProvider");
  return ctx;
}
