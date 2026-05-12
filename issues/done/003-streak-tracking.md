## Status

Done — 2026-05-11. `updateStreak(userId, activityDate)` added to `gamificationService`; called from `awardLessonPoints` with `todayUTC()`. Streak xpEvents flow through the existing lesson-page toast effect. 13 new tests cover first activity, same-day no-op, consecutive day +5, skipped-day reset, longestStreak update + non-reduction, milestones at 7/14/30, milestone-not-re-awarded on day 8, level-up via streak bonus, and the integration with `awardLessonPoints`.

## Parent PRD

`issues/prd.md`

## What to build

Implement `updateStreak(userId, activityDate)` in `gamificationService` and call it from inside `awardLessonPoints` after lesson XP is recorded. The function handles four cases: first-ever activity (initialise streak to 1), same-day activity (no-op), consecutive-day activity (increment streak, award +5 daily bonus, check milestones), and a skipped day (reset streak to 1). Milestone bonuses of +25/+50/+100 XP are awarded at exactly 7, 14, and 30 consecutive days. Streak milestone bonuses are also returned as `xpEvents` so the lesson page toasts show them.

All date comparisons use UTC calendar dates. See the "Streak logic" and "Point Values" sections of the PRD for the full rules.

## Acceptance criteria

- [ ] `updateStreak` increments `currentStreak` and awards +5 XP when `activityDate` is exactly one day after `lastActivityDate`
- [ ] `updateStreak` is a no-op when `activityDate` equals `lastActivityDate` (already active today)
- [ ] `updateStreak` resets `currentStreak` to 1 (no daily bonus) when `activityDate` is more than one day after `lastActivityDate`
- [ ] `updateStreak` initialises streak to 1 with no daily bonus when the user has no prior activity
- [ ] `longestStreak` is updated whenever `currentStreak` exceeds it
- [ ] Milestone bonuses (+25/+50/+100) are awarded as separate `streak_milestone` ledger entries at exactly 7, 14, and 30 consecutive days
- [ ] Milestone bonuses are not re-awarded if the streak is extended further (e.g. day 8 does not re-award the 7-day bonus)
- [ ] Streak XP events are included in the `xpEvents` array returned by `markLessonComplete`, and toasts fire for them on the lesson page
- [ ] Tests cover: first activity, consecutive day, same day, skipped day, milestone at 7/14/30, milestone not re-awarded, longestStreak update

## Blocked by

- Blocked by `issues/002-lesson-completion-xp-with-toasts.md`

## User stories addressed

- User story 8 (see current streak on dashboard)
- User story 9 (streak increases on consecutive daily lesson completion)
- User story 10 (streak resets if a day is missed)
- User story 11 (longest streak on record)
- User story 12 (daily streak bonus XP)
- User story 13 (milestone bonus XP at 7/14/30 days)
