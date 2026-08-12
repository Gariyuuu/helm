"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Check, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBackground, compressImageFile } from "./background-provider";
import { BACKGROUND_PRESETS, DEFAULT_BACKGROUND_CSS } from "@/lib/background-presets";

export function BackgroundPicker() {
  const { background, setPreset, setCustom, clear } = useBackground();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please pick an image file");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await compressImageFile(file);
      setCustom(dataUrl);
      toast.success("Background image set");
    } catch {
      toast.error("Could not use that image");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        <button
          type="button"
          onClick={clear}
          className="flex aspect-video flex-col items-center justify-center gap-1 rounded-lg border-2 bg-card text-xs"
          style={{ borderColor: background.type === "default" ? "var(--foreground)" : "var(--border)" }}
        >
          {background.type === "default" && <Check className="size-3.5" />}
          None
        </button>

        {BACKGROUND_PRESETS.map((preset) => {
          const selected = background.type === "preset" && background.id === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setPreset(preset.id)}
              title={preset.label}
              className="relative aspect-video overflow-hidden rounded-lg border-2 bg-card"
              style={{ borderColor: selected ? "var(--foreground)" : "var(--border)" }}
            >
              <div className="absolute inset-0" style={{ backgroundImage: preset.css }} />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-background/70 px-1.5 py-0.5 text-[10px]">
                {preset.label}
                {selected && <Check className="size-3" />}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative flex aspect-video flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border-2 border-dashed bg-card text-xs text-muted-foreground disabled:opacity-60"
          style={{ borderColor: background.type === "custom" ? "var(--foreground)" : "var(--border)" }}
        >
          {background.type === "custom" ? (
            <>
              <div className="absolute inset-0" style={{ backgroundImage: `url(${background.dataUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-background/70 px-1.5 py-0.5 text-[10px] text-foreground">
                Your image
                <Check className="size-3" />
              </span>
            </>
          ) : (
            <>
              <ImagePlus className="size-4" />
              {uploading ? "Uploading…" : "Upload"}
            </>
          )}
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Presets follow your accent color. Uploaded images are resized and kept on this device only.
        </p>
        {background.type !== "default" && (
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground" onClick={clear}>
            <X className="size-3" /> Remove
          </Button>
        )}
      </div>

      <div
        className="h-16 rounded-lg border border-border bg-background"
        style={{
          backgroundImage:
            background.type === "preset"
              ? BACKGROUND_PRESETS.find((p) => p.id === background.id)?.css
              : background.type === "custom"
                ? `url(${background.dataUrl})`
                : DEFAULT_BACKGROUND_CSS,
          backgroundSize: background.type === "custom" ? "cover" : undefined,
          backgroundPosition: background.type === "custom" ? "center" : undefined,
        }}
      />
    </div>
  );
}
