"use server";

import { auth } from "@/auth";
import { extractTextFromPDF } from "@/lib/pdf-parser";

/**
 * Server Action to extract text from a PDF without any AI intervention.
 */
export async function extractTextFromPdfAction(base64Pdf: string) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "CLASS_LEADER")) {
    return { error: "Akses ditolak. Hanya Pengajar atau Ketua Kelas yang bisa menggunakan fitur ini." };
  }

  try {
    const buffer = Buffer.from(base64Pdf, "base64");
    const text = await extractTextFromPDF(buffer);

    if (!text || text.trim().length === 0) {
      return { error: "Gagal mengekstrak teks. Pastikan PDF memiliki teks yang bisa dibaca (bukan hasil scan gambar tanpa OCR)." };
    }

    return { success: true, data: text };
  } catch (error) {
    console.error("PDF Assistant Error:", error);
    return { error: "Terjadi kesalahan saat memproses file PDF." };
  }
}
