import { eq, desc } from "drizzle-orm";
import { db } from "~/db";
import { users, xpTransactions } from "~/db/schema";
import { getLevelForXp, type LevelInfo } from "./gamificationEngine";

export interface XpTransactionEvent {
  id: number;
  amount: number;
  reason: string;
  referenceType: string | null;
  referenceId: number | null;
  createdAt: string;
}

export interface GamificationProfile {
  xp: number;
  level: number;
  levelTitle: string;
  xpRequired: number;
  xpToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  activity: XpTransactionEvent[];
}

export function getGamificationProfile(userId: number): GamificationProfile {
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) throw new Error(`User ${userId} not found`);

  const levelInfo: LevelInfo = getLevelForXp(user.xp);
  const activity = getRecentActivity(userId, 10);

  return {
    xp: user.xp,
    level: levelInfo.level,
    levelTitle: levelInfo.title,
    xpRequired: levelInfo.xpRequired,
    xpToNextLevel: levelInfo.xpToNextLevel,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    activity,
  };
}

export function getRecentActivity(
  userId: number,
  limit: number
): XpTransactionEvent[] {
  return db
    .select({
      id: xpTransactions.id,
      amount: xpTransactions.amount,
      reason: xpTransactions.reason,
      referenceType: xpTransactions.referenceType,
      referenceId: xpTransactions.referenceId,
      createdAt: xpTransactions.createdAt,
    })
    .from(xpTransactions)
    .where(eq(xpTransactions.userId, userId))
    .orderBy(desc(xpTransactions.createdAt))
    .limit(limit)
    .all();
}
