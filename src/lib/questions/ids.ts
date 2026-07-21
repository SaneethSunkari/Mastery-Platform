import { CourseSlug } from "@/lib/types";

export type MasteryQuestionTrack = CourseSlug;
export type PracticeQuestionTrack = CourseSlug | "arcade";

export type ParsedMasteryQuestionId = {
  kind: "mastery";
  track: MasteryQuestionTrack;
  ordinal: number;
  weekNumber: number;
  positionWithinWeek: number;
};

export type ParsedArcadeQuestionId = {
  kind: "arcade";
  track: "arcade";
  ordinal: number;
  levelNumber: number;
};

export type ParsedQuestionId = ParsedMasteryQuestionId | ParsedArcadeQuestionId;

const QUESTIONS_PER_WEEK = 125;
const MASTER_TRACK_MAX_ORDINAL = 3000;
const ARCADE_MAX_ORDINAL = 3000;

function padOrdinal(value: number) {
  return String(value).padStart(4, "0");
}

function validateMasteryWeekAndPosition(weekNumber: number, positionWithinWeek: number) {
  if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 24) {
    throw new Error(`Week number must be between 1 and 24. Received ${weekNumber}.`);
  }

  if (
    !Number.isInteger(positionWithinWeek) ||
    positionWithinWeek < 1 ||
    positionWithinWeek > QUESTIONS_PER_WEEK
  ) {
    throw new Error(
      `Position within week must be between 1 and ${QUESTIONS_PER_WEEK}. Received ${positionWithinWeek}.`,
    );
  }
}

function validateArcadeLevel(levelNumber: number) {
  if (!Number.isInteger(levelNumber) || levelNumber < 1 || levelNumber > ARCADE_MAX_ORDINAL) {
    throw new Error(`Arcade level number must be between 1 and ${ARCADE_MAX_ORDINAL}. Received ${levelNumber}.`);
  }
}

export function getMasteryOrdinal(weekNumber: number, positionWithinWeek: number) {
  validateMasteryWeekAndPosition(weekNumber, positionWithinWeek);
  return (weekNumber - 1) * QUESTIONS_PER_WEEK + positionWithinWeek;
}

export function getMasteryQuestionId(
  track: MasteryQuestionTrack,
  weekNumber: number,
  positionWithinWeek: number,
) {
  const ordinal = getMasteryOrdinal(weekNumber, positionWithinWeek);
  return `${track}-q-${padOrdinal(ordinal)}`;
}

export function getArcadeQuestionId(levelNumber: number) {
  validateArcadeLevel(levelNumber);
  return `arcade-q-${padOrdinal(levelNumber)}`;
}

export function parseQuestionId(id: string): ParsedQuestionId | null {
  const masteryMatch = id.match(/^(sql|python|pyspark)-q-(\d{4})$/u);
  if (masteryMatch) {
    const track = masteryMatch[1] as MasteryQuestionTrack;
    const ordinal = Number(masteryMatch[2]);
    if (ordinal < 1 || ordinal > MASTER_TRACK_MAX_ORDINAL) {
      return null;
    }

    const weekNumber = Math.floor((ordinal - 1) / QUESTIONS_PER_WEEK) + 1;
    const positionWithinWeek = ((ordinal - 1) % QUESTIONS_PER_WEEK) + 1;

    return {
      kind: "mastery",
      track,
      ordinal,
      weekNumber,
      positionWithinWeek,
    };
  }

  const arcadeMatch = id.match(/^arcade-q-(\d{4})$/u);
  if (arcadeMatch) {
    const levelNumber = Number(arcadeMatch[1]);
    if (levelNumber < 1 || levelNumber > ARCADE_MAX_ORDINAL) {
      return null;
    }

    return {
      kind: "arcade",
      track: "arcade",
      ordinal: levelNumber,
      levelNumber,
    };
  }

  return null;
}

export function getWeekFromQuestionId(id: string) {
  const parsed = parseQuestionId(id);
  return parsed?.kind === "mastery" ? parsed.weekNumber : null;
}

export function getPositionWithinWeek(id: string) {
  const parsed = parseQuestionId(id);
  return parsed?.kind === "mastery" ? parsed.positionWithinWeek : null;
}
