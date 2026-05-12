## Parent PRD

`issues/prd.md`

## What to build

Implement `awardQuizPoints(userId, quizAttemptId)` in `gamificationService` and wire it into the quiz submission flow (the point where `quizScoringService.computeResult` saves a passing attempt). A passing first attempt awards +15 XP base; if the attempt score is ≥90% an additional +5 XP is awarded, ≥80% an additional +3 XP. If the user has any prior passing attempt for the same quiz, the call is a no-op. XP events are returned to the client and rendered as `sonner` toasts on the quiz submission page.

See the "Point Values" and "Modules" sections of the PRD for the exact grade thresholds and event types (`quiz_pass`, `quiz_score_bonus`).

## Acceptance criteria

- [ ] `awardQuizPoints` writes a `quiz_pass` ledger entry (+15 XP) on a student's first passing attempt
- [ ] A grade ≥90% additionally writes a `quiz_score_bonus` ledger entry (+5 XP) in the same call
- [ ] A grade ≥80% (but <90%) additionally writes a `quiz_score_bonus` ledger entry (+3 XP)
- [ ] Grades below 80% receive no score bonus
- [ ] If the user has already passed this quiz in any prior attempt, `awardQuizPoints` is a no-op — no new ledger entries
- [ ] A failing attempt never triggers any XP award
- [ ] `userGamification.totalPoints` and `currentLevel` are updated correctly after XP is awarded
- [ ] Quiz submission action returns `xpEvents` and the quiz page renders `sonner` toasts for each event
- [ ] Tests: first pass awards base XP; grade A awards base + bonus; grade B awards base + bonus; grade C/D/F awards base only; second passing attempt is a no-op; failing attempt awards nothing

## Blocked by

- Blocked by `issues/001-gamification-schema-and-service-foundation.md`

## User stories addressed

- User story 2 (earn bonus XP when passing a quiz)
- User story 3 (earn more bonus XP for a higher quiz score)
- User story 17 (quiz re-attempts do not award additional XP)
