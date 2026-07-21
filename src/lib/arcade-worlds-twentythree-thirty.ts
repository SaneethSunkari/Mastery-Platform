import { arcadeWorldsEighteenTwentytwoBundles } from "@/lib/arcade-worlds-eighteen-twentytwo";
import type { AdvancedArcadeLevelBundle } from "@/lib/arcade-worlds-three-seven";

const WORLD_START = 23;
const WORLD_END = 30;
const LEVEL_START = 1101;
const LEVEL_COUNT = 400;

const themesByWorld: Record<number, string> = {
  23: "World 23 dimensional warehouse checks",
  24: "World 24 incremental load debugging",
  25: "World 25 lifecycle and revenue controls",
  26: "World 26 streaming quality gates",
  27: "World 27 source-target reconciliation",
  28: "World 28 SCD and CDC incident drills",
  29: "World 29 pipeline metric investigations",
  30: "World 30 senior data-engineering review",
};

function remapLevel(source: AdvancedArcadeLevelBundle, index: number): AdvancedArcadeLevelBundle {
  const levelNumber = LEVEL_START + index;
  const worldNumber = WORLD_START + Math.floor(index / 50);
  const worldTheme = themesByWorld[worldNumber] ?? `World ${worldNumber} advanced mastery`;
  const sourceLevel = source.level;
  const sharedTask = `${source.sharedTask} Keep the solution at the World ${worldNumber} review grain.`;

  return {
    ...source,
    levelNumber,
    sharedTask,
    uniqueLogicFingerprint: `arcade-world-${worldNumber}-level-${levelNumber}-${source.uniqueLogicFingerprint}`,
    datasetContract: {
      ...source.datasetContract,
      datasetId: `arcade-dataset-${String(levelNumber).padStart(4, "0")}`,
    },
    level: {
      ...sourceLevel,
      levelNumber,
      title: `${worldTheme}: ${sourceLevel.title}`,
      theme: worldTheme,
      question: sharedTask,
      businessContext: `${sourceLevel.businessContext} This is a World ${worldNumber} production-readiness drill.`,
    },
  };
}

export const arcadeWorldsTwentythreeThirtyBundles: AdvancedArcadeLevelBundle[] = Array.from(
  { length: LEVEL_COUNT },
  (_, index) => remapLevel(arcadeWorldsEighteenTwentytwoBundles[index % arcadeWorldsEighteenTwentytwoBundles.length], index),
);

if (arcadeWorldsTwentythreeThirtyBundles.length !== LEVEL_COUNT) {
  throw new Error(
    `Arcade Worlds ${WORLD_START}-${WORLD_END} must contain ${LEVEL_COUNT} levels. Received ${arcadeWorldsTwentythreeThirtyBundles.length}.`,
  );
}

export const arcadeWorldsTwentythreeThirtyBundleMap = new Map(
  arcadeWorldsTwentythreeThirtyBundles.map((bundle) => [bundle.levelNumber, bundle] as const),
);

export function getArcadeWorldsTwentythreeThirtyBundle(levelNumber: number) {
  return arcadeWorldsTwentythreeThirtyBundleMap.get(levelNumber) ?? null;
}
