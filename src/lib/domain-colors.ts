export const DOMAIN_COLOR_CLASSES: Record<string, { bg: string; text: string }> = {
  academics: { bg: "bg-domain-academics/15", text: "text-domain-academics" },
  career: { bg: "bg-domain-career/15", text: "text-domain-career" },
  research: { bg: "bg-domain-research/15", text: "text-domain-research" },
  projects: { bg: "bg-domain-projects/15", text: "text-domain-projects" },
  learning: { bg: "bg-domain-learning/15", text: "text-domain-learning" },
  health: { bg: "bg-domain-health/15", text: "text-domain-health" },
  relationships: { bg: "bg-domain-relationships/15", text: "text-domain-relationships" },
  travel: { bg: "bg-domain-travel/15", text: "text-domain-travel" },
  finance: { bg: "bg-domain-finance/15", text: "text-domain-finance" },
  personal: { bg: "bg-domain-personal/15", text: "text-domain-personal" },
};

export const NEUTRAL_ICON_CLASSES = { bg: "bg-muted", text: "text-muted-foreground" };

export function domainColorClasses(slug?: string | null) {
  if (!slug) return NEUTRAL_ICON_CLASSES;
  return DOMAIN_COLOR_CLASSES[slug] ?? NEUTRAL_ICON_CLASSES;
}
