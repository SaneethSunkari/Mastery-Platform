import { Suspense } from "react";
import { PythonWeekOneWorkspace } from "@/components/course/python-week-one-workspace";

export default function PythonPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading Python workspace...</div>}>
      <PythonWeekOneWorkspace />
    </Suspense>
  );
}
