"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

// Define the response shape for a question to send to the client
export interface NextQuestionResult {
  id: string;
  question: string;
  options: string[]; // parsed from JSON
  difficulty: Difficulty;
  isFinished: boolean; // flag if the quiz has exhausted all questions
}

export async function getNextQuestion(
  quizId: string, 
  currentDifficulty: Difficulty | null, 
  wasCorrect: boolean | null,
  answeredQuestionIds: string[]
): Promise<NextQuestionResult | null> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  let targetDifficulty: Difficulty = "MEDIUM";

  // Adaptive Algorithm
  if (currentDifficulty) {
    if (wasCorrect) {
      // If correct, ramp up difficulty
      if (currentDifficulty === "EASY") targetDifficulty = "MEDIUM";
      if (currentDifficulty === "MEDIUM") targetDifficulty = "HARD";
      if (currentDifficulty === "HARD") targetDifficulty = "HARD"; // Cap
    } else {
      // If incorrect, lower difficulty
      if (currentDifficulty === "HARD") targetDifficulty = "MEDIUM";
      if (currentDifficulty === "MEDIUM") targetDifficulty = "EASY";
      if (currentDifficulty === "EASY") targetDifficulty = "EASY"; // Floor
    }
  }

  // Try to find a question with the target difficulty that hasn't been answered
  let question = await prisma.quizQuestion.findFirst({
    where: {
      quizId,
      id: { notIn: answeredQuestionIds },
      difficulty: targetDifficulty
    }
  });

  // Fallback: If no question of target difficulty exists, grab ANY unanswered question
  if (!question) {
    question = await prisma.quizQuestion.findFirst({
      where: {
        quizId,
        id: { notIn: answeredQuestionIds }
      }
    });
  }

  // If still no question, the quiz is finished
  if (!question) {
    return {
      id: "finish",
      question: "",
      options: [],
      difficulty: "MEDIUM",
      isFinished: true
    };
  }

  return {
    id: question.id,
    question: question.question,
    options: question.options as string[],
    difficulty: question.difficulty as Difficulty,
    isFinished: false
  };
}

// Function to verify answer (Server-Side validation prevents client cheating)
export async function verifyAnswer(questionId: string, selectedAnswer: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const question = await prisma.quizQuestion.findUnique({
    where: { id: questionId },
    select: { correctAnswer: true }
  });

  if (!question) throw new Error("Question not found");
  return question.correctAnswer === selectedAnswer;
}

// Submits the final score
export async function submitQuizScore(quizId: string, score: number) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  await prisma.quizScore.create({
    data: {
      quizId,
      studentId: session.user.id,
      score,
    }
  });

  return { success: true };
}
