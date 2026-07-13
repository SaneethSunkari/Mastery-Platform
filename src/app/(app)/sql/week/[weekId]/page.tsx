import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { SqlWeekWorkspace } from "@/components/sql/sql-week-workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getSqlWeekDefinition } from "@/lib/sql-weeks";
import { sqlWeekOneId, sqlWeekOneUnlockMessage } from "@/lib/sql-week-one";
import { cn } from "@/lib/utils";

export default async function SqlWeekPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const { weekId } = await params;
  if (getSqlWeekDefinition(weekId)) {
    return <SqlWeekWorkspace weekId={weekId} />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-border/70 bg-muted/40 p-3">
            <LockKeyhole className="size-4" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold">Week locked</CardTitle>
            <CardDescription>{sqlWeekOneUnlockMessage}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Link href={`/sql/week/${sqlWeekOneId}`} className={cn(buttonVariants(), "inline-flex")}>
          Go to Week 1 tasks
        </Link>
      </CardContent>
    </Card>
  );
}
