import { LessonView } from "@/components/course/lesson-view";

export default async function SqlLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  return <LessonView courseSlug="sql" lessonId={lessonId} />;
}
