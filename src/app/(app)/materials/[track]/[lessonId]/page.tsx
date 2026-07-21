import { notFound } from "next/navigation";
import { MaterialsView } from "@/components/materials/materials-view";
import { getMaterialLesson } from "@/lib/materials";
import { CourseSlug } from "@/lib/types";

const validTracks: CourseSlug[] = ["sql", "python", "pyspark"];

export default async function MaterialsLessonPage({
  params,
}: {
  params: Promise<{ track: string; lessonId: string }>;
}) {
  const { track, lessonId } = await params;
  const safeTrack = track as CourseSlug;

  if (!validTracks.includes(safeTrack) || !getMaterialLesson(safeTrack, lessonId)) {
    notFound();
  }

  return <MaterialsView track={safeTrack} lessonId={lessonId} />;
}
