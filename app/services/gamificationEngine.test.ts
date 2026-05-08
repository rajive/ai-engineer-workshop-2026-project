import { describe, it, expect } from "vitest";
import { getLevelForXp } from "./gamificationEngine";

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
