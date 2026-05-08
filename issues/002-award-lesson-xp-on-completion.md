## Parent PRD

`issues/prd.md`

## What to build

Implement the first reward-producing tracer bullet from the PRD: when a student completes a lesson, the app awards lesson XP exactly once, records the event in XP history, updates the student's gamification totals, and shows immediate completion feedback in the lesson flow.

This slice should use the sidebar status established earlier so the end-to-end behavior is visible immediately after a lesson is completed.

## Acceptance criteria

- [ ] Completing a lesson awards the agreed lesson XP exactly once per student per lesson and records the event in XP history.
- [ ] After lesson completion, the student's sidebar-visible totals reflect the new XP and level state without requiring any manual reconciliation.
- [ ] Tests verify lesson completion rewards, duplicate-completion protection, and the thin integration between lesson progress and gamification behavior.

## Blocked by

- Blocked by `issues/001-add-gamification-profile-and-sidebar-status.md`

## User stories addressed

- User story 2
- User story 15
- User story 18
- User story 20
- User story 31
- User story 36
- User story 43
- User story 52
- User story 53
- User story 55
