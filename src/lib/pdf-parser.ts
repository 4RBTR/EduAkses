const pdf = require("pdf-parse/lib/pdf-parse.js");


/**
 * Extracts text from a PDF Buffer using pdf-parse v1.1.1 (Stable Node version)
 * @param buffer PDF file buffer
 * @returns Extracted text content
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    console.log("Memulai ekstraksi PDF (v1.1.1), buffer size:", buffer.length);
    
    const data = await pdf(buffer);
    
    console.log("Ekstraksi berhasil, panjang teks:", data.text?.length || 0);
    return data.text || "";
  } catch (error: any) {
    console.error("PDF Parsing Error detail:", error);
    throw new Error(`Gagal mengekstrak teks: ${error.message || "Pastikan file adalah PDF yang valid"}`);
  }
}



