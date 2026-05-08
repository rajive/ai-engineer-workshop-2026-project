import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDb, seedBaseData } from "~/test/setup";
import * as schema from "~/db/schema";

let testDb: ReturnType<typeof createTestDb>;
let base: ReturnType<typeof seedBaseData>;

vi.mock("~/db", () => ({
  get db() {
    return testDb;
  },
}));

import { computeResult } from "./quizScoringService";
import { getGamificationProfile } from "./gamificationProfileService";

function createQuizWithOneQuestion(
  lessonId: number,
  correctOptionIndex?: number
) {
  const quiz = testDb
    .insert(schema.quizzes)
    .values({
      lessonId,
      title: "Test Quiz",
      passingScore: 0.7,
    })
    .returning()
    .get();

  const question = testDb
    .insert(schema.quizQuestions)
    .values({
      quizId: quiz.id,
      questionText: "What is 2+2?",
      questionType: schema.QuestionType.MultipleChoice,
      position: 1,
    })
    .returning()
    .get();

  const correctIdx = correctOptionIndex ?? 0;
  const options = [
    { questionId: question.id, optionText: "4", isCorrect: true },
    { questionId: question.id, optionText: "5", isCorrect: false },
    { questionId: question.id, optionText: "6", isCorrect: false },
  ];

  const createdOptions = options.map((opt) =>
    testDb
      .insert(schema.quizOptions)
      .values(opt)
      .returning()
      .get()
  );

  return { quiz, question, correctOption: createdOptions[correctIdx], options: createdOptions };
}

function createQuizWithLesson(
  courseId: number
) {
  const mod = testDb
    .insert(schema.modules)
    .values({ courseId, title: "Quiz Module", position: 1 })
    .returning()
    .get();

  const lesson = testDb
    .insert(schema.lessons)
    .values({ moduleId: mod.id, title: "Quiz Lesson", position: 1 })
    .returning()
    .get();

  const { quiz, question, correctOption, options } = createQuizWithOneQuestion(lesson.id);

  return { module: mod, lesson, quiz, question, correctOption, options };
}

describe("quizScoringService — XP integration", () => {
  beforeEach(() => {
    testDb = createTestDb();
    base = seedBaseData(testDb);
  });

  it("awards 100 XP for passing a quiz (plus first-try bonus on first attempt)", () => {
    const { lesson, quiz, question, correctOption, options } = createQuizWithLesson(base.course.id);
    const selectedAnswers = { [question.id]: correctOption.id };

    const result = computeResult(base.user.id, quiz.id, selectedAnswers);

    expect(result).not.toBeNull();
    expect(result.passed).toBe(true);

    const profile = getGamificationProfile(base.user.id);
    expect(profile.xp).toBe(150);
    expect(profile.activity).toHaveLength(2);
    const passTx = profile.activity.find((a) => a.reason === "quiz_pass")!;
    const bonusTx = profile.activity.find((a) => a.reason === "quiz_first_try")!;
    expect(passTx).toBeDefined();
    expect(passTx.amount).toBe(100);
    expect(passTx.referenceType).toBe("quiz");
    expect(passTx.referenceId).toBe(quiz.id);
    expect(bonusTx).toBeDefined();
    expect(bonusTx.amount).toBe(50);
  });

  it("awards an extra 50 XP (first-try bonus) on the very first passing attempt", () => {
    const { lesson, quiz, question, correctOption, options } = createQuizWithLesson(base.course.id);

    computeResult(base.user.id, quiz.id, { [question.id]: correctOption.id });

    const profile = getGamificationProfile(base.user.id);
    expect(profile.xp).toBe(150);
    expect(profile.activity).toHaveLength(2);
    const passTx = profile.activity.find((a) => a.reason === "quiz_pass")!;
    const bonusTx = profile.activity.find((a) => a.reason === "quiz_first_try")!;
    expect(passTx).toBeDefined();
    expect(passTx.amount).toBe(100);
    expect(bonusTx).toBeDefined();
    expect(bonusTx.amount).toBe(50);
  });

  it("does not award first-try bonus if first attempt failed", () => {
    const { lesson, quiz, question, correctOption, options } = createQuizWithLesson(base.course.id);
    // Submit wrong answer to fail
    const wrongOption = options[1];
    expect(wrongOption.isCorrect).toBe(false);

    computeResult(base.user.id, quiz.id, { [question.id]: wrongOption.id });
    let profile = getGamificationProfile(base.user.id);
    expect(profile.xp).toBe(0);

    // Now pass on second attempt
    computeResult(base.user.id, quiz.id, { [question.id]: correctOption.id });
    profile = getGamificationProfile(base.user.id);
    expect(profile.xp).toBe(100);
    expect(profile.activity).toHaveLength(1);
    expect(profile.activity[0].reason).toBe("quiz_pass");
    expect(profile.activity[0].amount).toBe(100);
  });

  it("does not re-award XP for passing the same quiz again", () => {
    const { lesson, quiz, question, correctOption, options } = createQuizWithLesson(base.course.id);

    computeResult(base.user.id, quiz.id, { [question.id]: correctOption.id });
    computeResult(base.user.id, quiz.id, { [question.id]: correctOption.id });

    const profile = getGamificationProfile(base.user.id);
    expect(profile.xp).toBe(150); // 100 pass + 50 first-try, not doubled
    expect(profile.activity).toHaveLength(2);
  });

  it("awards XP separately for two different quizzes", () => {
    const { lesson, quiz, question, correctOption, options } = createQuizWithLesson(base.course.id);

    // Create a second quiz with a different question
    const quiz2 = testDb
      .insert(schema.quizzes)
      .values({ lessonId: lesson.id, title: "Test Quiz 2", passingScore: 0.7 })
      .returning()
      .get();

    const question2 = testDb
      .insert(schema.quizQuestions)
      .values({ quizId: quiz2.id, questionText: "What is 3+3?", questionType: schema.QuestionType.MultipleChoice, position: 1 })
      .returning()
      .get();

    const opt2Correct = testDb
      .insert(schema.quizOptions)
      .values({ questionId: question2.id, optionText: "6", isCorrect: true })
      .returning()
      .get();
    testDb
      .insert(schema.quizOptions)
      .values({ questionId: question2.id, optionText: "7", isCorrect: false })
      .run();

    computeResult(base.user.id, quiz.id, { [question.id]: correctOption.id });
    computeResult(base.user.id, quiz2.id, { [question2.id]: opt2Correct.id });

    const profile = getGamificationProfile(base.user.id);
    expect(profile.xp).toBe(300); // (100+50) + (100+50) = 300
    expect(profile.activity).toHaveLength(4);
  });
});
