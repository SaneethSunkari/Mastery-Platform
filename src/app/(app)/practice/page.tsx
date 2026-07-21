import { PracticeView } from "@/components/practice/practice-view";

interface PracticePageProps {
  searchParams: Promise<{
    track?: string | string[];
  }>;
}

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const resolvedSearchParams = await searchParams;
  const track = Array.isArray(resolvedSearchParams.track)
    ? resolvedSearchParams.track[0]
    : resolvedSearchParams.track;

  return <PracticeView initialTrack={track} />;
}
