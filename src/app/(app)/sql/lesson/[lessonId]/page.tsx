import { redirect } from "next/navigation";

export default async function SqlLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  redirect(`/materials/sql/${lessonId}`);
}
