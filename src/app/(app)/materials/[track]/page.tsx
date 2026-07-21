import { notFound } from "next/navigation";
import { MaterialsView } from "@/components/materials/materials-view";
import { CourseSlug } from "@/lib/types";

const validTracks: CourseSlug[] = ["sql", "python", "pyspark"];

export default async function MaterialsTrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;

  if (!validTracks.includes(track as CourseSlug)) {
    notFound();
  }

  return <MaterialsView track={track as CourseSlug} />;
}
