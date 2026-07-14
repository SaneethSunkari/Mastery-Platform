import { LessonView } from "@/components/course/lesson-view";

export default async function PySparkLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  return <LessonView courseSlug="pyspark" lessonId={lessonId} />;
}
