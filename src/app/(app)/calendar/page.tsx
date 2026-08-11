import { requireUser } from "@/lib/auth/current-user";
import { getActiveFocusSession, getUpcomingEventsForUser } from "@/lib/queries/calendar";
import { getActiveWorkItems } from "@/lib/queries/work-items";
import { EventFormDialog } from "@/components/calendar/event-form-dialog";
import { EventRow } from "@/components/calendar/event-row";
import { FocusModePanel } from "@/components/calendar/focus-mode-panel";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

export default async function CalendarPage() {
  const user = await requireUser();
  const [events, activeSession, activeItems] = await Promise.all([
    getUpcomingEventsForUser(user.id),
    getActiveFocusSession(user.id),
    getActiveWorkItems(user.id),
  ]);
  const workItemOptions = activeItems.map((s) => ({ id: s.item.id, title: s.item.title }));

  const byDay = new Map<string, typeof events>();
  for (const event of events) {
    const key = event.startAt.toDateString();
    byDay.set(key, [...(byDay.get(key) ?? []), event]);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <PageHeader
        icon={Calendar}
        title="Calendar"
        description="Upcoming events and focus time."
        action={
          <EventFormDialog
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" /> New event
              </Button>
            }
          />
        }
      />

      <FocusModePanel activeSession={activeSession} workItemOptions={workItemOptions} />

      {byDay.size === 0 ? (
        <EmptyState icon={Calendar}>No upcoming events.</EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {[...byDay.entries()].map(([day, dayEvents]) => (
            <div key={day}>
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                {new Date(day).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
              </h2>
              <div className="flex flex-col gap-2">
                {dayEvents.map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
