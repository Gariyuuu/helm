"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anchor } from "lucide-react";
import { NAV_GROUPS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/85 backdrop-blur-xl text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4 py-4">
        <Anchor className="size-5 text-primary" />
        <span className="font-semibold tracking-tight">Helm</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {NAV_GROUPS.map((group, i) => (
          <div key={i} className="mb-3">
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
            {i < NAV_GROUPS.length - 1 && <div className="mx-3 my-2 border-t border-sidebar-border" />}
          </div>
        ))}
      </nav>
    </aside>
  );
}
