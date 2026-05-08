## Parent PRD

`issues/prd.md`

## What to build

Implement the streak milestone reward slice from the PRD: when a student reaches the agreed streak thresholds, the app awards the one-time milestone XP bonus, records the event in XP history, and updates the student's total XP and level state.

This slice should rely on the working streak logic and ensure milestone rewards are auditable and not repeatedly granted for the same threshold.

## Acceptance criteria

- [ ] Reaching the agreed streak milestones awards the correct one-time bonus XP and records the milestone event in XP history.
- [ ] A student cannot repeatedly earn the same milestone bonus from the same threshold.
- [ ] Tests verify milestone awards at the approved thresholds and confirm totals update correctly after streak bonus events.

## Blocked by

- Blocked by `issues/004-track-daily-lesson-streaks-in-the-sidebar.md`

## User stories addressed

- User story 10
- User story 33
- User story 34
- User story 35
- User story 49
- User story 57
- User story 60
