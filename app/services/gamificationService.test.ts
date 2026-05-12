import { describe, it, expect, beforeEach, vi } from "vitest";
import { eq, and } from "drizzle-orm";
import { createTestDb, seedBaseData } from "~/test/setup";
import * as schema from "~/db/schema";

let testDb: ReturnType<typeof createTestDb>;
let base: ReturnType<typeof seedBaseData>;

vi.mock("~/db", () => ({
  get db() {
    return testDb;
  },
}));

// Import after mock so the module picks up our test db
import {
  computeLevel,
  getUserGamificationStats,
  getRecentPointsEvents,
  awardLessonPoints,
  awardQuizPoints,
  updateStreak,
} from "./gamificationService";

function seedLesson(db: typeof testDb, courseId: number) {
  const mod = db
    .insert(schema.modules)
    .values({ courseId, title: "Module 1", position: 1 })
    .returning()
    .get();
  return db
    .insert(schema.lessons)
    .values({ moduleId: mod.id, title: "Lesson 1", position: 1 })
    .returning()
    .get();
}

function seedQuiz(db: typeof testDb, courseId: number) {
  const lesson = seedLesson(db, courseId);
  const quiz = db
    .insert(schema.quizzes)
    .values({ lessonId: lesson.id, title: "Quiz 1", passingScore: 0.7 })
    .returning()
    .get();
  return { lesson, quiz };
}

function seedQuizAttempt(
  db: typeof testDb,
  userId: number,
  quizId: number,
  score: number,
  passed: boolean,
  attemptedAt?: string
) {
  return db
    .insert(schema.quizAttempts)
    .values({
      userId,
      quizId,
      score,
      passed,
      ...(attemptedAt ? { attemptedAt } : {}),
    })
    .returning()
    .get();
}

describe("gamificationService", () => {
  beforeEach(() => {
    testDb = createTestDb();
    base = seedBaseData(testDb);
  });

  describe("computeLevel", () => {
    it("returns level 1 Beginner at 0 XP", () => {
      const result = computeLevel(0);
      expect(result.level).toBe(1);
      expect(result.name).toBe("Beginner");
    });

    it("returns level 1 Beginner just below level 2 threshold (99 XP)", () => {
      const result = computeLevel(99);
      expect(result.level).toBe(1);
      expect(result.name).toBe("Beginner");
    });

    it("returns level 2 Novice at exactly 100 XP", () => {
      const result = computeLevel(100);
      expect(result.level).toBe(2);
      expect(result.name).toBe("Novice");
    });

    it("returns level 2 Novice mid-range (175 XP)", () => {
      const result = computeLevel(175);
      expect(result.level).toBe(2);
      expect(result.name).toBe("Novice");
    });

    it("returns level 3 Apprentice at exactly 250 XP", () => {
      const result = computeLevel(250);
      expect(result.level).toBe(3);
      expect(result.name).toBe("Apprentice");
    });

    it("returns level 3 Apprentice mid-range (375 XP)", () => {
      const result = computeLevel(375);
      expect(result.level).toBe(3);
      expect(result.name).toBe("Apprentice");
    });

    it("returns level 4 Student at exactly 500 XP", () => {
      const result = computeLevel(500);
      expect(result.level).toBe(4);
      expect(result.name).toBe("Student");
    });

    it("returns level 4 Student mid-range (700 XP)", () => {
      const result = computeLevel(700);
      expect(result.level).toBe(4);
      expect(result.name).toBe("Student");
    });

    it("returns level 5 Scholar at exactly 900 XP", () => {
      const result = computeLevel(900);
      expect(result.level).toBe(5);
      expect(result.name).toBe("Scholar");
    });

    it("returns level 5 Scholar mid-range (1150 XP)", () => {
      const result = computeLevel(1150);
      expect(result.level).toBe(5);
      expect(result.name).toBe("Scholar");
    });

    it("returns level 6 Practitioner at exactly 1400 XP", () => {
      const result = computeLevel(1400);
      expect(result.level).toBe(6);
      expect(result.name).toBe("Practitioner");
    });

    it("returns level 6 Practitioner mid-range (1700 XP)", () => {
      const result = computeLevel(1700);
      expect(result.level).toBe(6);
      expect(result.name).toBe("Practitioner");
    });

    it("returns level 7 Expert at exactly 2000 XP", () => {
      const result = computeLevel(2000);
      expect(result.level).toBe(7);
      expect(result.name).toBe("Expert");
    });

    it("returns level 7 Expert mid-range (2375 XP)", () => {
      const result = computeLevel(2375);
      expect(result.level).toBe(7);
      expect(result.name).toBe("Expert");
    });

    it("returns level 8 Master at exactly 2750 XP", () => {
      const result = computeLevel(2750);
      expect(result.level).toBe(8);
      expect(result.name).toBe("Master");
    });

    it("returns level 8 Master mid-range (3250 XP)", () => {
      const result = computeLevel(3250);
      expect(result.level).toBe(8);
      expect(result.name).toBe("Master");
    });

    it("returns level 9 Grandmaster at exactly 3750 XP", () => {
      const result = computeLevel(3750);
      expect(result.level).toBe(9);
      expect(result.name).toBe("Grandmaster");
    });

    it("returns level 9 Grandmaster mid-range (4375 XP)", () => {
      const result = computeLevel(4375);
      expect(result.level).toBe(9);
      expect(result.name).toBe("Grandmaster");
    });

    it("returns level 10 Legend at exactly 5000 XP", () => {
      const result = computeLevel(5000);
      expect(result.level).toBe(10);
      expect(result.name).toBe("Legend");
    });

    it("returns level 10 Legend above max threshold (9999 XP)", () => {
      const result = computeLevel(9999);
      expect(result.level).toBe(10);
      expect(result.name).toBe("Legend");
    });
  });

  describe("getUserGamificationStats", () => {
    it("returns zeroed stats for a user with no gamification record", () => {
      const stats = getUserGamificationStats(base.user.id);

      expect(stats.totalPoints).toBe(0);
      expect(stats.currentLevel).toBe(1);
      expect(stats.levelName).toBe("Beginner");
      expect(stats.currentStreak).toBe(0);
      expect(stats.longestStreak).toBe(0);
    });

    it("returns xpToNextLevel of 100 for a brand new user at level 1", () => {
      const stats = getUserGamificationStats(base.user.id);
      expect(stats.xpToNextLevel).toBe(100);
    });

    it("calling it twice for the same user does not create duplicate rows", () => {
      getUserGamificationStats(base.user.id);
      getUserGamificationStats(base.user.id);

      const allRows = testDb.select().from(schema.userGamification).all();
      const userRows = allRows.filter((r) => r.userId === base.user.id);
      expect(userRows).toHaveLength(1);
    });

    it("returns correct stats for a user with existing XP", () => {
      testDb
        .insert(schema.userGamification)
        .values({
          userId: base.user.id,
          totalPoints: 150,
          currentLevel: 2,
          currentStreak: 2,
          longestStreak: 5,
        })
        .run();

      const stats = getUserGamificationStats(base.user.id);
      expect(stats.totalPoints).toBe(150);
      expect(stats.currentLevel).toBe(2);
      expect(stats.levelName).toBe("Novice");
      expect(stats.xpToNextLevel).toBe(100); // 250 - 150 = 100
      expect(stats.currentStreak).toBe(2);
      expect(stats.longestStreak).toBe(5);
    });

    it("returns null xpToNextLevel for a level 10 Legend", () => {
      testDb
        .insert(schema.userGamification)
        .values({
          userId: base.user.id,
          totalPoints: 5000,
          currentLevel: 10,
          currentStreak: 3,
          longestStreak: 7,
        })
        .run();

      const stats = getUserGamificationStats(base.user.id);
      expect(stats.currentLevel).toBe(10);
      expect(stats.xpToNextLevel).toBeNull();
    });
  });

  describe("getRecentPointsEvents", () => {
    it("returns empty array when user has no ledger entries", () => {
      const events = getRecentPointsEvents(base.user.id, 10);
      expect(events).toHaveLength(0);
    });

    it("returns ledger entries in reverse-chronological order", () => {
      testDb
        .insert(schema.pointsLedger)
        .values([
          {
            userId: base.user.id,
            points: 10,
            event: schema.PointsEventType.LessonComplete,
            referenceId: "1",
            earnedAt: "2024-01-01T10:00:00.000Z",
          },
          {
            userId: base.user.id,
            points: 15,
            event: schema.PointsEventType.QuizPass,
            referenceId: "2",
            earnedAt: "2024-01-02T10:00:00.000Z",
          },
          {
            userId: base.user.id,
            points: 5,
            event: schema.PointsEventType.StreakDaily,
            earnedAt: "2024-01-03T10:00:00.000Z",
          },
        ])
        .run();

      const events = getRecentPointsEvents(base.user.id, 10);
      expect(events).toHaveLength(3);
      expect(events[0].points).toBe(5); // most recent
      expect(events[1].points).toBe(15);
      expect(events[2].points).toBe(10); // oldest
    });

    it("respects the limit parameter", () => {
      testDb
        .insert(schema.pointsLedger)
        .values([
          {
            userId: base.user.id,
            points: 10,
            event: schema.PointsEventType.LessonComplete,
            earnedAt: "2024-01-01T10:00:00.000Z",
          },
          {
            userId: base.user.id,
            points: 15,
            event: schema.PointsEventType.QuizPass,
            earnedAt: "2024-01-02T10:00:00.000Z",
          },
          {
            userId: base.user.id,
            points: 5,
            event: schema.PointsEventType.StreakDaily,
            earnedAt: "2024-01-03T10:00:00.000Z",
          },
        ])
        .run();

      const events = getRecentPointsEvents(base.user.id, 2);
      expect(events).toHaveLength(2);
      expect(events[0].points).toBe(5); // most recent
      expect(events[1].points).toBe(15);
    });

    it("only returns events for the specified user", () => {
      const otherUser = testDb
        .insert(schema.users)
        .values({
          name: "Other User",
          email: "other@example.com",
          role: schema.UserRole.Student,
        })
        .returning()
        .get();

      testDb
        .insert(schema.pointsLedger)
        .values([
          {
            userId: base.user.id,
            points: 10,
            event: schema.PointsEventType.LessonComplete,
            earnedAt: "2024-01-01T10:00:00.000Z",
          },
          {
            userId: otherUser.id,
            points: 20,
            event: schema.PointsEventType.LessonComplete,
            earnedAt: "2024-01-01T10:00:00.000Z",
          },
        ])
        .run();

      const events = getRecentPointsEvents(base.user.id, 10);
      expect(events).toHaveLength(1);
      expect(events[0].points).toBe(10);
    });
  });

  describe("awardLessonPoints", () => {
    it("awards 10 XP and writes a ledger entry on first call", () => {
      const lesson = seedLesson(testDb, base.course.id);
      awardLessonPoints(base.user.id, lesson.id);
      const events = getRecentPointsEvents(base.user.id, 10);
      expect(events).toHaveLength(1);
      expect(events[0].points).toBe(10);
      expect(events[0].event).toBe(schema.PointsEventType.LessonComplete);
      expect(events[0].referenceId).toBe(String(lesson.id));
    });

    it("updates totalPoints on userGamification row", () => {
      const lesson = seedLesson(testDb, base.course.id);
      awardLessonPoints(base.user.id, lesson.id);
      const stats = getUserGamificationStats(base.user.id);
      expect(stats.totalPoints).toBe(10);
    });

    it("updates currentLevel when XP crosses a threshold", () => {
      testDb
        .insert(schema.userGamification)
        .values({ userId: base.user.id, totalPoints: 95, currentLevel: 1 })
        .run();
      const lesson = seedLesson(testDb, base.course.id);
      awardLessonPoints(base.user.id, lesson.id);
      const stats = getUserGamificationStats(base.user.id);
      expect(stats.totalPoints).toBe(105);
      expect(stats.currentLevel).toBe(2);
    });

    it("returns xpEvents with correct shape", () => {
      const lesson = seedLesson(testDb, base.course.id);
      const xpEvents = awardLessonPoints(base.user.id, lesson.id);
      expect(xpEvents).toHaveLength(1);
      expect(xpEvents[0]).toEqual({
        points: 10,
        event: "lesson_complete",
        label: "+10 XP — Lesson complete!",
      });
    });

    it("second call for same lesson is a no-op: no new ledger entry and totalPoints unchanged", () => {
      const lesson = seedLesson(testDb, base.course.id);
      awardLessonPoints(base.user.id, lesson.id);
      awardLessonPoints(base.user.id, lesson.id);
      const events = getRecentPointsEvents(base.user.id, 10);
      expect(events).toHaveLength(1);
      const stats = getUserGamificationStats(base.user.id);
      expect(stats.totalPoints).toBe(10);
    });

    it("second call for same lesson returns empty xpEvents", () => {
      const lesson = seedLesson(testDb, base.course.id);
      awardLessonPoints(base.user.id, lesson.id);
      const xpEvents = awardLessonPoints(base.user.id, lesson.id);
      expect(xpEvents).toHaveLength(0);
    });

    it("initialises streak to 1 on first lesson completion and updates lastActivityDate", () => {
      const lesson = seedLesson(testDb, base.course.id);
      awardLessonPoints(base.user.id, lesson.id);
      const stats = getUserGamificationStats(base.user.id);
      expect(stats.currentStreak).toBe(1);
      expect(stats.longestStreak).toBe(1);
    });
  });

  describe("updateStreak", () => {
    it("initialises currentStreak to 1 with no daily bonus on first activity ever", () => {
      const xpEvents = updateStreak(base.user.id, "2024-01-01");
      expect(xpEvents).toEqual([]);

      const row = testDb
        .select()
        .from(schema.userGamification)
        .where(eq(schema.userGamification.userId, base.user.id))
        .get();
      expect(row?.currentStreak).toBe(1);
      expect(row?.longestStreak).toBe(1);
      expect(row?.lastActivityDate).toBe("2024-01-01");
    });

    it("is a no-op when activityDate equals lastActivityDate", () => {
      testDb
        .insert(schema.userGamification)
        .values({
          userId: base.user.id,
          currentStreak: 3,
          longestStreak: 5,
          lastActivityDate: "2024-01-01",
        })
        .run();

      const xpEvents = updateStreak(base.user.id, "2024-01-01");
      expect(xpEvents).toEqual([]);

      const row = testDb
        .select()
        .from(schema.userGamification)
        .where(eq(schema.userGamification.userId, base.user.id))
        .get();
      expect(row?.currentStreak).toBe(3);
      expect(row?.longestStreak).toBe(5);

      const ledgerCount = testDb
        .select()
        .from(schema.pointsLedger)
        .where(eq(schema.pointsLedger.userId, base.user.id))
        .all();
      expect(ledgerCount).toHaveLength(0);
    });

    it("increments currentStreak and awards +5 XP on a consecutive day", () => {
      testDb
        .insert(schema.userGamification)
        .values({
          userId: base.user.id,
          totalPoints: 10,
          currentLevel: 1,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: "2024-01-01",
        })
        .run();

      const xpEvents = updateStreak(base.user.id, "2024-01-02");
      expect(xpEvents).toEqual([
        { points: 5, event: "streak_daily", label: "+5 XP — Daily streak!" },
      ]);

      const row = testDb
        .select()
        .from(schema.userGamification)
        .where(eq(schema.userGamification.userId, base.user.id))
        .get();
      expect(row?.currentStreak).toBe(2);
      expect(row?.longestStreak).toBe(2);
      expect(row?.totalPoints).toBe(15);
      expect(row?.lastActivityDate).toBe("2024-01-02");

      const ledger = testDb
        .select()
        .from(schema.pointsLedger)
        .where(eq(schema.pointsLedger.userId, base.user.id))
        .all();
      expect(ledger).toHaveLength(1);
      expect(ledger[0].event).toBe(schema.PointsEventType.StreakDaily);
      expect(ledger[0].points).toBe(5);
    });

    it("resets currentStreak to 1 (no daily bonus) when a day is skipped", () => {
      testDb
        .insert(schema.userGamification)
        .values({
          userId: base.user.id,
          currentStreak: 5,
          longestStreak: 5,
          lastActivityDate: "2024-01-01",
        })
        .run();

      const xpEvents = updateStreak(base.user.id, "2024-01-03");
      expect(xpEvents).toEqual([]);

      const row = testDb
        .select()
        .from(schema.userGamification)
        .where(eq(schema.userGamification.userId, base.user.id))
        .get();
      expect(row?.currentStreak).toBe(1);
      expect(row?.longestStreak).toBe(5);
      expect(row?.lastActivityDate).toBe("2024-01-03");
    });

    it("updates longestStreak whenever currentStreak exceeds it", () => {
      testDb
        .insert(schema.userGamification)
        .values({
          userId: base.user.id,
          currentStreak: 3,
          longestStreak: 3,
          lastActivityDate: "2024-01-03",
        })
        .run();

      updateStreak(base.user.id, "2024-01-04");

      const row = testDb
        .select()
        .from(schema.userGamification)
        .where(eq(schema.userGamification.userId, base.user.id))
        .get();
      expect(row?.currentStreak).toBe(4);
      expect(row?.longestStreak).toBe(4);
    });

    it("does not reduce longestStreak when currentStreak resets", () => {
      testDb
        .insert(schema.userGamification)
        .values({
          userId: base.user.id,
          currentStreak: 10,
          longestStreak: 10,
          lastActivityDate: "2024-01-10",
        })
        .run();

      updateStreak(base.user.id, "2024-01-15");

      const row = testDb
        .select()
        .from(schema.userGamification)
        .where(eq(schema.userGamification.userId, base.user.id))
        .get();
      expect(row?.currentStreak).toBe(1);
      expect(row?.longestStreak).toBe(10);
    });

    it("awards +25 milestone bonus at exactly 7 consecutive days", () => {
      testDb
        .insert(schema.userGamification)
        .values({
          userId: base.user.id,
          currentStreak: 6,
          longestStreak: 6,
          lastActivityDate: "2024-01-06",
        })
        .run();

      const xpEvents = updateStreak(base.user.id, "2024-01-07");
      expect(xpEvents).toEqual([
        { points: 5, event: "streak_daily", label: "+5 XP — Daily streak!" },
        { points: 25, event: "streak_milestone", label: "+25 XP — 7-day streak!" },
      ]);

      const row = testDb
        .select()
        .from(schema.userGamification)
        .where(eq(schema.userGamification.userId, base.user.id))
        .get();
      expect(row?.currentStreak).toBe(7);
      expect(row?.totalPoints).toBe(30);

      const milestoneRows = testDb
        .select()
        .from(schema.pointsLedger)
        .where(
          and(
            eq(schema.pointsLedger.userId, base.user.id),
            eq(schema.pointsLedger.event, schema.PointsEventType.StreakMilestone)
          )
        )
        .all();
      expect(milestoneRows).toHaveLength(1);
      expect(milestoneRows[0].points).toBe(25);
    });

    it("awards +50 milestone bonus at exactly 14 consecutive days", () => {
      testDb
        .insert(schema.userGamification)
        .values({
          userId: base.user.id,
          currentStreak: 13,
          longestStreak: 13,
          lastActivityDate: "2024-01-13",
        })
        .run();

      const xpEvents = updateStreak(base.user.id, "2024-01-14");
      expect(xpEvents).toContainEqual({
        points: 50,
        event: "streak_milestone",
        label: "+50 XP — 14-day streak!",
      });

      const row = testDb
        .select()
        .from(schema.userGamification)
        .where(eq(schema.userGamification.userId, base.user.id))
        .get();
      expect(row?.currentStreak).toBe(14);
      expect(row?.totalPoints).toBe(55);
    });

    it("awards +100 milestone bonus at exactly 30 consecutive days", () => {
      testDb
        .insert(schema.userGamification)
        .values({
          userId: base.user.id,
          currentStreak: 29,
          longestStreak: 29,
          lastActivityDate: "2024-01-29",
        })
        .run();

      const xpEvents = updateStreak(base.user.id, "2024-01-30");
      expect(xpEvents).toContainEqual({
        points: 100,
        event: "streak_milestone",
        label: "+100 XP — 30-day streak!",
      });

      const row = testDb
        .select()
        .from(schema.userGamification)
        .where(eq(schema.userGamification.userId, base.user.id))
        .get();
      expect(row?.currentStreak).toBe(30);
      expect(row?.totalPoints).toBe(105);
    });

    it("does not re-award the 7-day milestone on day 8", () => {
      testDb
        .insert(schema.userGamification)
        .values({
          userId: base.user.id,
          currentStreak: 7,
          longestStreak: 7,
          lastActivityDate: "2024-01-07",
        })
        .run();

      const xpEvents = updateStreak(base.user.id, "2024-01-08");
      expect(xpEvents).toEqual([
        { points: 5, event: "streak_daily", label: "+5 XP — Daily streak!" },
      ]);

      const milestoneRows = testDb
        .select()
        .from(schema.pointsLedger)
        .where(
          and(
            eq(schema.pointsLedger.userId, base.user.id),
            eq(schema.pointsLedger.event, schema.PointsEventType.StreakMilestone)
          )
        )
        .all();
      expect(milestoneRows).toHaveLength(0);
    });

    it("updates currentLevel when streak bonus pushes XP across a threshold", () => {
      testDb
        .insert(schema.userGamification)
        .values({
          userId: base.user.id,
          totalPoints: 95,
          currentLevel: 1,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: "2024-01-01",
        })
        .run();

      updateStreak(base.user.id, "2024-01-02");

      const stats = getUserGamificationStats(base.user.id);
      expect(stats.totalPoints).toBe(100);
      expect(stats.currentLevel).toBe(2);
    });
  });

  describe("awardQuizPoints", () => {
    it("awards +15 XP and writes a quiz_pass ledger entry on first passing attempt", () => {
      const { quiz } = seedQuiz(testDb, base.course.id);
      const attempt = seedQuizAttempt(testDb, base.user.id, quiz.id, 0.75, true);

      const xpEvents = awardQuizPoints(base.user.id, attempt.id);

      expect(xpEvents).toContainEqual({
        points: 15,
        event: "quiz_pass",
        label: "+15 XP — Quiz passed!",
      });

      const ledger = testDb
        .select()
        .from(schema.pointsLedger)
        .where(
          and(
            eq(schema.pointsLedger.userId, base.user.id),
            eq(schema.pointsLedger.event, schema.PointsEventType.QuizPass)
          )
        )
        .all();
      expect(ledger).toHaveLength(1);
      expect(ledger[0].points).toBe(15);
      expect(ledger[0].referenceId).toBe(String(attempt.id));
    });

    it("awards +5 score bonus on a grade A pass (>=90%)", () => {
      const { quiz } = seedQuiz(testDb, base.course.id);
      const attempt = seedQuizAttempt(testDb, base.user.id, quiz.id, 0.95, true);

      const xpEvents = awardQuizPoints(base.user.id, attempt.id);

      expect(xpEvents).toEqual([
        { points: 15, event: "quiz_pass", label: "+15 XP — Quiz passed!" },
        {
          points: 5,
          event: "quiz_score_bonus",
          label: "+5 XP — Grade A bonus!",
        },
      ]);

      const bonusRows = testDb
        .select()
        .from(schema.pointsLedger)
        .where(
          and(
            eq(schema.pointsLedger.userId, base.user.id),
            eq(schema.pointsLedger.event, schema.PointsEventType.QuizScoreBonus)
          )
        )
        .all();
      expect(bonusRows).toHaveLength(1);
      expect(bonusRows[0].points).toBe(5);
      expect(bonusRows[0].referenceId).toBe(String(attempt.id));

      const stats = getUserGamificationStats(base.user.id);
      expect(stats.totalPoints).toBe(20);
    });

    it("awards +3 score bonus on a grade B pass (80%)", () => {
      const { quiz } = seedQuiz(testDb, base.course.id);
      const attempt = seedQuizAttempt(testDb, base.user.id, quiz.id, 0.8, true);

      const xpEvents = awardQuizPoints(base.user.id, attempt.id);

      expect(xpEvents).toEqual([
        { points: 15, event: "quiz_pass", label: "+15 XP — Quiz passed!" },
        {
          points: 3,
          event: "quiz_score_bonus",
          label: "+3 XP — Grade B bonus!",
        },
      ]);

      const stats = getUserGamificationStats(base.user.id);
      expect(stats.totalPoints).toBe(18);
    });

    it("awards only base XP on a grade C pass (just above 70%)", () => {
      const { quiz } = seedQuiz(testDb, base.course.id);
      const attempt = seedQuizAttempt(testDb, base.user.id, quiz.id, 0.75, true);

      const xpEvents = awardQuizPoints(base.user.id, attempt.id);
      expect(xpEvents).toHaveLength(1);
      expect(xpEvents[0].event).toBe("quiz_pass");

      const bonusRows = testDb
        .select()
        .from(schema.pointsLedger)
        .where(
          and(
            eq(schema.pointsLedger.userId, base.user.id),
            eq(schema.pointsLedger.event, schema.PointsEventType.QuizScoreBonus)
          )
        )
        .all();
      expect(bonusRows).toHaveLength(0);

      const stats = getUserGamificationStats(base.user.id);
      expect(stats.totalPoints).toBe(15);
    });

    it("awards nothing on a failing attempt", () => {
      const { quiz } = seedQuiz(testDb, base.course.id);
      const attempt = seedQuizAttempt(testDb, base.user.id, quiz.id, 0.5, false);

      const xpEvents = awardQuizPoints(base.user.id, attempt.id);
      expect(xpEvents).toEqual([]);

      const ledger = testDb
        .select()
        .from(schema.pointsLedger)
        .where(eq(schema.pointsLedger.userId, base.user.id))
        .all();
      expect(ledger).toHaveLength(0);

      const stats = getUserGamificationStats(base.user.id);
      expect(stats.totalPoints).toBe(0);
    });

    it("is a no-op when a prior passing attempt for this quiz already exists", () => {
      const { quiz } = seedQuiz(testDb, base.course.id);
      const firstAttempt = seedQuizAttempt(
        testDb,
        base.user.id,
        quiz.id,
        0.75,
        true,
        "2024-01-01T10:00:00.000Z"
      );
      awardQuizPoints(base.user.id, firstAttempt.id);

      const secondAttempt = seedQuizAttempt(
        testDb,
        base.user.id,
        quiz.id,
        0.95,
        true,
        "2024-01-02T10:00:00.000Z"
      );
      const xpEvents = awardQuizPoints(base.user.id, secondAttempt.id);
      expect(xpEvents).toEqual([]);

      const passRows = testDb
        .select()
        .from(schema.pointsLedger)
        .where(
          and(
            eq(schema.pointsLedger.userId, base.user.id),
            eq(schema.pointsLedger.event, schema.PointsEventType.QuizPass)
          )
        )
        .all();
      expect(passRows).toHaveLength(1);
      expect(passRows[0].referenceId).toBe(String(firstAttempt.id));

      const stats = getUserGamificationStats(base.user.id);
      expect(stats.totalPoints).toBe(15);
    });

    it("is a no-op when called twice for the same attempt", () => {
      const { quiz } = seedQuiz(testDb, base.course.id);
      const attempt = seedQuizAttempt(testDb, base.user.id, quiz.id, 0.95, true);

      awardQuizPoints(base.user.id, attempt.id);
      const xpEvents = awardQuizPoints(base.user.id, attempt.id);
      expect(xpEvents).toEqual([]);

      const ledger = testDb
        .select()
        .from(schema.pointsLedger)
        .where(eq(schema.pointsLedger.userId, base.user.id))
        .all();
      expect(ledger).toHaveLength(2); // quiz_pass + quiz_score_bonus

      const stats = getUserGamificationStats(base.user.id);
      expect(stats.totalPoints).toBe(20);
    });

    it("does not award if the attempt belongs to a different user", () => {
      const otherUser = testDb
        .insert(schema.users)
        .values({
          name: "Other",
          email: "other@example.com",
          role: schema.UserRole.Student,
        })
        .returning()
        .get();
      const { quiz } = seedQuiz(testDb, base.course.id);
      const attempt = seedQuizAttempt(testDb, otherUser.id, quiz.id, 0.95, true);

      const xpEvents = awardQuizPoints(base.user.id, attempt.id);
      expect(xpEvents).toEqual([]);

      const ledger = testDb
        .select()
        .from(schema.pointsLedger)
        .where(eq(schema.pointsLedger.userId, base.user.id))
        .all();
      expect(ledger).toHaveLength(0);
    });

    it("updates currentLevel when XP crosses a threshold", () => {
      testDb
        .insert(schema.userGamification)
        .values({ userId: base.user.id, totalPoints: 90, currentLevel: 1 })
        .run();
      const { quiz } = seedQuiz(testDb, base.course.id);
      const attempt = seedQuizAttempt(testDb, base.user.id, quiz.id, 0.95, true);

      awardQuizPoints(base.user.id, attempt.id);

      const stats = getUserGamificationStats(base.user.id);
      expect(stats.totalPoints).toBe(110); // 90 + 15 + 5
      expect(stats.currentLevel).toBe(2);
    });
  });

  describe("awardLessonPoints + updateStreak integration", () => {
    it("returns lesson + streak daily bonus xpEvents on a consecutive day", () => {
      const lesson1 = seedLesson(testDb, base.course.id);
      // Seed yesterday's state
      testDb
        .insert(schema.userGamification)
        .values({
          userId: base.user.id,
          totalPoints: 10,
          currentLevel: 1,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: getYesterdayUTC(),
        })
        .run();

      const xpEvents = awardLessonPoints(base.user.id, lesson1.id);
      expect(xpEvents).toContainEqual({
        points: 10,
        event: "lesson_complete",
        label: "+10 XP — Lesson complete!",
      });
      expect(xpEvents).toContainEqual({
        points: 5,
        event: "streak_daily",
        label: "+5 XP — Daily streak!",
      });
    });
  });
});

function getYesterdayUTC(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
