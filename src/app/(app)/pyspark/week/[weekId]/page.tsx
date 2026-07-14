import { WeekView } from "@/components/course/week-view";

export default async function PySparkWeekPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const { weekId } = await params;
  return <WeekView courseSlug="pyspark" weekId={weekId} />;
}
