"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { BACKGROUND_STORAGE_KEY } from "@/lib/background-presets";

export type BackgroundSelection = { type: "default" } | { type: "preset"; id: string } | { type: "custom"; dataUrl: string };

const DEFAULT_SELECTION: BackgroundSelection = { type: "default" };

interface BackgroundContextValue {
  background: BackgroundSelection;
  setPreset: (id: string) => void;
  setCustom: (dataUrl: string) => void;
  clear: () => void;
}

const BackgroundContext = createContext<BackgroundContextValue | null>(null);

function persist(selection: BackgroundSelection) {
  try {
    localStorage.setItem(BACKGROUND_STORAGE_KEY, JSON.stringify(selection));
  } catch {
    // localStorage full (large custom image) — selection still applies for this session.
  }
}

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [background, setBackground] = useState<BackgroundSelection>(DEFAULT_SELECTION);

  useEffect(() => {
    const stored = localStorage.getItem(BACKGROUND_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as BackgroundSelection;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe localStorage read, mount-only
      setBackground(parsed);
    } catch {
      // ignore corrupt value
    }
  }, []);

  function setPreset(id: string) {
    const next: BackgroundSelection = { type: "preset", id };
    setBackground(next);
    persist(next);
  }

  function setCustom(dataUrl: string) {
    const next: BackgroundSelection = { type: "custom", dataUrl };
    setBackground(next);
    persist(next);
  }

  function clear() {
    setBackground(DEFAULT_SELECTION);
    persist(DEFAULT_SELECTION);
  }

  return <BackgroundContext.Provider value={{ background, setPreset, setCustom, clear }}>{children}</BackgroundContext.Provider>;
}

export function useBackground() {
  const ctx = useContext(BackgroundContext);
  if (!ctx) throw new Error("useBackground must be used within BackgroundProvider");
  return ctx;
}

/** Downscales + re-encodes an uploaded image client-side so it fits comfortably in localStorage. */
export function compressImageFile(file: File, maxDim = 1920, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not decode image"));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unsupported"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
