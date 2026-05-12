import { eq, desc, and } from "drizzle-orm";
import { db } from "~/db";
import { userGamification, pointsLedger, PointsEventType } from "~/db/schema";

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

type XpEvent = { points: number; event: string; label: string };

const STREAK_MILESTONES: Record<number, { points: number; label: string }> = {
  7: { points: 25, label: "+25 XP — 7-day streak!" },
  14: { points: 50, label: "+50 XP — 14-day streak!" },
  30: { points: 100, label: "+100 XP — 30-day streak!" },
};

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetweenUTC(a: string, b: string): number {
  const aMs = Date.UTC(
    Number(a.slice(0, 4)),
    Number(a.slice(5, 7)) - 1,
    Number(a.slice(8, 10))
  );
  const bMs = Date.UTC(
    Number(b.slice(0, 4)),
    Number(b.slice(5, 7)) - 1,
    Number(b.slice(8, 10))
  );
  return Math.round((bMs - aMs) / 86400000);
}

function ensureGamificationRow(userId: number) {
  let row = db
    .select()
    .from(userGamification)
    .where(eq(userGamification.userId, userId))
    .get();
  if (!row) {
    row = db.insert(userGamification).values({ userId }).returning().get();
  }
  return row;
}

export function updateStreak(userId: number, activityDate: string): XpEvent[] {
  const row = ensureGamificationRow(userId);

  if (row.lastActivityDate === activityDate) {
    return [];
  }

  const xpEvents: XpEvent[] = [];
  let newStreak: number;
  let bonusPoints = 0;

  if (row.lastActivityDate === null) {
    newStreak = 1;
  } else {
    const diff = daysBetweenUTC(row.lastActivityDate, activityDate);
    if (diff === 1) {
      newStreak = row.currentStreak + 1;
      bonusPoints += 5;
      xpEvents.push({
        points: 5,
        event: "streak_daily",
        label: "+5 XP — Daily streak!",
      });
      const milestone = STREAK_MILESTONES[newStreak];
      if (milestone) {
        bonusPoints += milestone.points;
        xpEvents.push({
          points: milestone.points,
          event: "streak_milestone",
          label: milestone.label,
        });
      }
    } else {
      newStreak = 1;
    }
  }

  const newLongest = Math.max(row.longestStreak, newStreak);
  const newTotal = row.totalPoints + bonusPoints;
  const newLevel = computeLevel(newTotal).level;

  if (bonusPoints > 0) {
    if (xpEvents.some((e) => e.event === "streak_daily")) {
      db.insert(pointsLedger)
        .values({ userId, points: 5, event: PointsEventType.StreakDaily })
        .run();
    }
    const milestone = STREAK_MILESTONES[newStreak];
    if (milestone && xpEvents.some((e) => e.event === "streak_milestone")) {
      db.insert(pointsLedger)
        .values({
          userId,
          points: milestone.points,
          event: PointsEventType.StreakMilestone,
          referenceId: String(newStreak),
        })
        .run();
    }
  }

  db.update(userGamification)
    .set({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActivityDate: activityDate,
      totalPoints: newTotal,
      currentLevel: newLevel,
    })
    .where(eq(userGamification.userId, userId))
    .run();

  return xpEvents;
}

export function awardLessonPoints(userId: number, lessonId: number) {
  const existing = db
    .select()
    .from(pointsLedger)
    .where(
      and(
        eq(pointsLedger.userId, userId),
        eq(pointsLedger.event, PointsEventType.LessonComplete),
        eq(pointsLedger.referenceId, String(lessonId))
      )
    )
    .get();

  if (existing) return [];

  const row = ensureGamificationRow(userId);

  const newTotal = row.totalPoints + 10;
  const newLevel = computeLevel(newTotal).level;

  db.insert(pointsLedger)
    .values({
      userId,
      points: 10,
      event: PointsEventType.LessonComplete,
      referenceId: String(lessonId),
    })
    .run();

  db.update(userGamification)
    .set({ totalPoints: newTotal, currentLevel: newLevel })
    .where(eq(userGamification.userId, userId))
    .run();

  const xpEvents: XpEvent[] = [
    { points: 10, event: "lesson_complete", label: "+10 XP — Lesson complete!" },
  ];

  const streakEvents = updateStreak(userId, todayUTC());
  xpEvents.push(...streakEvents);

  return xpEvents;
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
