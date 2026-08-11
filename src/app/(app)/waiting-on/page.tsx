import { requireUser } from "@/lib/auth/current-user";
import { getResolvedWaitingItemsForUser, getWaitingItemsForUser } from "@/lib/queries/waiting-items";
import { WaitingItemFormDialog } from "@/components/waiting-on/waiting-item-form-dialog";
import { WaitingItemRow } from "@/components/waiting-on/waiting-item-row";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function WaitingOnPage() {
  const user = await requireUser();
  const [open, resolved] = await Promise.all([
    getWaitingItemsForUser(user.id),
    getResolvedWaitingItemsForUser(user.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Waiting On</h1>
          <p className="text-sm text-muted-foreground">Things blocked on someone else.</p>
        </div>
        <WaitingItemFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" /> New
            </Button>
          }
        />
      </div>

      {open.length === 0 ? (
        <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">
          Nothing pending. Add something you&apos;re waiting on so it never silently stalls.
        </Card>
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
