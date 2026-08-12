export interface PatchNote {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export const PATCH_NOTES: PatchNote[] = [
  {
    version: "0.6.0",
    date: "2026-08-12",
    title: "Accent, everywhere — plus custom backgrounds",
    changes: [
      "The active sidebar item and the Helm logo now use your accent color — previously only buttons and focus rings did, because the sidebar was wired to an unused token",
      "A soft accent-tinted gradient now washes the page margins by default, so the whole app reads as themed, not just isolated controls",
      "New Background section in Settings: four gradient presets that automatically match your accent color, or upload your own image",
      "Uploaded images are resized and compressed client-side and kept on this device only — nothing is sent anywhere",
      "Sidebar, topbar, and mobile nav are now translucent with a blur so the background shows through behind them; page content stays fully opaque and readable",
    ],
  },
  {
    version: "0.5.0",
    date: "2026-08-11",
    title: "Accent themes and this page",
    changes: [
      "Six accent color themes (Default, Ocean, Forest, Sunset, Berry, Violet), picked from a radial theme wheel in Settings",
      "Accent applies instantly and independently of light/dark mode, saved per device",
      "Patch Notes page — you're looking at it",
    ],
  },
  {
    version: "0.4.0",
    date: "2026-08-11",
    title: "Dark mode, for real this time",
    changes: [
      "The Theme setting in Settings previously saved to the database and did nothing — dark mode is now actually wired up",
      "Theme changes apply live, no save required, and persist across reloads",
      "Toasts now match the active theme instead of always rendering light",
      "Added loading skeletons so page navigation doesn't flash blank while data loads",
    ],
  },
  {
    version: "0.3.0",
    date: "2026-08-11",
    title: "Feedback and visual polish",
    changes: [
      "Every create, complete, archive, restore, and status-change action now confirms with a toast instead of silently refreshing",
      "Each section's page header now uses its life-domain color — previously defined in the design system but never applied anywhere",
      "Empty states across the app got an icon instead of bare placeholder text",
    ],
  },
  {
    version: "0.2.1",
    date: "2026-08-11",
    title: "Reliability pass",
    changes: [
      "Every database read now degrades to an empty result instead of 500ing the page if the connection has a problem",
    ],
  },
  {
    version: "0.2.0",
    date: "2026-08-11",
    title: "Every section, for real",
    changes: [
      "Built out School, Career, Applications, Research, Goals, and Waiting On with full create/edit/status flows",
      "Built out Learning, Travel, Personal, Health, Finance, and Relationships — the last four share one view over the universal work-item system, filtered by life domain",
      "Added Archive (with restore), Weekly Review (auto-computed stats), Insights (analytics), and Calendar + Focus Mode (with a real start/stop timer that logs time)",
      "Fixed a bug where opening the ⌘K command palette crashed the app — a leftover scaffolding issue, not something anyone had hit yet",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-08-09",
    title: "Foundation",
    changes: [
      "Full schema for the entire 89-section spec — school, career, research, projects, goals, and more",
      "A deterministic, explainable priority engine: every ranked item shows the reasons behind its score",
      "Command Center, Today, Inbox, All Work, and Projects, with real CRUD throughout",
      "⌘K command palette for quick capture and navigation",
    ],
  },
];
