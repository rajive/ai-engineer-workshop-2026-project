## Parent PRD

`issues/prd.md`

## What to build

Implement the lesson-based streak slice from the PRD: completing at least one lesson on consecutive calendar days updates a student's current streak and longest streak, while missing a day resets the current streak. The live streak state should be reflected in the sidebar so students can see the habit loop working.

This slice should operate through the agreed lesson-completion trigger and use the approved streak behavior without adding freezes or other exceptions.

## Acceptance criteria

- [ ] Lesson completion updates current streak, longest streak, and reset behavior according to the PRD's hard-streak definition.
- [ ] The sidebar status shows the student's current streak state using the same gamification profile used elsewhere in the app.
- [ ] Tests verify same-day completions, next-day continuation, missed-day reset, and the lesson-triggered streak integration.

## Blocked by

- Blocked by `issues/002-award-lesson-xp-on-completion.md`

## User stories addressed

- User story 8
- User story 9
- User story 11
- User story 24
- User story 27
- User story 45
- User story 53
- User story 55
