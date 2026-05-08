## Parent PRD

`issues/prd.md`

## What to build

Implement the dashboard visibility slice from the PRD: the student dashboard should present a richer gamification summary including total XP, current level, progress to next level, streak state, and recent gamification activity. This slice should make the dashboard a clear home base for the private gamification system.

The behavior should reuse the agreed gamification profile/query model rather than introducing dashboard-specific reward logic.

## Acceptance criteria

- [ ] The dashboard shows a gamification summary with total XP, level, next-level progress, and current streak.
- [ ] The dashboard shows recent gamification activity derived from the student's XP history.
- [ ] Tests verify the dashboard-facing query contract exposes the read-side data needed for summary and activity views.

## Blocked by

- Blocked by `issues/002-award-lesson-xp-on-completion.md`
- Blocked by `issues/003-award-quiz-pass-xp-and-first-try-bonus.md`
- Blocked by `issues/004-track-daily-lesson-streaks-in-the-sidebar.md`

## User stories addressed

- User story 7
- User story 14
- User story 25
- User story 30
- User story 40
- User story 41
- User story 50
- User story 54
