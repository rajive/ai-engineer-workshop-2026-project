## Parent PRD

`issues/prd.md`

## What to build

Create the first end-to-end gamification slice from the PRD's Solution, Implementation Decisions, and UI touchpoint decisions: a student can have persistent gamification state and see it in a compact sidebar status area. This slice should establish the app's ability to store a student's XP, level, streak state, and XP transaction history, then expose a read model that the shared app shell can render for the current user.

This slice is complete when a student can load the app and see a private gamification summary in the sidebar, even before lesson and quiz rewards are fully wired in.

## Acceptance criteria

- [ ] The application persists per-user gamification state and XP transaction history in support of the PRD's global XP model.
- [ ] The shared app shell can load a gamification profile for the current user and render a compact sidebar status showing XP, level title, and streak state.
- [ ] Service-level tests cover the gamification profile/query contract and confirm the sidebar can depend on stable read-side behavior.

## Blocked by

None - can start immediately

## User stories addressed

- User story 1
- User story 5
- User story 6
- User story 12
- User story 13
- User story 26
- User story 39
- User story 41
- User story 50
- User story 51
- User story 54
