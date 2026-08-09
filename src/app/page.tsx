import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/command-center");

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
        <Anchor className="size-7 text-primary" />
      </div>
      <h1 className="max-w-xl text-4xl font-semibold tracking-tight">Helm</h1>
      <p className="mt-4 max-w-md text-balance text-muted-foreground">
        Your personal command center. One system that collects everything, ranks what matters,
        and tells you what to focus on next — and why.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild size="lg">
          <Link href="/sign-up">Get started</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    </div>
  );
}
