## Problem Statement

Cadence students are not seeing enough visible, cumulative progress as they move through courses. The current product tracks lesson completion and course progress, but progress is mostly expressed as percentages and checkboxes. Students can complete dozens of lessons without feeling that they have built momentum, reached milestones, or earned anything tangible beyond incremental course completion. This makes the learning experience feel flat and contributes to poor retention.

The product team wants to add private, non-competitive gamification that reinforces learning habits without making the platform feel juvenile or distracting. The system needs to reward meaningful learning activity, create short-term goals to aim for, reinforce consistent daily engagement, and make quizzes feel worthwhile. It also needs to fit naturally into the current course, lesson, quiz, sidebar, and dashboard experience.

## Solution

Introduce a private gamification layer centered around global XP, levels, and lesson-based streaks. Students will earn XP for completing lessons, passing quizzes, passing quizzes on the first attempt, and reaching streak milestones. Their cumulative XP will determine a global level, shown as a numeric level with a descriptive title. Their streak will increase when they complete at least one lesson on consecutive calendar days and will reset if they miss a day.

This system will be surfaced in three primary places: a compact persistent status area in the sidebar, a richer progress summary on the dashboard, and immediate feedback on lesson completion via toasts and subtle level-up animation. The design will remain private to each student and will not include public leaderboards, competitive ranking, or other social comparison mechanics.

## User Stories

1. As a student, I want my work across all courses to contribute to a single XP total, so that my effort feels cumulative over time.
2. As a student, I want to earn XP when I complete a lesson, so that every completed learning unit feels rewarding.
3. As a student, I want quiz completion to matter to my overall progress, so that I feel motivated to take quizzes instead of skipping them.
4. As a student, I want extra recognition for passing a quiz on my first try, so that preparation and mastery feel rewarded.
5. As a student, I want to see my current level, so that I know how far I have progressed overall.
6. As a student, I want levels to have descriptive titles, so that milestones feel more meaningful than raw numbers alone.
7. As a student, I want to see how close I am to my next level, so that I have a short-term goal to work toward.
8. As a student, I want my streak to increase when I complete at least one lesson in a day, so that daily learning becomes a habit.
9. As a student, I want my streak to reset when I miss a day, so that the streak represents true daily consistency.
10. As a student, I want milestone bonuses for longer streaks, so that maintaining my streak feels increasingly worthwhile.
11. As a student, I want my streak to be based on real lesson completion rather than passive activity, so that the system reflects actual learning.
12. As a student, I want the system to stay private to me, so that I can feel motivated without being compared to other students.
13. As a student, I want to see my gamification status in the sidebar, so that I can quickly orient myself from anywhere in the app.
14. As a student, I want a richer summary of my XP, level, and streak on the dashboard, so that I have a home base for my overall progress.
15. As a student, I want a toast when I complete a lesson and earn XP, so that I get immediate feedback for progress.
16. As a student, I want a subtle celebration when I level up, so that milestone moments feel satisfying without disrupting learning.
17. As a student, I want my level-up feedback to keep me in the lesson flow, so that the system motivates me without becoming intrusive.
18. As a student, I want a consistent reward amount for each lesson completion, so that the system is easy to understand.
19. As a student, I want a consistent reward amount for quiz passes, so that I know what I will earn before I take a quiz.
20. As a student, I want the system to avoid rewarding the same lesson multiple times, so that progress feels fair and not exploitable.
21. As a student, I want the system to avoid rewarding repeated passes on the same quiz, so that progress cannot be farmed by retaking already-passed quizzes.
22. As a student, I want to still earn quiz pass XP if I fail once and later pass, so that improvement is rewarded.
23. As a student, I want first-try bonuses to only apply to my first attempt, so that they represent genuine mastery.
24. As a student, I want my longest streak to be preserved even if my current streak resets, so that I can still see my best historical habit.
25. As a student, I want the dashboard to reflect recent gamification activity, so that I can understand why my XP total changed.
26. As a student, I want my XP and level to persist across sessions and devices, so that my progress remains stable.
27. As a student, I want the platform to reward daily lesson completion even if I switch between courses, so that habits are reinforced globally.
28. As a student, I want the system to feel professional and understated, so that gamification fits the tone of a product for working professionals.
29. As a student, I want the system to avoid public competition, so that I stay motivated without pressure from rankings.
30. As a student, I want the gamification system to complement course progress rather than replace it, so that I can still track both mastery and completion.
31. As a student, I want the XP system to feel generous enough to notice after a single lesson, so that each session feels worthwhile.
32. As a student, I want level thresholds to rise over time, so that higher levels feel progressively more meaningful.
33. As a student, I want the streak milestones at specific meaningful thresholds, so that they feel like achievements rather than background drip rewards.
34. As a student, I want the 7-day streak milestone to feel attainable, so that I can quickly build early momentum.
35. As a student, I want the 30-day and longer streak milestones to feel substantial, so that long-term consistency is rewarded.
36. As a student, I want lesson completion XP to be awarded exactly once per lesson, so that duplicate actions do not inflate my totals.
37. As a student, I want quiz pass XP to be awarded the first time I pass a quiz, so that I am rewarded for eventually mastering the material.
38. As a student, I want repeated successful quiz retakes to award no extra XP, so that I cannot abuse the system.
39. As a student, I want the sidebar status to be compact, so that it stays visible without crowding navigation.
40. As a student, I want the dashboard summary to explain my progress clearly, so that I understand both my total XP and my next milestone.
41. As a student, I want my XP progress to next level to be visual, so that I can quickly assess how far away I am.
42. As a student, I want my lesson completion toast to say what I earned, so that the reward is explicit.
43. As a student, I want the system to feel predictable, so that I can trust how rewards are calculated.
44. As a product stakeholder, I want quizzes to have stronger incentives, so that students are more likely to engage with assessment content.
45. As a product stakeholder, I want streaks tied to lesson completion specifically, so that the behavior being reinforced aligns with course completion.
46. As a product stakeholder, I want the system to avoid leaderboards, so that it aligns with the professional tone of the audience.
47. As a product stakeholder, I want the system to create visible progress beyond checkboxes, so that students feel like they have something to show for repeated learning activity.
48. As a product stakeholder, I want the first version to be simple to explain, so that support and onboarding remain straightforward.
49. As a product stakeholder, I want a transaction history of XP-awarding events, so that the product can support future auditing, analytics, and UI history.
50. As a product stakeholder, I want aggregate gamification state stored for fast reads, so that the sidebar and dashboard can load efficiently.
51. As a developer, I want gamification rules centralized in a small number of stable interfaces, so that reward logic stays testable and maintainable.
52. As a developer, I want existing lesson and quiz services to stay thin at their integration points, so that gamification can evolve without scattering logic across the app.
53. As a developer, I want streak updates to run from lesson completion events, so that the system reflects agreed behavior with minimal ambiguity.
54. As a developer, I want the read-side UI queries separated from the write-side reward rules, so that loaders remain simple and business logic stays encapsulated.
55. As a developer, I want tests to focus on externally visible gamification behavior, so that refactors do not break the test suite unnecessarily.
56. As an instructor or admin reviewing the product, I want gamification to behave consistently across all student activity, so that the system appears reliable and intentional.
57. As a student returning after missing a day, I want to clearly see that my streak reset but my XP and level did not, so that a missed day feels recoverable.
58. As a student who completes many lessons, I want my level to continue increasing beyond early milestones, so that the system remains motivating over longer periods.
59. As a student, I want the system to preserve my earned XP permanently, so that progress compounds even if my streak does not.
60. As a future analyst, I want XP events categorized by reason, so that behavior patterns can be analyzed later.

## Implementation Decisions

- The gamification system will use global XP rather than course-specific XP.
- Lesson completion will award 50 XP.
- Passing a quiz will award 100 XP.
- Passing a quiz on the first attempt will award an additional 50 XP.
- Streak milestones will award one-time XP bonuses at 7 days, 30 days, 100 days, and 365 days.
- The streak will be defined as completing at least one lesson on consecutive calendar days.
- The streak will be a hard streak: missing one day resets the current streak.
- Streak bonuses will occur only at specific milestone thresholds rather than every seven days.
- Levels will be numeric and accompanied by descriptive titles.
- Level thresholds will start with agreed milestone values and continue increasing beyond the early levels.
- The system will remain private to each student and will not include leaderboards or public ranking.
- Aggregate gamification state will be stored directly on the user record for efficient reads.
- A separate XP transaction log will store every XP-awarding event with its reason and timestamp.
- The XP transaction log will capture enough metadata to identify what event produced the reward.
- Lesson completion will only award XP once per lesson.
- Quiz pass XP will only be awarded on the first time a student passes a given quiz.
- Re-passing a quiz that was already passed earlier will not award additional XP.
- The first-attempt quiz bonus will only be awarded when the student passes on their very first attempt.
- The write-side rules for XP, levels, streaks, milestone bonuses, and deduplication will be encapsulated in a gamification engine module.
- The agreed descriptive name for the streak update entry point is `recordLessonCompletionStreak`, replacing the earlier placeholder name.
- The read-side assembly of XP, level, streak, recent activity, and progress-to-next-level will be encapsulated in a separate gamification profile/query service.
- Existing progress logic will remain the place where lesson completion is detected, but it will delegate gamification behavior to the gamification engine.
- Existing quiz scoring logic will remain the place where quiz outcomes are detected, but it will delegate gamification behavior to the gamification engine.
- Sidebar and dashboard loaders will consume gamification profile data rather than recomputing XP or level logic themselves.
- UI feedback will appear in three places: a compact sidebar status, a richer dashboard summary, and lesson-level completion/level-up feedback.
- Level-up feedback will use a toast plus subtle animation rather than a disruptive modal overlay.
- The first implementation phase will prioritize schema changes and backend rules before adding UI surfaces.
- The implementation will favor deep modules with simple interfaces over spreading reward logic across route loaders and actions.

## Testing Decisions

- Good tests should verify externally observable behavior and stable contracts rather than internal implementation details.
- Good tests should assert outcomes such as awarded XP, computed level, streak resets, milestone bonuses, and deduplication behavior, rather than how queries are ordered internally.
- Good tests should cover both happy paths and edge cases such as duplicate lesson completion, failed quiz then passed quiz, first-attempt pass bonus, and missed-day streak reset.
- The gamification engine will be tested directly because it contains the core reward, level, streak, and deduplication rules.
- The gamification profile/query service will be tested because it defines what gamification data the UI can safely depend on.
- Thin integration behavior in the lesson progress flow will be tested to confirm lesson completion triggers the correct gamification effects once.
- Thin integration behavior in the quiz scoring flow will be tested to confirm quiz outcomes trigger the correct gamification effects without duplicate rewards.
- Prior art for the testing approach exists in the current service-level tests that use an in-memory SQLite database and validate service behavior via public functions.
- Tests should continue following the existing project convention of using migrated in-memory databases and mocking the shared database import for service isolation.
- UI tests are not the priority for this PRD; the most important coverage is at the service and integration boundary level where the business rules live.

## Out of Scope

- Leaderboards, public ranking, or any social competition mechanics.
- Peer comparisons, team competitions, or instructor-facing competitive views.
- Rewards for passive activity such as page views, video starts, or login events.
- Streak freezes, grace periods, or weekend exemptions.
- Score-scaled quiz XP beyond the agreed flat pass reward and first-attempt bonus.
- Re-awarding XP for lessons or quizzes that were already rewarded.
- A dedicated standalone gamification page beyond the sidebar and dashboard surfaces.
- Achievements, badges, collectibles, avatars, or cosmetic unlock systems beyond levels and streaks.
- Email, push, or external notifications for streak milestones or level-ups.
- Any change to the platform's private-by-default stance on student progress.

## Further Notes

- The initial release should bias toward clarity and trustworthiness over novelty. Students should be able to quickly understand why they earned XP and what they need to do to continue progressing.
- The transaction log is intentionally included in the first version even though the initial UI surface is small, because it creates a foundation for future analytics and recent-activity displays.
- The system should preserve a professional tone suitable for working adults. Visual feedback should be motivating and polished, not loud or game-like for its own sake.
- The planned backend split intentionally creates one write-focused deep module and one read-focused deep module, with existing lesson and quiz services acting as thin orchestration points.
- The first implementation pass should establish clean interfaces and reliable behavior before expanding the visual treatment.
