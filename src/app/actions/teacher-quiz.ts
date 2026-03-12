"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Difficulty } from "@prisma/client";

// Ensure only TEACHER can manage quizzes
async function getTeacherId() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    throw new Error("Unauthorized: Only Teachers can perform this action");
  }
  return session.user.id;
}

export async function createQuiz(formData: FormData) {
  const title = formData.get("title") as string;
  const classId = formData.get("classId") as string;

  if (!title || !classId) {
    throw new Error("Missing required fields");
  }

  const teacherId = await getTeacherId();

  // Verify that the teacher is actually teaching this class
  const membership = await prisma.classMember.findUnique({
    where: { userId_classId: { userId: teacherId, classId } }
  });

  if (!membership || membership.role !== "TEACHER") {
    throw new Error("Unauthorized: You do not have permission to add a quiz to this class.");
  }

  await prisma.quiz.create({
    data: {
      title,
      classId,
      creatorId: teacherId
    }
  });

  revalidatePath("/dashboard/teacher/quizzes");
}

export async function deleteQuiz(quizId: string) {
  const teacherId = await getTeacherId();

  // Verify ownership
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz || quiz.creatorId !== teacherId) {
    throw new Error("Unauthorized or Quiz not found");
  }

  await prisma.quiz.delete({
    where: { id: quizId }
  });

  revalidatePath("/dashboard/teacher/quizzes");
}

export async function addQuestion(formData: FormData) {
  const quizId = formData.get("quizId") as string;
  const question = formData.get("question") as string;
  const optionA = formData.get("optionA") as string;
  const optionB = formData.get("optionB") as string;
  const optionC = formData.get("optionC") as string;
  const optionD = formData.get("optionD") as string;
  const correctAnswer = formData.get("correctAnswer") as string;
  const difficulty = formData.get("difficulty") as Difficulty;

  if (!quizId || !question || !optionA || !optionB || !optionC || !optionD || !correctAnswer || !difficulty) {
    throw new Error("Missing required fields");
  }

  const teacherId = await getTeacherId();

  // Verify ownership
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz || quiz.creatorId !== teacherId) {
    throw new Error("Unauthorized or Quiz not found");
  }

  const optionsArray = [optionA, optionB, optionC, optionD];
  if (!optionsArray.includes(correctAnswer)) {
    throw new Error("Correct answer must be one of the options");
  }

  await prisma.quizQuestion.create({
    data: {
      quizId,
      question,
      options: optionsArray,
      correctAnswer,
      difficulty
    }
  });

  revalidatePath(`/dashboard/teacher/quizzes/${quizId}`);
}

export async function deleteQuestion(questionId: string) {
  const teacherId = await getTeacherId();

  // Find question and its quiz to verify ownership
  const question = await prisma.quizQuestion.findUnique({
    where: { id: questionId },
    include: { quiz: true }
  });

  if (!question || question.quiz.creatorId !== teacherId) {
    throw new Error("Unauthorized or Question not found");
  }

  await prisma.quizQuestion.delete({
    where: { id: questionId }
  });

  revalidatePath(`/dashboard/teacher/quizzes/${question.quizId}`);
}
