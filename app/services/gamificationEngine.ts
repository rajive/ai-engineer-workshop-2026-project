import { eq, and } from "drizzle-orm";
import { db } from "~/db";
import { users, xpTransactions, type XpTransactionReason } from "~/db/schema";

export interface LevelInfo {
  level: number;
  title: string;
  xpRequired: number;
  xpToNextLevel: number;
}

const LEVEL_THRESHOLDS = [
  { level: 1, xpRequired: 0, title: "Beginner" },
  { level: 2, xpRequired: 300, title: "Apprentice" },
  { level: 3, xpRequired: 750, title: "Practitioner" },
  { level: 4, xpRequired: 1500, title: "Expert" },
  { level: 5, xpRequired: 2750, title: "Scholar" },
  { level: 6, xpRequired: 4500, title: "Master" },
] as const;

const POST_MASTER_XP_STEP = 2000;

export function getLevelForXp(xp: number): LevelInfo {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xpRequired) {
      const current = LEVEL_THRESHOLDS[i];
      const next = LEVEL_THRESHOLDS[i + 1];

      if (next) {
        return {
          level: current.level,
          title: current.title,
          xpRequired: current.xpRequired,
          xpToNextLevel: next.xpRequired - xp,
        };
      }

      const levelsAbove = Math.floor((xp - current.xpRequired) / POST_MASTER_XP_STEP);
      const level = current.level + levelsAbove;
      const thisLevelXp = current.xpRequired + levelsAbove * POST_MASTER_XP_STEP;
      const nextLevelXp = thisLevelXp + POST_MASTER_XP_STEP;

      return {
        level,
        title: current.title,
        xpRequired: thisLevelXp,
        xpToNextLevel: Math.max(0, nextLevelXp - xp),
      };
    }
  }

  return {
    level: LEVEL_THRESHOLDS[0].level,
    title: LEVEL_THRESHOLDS[0].title,
    xpRequired: LEVEL_THRESHOLDS[0].xpRequired,
    xpToNextLevel: LEVEL_THRESHOLDS[1].xpRequired,
  };
}

export function addXp(
  userId: number,
  amount: number,
  reason: XpTransactionReason,
  referenceType?: string,
  referenceId?: number
): void {
  db.insert(xpTransactions)
    .values({
      userId,
      amount,
      reason,
      referenceType: referenceType ?? null,
      referenceId: referenceId ?? null,
    })
    .run();

  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) throw new Error(`User ${userId} not found`);

  const newXp = user.xp + amount;
  const newLevel = getLevelForXp(newXp).level;

  db.update(users)
    .set({ xp: newXp, level: newLevel })
    .where(eq(users.id, userId))
    .run();
}

export function awardLessonCompletionXp(
  userId: number,
  lessonId: number
): void {
  const existing = db
    .select()
    .from(xpTransactions)
    .where(
      and(
        eq(xpTransactions.userId, userId),
        eq(xpTransactions.reason, "lesson_complete"),
        eq(xpTransactions.referenceType, "lesson"),
        eq(xpTransactions.referenceId, lessonId)
      )
    )
    .get();

  if (existing) return;

  addXp(userId, 50, "lesson_complete", "lesson", lessonId);
}
