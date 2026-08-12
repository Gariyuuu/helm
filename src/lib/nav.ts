import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Sun,
  Inbox,
  ListChecks,
  Calendar,
  FolderKanban,
  GraduationCap,
  Briefcase,
  FileText,
  FlaskConical,
  BookOpen,
  Heart,
  Users,
  Plane,
  HeartPulse,
  Landmark,
  Target,
  Clock,
  BarChart3,
  ClipboardCheck,
  Archive,
  ScrollText,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: "Command Center", href: "/command-center", icon: LayoutDashboard },
      { label: "Today", href: "/today", icon: Sun },
      { label: "Inbox", href: "/inbox", icon: Inbox },
      { label: "All Work", href: "/work", icon: ListChecks },
      { label: "Calendar", href: "/calendar", icon: Calendar },
    ],
  },
  {
    items: [
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "School", href: "/school", icon: GraduationCap },
      { label: "Career", href: "/career", icon: Briefcase },
      { label: "Applications", href: "/applications", icon: FileText },
      { label: "Research", href: "/research", icon: FlaskConical },
      { label: "Learning", href: "/learning", icon: BookOpen },
    ],
  },
  {
    items: [
      { label: "Personal", href: "/personal", icon: Heart },
      { label: "Relationships", href: "/relationships", icon: Users },
      { label: "Travel", href: "/travel", icon: Plane },
      { label: "Health", href: "/health", icon: HeartPulse },
      { label: "Finance", href: "/finance", icon: Landmark },
    ],
  },
  {
    items: [
      { label: "Goals", href: "/goals", icon: Target },
      { label: "Waiting On", href: "/waiting-on", icon: Clock },
      { label: "Insights", href: "/insights", icon: BarChart3 },
      { label: "Weekly Review", href: "/weekly-review", icon: ClipboardCheck },
    ],
  },
  {
    items: [
      { label: "Archive", href: "/archive", icon: Archive },
      { label: "Patch Notes", href: "/patch-notes", icon: ScrollText },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const ALL_WORK_ITEM_TYPES_LABEL = "All Work";
