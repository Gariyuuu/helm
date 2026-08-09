import { requireUser } from "@/lib/auth/current-user";
import { getSettingsForUser } from "@/lib/queries/settings";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = await getSettingsForUser(user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Capacity, notifications, and appearance.</p>
      </div>
      <SettingsForm
        initialCapacity={settings.capacityByDay}
        initialNotificationLevel={settings.notificationLevel}
        initialTheme={settings.theme}
      />
    </div>
  );
}
