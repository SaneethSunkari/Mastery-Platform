import { MaterialsView } from "@/components/materials/materials-view";

interface MaterialsPageProps {
  searchParams: Promise<{
    track?: string | string[];
  }>;
}

export default async function MaterialsPage({ searchParams }: MaterialsPageProps) {
  const resolvedSearchParams = await searchParams;
  const track = Array.isArray(resolvedSearchParams.track)
    ? resolvedSearchParams.track[0]
    : resolvedSearchParams.track;

  return <MaterialsView initialTrack={track} />;
}
