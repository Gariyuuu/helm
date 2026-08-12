import { PATCH_NOTES } from "@/lib/patch-notes";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatIsoDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

export default function PatchNotesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
      <PageHeader icon={ScrollText} title="Patch Notes" description="What's shipped, in order." />

      <div className="flex flex-col gap-3">
        {PATCH_NOTES.map((note) => (
          <Card key={note.version} className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline">v{note.version}</Badge>
              <span className="text-xs text-muted-foreground">{formatIsoDate(note.date)}</span>
            </div>
            <h2 className="mb-2 font-semibold">{note.title}</h2>
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {note.changes.map((change, i) => (
                <li key={i}>{change}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
