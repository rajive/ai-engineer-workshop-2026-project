## Parent PRD

`issues/prd.md`

## What to build

Add the two new database tables (`userGamification` and `pointsLedger`) to the Drizzle schema and generate the corresponding migration. Then implement the read-side of `gamificationService`: the pure `computeLevel()` function, `getUserGamificationStats()`, and `getRecentPointsEvents()`. No XP is awarded yet — this slice establishes the foundation that all subsequent slices build on. Demoable by calling `getUserGamificationStats` on any existing user and receiving a valid zeroed-out response (level 1 / Beginner, 0 XP, 0 streak).

See the "Schema Changes", "Point Values", "Level Thresholds", and "Modules" sections of the PRD for the full data model and level tier table.

## Acceptance criteria

- [ ] `userGamification` table exists in schema with fields: `userId` (unique FK), `totalPoints`, `currentLevel`, `currentStreak`, `longestStreak`, `lastActivityDate`
- [ ] `pointsLedger` table exists in schema with fields: `id`, `userId`, `points`, `event`, `referenceId`, `earnedAt`; `event` is constrained to the six allowed enum values
- [ ] Drizzle migration runs cleanly against the existing database
- [ ] `computeLevel(totalPoints)` returns the correct level number and name for any XP value, including boundary values (e.g. exactly 100, 250, 500 XP)
- [ ] `getUserGamificationStats(userId)` returns `totalPoints`, `currentLevel`, `levelName`, `xpToNextLevel`, `currentStreak`, `longestStreak` — initialising a row with zeroed values if none exists yet
- [ ] `getRecentPointsEvents(userId, limit)` returns ledger rows in reverse-chronological order
- [ ] Tests for `computeLevel()` cover all 10 level thresholds and at least one mid-range value per tier
- [ ] No other module writes directly to `userGamification` or `pointsLedger`

## Blocked by

None — can start immediately.

## User stories addressed

- User story 4 (XP persists across sessions)
- User story 5 (see current XP total)
- User story 6 (see named level)
- User story 7 (progress bar to next level)
- User story 19 (level name shown prominently)
- User story 20 (recent XP event summary)
