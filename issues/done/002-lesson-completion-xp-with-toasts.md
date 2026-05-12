## Parent PRD

`issues/prd.md`

## What to build

Implement `awardLessonPoints(userId, lessonId)` in `gamificationService` and wire it into the existing `markLessonComplete` server action. The action should return the XP events earned alongside its existing response, and the lesson page client should render a `sonner` toast for each event immediately after the action completes. This slice makes the points system visible to students for the first time.

See the "Point Values", "Modules", and "API Contract" sections of the PRD for exact XP values and the `xpEvents` response shape.

## Acceptance criteria

- [ ] `awardLessonPoints(userId, lessonId)` writes a `lesson_complete` ledger entry (+10 XP) and updates `userGamification.totalPoints` and `currentLevel`
- [ ] Calling `awardLessonPoints` a second time for the same lesson is a no-op (idempotent) — no duplicate ledger entry, no double XP
- [ ] The `markLessonComplete` server action returns an `xpEvents` array: each entry has `{ points, event, label }`
- [ ] The lesson page renders a `sonner` toast for each XP event, e.g. "+10 XP — Lesson complete!"
- [ ] Toasts appear immediately after the "Mark Complete" button action resolves
- [ ] Tests: lesson XP award writes correct ledger entry and updates total; second call for same lesson produces no additional ledger row and no XP change

## Blocked by

- Blocked by `issues/001-gamification-schema-and-service-foundation.md`

## User stories addressed

- User story 1 (earn XP every time a lesson is completed)
- User story 4 (XP persists across sessions)
- User story 14 (immediate toast notification on lesson page)
- User story 15 (toast tells how many XP and why)
- User story 17 (re-attempts do not award additional XP — lesson variant)
