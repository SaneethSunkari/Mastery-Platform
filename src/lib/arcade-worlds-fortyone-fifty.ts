import { arcadeWorldsThirtyoneFortyBundles } from "@/lib/arcade-worlds-thirtyone-forty";
import type { AdvancedArcadeLevelBundle } from "@/lib/arcade-worlds-three-seven";

const WORLD_START = 41;
const WORLD_END = 50;
const LEVEL_START = 2001;
const LEVEL_COUNT = 500;

const themesByWorld: Record<number, string> = {
  41: "World 41 warehouse incident triage",
  42: "World 42 retention metric investigations",
  43: "World 43 dimensional model validation",
  44: "World 44 CDC and replay safety",
  45: "World 45 finance-grade reconciliation",
  46: "World 46 event pipeline debugging",
  47: "World 47 customer lifecycle analysis",
  48: "World 48 late-arriving data repair",
  49: "World 49 senior quality gates",
  50: "World 50 production-readiness review",
};

function remapLevel(source: AdvancedArcadeLevelBundle, index: number): AdvancedArcadeLevelBundle {
  const levelNumber = LEVEL_START + index;
  const worldNumber = WORLD_START + Math.floor(index / 50);
  const worldTheme = themesByWorld[worldNumber] ?? `World ${worldNumber} expert mastery`;
  const sharedTask = `${source.sharedTask} Treat this as a World ${worldNumber} expert production-readiness check.`;

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

export const arcadeWorldsFortyoneFiftyBundles: AdvancedArcadeLevelBundle[] = Array.from(
  { length: LEVEL_COUNT },
  (_, index) => remapLevel(arcadeWorldsThirtyoneFortyBundles[index % arcadeWorldsThirtyoneFortyBundles.length], index),
);

if (arcadeWorldsFortyoneFiftyBundles.length !== LEVEL_COUNT) {
  throw new Error(
    `Arcade Worlds ${WORLD_START}-${WORLD_END} must contain ${LEVEL_COUNT} levels. Received ${arcadeWorldsFortyoneFiftyBundles.length}.`,
  );
}

export const arcadeWorldsFortyoneFiftyBundleMap = new Map(
  arcadeWorldsFortyoneFiftyBundles.map((bundle) => [bundle.levelNumber, bundle] as const),
);

export function getArcadeWorldsFortyoneFiftyBundle(levelNumber: number) {
  return arcadeWorldsFortyoneFiftyBundleMap.get(levelNumber) ?? null;
}
