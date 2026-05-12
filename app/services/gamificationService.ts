import { eq, desc } from "drizzle-orm";
import { db } from "~/db";
import { userGamification, pointsLedger } from "~/db/schema";

// ─── Level Thresholds ───

const LEVELS = [
  { level: 1, name: "Beginner", xp: 0 },
  { level: 2, name: "Novice", xp: 100 },
  { level: 3, name: "Apprentice", xp: 250 },
  { level: 4, name: "Student", xp: 500 },
  { level: 5, name: "Scholar", xp: 900 },
  { level: 6, name: "Practitioner", xp: 1400 },
  { level: 7, name: "Expert", xp: 2000 },
  { level: 8, name: "Master", xp: 2750 },
  { level: 9, name: "Grandmaster", xp: 3750 },
  { level: 10, name: "Legend", xp: 5000 },
] as const;

// ─── Pure Functions ───

export function computeLevel(totalPoints: number): { level: number; name: string; xpThreshold: number } {
  let current: (typeof LEVELS)[number] = LEVELS[0];
  for (const tier of LEVELS) {
    if (totalPoints >= tier.xp) {
      current = tier;
    } else {
      break;
    }
  }
  return { level: current.level, name: current.name, xpThreshold: current.xp };
}

// ─── Read Service ───

export function getUserGamificationStats(userId: number) {
  let row = db
    .select()
    .from(userGamification)
    .where(eq(userGamification.userId, userId))
    .get();

  if (!row) {
    row = db
      .insert(userGamification)
      .values({ userId })
      .returning()
      .get();
  }

  const { level, name } = computeLevel(row.totalPoints);
  const nextTier = LEVELS.find((t) => t.level === level + 1);
  const xpToNextLevel = nextTier ? nextTier.xp - row.totalPoints : null;

  return {
    totalPoints: row.totalPoints,
    currentLevel: level,
    levelName: name,
    xpToNextLevel,
    currentStreak: row.currentStreak,
    longestStreak: row.longestStreak,
  };
}

export function getRecentPointsEvents(userId: number, limit: number) {
  return db
    .select()
    .from(pointsLedger)
    .where(eq(pointsLedger.userId, userId))
    .orderBy(desc(pointsLedger.earnedAt))
    .limit(limit)
    .all();
}
