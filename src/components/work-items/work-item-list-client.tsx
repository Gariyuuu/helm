"use client";

import { useMemo, useState } from "react";
import { WorkItemRow } from "./work-item-row";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { ScoredWorkItem } from "@/lib/priority/from-db";
import { workItemStatusValues } from "@/lib/validation/work-item";

export function WorkItemListClient({
  items,
  projectNameById,
  domainOptions,
}: {
  items: ScoredWorkItem[];
  projectNameById: Map<string, string>;
  domainOptions: { id: string; name: string }[];
}) {
  const [status, setStatus] = useState<string>("all");
  const [domainId, setDomainId] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return items.filter((s) => {
      if (status !== "all" && s.item.status !== status) return false;
      if (domainId !== "all" && s.item.domainId !== domainId) return false;
      if (search && !s.item.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, status, domainId, search]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-56" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {workItemStatusValues.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={domainId} onValueChange={setDomainId}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Domain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All domains</SelectItem>
            {domainOptions.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No items match these filters.</p>
      ) : (
        <div className="flex flex-col">
          {filtered.map((s) => (
            <WorkItemRow key={s.item.id} scored={s} projectName={s.item.projectId ? projectNameById.get(s.item.projectId) : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
