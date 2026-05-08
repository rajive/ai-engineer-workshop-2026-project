import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDb, seedBaseData } from "~/test/setup";

let testDb: ReturnType<typeof createTestDb>;

vi.mock("~/db", () => ({
  get db() {
    return testDb;
  },
}));

import { getLevelForXp, getLevelUpAfterReward, addXp } from "./gamificationEngine";

describe("getLevelForXp", () => {
  it("returns Level 1 - Beginner at 0 XP", () => {
    const result = getLevelForXp(0);
    expect(result.level).toBe(1);
    expect(result.title).toBe("Beginner");
    expect(result.xpRequired).toBe(0);
    expect(result.xpToNextLevel).toBe(300);
  });

  it("returns Level 1 just below the threshold", () => {
    const result = getLevelForXp(299);
    expect(result.level).toBe(1);
    expect(result.xpToNextLevel).toBe(1);
  });

  it("returns Level 2 - Apprentice at 300 XP", () => {
    const result = getLevelForXp(300);
    expect(result.level).toBe(2);
    expect(result.title).toBe("Apprentice");
    expect(result.xpRequired).toBe(300);
    expect(result.xpToNextLevel).toBe(450);
  });

  it("returns Level 3 - Practitioner at 750 XP", () => {
    const result = getLevelForXp(750);
    expect(result.level).toBe(3);
    expect(result.title).toBe("Practitioner");
    expect(result.xpToNextLevel).toBe(750);
  });

  it("returns Level 4 - Expert at 1500 XP", () => {
    const result = getLevelForXp(1500);
    expect(result.level).toBe(4);
    expect(result.title).toBe("Expert");
    expect(result.xpToNextLevel).toBe(1250);
  });

  it("returns Level 5 - Scholar at 2750 XP", () => {
    const result = getLevelForXp(2750);
    expect(result.level).toBe(5);
    expect(result.title).toBe("Scholar");
    expect(result.xpToNextLevel).toBe(1750);
  });

  it("returns Level 6 - Master at 4500 XP", () => {
    const result = getLevelForXp(4500);
    expect(result.level).toBe(6);
    expect(result.title).toBe("Master");
    expect(result.xpToNextLevel).toBe(2000);
  });

  it("returns Level 7 - Master at 6500 XP (+2000 from L6)", () => {
    const result = getLevelForXp(6500);
    expect(result.level).toBe(7);
    expect(result.title).toBe("Master");
    expect(result.xpRequired).toBe(6500);
    expect(result.xpToNextLevel).toBe(2000);
  });

  it("returns Level 8 - Master at 8500 XP", () => {
    const result = getLevelForXp(8500);
    expect(result.level).toBe(8);
    expect(result.xpRequired).toBe(8500);
    expect(result.xpToNextLevel).toBe(2000);
  });

  it("shows remaining XP to next level for Master tier", () => {
    const result = getLevelForXp(7000);
    expect(result.level).toBe(7);
    expect(result.xpToNextLevel).toBe(1500);
  });

  it("handles very large XP values", () => {
    const result = getLevelForXp(100000);
    expect(result.level).toBe(53);
    expect(result.title).toBe("Master");
    expect(result.xpToNextLevel).toBe(500);
  });
});

describe("getLevelUpAfterReward", () => {
  beforeEach(() => {
    testDb = createTestDb();
  });

  it("returns levelUp when XP crosses a level threshold", () => {
    // Seed a user with 0 XP (L1)
    const { user } = seedBaseData(testDb);

    // Award 300+ XP to cross into L2
    const { result, levelUp } = getLevelUpAfterReward(user.id, () =>
      addXp(user.id, 300, "lesson_complete")
    );

    expect(result).toBeUndefined(); // addXp returns void
    expect(levelUp).not.toBeNull();
    expect(levelUp!.newLevel).toBe(2);
    expect(levelUp!.title).toBe("Apprentice");
  });

  it("returns null levelUp when staying in same level", () => {
    const { user } = seedBaseData(testDb);

    const { result, levelUp } = getLevelUpAfterReward(user.id, () =>
      addXp(user.id, 50, "lesson_complete")
    );

    expect(levelUp).toBeNull();
  });

  it("captures the function result alongside levelUp", () => {
    const { user } = seedBaseData(testDb);

    const { result, levelUp } = getLevelUpAfterReward(user.id, () => 42);

    expect(result).toBe(42);
    expect(levelUp).toBeNull();
  });

  it("detects multi-level leaps", () => {
    const { user } = seedBaseData(testDb);

    const { levelUp } = getLevelUpAfterReward(user.id, () =>
      addXp(user.id, 3000, "lesson_complete")
    );

    expect(levelUp).not.toBeNull();
    expect(levelUp!.newLevel).toBe(5);
    expect(levelUp!.title).toBe("Scholar");
  });

  it("returns levelUp for quiz pass that triggers level-up", () => {
    const { user } = seedBaseData(testDb);

    // First, get user to 299 XP (just below L2)
    addXp(user.id, 299, "lesson_complete");

    // Now award 100 (quiz pass) — should push to 399, crossing into L2
    const { levelUp } = getLevelUpAfterReward(user.id, () =>
      addXp(user.id, 100, "quiz_pass")
    );

    expect(levelUp).not.toBeNull();
    expect(levelUp!.newLevel).toBe(2);
    expect(levelUp!.title).toBe("Apprentice");
  });
});
