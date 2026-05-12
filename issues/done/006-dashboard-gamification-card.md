## Parent PRD

`issues/prd.md`

## What to build

Add a gamification summary card to the top of the student dashboard. The card reads from `getUserGamificationStats` and displays: current level number and name, current XP and XP needed to reach the next level as a progress bar, current streak count with a flame icon, and longest streak on record. Students with no activity yet see level 1 / Beginner, 0 XP, and a 0-day streak — the card is always shown, never hidden.

See the "UI placement" section of the PRD. Use existing shadcn/ui `Card` and `Progress` (or equivalent) components and `lucide-react` icons to stay consistent with the rest of the UI.

## Acceptance criteria

- [ ] Gamification card appears at the top of the student dashboard for all enrolled students
- [ ] Card displays current level number and level name (e.g. "Level 3 — Apprentice")
- [ ] Card displays current XP and XP required for the next level (e.g. "250 / 500 XP")
- [ ] XP progress bar visually reflects how far the student is through the current level band
- [ ] Card displays current streak with a flame icon (e.g. "🔥 5-day streak")
- [ ] Card displays longest streak (e.g. "Best: 12 days")
- [ ] A student with zero activity sees Beginner / 0 XP / 0-day streak — not an error state
- [ ] A Level 10 (Legend) student sees a full progress bar and no "XP to next level" figure
- [ ] Dashboard loader fetches gamification stats server-side; no client-side fetch needed
- [ ] Card is visually consistent with the existing dashboard UI (uses the same card/spacing conventions)

## Blocked by

- Blocked by `issues/001-gamification-schema-and-service-foundation.md`
- Best started after `issues/003-streak-tracking.md` so streak data is live

## User stories addressed

- User story 5 (see current XP total on dashboard)
- User story 6 (see named level)
- User story 7 (progress bar to next level)
- User story 8 (see current streak on dashboard)
- User story 11 (longest streak on record)
- User story 18 (gamification progress is private)
- User story 19 (level name shown prominently)
