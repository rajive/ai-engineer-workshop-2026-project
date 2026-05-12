## Parent PRD

`issues/prd.md`

## What to build

Extend `awardLessonPoints` to detect when the lesson just completed is the last incomplete lesson in the student's enrollment, and if so, award a one-time +100 XP `course_complete` bonus. The check happens after lesson XP is recorded and uses the existing `progressService` to determine whether all lessons in the course are now complete. The bonus is included in the `xpEvents` array so it fires as a toast on the lesson page alongside the regular lesson XP toast.

See the "Point Values" and "Modules" sections of the PRD.

## Acceptance criteria

- [ ] When a student completes the final lesson in a course, a `course_complete` ledger entry (+100 XP) is written in the same call as the `lesson_complete` entry
- [ ] Completing any lesson that is not the last one does not trigger the course completion bonus
- [ ] The bonus is awarded at most once per enrollment — if somehow `awardLessonPoints` is called again after all lessons are done, no second `course_complete` entry is written
- [ ] `userGamification.totalPoints` and `currentLevel` reflect the combined lesson + course bonus XP
- [ ] The `course_complete` XP event appears in `xpEvents` and renders as a distinct toast (e.g. "+100 XP — Course complete!")
- [ ] Tests: bonus fires on last lesson completion; bonus does not fire on non-final lessons; bonus is not re-awarded on a redundant call

## Blocked by

- Blocked by `issues/002-lesson-completion-xp-with-toasts.md`

## User stories addressed

- User story 16 (one-time course completion bonus)
