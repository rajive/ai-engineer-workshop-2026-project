## Parent PRD

`issues/prd.md`

## What to build

Implement the level-up celebration slice from the PRD: when a lesson or quiz reward pushes a student across a level threshold, the app should celebrate it in the learning flow with the approved toast and subtle animation. The celebration should be noticeable and satisfying without interrupting the lesson experience.

This slice should work for both lesson-earned and quiz-earned level-ups and should reflect the same level model used by the sidebar and dashboard.

## Acceptance criteria

- [ ] A student who crosses a level threshold from lesson or quiz rewards receives in-flow level-up feedback using the approved toast-and-animation pattern.
- [ ] The feedback uses the student's new level and title from the shared gamification model and does not require a blocking modal.
- [ ] Tests verify the reward flow can detect level transitions for both lesson and quiz paths and expose the information needed by the UI feedback layer.

## Blocked by

- Blocked by `issues/002-award-lesson-xp-on-completion.md`
- Blocked by `issues/003-award-quiz-pass-xp-and-first-try-bonus.md`

## User stories addressed

- User story 16
- User story 17
- User story 32
- User story 42
- User story 58
- User story 59
