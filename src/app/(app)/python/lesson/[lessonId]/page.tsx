import { redirect } from "next/navigation";
import { getLessonById } from "@/lib/curriculum";

export default async function PythonLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);

  if (!lesson || lesson.courseSlug !== "python") {
    redirect("/python");
  }

  redirect(`/python?week=${lesson.weekId}&lesson=${lesson.id}`);
}
