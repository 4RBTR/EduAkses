"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

// Shape respon soal untuk dikirim ke Client (QuizEngine)
export interface NextQuestionResult {
  id: string;
  question: string;
  options: string[];
  difficulty: Difficulty;
  isFinished: boolean;
  totalQuestions: number;
}

/**
 * Algoritma Adaptif: Mengambil soal berikutnya berdasarkan performa sebelumnya.
 */
export async function getNextQuestion(
  quizId: string, 
  currentDifficulty: Difficulty | null, 
  wasCorrect: boolean | null,
  answeredQuestionIds: string[]
): Promise<NextQuestionResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Logika Penentuan Difficulty Target
  let targetDifficulty: Difficulty = "MEDIUM";

  if (currentDifficulty && wasCorrect !== null) {
    if (wasCorrect) {
      // Jika benar, naikkan level
      if (currentDifficulty === "EASY") targetDifficulty = "MEDIUM";
      else targetDifficulty = "HARD";
    } else {
      // Jika salah, turunkan level
      if (currentDifficulty === "HARD") targetDifficulty = "MEDIUM";
      else targetDifficulty = "EASY";
    }
  }

  // 1. Hitung total soal untuk progress bar
  const totalQuestions = await prisma.quizQuestion.count({ where: { quizId } });

  // 2. Cari soal dengan difficulty target yang belum dijawab
  let question = await prisma.quizQuestion.findFirst({
    where: {
      quizId,
      id: { notIn: answeredQuestionIds },
      difficulty: targetDifficulty
    }
  });

  // 3. Fallback: Jika level target habis, ambil soal APAPUN yang tersisa
  if (!question) {
    question = await prisma.quizQuestion.findFirst({
      where: {
        quizId,
        id: { notIn: answeredQuestionIds }
      }
    });
  }

  // 4. Jika benar-benar tidak ada soal tersisa, kuis selesai
  if (!question) {
    return {
      id: "finish",
      question: "",
      options: [],
      difficulty: "MEDIUM",
      isFinished: true,
      totalQuestions,
    };
  }

  // Kembalikan data soal (pastikan options adalah array of string)
  return {
    id: question.id,
    question: question.question,
    options: question.options as string[],
    difficulty: question.difficulty as Difficulty,
    isFinished: false,
    totalQuestions,
  };
}

/**
 * Verifikasi Jawaban di Server-Side (Mencegah manipulasi inspect element)
 */
export async function verifyAnswer(
  questionId: string, 
  selectedAnswer: string
): Promise<{ isCorrect: boolean; correctAnswer: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const question = await prisma.quizQuestion.findUnique({
    where: { id: questionId },
    select: { correctAnswer: true }
  });

  if (!question) throw new Error("Soal tidak ditemukan.");
  
  return {
    isCorrect: question.correctAnswer === selectedAnswer,
    correctAnswer: question.correctAnswer
  };
}

/**
 * Submit Skor Akhir ke Database
 */
export async function submitQuizScore(
  quizId: string,
  correctAnswers: number,
  incorrectAnswers: number,
  totalQuestions: number
) {
  const session = await auth();
  
  // Proteksi Role: Hanya Student & Class Leader
  if (!session?.user?.id || !["STUDENT", "CLASS_LEADER"].includes(session.user.role)) {
    throw new Error("Unauthorized: Anda tidak memiliki akses untuk menyimpan skor.");
  }

  // Kalkulasi Skor (Normalisasi ke 0-100)
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  // Kalkulasi Persentase Penyelesaian
  const completionPercentage = totalQuestions > 0
    ? Math.round(((correctAnswers + incorrectAnswers) / totalQuestions) * 100)
    : 0;

  try {
    // Gunakan upsert jika kamu ingin murid bisa mengulang kuis (menimpa skor lama)
    // Atau gunakan create jika ingin menyimpan riwayat setiap percobaan
    await prisma.quizScore.create({
      data: {
        quizId,
        studentId: session.user.id,
        score: Math.min(score, 100), // Safety cap 100
        correctAnswers,
        incorrectAnswers,
        completionPercentage,
      }
    });

    // Revalidasi data agar laporan guru & dashboard murid langsung update
    revalidatePath("/dashboard/teacher/quizzes");
    revalidatePath("/dashboard/teacher/reports");
    revalidatePath(`/dashboard/student/quizzes/${quizId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Critical Error submitting quiz score:", error);
    throw new Error("Gagal menyimpan hasil kuis ke database.");
  }
}