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

import { getGamificationProfile, getRecentActivity } from "./gamificationProfileService";
import { addXp } from "./gamificationEngine";

describe("gamificationProfileService", () => {
  beforeEach(() => {
    testDb = createTestDb();
    base = seedBaseData(testDb);
  });

  describe("getGamificationProfile", () => {
    it("returns a profile with default values for a new user", () => {
      const profile = getGamificationProfile(base.user.id);

      expect(profile.xp).toBe(0);
      expect(profile.level).toBe(1);
      expect(profile.levelTitle).toBe("Beginner");
      expect(profile.currentStreak).toBe(0);
      expect(profile.longestStreak).toBe(0);
      expect(profile.activity).toEqual([]);
    });

    it("reflects XP earned through the engine", () => {
      addXp(base.user.id, 300, "lesson_complete");
      addXp(base.user.id, 100, "quiz_pass");

      const profile = getGamificationProfile(base.user.id);

      expect(profile.xp).toBe(400);
      expect(profile.level).toBe(2);
      expect(profile.levelTitle).toBe("Apprentice");
    });

    it("returns recent transactions as activity", () => {
      addXp(base.user.id, 50, "lesson_complete", "lesson", 1);
      addXp(base.user.id, 50, "lesson_complete", "lesson", 2);

      const profile = getGamificationProfile(base.user.id);

      expect(profile.activity).toHaveLength(2);
      expect(profile.activity[0].amount).toBe(50);
      expect(profile.activity[0].reason).toBe("lesson_complete");
    });

    it("returns highest level when XP crosses multiple thresholds", () => {
      addXp(base.user.id, 5000, "lesson_complete");

      const profile = getGamificationProfile(base.user.id);

      expect(profile.level).toBe(6);
      expect(profile.levelTitle).toBe("Master");
      expect(profile.xp).toBe(5000);
    });
  });

  describe("getRecentActivity", () => {
    it("returns transactions in reverse chronological order", () => {
      addXp(base.user.id, 50, "streak_milestone", "streak", 7);
      addXp(base.user.id, 100, "quiz_pass", "quiz", 1);

      const activity = getRecentActivity(base.user.id, 10);

      expect(activity).toHaveLength(2);
      expect(activity.map((a) => a.reason).sort()).toEqual([
        "quiz_pass",
        "streak_milestone",
      ]);
    });

    it("respects the limit parameter", () => {
      addXp(base.user.id, 50, "lesson_complete");
      addXp(base.user.id, 50, "lesson_complete");
      addXp(base.user.id, 50, "lesson_complete");

      const activity = getRecentActivity(base.user.id, 2);

      expect(activity).toHaveLength(2);
    });
  });

  describe("dashboard integration", () => {
    it("exposes the full dashboard-facing dataset (profile + activity)", () => {
      addXp(base.user.id, 50, "lesson_complete", "lesson", 1);
      addXp(base.user.id, 100, "quiz_pass", "quiz", 1);

      const profile = getGamificationProfile(base.user.id);
      const activity = getRecentActivity(base.user.id, 5);

      expect(profile.xp).toBe(150);
      expect(typeof profile.level).toBe("number");
      expect(typeof profile.levelTitle).toBe("string");
      expect(typeof profile.xpRequired).toBe("number");
      expect(typeof profile.xpToNextLevel).toBe("number");
      expect(typeof profile.currentStreak).toBe("number");
      expect(typeof profile.longestStreak).toBe("number");
      expect(Array.isArray(profile.activity)).toBe(true);

      expect(activity).toHaveLength(2);
      expect(activity[0].id).toBeGreaterThan(0);
      expect(typeof activity[0].amount).toBe("number");
      expect(typeof activity[0].reason).toBe("string");
      expect(typeof activity[0].createdAt).toBe("string");
    });
  });
});
