import { arcadeWorldOneBundles, type ArcadeWorldOneLevelBundle } from "@/lib/arcade-world-one";
import { arcadeWorldTwoBundles, type ArcadeWorldTwoLevelBundle } from "@/lib/arcade-world-two";
import {
  arcadeWorldsThreeSevenBundles,
  type AdvancedArcadeLevelBundle,
} from "@/lib/arcade-worlds-three-seven";
import { arcadeWorldsEightTwelveBundles } from "@/lib/arcade-worlds-eight-twelve";
import { arcadeWorldsEighteenTwentytwoBundles } from "@/lib/arcade-worlds-eighteen-twentytwo";
import { arcadeWorldsFiftyoneSixtyBundles } from "@/lib/arcade-worlds-fiftyone-sixty";
import { arcadeWorldsFortyoneFiftyBundles } from "@/lib/arcade-worlds-fortyone-fifty";
import { arcadeWorldsThirtyoneFortyBundles } from "@/lib/arcade-worlds-thirtyone-forty";
import { arcadeWorldsThirteenSeventeenBundles } from "@/lib/arcade-worlds-thirteen-seventeen";
import { arcadeWorldsTwentythreeThirtyBundles } from "@/lib/arcade-worlds-twentythree-thirty";

export type ArcadeLevelBundle =
  | ArcadeWorldOneLevelBundle
  | ArcadeWorldTwoLevelBundle
  | AdvancedArcadeLevelBundle;

export const arcadeValidatorBackedBundles: ArcadeLevelBundle[] = [
  ...arcadeWorldOneBundles,
  ...arcadeWorldTwoBundles,
  ...arcadeWorldsThreeSevenBundles,
  ...arcadeWorldsEightTwelveBundles,
  ...arcadeWorldsThirteenSeventeenBundles,
  ...arcadeWorldsEighteenTwentytwoBundles,
  ...arcadeWorldsTwentythreeThirtyBundles,
  ...arcadeWorldsThirtyoneFortyBundles,
  ...arcadeWorldsFortyoneFiftyBundles,
  ...arcadeWorldsFiftyoneSixtyBundles,
];

export const arcadeValidatorBackedBundleMap = new Map(
  arcadeValidatorBackedBundles.map((bundle) => [bundle.levelNumber, bundle] as const),
);

export const arcadeValidatorBackedLevelCount = arcadeValidatorBackedBundles.length;

export function getArcadeBundle(levelNumber: number) {
  return arcadeValidatorBackedBundleMap.get(levelNumber) ?? null;
}
