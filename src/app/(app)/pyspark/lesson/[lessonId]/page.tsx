import { redirect } from "next/navigation";
import { getLessonById } from "@/lib/curriculum";

export default async function PySparkLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);

  if (!lesson || lesson.courseSlug !== "pyspark") {
    redirect("/pyspark");
  }

  redirect(`/pyspark?week=${lesson.weekId}&lesson=${lesson.id}`);
}
