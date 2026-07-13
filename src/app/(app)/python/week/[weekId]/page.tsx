import { WeekView } from "@/components/course/week-view";

export default async function PythonWeekPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const { weekId } = await params;
  return <WeekView courseSlug="python" weekId={weekId} />;
}
