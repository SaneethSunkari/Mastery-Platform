import { Suspense } from "react";
import { PysparkWeekOneWorkspace } from "@/components/course/pyspark-week-one-workspace";

export default function PySparkPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading PySpark workspace...</div>}>
      <PysparkWeekOneWorkspace />
    </Suspense>
  );
}
