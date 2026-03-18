"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * Fungsi untuk mengambil analitik kuis secara mendalam.
 * Menjamin semua anggota kelas (Student & Class Leader) muncul di laporan,
 * meskipun mereka belum mengerjakan kuis.
 */
export async function getQuizAnalytics(quizId: string) {
  const session = await auth();
  
  // 1. Keamanan: Validasi Sesi
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Silakan login terlebih dahulu.");
  }

  try {
    // 2. Ambil metadata kuis untuk mendapatkan classId
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { classId: true, title: true }
    });

    if (!quiz) {
      throw new Error("Quiz tidak ditemukan.");
    }

    // 3. Query Utama: Mengambil semua anggota kelas yang relevan
    // Menggunakan include user & quizScores yang difilter spesifik untuk quizId ini
    const classMembers = await prisma.classMember.findMany({
      where: {
        classId: quiz.classId,
        role: { in: ["STUDENT", "CLASS_LEADER"] }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            quizScores: {
              where: { quizId: quizId },
              take: 1, // Mengambil skor terbaru jika ada multiple attempts
              orderBy: { createdAt: 'desc' },
              select: {
                score: true,
                correctAnswers: true,
                incorrectAnswers: true,
                completionPercentage: true,
                createdAt: true
              }
            }
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc' // Urutkan nama siswa sesuai abjad
        }
      }
    });

    // 4. Data Mapping & Logic Processing
    const report = classMembers.map(member => {
      // Ambil data skor (jika ada)
      const scoreRow = member.user.quizScores[0];
      const hasAttempted = !!scoreRow;

      return {
        studentId: member.user.id,
        studentName: member.user.name || "Siswa Tanpa Nama",
        studentEmail: member.user.email,
        hasAttempted: hasAttempted,
        
        // Logic: Score mentok di 100 dan dibulatkan
        score: hasAttempted 
          ? Math.min(Math.round(scoreRow.score), 100) 
          : 0,
        
        // Pastikan Correct/Incorrect tampil sebagai angka 0 jika belum mengerjakan
        correctAnswers: scoreRow?.correctAnswers ?? 0,
        incorrectAnswers: scoreRow?.incorrectAnswers ?? 0,
        
        completionPercentage: scoreRow?.completionPercentage ?? 0,
        
        // Status Timestamp untuk audit pengumpulan
        attemptedAt: hasAttempted ? scoreRow.createdAt : null,
      };
    });

    // 5. Return Clean Data ke Frontend
    return report;

  } catch (error) {
    // Logging internal untuk debugging
    console.error("Critical Error in getQuizAnalytics:", error);
    throw new Error("Gagal menghasilkan laporan analitik kuis.");
  }
}