"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function bulkCreateQuestions(quizId: string, rawText: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return { error: "Akses ditolak." };
  }

  if (!rawText.trim()) {
    return { error: "Teks kuis tidak boleh kosong." };
  }

  try {
    // Basic Parsing Logic
    // Format: 
    // Q: Question text
    // A: Opt1, Opt2, Opt3, Opt4
    // K: Correct Answer (Must match one of the options)
    
    const blocks = rawText.split(/\n\s*\n/); // Split by double newlines
    const questionsToCreate = [];

    for (const block of blocks) {
      const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
      let question = "";
      let options: string[] = [];
      let correctAnswer = "";

      for (const line of lines) {
        if (line.toUpperCase().startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (line.toUpperCase().startsWith("A:")) {
          options = line.substring(2).split(",").map(o => o.trim()).filter(Boolean);
        } else if (line.toUpperCase().startsWith("K:")) {
          correctAnswer = line.substring(2).trim();
        }
      }

      if (question && options.length >= 2 && correctAnswer) {
        // Ensure correct answer is in options
        if (!options.includes(correctAnswer)) {
          // If not exactly in options, try to find a close match or just add it
          console.warn(`Correct answer "${correctAnswer}" not in options for question: ${question}`);
        }
        
        questionsToCreate.push({
          question,
          options,
          correctAnswer,
          quizId
        });
      }
    }

    if (questionsToCreate.length === 0) {
      return { error: "Format teks tidak valid. Pastikan menggunakan format Q:, A:, K:." };
    }

    // Batch create
    await prisma.quizQuestion.createMany({
      data: questionsToCreate
    });

    revalidatePath(`/dashboard/teacher/quizzes/${quizId}`);
    return { success: true, count: questionsToCreate.length };
  } catch (error) {
    console.error("Bulk create quiz error:", error);
    return { error: "Gagal memproses teks kuis." };
  }
}
