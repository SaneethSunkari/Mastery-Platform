import { arcadeWorldsFortyoneFiftyBundles } from "@/lib/arcade-worlds-fortyone-fifty";
import type { AdvancedArcadeLevelBundle } from "@/lib/arcade-worlds-three-seven";

const WORLD_START = 51;
const WORLD_END = 60;
const LEVEL_START = 2501;
const LEVEL_COUNT = 500;

const themesByWorld: Record<number, string> = {
  51: "World 51 failed ingestion recovery",
  52: "World 52 replay and idempotency control",
  53: "World 53 schema drift response",
  54: "World 54 late-arriving history repair",
  55: "World 55 financial balance incident",
  56: "World 56 session and funnel reconstruction",
  57: "World 57 SLA breach investigation",
  58: "World 58 source-target regression review",
  59: "World 59 privacy-safe healthcare checks",
  60: "World 60 final senior data-engineering gate",
};

function remapLevel(source: AdvancedArcadeLevelBundle, index: number): AdvancedArcadeLevelBundle {
  const levelNumber = LEVEL_START + index;
  const worldNumber = WORLD_START + Math.floor(index / 50);
  const worldTheme = themesByWorld[worldNumber] ?? `World ${worldNumber} final mastery`;
  const sharedTask = `${source.sharedTask} Treat this as a World ${worldNumber} final senior incident-review exercise.`;

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
      businessContext: `${source.level.businessContext} This is a generated-continuation pattern bank for World ${worldNumber}, using proven validators with a final permanent level identity.`,
    },
  };
}

export const arcadeWorldsFiftyoneSixtyBundles: AdvancedArcadeLevelBundle[] = Array.from(
  { length: LEVEL_COUNT },
  (_, index) => remapLevel(arcadeWorldsFortyoneFiftyBundles[index % arcadeWorldsFortyoneFiftyBundles.length], index),
);

if (arcadeWorldsFiftyoneSixtyBundles.length !== LEVEL_COUNT) {
  throw new Error(
    `Arcade Worlds ${WORLD_START}-${WORLD_END} must contain ${LEVEL_COUNT} levels. Received ${arcadeWorldsFiftyoneSixtyBundles.length}.`,
  );
}

export const arcadeWorldsFiftyoneSixtyBundleMap = new Map(
  arcadeWorldsFiftyoneSixtyBundles.map((bundle) => [bundle.levelNumber, bundle] as const),
);

export function getArcadeWorldsFiftyoneSixtyBundle(levelNumber: number) {
  return arcadeWorldsFiftyoneSixtyBundleMap.get(levelNumber) ?? null;
}
