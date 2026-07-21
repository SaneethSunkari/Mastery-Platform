import { CandyArcadeView } from "@/components/game/candy-arcade-view";

export default async function ArcadePage({
  searchParams,
}: {
  searchParams: Promise<{ question?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return <CandyArcadeView initialQuestionId={resolvedSearchParams.question ?? null} />;
}
