"use client";

import { useBackground } from "./background-provider";
import { BACKGROUND_PRESETS, DEFAULT_BACKGROUND_CSS } from "@/lib/background-presets";

export function BackgroundLayer() {
  const { background } = useBackground();

  const style: React.CSSProperties = {};
  let needsScrim = false;

  if (background.type === "preset") {
    const preset = BACKGROUND_PRESETS.find((p) => p.id === background.id);
    style.backgroundImage = preset?.css ?? DEFAULT_BACKGROUND_CSS;
    needsScrim = true;
  } else if (background.type === "custom") {
    style.backgroundImage = `url(${background.dataUrl})`;
    style.backgroundSize = "cover";
    style.backgroundPosition = "center";
    needsScrim = true;
  } else {
    style.backgroundImage = DEFAULT_BACKGROUND_CSS;
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-background">
      <div className="absolute inset-0" style={style} />
      {needsScrim && <div className="absolute inset-0 bg-background/55" />}
    </div>
  );
}
