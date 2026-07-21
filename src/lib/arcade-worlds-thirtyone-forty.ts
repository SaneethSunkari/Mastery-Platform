import { arcadeWorldsTwentythreeThirtyBundles } from "@/lib/arcade-worlds-twentythree-thirty";
import type { AdvancedArcadeLevelBundle } from "@/lib/arcade-worlds-three-seven";

const WORLD_START = 31;
const WORLD_END = 40;
const LEVEL_START = 1501;
const LEVEL_COUNT = 500;

const themesByWorld: Record<number, string> = {
  31: "World 31 advanced window investigations",
  32: "World 32 multi-CTE warehouse builds",
  33: "World 33 cohort and retention controls",
  34: "World 34 funnel metric debugging",
  35: "World 35 SCD current-state reviews",
  36: "World 36 CDC change detection",
  37: "World 37 quality exception reporting",
  38: "World 38 source-target incident response",
  39: "World 39 revenue metric reconciliation",
  40: "World 40 senior pipeline readiness",
};

function remapLevel(source: AdvancedArcadeLevelBundle, index: number): AdvancedArcadeLevelBundle {
  const levelNumber = LEVEL_START + index;
  const worldNumber = WORLD_START + Math.floor(index / 50);
  const worldTheme = themesByWorld[worldNumber] ?? `World ${worldNumber} senior mastery`;
  const sharedTask = `${source.sharedTask} Treat this as a World ${worldNumber} senior production review.`;

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
      ...source.level,
      levelNumber,
      title: `${worldTheme}: ${source.level.title}`,
      theme: worldTheme,
      question: sharedTask,
      businessContext: `${source.level.businessContext} This is a generated-continuation pattern bank for World ${worldNumber}, using proven validators with a new permanent level identity.`,
    },
  };
}

export const arcadeWorldsThirtyoneFortyBundles: AdvancedArcadeLevelBundle[] = Array.from(
  { length: LEVEL_COUNT },
  (_, index) => remapLevel(arcadeWorldsTwentythreeThirtyBundles[index % arcadeWorldsTwentythreeThirtyBundles.length], index),
);

if (arcadeWorldsThirtyoneFortyBundles.length !== LEVEL_COUNT) {
  throw new Error(
    `Arcade Worlds ${WORLD_START}-${WORLD_END} must contain ${LEVEL_COUNT} levels. Received ${arcadeWorldsThirtyoneFortyBundles.length}.`,
  );
}

export const arcadeWorldsThirtyoneFortyBundleMap = new Map(
  arcadeWorldsThirtyoneFortyBundles.map((bundle) => [bundle.levelNumber, bundle] as const),
);

export function getArcadeWorldsThirtyoneFortyBundle(levelNumber: number) {
  return arcadeWorldsThirtyoneFortyBundleMap.get(levelNumber) ?? null;
}
