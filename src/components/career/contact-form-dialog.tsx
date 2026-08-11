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
import { createContact } from "@/lib/actions/career";

export function ContactFormDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [relationshipType, setRelationshipType] = useState("");
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await createContact({
          name: name.trim(),
          company: company || undefined,
          role: role || undefined,
          relationshipType: relationshipType || undefined,
          email: email || undefined,
        });
        toast.success("Contact added");
        setName("");
        setCompany("");
        setRole("");
        setRelationshipType("");
        setEmail("");
        setOpen(false);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not add contact");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New contact</DialogTitle>
          <DialogDescription>Recruiters, referrals, and other relationships.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label className="mb-1">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1">Company</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1">Role</Label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Recruiter" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1">Relationship</Label>
              <Input value={relationshipType} onChange={(e) => setRelationshipType(e.target.value)} placeholder="e.g. referral" />
            </div>
            <div>
              <Label className="mb-1">Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
            {isPending ? "Saving…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
