import { requireUser } from "@/lib/auth/current-user";
import { getResolvedWaitingItemsForUser, getWaitingItemsForUser } from "@/lib/queries/waiting-items";
import { WaitingItemFormDialog } from "@/components/waiting-on/waiting-item-form-dialog";
import { WaitingItemRow } from "@/components/waiting-on/waiting-item-row";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";

export default async function WaitingOnPage() {
  const user = await requireUser();
  const [open, resolved] = await Promise.all([
    getWaitingItemsForUser(user.id),
    getResolvedWaitingItemsForUser(user.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <PageHeader
        icon={Clock}
        title="Waiting On"
        description="Things blocked on someone else."
        action={
          <WaitingItemFormDialog
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" /> New
              </Button>
            }
          />
        }
      />

      {open.length === 0 ? (
        <EmptyState icon={Clock}>Nothing pending. Add something you&apos;re waiting on so it never silently stalls.</EmptyState>
      ) : (
        <div className="flex flex-col gap-2">
          {open.map((item) => (
            <WaitingItemRow key={item.id} item={item} />
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Resolved</h2>
          <div className="flex flex-col gap-2 opacity-60">
            {resolved.map((item) => (
              <WaitingItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
