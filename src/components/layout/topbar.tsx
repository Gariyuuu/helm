"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const [today] = useState(() =>
    new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
  );

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 md:px-6">
      <div className="text-sm text-muted-foreground">{today}</div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground gap-2"
          onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
        >
          <Search className="size-3.5" />
          <span className="hidden sm:inline">Quick add / search</span>
          <kbd className="ml-2 hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] sm:inline">⌘K</kbd>
        </Button>
        <UserButton />
      </div>
    </header>
  );
}
