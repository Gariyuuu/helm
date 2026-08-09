"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { quickAddWorkItem } from "@/lib/actions/work-items";
import { Plus } from "lucide-react";

export function QuickAddBar({ placeholder = "Dump something into your inbox…" }: { placeholder?: string }) {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await quickAddWorkItem(trimmed);
      setValue("");
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder={placeholder}
        disabled={isPending}
      />
      <Button onClick={submit} disabled={isPending || !value.trim()} className="gap-1.5 shrink-0">
        <Plus className="size-4" /> Add
      </Button>
    </div>
  );
}
