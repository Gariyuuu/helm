export interface AccentTheme {
  id: string;
  label: string;
  /** CSS color used for the swatch button itself (roughly the light-mode primary). */
  swatch: string;
}

export const ACCENT_THEMES: AccentTheme[] = [
  { id: "default", label: "Default", swatch: "oklch(0.35 0 0)" },
  { id: "ocean", label: "Ocean", swatch: "oklch(0.55 0.18 250)" },
  { id: "forest", label: "Forest", swatch: "oklch(0.5 0.14 155)" },
  { id: "sunset", label: "Sunset", swatch: "oklch(0.65 0.19 45)" },
  { id: "berry", label: "Berry", swatch: "oklch(0.55 0.22 340)" },
  { id: "violet", label: "Violet", swatch: "oklch(0.5 0.2 290)" },
];

export const DEFAULT_ACCENT = "default";
export const ACCENT_STORAGE_KEY = "helm-accent-theme";
