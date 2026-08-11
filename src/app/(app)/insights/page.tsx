import { requireUser } from "@/lib/auth/current-user";
import { getInsightsForUser } from "@/lib/queries/insights";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const HEALTH_CLASS: Record<string, string> = {
  healthy: "bg-health-healthy",
  attention: "bg-health-attention",
  at_risk: "bg-health-at-risk",
  critical: "bg-health-critical",
  dormant: "bg-health-dormant",
};

const BUCKET_CLASS: Record<string, string> = {
  Critical: "bg-priority-critical",
  "Very High": "bg-priority-high",
  High: "bg-priority-high",
  Medium: "bg-priority-medium",
  Low: "bg-priority-low",
  Someday: "bg-priority-someday",
};

function BarList({ rows, colorFor }: { rows: [string, number][]; colorFor: (label: string) => string }) {
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <div className="flex flex-col gap-2">
      {rows.map(([label, count]) => (
        <div key={label} className="flex items-center gap-2 text-sm">
          <span className="w-28 shrink-0 truncate capitalize text-muted-foreground">{label.replace("_", " ")}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full ${colorFor(label)}`} style={{ width: `${(count / max) * 100}%` }} />
          </div>
          <span className="w-6 shrink-0 text-right text-xs text-muted-foreground">{count}</span>
        </div>
      ))}
    </div>
  );
}

export default async function InsightsPage() {
  const user = await requireUser();
  const insights = await getInsightsForUser(user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <PageHeader icon={BarChart3} title="Insights" description="How work is actually moving." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-semibold">{insights.completedLast7Days}</p>
          <p className="text-xs text-muted-foreground">Completed (7d)</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-semibold">{insights.completedLast30Days}</p>
          <p className="text-xs text-muted-foreground">Completed (30d)</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-semibold text-priority-critical">{insights.overdueCount}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-semibold">{insights.activeCount}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </Card>
      </div>

      {insights.byBucket.length > 0 && (
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold">Active work by priority</h2>
          <BarList rows={insights.byBucket} colorFor={(b) => BUCKET_CLASS[b] ?? "bg-muted-foreground"} />
        </Card>
      )}

      {insights.byDomain.length > 0 && (
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold">Active work by domain</h2>
          <BarList rows={insights.byDomain} colorFor={() => "bg-foreground/70"} />
        </Card>
      )}

      {insights.byHealth.length > 0 && (
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold">Project health</h2>
          <BarList rows={insights.byHealth} colorFor={(h) => HEALTH_CLASS[h] ?? "bg-muted-foreground"} />
        </Card>
      )}
    </div>
  );
}
