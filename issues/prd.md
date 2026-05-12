# PRD: Gamification System for Cadence

## Problem Statement

Students sign up for courses on Cadence, complete a handful of lessons, and then drop off. There is no visible sense of accumulating progress beyond a per-lesson checkbox. Students who complete 40 lessons have nothing tangible to show for it. There is also no incentive to attempt quizzes, and no mechanism to build the daily habit that correlates with course completion. Retention is suffering as a result.

## Solution

Add a private gamification layer — points, levels, and streaks — that makes cumulative progress visible and rewarding. Students earn XP for completing lessons, passing quizzes, and maintaining daily streaks. XP unlocks named level tiers. A streak counter rewards consecutive daily activity. Everything is private to the student; there are no leaderboards or competitive elements.

## User Stories

1. As a student, I want to earn XP every time I complete a lesson, so that I feel my effort accumulating even before I finish a course.
2. As a student, I want to earn bonus XP when I pass a quiz, so that there is a clear incentive to attempt quizzes rather than skip them.
3. As a student, I want to earn more bonus XP the higher my quiz score, so that doing well on a quiz feels meaningfully better than barely passing.
4. As a student, I want my XP to persist across sessions, so that I can return days later and pick up where I left off.
5. As a student, I want to see my current XP total on my dashboard, so that I always know how much I have accumulated.
6. As a student, I want to see a named level (e.g. "Scholar") based on my XP, so that I have a milestone to aim for beyond raw numbers.
7. As a student, I want to see a progress bar showing how far I am from the next level, so that I can judge how much effort it will take to level up.
8. As a student, I want to see my current streak count on my dashboard, so that I am motivated to return the next day.
9. As a student, I want my streak to increase when I complete at least one lesson each calendar day, so that daily habits are rewarded.
10. As a student, I want my streak to reset if I miss a day, so that the streak counter accurately reflects my consistency.
11. As a student, I want to see my longest streak on record, so that I can feel proud of past consistency even if my current streak resets.
12. As a student, I want to earn a streak bonus XP each day I maintain my streak, so that keeping a streak going is rewarding in itself.
13. As a student, I want to earn milestone bonus XP at 7, 14, and 30-day streaks, so that hitting those targets feels like a significant achievement.
14. As a student, I want to receive an immediate toast notification when I earn XP on the lesson page, so that the reward feels instant and tied to the action.
15. As a student, I want the toast notification to tell me exactly how many XP I earned and why, so that I understand what caused the reward.
16. As a student, I want to earn a one-time course completion bonus when I finish every lesson in a course, so that completing a full course feels like a significant event.
17. As a student, I want quiz re-attempts to not award additional XP, so that the system rewards genuine achievement rather than grinding.
18. As a student, I want my gamification progress to be entirely private, so that I am not compared to or judged by other students.
19. As a student, I want my level name to be shown prominently alongside my XP on the dashboard, so that the level feels meaningful rather than just a number.
20. As a student, I want to see a summary of recent XP events (what I earned and when), so that I can understand the history behind my total.

## Implementation Decisions

### Schema Changes

Two new database tables:

**`userGamification`** — one row per user, updated in place:
- `userId` (unique FK to users)
- `totalPoints` — running XP total
- `currentLevel` — integer 1–10, derived from totalPoints
- `currentStreak` — consecutive days with at least one lesson completed
- `longestStreak` — all-time best streak
- `lastActivityDate` — date of last lesson completion (UTC date string, used for streak logic)

**`pointsLedger`** — append-only audit log, one row per XP award event:
- `id`, `userId`, `points`, `event`, `referenceId`, `earnedAt`
- `event` enum: `lesson_complete | quiz_pass | quiz_score_bonus | streak_daily | streak_milestone | course_complete`
- `referenceId` — lessonId, quizAttemptId, or enrollmentId depending on event type

A Drizzle migration will add both tables.

### Point Values

| Event | XP |
|---|---|
| Lesson completed | +10 |
| Quiz passed (first attempt only) | +15 |
| Quiz grade A (≥90%) | +5 additional |
| Quiz grade B (≥80%) | +3 additional |
| Daily streak bonus | +5 |
| 7-day streak milestone | +25 |
| 14-day streak milestone | +50 |
| 30-day streak milestone | +100 |
| Course completed (all lessons done) | +100 |

### Level Thresholds

| Level | Name | XP Required |
|---|---|---|
| 1 | Beginner | 0 |
| 2 | Novice | 100 |
| 3 | Apprentice | 250 |
| 4 | Student | 500 |
| 5 | Scholar | 900 |
| 6 | Practitioner | 1,400 |
| 7 | Expert | 2,000 |
| 8 | Master | 2,750 |
| 9 | Grandmaster | 3,750 |
| 10 | Legend | 5,000 |

### Modules

**`gamificationService`** — the core deep module. Encapsulates all business logic:
- `awardLessonPoints(userId, lessonId)` — awards lesson XP, triggers streak update, checks for course completion bonus; idempotent (no-ops if already awarded for this lesson)
- `awardQuizPoints(userId, quizAttemptId)` — awards quiz pass and score bonus XP; idempotent (no-ops if any prior passing attempt exists)
- `updateStreak(userId, activityDate)` — advances or resets streak, awards daily and milestone bonuses
- `getUserGamificationStats(userId)` — returns totalPoints, currentLevel, levelName, xpToNextLevel, currentStreak, longestStreak
- `getRecentPointsEvents(userId, limit)` — returns recent ledger rows for the activity summary
- `computeLevel(totalPoints)` — pure function: maps XP total to level object (level number, name, XP threshold)

This service owns all writes to `userGamification` and `pointsLedger`. No other module writes to those tables directly.

**Schema & Migration** — Drizzle schema additions and the corresponding SQL migration file.

**Integration with existing services** — `progressService.markLessonComplete` is the hook point for lesson XP. `quizScoringService.computeResult` is the hook point for quiz XP. Both call into `gamificationService` after their own writes succeed. Course completion is checked inside `awardLessonPoints` by querying whether all lessons in the enrollment are now complete.

**Dashboard UI component** — a new card rendered at the top of the student dashboard showing: level name, current XP / XP needed for next level (progress bar), streak count with flame icon, longest streak. Reads from `getUserGamificationStats`.

**Lesson page integration** — after the existing "Mark Complete" action succeeds, call `awardLessonPoints` server-side and return the XP events earned. The client renders a `sonner` toast for each event.

**Streak logic** — UTC calendar date comparison. If `lastActivityDate` is yesterday → increment streak and award daily bonus (and check milestones). If today → no-op (already active today). If older → reset streak to 1. On first activity ever → initialize streak to 1.

### API Contract

The existing `markLessonComplete` server action will return a new `xpEvents` array in its response: each entry has `{ points, event, label }`. The client maps these to toasts. No new API route is needed.

## Testing Decisions

Good tests for this system verify observable behavior from the outside — what XP total and streak state result from a sequence of actions — without asserting on internal implementation details like which SQL queries ran or how many times a helper was called.

**`gamificationService`** is the primary test target because it is a deep module with a stable interface and no UI dependencies. Tests should cover:
- Lesson completion awards correct XP and updates `totalPoints`
- Idempotency: completing the same lesson twice awards XP only once
- Quiz pass on first attempt awards base + score bonus XP
- Quiz re-attempt (already passed) awards zero XP
- Streak increments on consecutive days
- Streak resets when a day is skipped
- Streak same-day no-op (completing two lessons on the same day counts as one)
- Streak milestones award the correct bonus at exactly 7, 14, and 30 days
- Course completion bonus awarded when last lesson in enrollment is completed
- `computeLevel` pure function: spot-check several XP values against expected level

Prior art for test style: look at how `quizScoringService` and `progressService` are tested in the existing test suite — those are the closest analogs for service-layer tests with database interaction.

## Out of Scope

- Leaderboards or any form of inter-student comparison
- Badges or achievement icons (beyond level names)
- XP decay or time-based expiry of points
- Streak freezes or grace days
- Push notifications or email digests about streaks
- Instructor or admin views of student gamification data
- XP for video watch progress (only lesson completion counts)
- Mobile app or native integrations
- Configurable point values via admin UI

## Further Notes

- The `pointsLedger` table makes the system auditable and recomputable. If point values change in a future version, historical events remain at their original values; only new events use the new schedule.
- Streak timezone is UTC for server-side simplicity. This should be documented clearly to students so a lesson completed just after midnight UTC doesn't feel like a broken streak.
- The `currentLevel` column on `userGamification` is a denormalized cache of `computeLevel(totalPoints)`. It is always recomputed and written alongside `totalPoints` updates to keep them in sync — never read in isolation.
- V1 does not surface a dedicated "my progress" page. Gamification data appears only on the dashboard and via lesson-page toasts. A dedicated page can be added in v2 once the data model is proven.
