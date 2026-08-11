"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createApplication } from "@/lib/actions/career";

export function ApplicationFormDialog({
  trigger,
  companies,
}: {
  trigger: ReactNode;
  companies: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("");
  const [companyId, setCompanyId] = useState("none");
  const [type, setType] = useState("internship");
  const [deadline, setDeadline] = useState("");
  const [link, setLink] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    if (!role.trim()) return;
    startTransition(async () => {
      try {
        await createApplication({
          role: role.trim(),
          companyId: companyId === "none" ? null : companyId,
          type,
          deadline: deadline ? new Date(deadline) : null,
          link: link || undefined,
        });
        toast.success("Application added");
        setRole("");
        setCompanyId("none");
        setDeadline("");
        setLink("");
        setOpen(false);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not add application");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New application</DialogTitle>
          <DialogDescription>Starts in Interested.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label className="mb-1">Role</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} autoFocus placeholder="e.g. SWE Intern" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1">Company</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="full_time">Full-time</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="mb-1">Deadline</Label>
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1">Link</Label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !role.trim()}>
            {isPending ? "Saving…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
