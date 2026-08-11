import { requireUser } from "@/lib/auth/current-user";
import { getTripsForUser } from "@/lib/queries/travel";
import { TripFormDialog } from "@/components/travel/trip-form-dialog";
import { TripCard } from "@/components/travel/trip-card";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Plane, Plus } from "lucide-react";

export default async function TravelPage() {
  const user = await requireUser();
  const trips = await getTripsForUser(user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <PageHeader
        icon={Plane}
        title="Travel"
        description="Trips, flights, hotels, and packing checklists."
        domainSlug="travel"
        action={
          <TripFormDialog
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" /> New trip
              </Button>
            }
          />
        }
      />

      {trips.length === 0 ? (
        <EmptyState icon={Plane}>No trips planned yet.</EmptyState>
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
