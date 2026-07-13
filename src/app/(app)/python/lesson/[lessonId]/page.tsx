import { LessonView } from "@/components/course/lesson-view";

export default async function PythonLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  return <LessonView courseSlug="python" lessonId={lessonId} />;
}
