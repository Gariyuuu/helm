"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ThemeWheel } from "@/components/theme/theme-wheel";
import { updateSettings } from "@/lib/actions/settings";
import type { CapacityByDay } from "@/lib/priority/capacity";

const DAYS: { key: keyof CapacityByDay; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

export function SettingsForm({
  initialCapacity,
  initialNotificationLevel,
  initialTheme,
}: {
  initialCapacity: CapacityByDay;
  initialNotificationLevel: "critical_only" | "balanced" | "everything" | "custom";
  initialTheme: "light" | "dark" | "system";
}) {
  const [capacity, setCapacity] = useState(initialCapacity);
  const [notificationLevel, setNotificationLevel] = useState(initialNotificationLevel);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (theme === undefined) setTheme(initialTheme);
    // Only seed from the saved DB value once, before next-themes has hydrated its own state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function save() {
    startTransition(async () => {
      await updateSettings({ capacityByDay: capacity, notificationLevel, theme: (theme as typeof initialTheme) ?? initialTheme });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="mb-1 text-sm font-semibold">Weekly capacity</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Realistic productive hours per day. The Capacity Meter on Command Center compares this to committed work.
        </p>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((d) => (
            <div key={d.key}>
              <Label className="mb-1 block text-center text-xs text-muted-foreground">{d.label}</Label>
              <Input
                type="number"
                min={0}
                max={16}
                value={capacity[d.key]}
                onChange={(e) => setCapacity((prev) => ({ ...prev, [d.key]: Number(e.target.value) || 0 }))}
                className="text-center"
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold">Notifications</h3>
        <Select value={notificationLevel} onValueChange={(v) => setNotificationLevel(v as typeof notificationLevel)}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="critical_only">Critical only</SelectItem>
            <SelectItem value="balanced">Balanced</SelectItem>
            <SelectItem value="everything">Everything</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold">Theme</h3>
        <Select value={theme ?? initialTheme} onValueChange={setTheme}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>

        <Separator className="my-4" />

        <h4 className="mb-3 text-sm font-semibold">Accent color</h4>
        <ThemeWheel />
      </Card>

      <Button onClick={save} disabled={isPending}>
        {isPending ? "Saving…" : saved ? "Saved" : "Save settings"}
      </Button>
    </div>
  );
}
