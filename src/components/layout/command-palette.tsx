"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { quickAddWorkItem } from "@/lib/actions/work-items";
import { NAV_GROUPS } from "@/lib/nav";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const allNavItems = NAV_GROUPS.flatMap((g) => g.items);
  const trimmed = query.trim();

  function handleQuickAdd() {
    if (!trimmed) return;
    startTransition(async () => {
      await quickAddWorkItem(trimmed);
      setQuery("");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Quick capture" description="Add a task or jump anywhere">
      <CommandInput placeholder="Type a task, or search pages…" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>Nothing found.</CommandEmpty>
        {trimmed && (
          <CommandGroup heading="Quick add">
            <CommandItem onSelect={handleQuickAdd} disabled={isPending} value={`add-${trimmed}`}>
              Add “{trimmed}” to Inbox
            </CommandItem>
          </CommandGroup>
        )}
        <CommandGroup heading="Go to">
          {allNavItems.map((item) => (
            <CommandItem
              key={item.href}
              value={item.label}
              onSelect={() => {
                router.push(item.href);
                setOpen(false);
              }}
            >
              <item.icon className="size-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
