import { CourseSlug, GameLevelDefinition } from "@/lib/types";
import { academyTrackMap } from "@/lib/academy";
import { sqlWeekOneId } from "@/lib/sql-week-one";
import { sqlWeekThreeId } from "@/lib/sql-week-three";
import { sqlWeekTwoId } from "@/lib/sql-week-two";
import { sqlWeekFourId } from "@/lib/sql-week-four";

const difficultyForLevel = (levelNumber: number, totalLevels: number) => {
  const ratio = levelNumber / totalLevels;
  if (ratio <= 0.3) return "easy" as const;
  if (ratio <= 0.6) return "medium" as const;
  if (ratio <= 0.85) return "hard" as const;
  return "expert" as const;
};

function buildLevels(courseSlug: CourseSlug, themes: string[]): GameLevelDefinition[] {
  const track = academyTrackMap[courseSlug];

  return Array.from({ length: track.arcadeLevelCount }, (_, index) => {
    const levelNumber = index + 1;
    const worldNumber = Math.floor(index / 25) + 1;
    const theme = themes[index % themes.length];
    const linkedWeekId =
      courseSlug === "sql"
        ? levelNumber <= 15
          ? sqlWeekOneId
          : levelNumber <= 30
            ? sqlWeekTwoId
            : levelNumber <= 45
              ? sqlWeekThreeId
              : levelNumber <= 60
                ? sqlWeekFourId
            : null
        : null;

    return {
      id: `${courseSlug}-level-${String(levelNumber).padStart(3, "0")}`,
      courseSlug,
      levelNumber,
      worldNumber,
      title: `${theme} Level ${levelNumber}`,
      difficulty: difficultyForLevel(levelNumber, track.arcadeLevelCount),
      theme,
      linkedWeekId,
    };
  });
}

export const sqlGameLevels = buildLevels("sql", academyTrackMap.sql.gameThemes);
export const pythonGameLevels = buildLevels("python", academyTrackMap.python.gameThemes);
export const pysparkGameLevels = buildLevels("pyspark", academyTrackMap.pyspark.gameThemes);
export const allGameLevels = [...sqlGameLevels, ...pythonGameLevels, ...pysparkGameLevels];
