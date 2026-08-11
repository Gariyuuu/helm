import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { domainColorClasses } from "@/lib/domain-colors";

export function PageHeader({
  icon: Icon,
  title,
  description,
  domainSlug,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  domainSlug?: string | null;
  action?: ReactNode;
}) {
  const color = domainColorClasses(domainSlug);

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${color.bg}`}>
          <Icon className={`size-4.5 ${color.text}`} />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
