## Parent PRD

`issues/prd.md`

## What to build

Implement the quiz incentive slice from the PRD: when a student passes a quiz, the app awards quiz XP on the first passing attempt, awards the extra first-try bonus only when the very first attempt passes, records the appropriate XP events, and makes the outcome visible in the quiz result flow.

This slice should work end-to-end with the shared gamification profile so quiz outcomes immediately affect the student's private totals.

## Acceptance criteria

- [ ] Passing a quiz awards the agreed quiz XP only the first time the student achieves a passing result for that quiz.
- [ ] Passing on the very first attempt awards the agreed first-try bonus, while later passes do not.
- [ ] Tests verify first-pass behavior, first-try bonus behavior, repeat-pass deduplication, and the thin integration between quiz scoring and gamification behavior.

## Blocked by

- Blocked by `issues/001-add-gamification-profile-and-sidebar-status.md`

## User stories addressed

- User story 3
- User story 4
- User story 19
- User story 21
- User story 22
- User story 23
- User story 37
- User story 38
- User story 44
- User story 52
- User story 55
