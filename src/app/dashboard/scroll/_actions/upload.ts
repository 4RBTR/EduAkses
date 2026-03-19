"use server";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadContributionFile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  // Higher limit maybe? Let's keep it 10MB or 20MB for PDFs
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("Ukuran file maksimal 20MB");
  }

  const ext = file.name.split(".").pop();
  const path = `contributions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const buffer = await file.arrayBuffer();
  const { error } = await supabaseAdmin.storage
    .from("file2") // reused from chat bucket
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) throw new Error(error.message);

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from("file2")
    .getPublicUrl(path);

  return {
    publicUrl,
    fileType: file.type.startsWith("image/") ? "image" : file.type.includes("pdf") ? "pdf" : "document",
    fileName: file.name
  };
}
