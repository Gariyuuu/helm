"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sun, Plus, FolderKanban, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_ITEMS = [
  { label: "Home", href: "/command-center", icon: LayoutDashboard },
  { label: "Today", href: "/today", icon: Sun },
  { label: "Add", href: "/inbox", icon: Plus },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "More", href: "/settings", icon: Menu },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden sticky bottom-0 z-40 flex items-stretch border-t border-border bg-background/95 backdrop-blur">
      {MOBILE_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]",
              active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
