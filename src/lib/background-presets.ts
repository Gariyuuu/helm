export interface BackgroundPreset {
  id: string;
  label: string;
  /** CSS `background` value. Can reference theme CSS vars (e.g. var(--primary)) so it follows the active accent. */
  css: string;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: "aurora",
    label: "Aurora",
    css: "radial-gradient(ellipse 80% 60% at 15% -10%, color-mix(in oklch, var(--primary) 30%, transparent), transparent), radial-gradient(ellipse 70% 60% at 100% 0%, color-mix(in oklch, var(--primary) 18%, transparent), transparent)",
  },
  {
    id: "glow",
    label: "Glow",
    css: "radial-gradient(circle at 20% 20%, color-mix(in oklch, var(--primary) 25%, transparent), transparent 55%)",
  },
  {
    id: "sunrise",
    label: "Sunrise",
    css: "linear-gradient(135deg, color-mix(in oklch, var(--primary) 20%, transparent) 0%, transparent 55%)",
  },
  {
    id: "deep",
    label: "Deep",
    css: "radial-gradient(ellipse 90% 70% at 50% 100%, color-mix(in oklch, var(--primary) 22%, transparent), transparent)",
  },
];

export const DEFAULT_BACKGROUND_CSS =
  "radial-gradient(ellipse 70% 50% at 10% -10%, color-mix(in oklch, var(--primary) 7%, transparent), transparent)";

export const BACKGROUND_STORAGE_KEY = "helm-background";
