import { requireUser } from "@/lib/auth/current-user";
import { getTripsForUser } from "@/lib/queries/travel";
import { TripFormDialog } from "@/components/travel/trip-form-dialog";
import { TripCard } from "@/components/travel/trip-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function TravelPage() {
  const user = await requireUser();
  const trips = await getTripsForUser(user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Travel</h1>
          <p className="text-sm text-muted-foreground">Trips, flights, hotels, and packing checklists.</p>
        </div>
        <TripFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" /> New trip
            </Button>
          }
        />
      </div>

      {trips.length === 0 ? (
        <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">No trips planned yet.</Card>
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((t) => (
            <TripCard key={t.id} trip={t} />
          ))}
        </div>
      )}
    </div>
  );
}
