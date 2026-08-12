"use client";

import { Check } from "lucide-react";
import { useAccent } from "./accent-provider";
import { ACCENT_THEMES } from "@/lib/accent-themes";

const RADIUS = 54;
const SIZE = RADIUS * 2 + 56;

export function ThemeWheel() {
  const { accent, setAccent } = useAccent();
  const current = ACCENT_THEMES.find((t) => t.id === accent);

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-14 flex-col items-center justify-center rounded-full border border-border bg-muted text-center">
            <span className="text-[10px] font-medium leading-tight text-muted-foreground">{current?.label ?? "Theme"}</span>
          </div>
        </div>
        {ACCENT_THEMES.map((t, i) => {
          const angle = (i / ACCENT_THEMES.length) * 2 * Math.PI - Math.PI / 2;
          const x = RADIUS * Math.cos(angle);
          const y = RADIUS * Math.sin(angle);
          const selected = accent === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setAccent(t.id)}
              title={t.label}
              aria-label={`Use ${t.label} accent theme`}
              aria-pressed={selected}
              className="absolute flex size-9 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: t.swatch,
                left: `calc(50% + ${x}px - 18px)`,
                top: `calc(50% + ${y}px - 18px)`,
                borderColor: selected ? "var(--foreground)" : "var(--border)",
                transform: selected ? "scale(1.12)" : undefined,
              }}
            >
              {selected && <Check className="size-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />}
            </button>
          );
        })}
      </div>
      <div className="text-sm text-muted-foreground">
        Pick an accent color for buttons, focus rings, and the active sidebar item.
        <br />
        Applies instantly, saved on this device.
      </div>
    </div>
  );
}
