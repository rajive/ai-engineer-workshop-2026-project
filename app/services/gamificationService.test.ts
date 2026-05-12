import { describe, it, expect, beforeEach, vi } from "vitest";
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
import { computeLevel, getUserGamificationStats, getRecentPointsEvents } from "./gamificationService";

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
});
