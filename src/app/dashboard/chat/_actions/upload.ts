"use server";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";

// Server-side Supabase client using SERVICE ROLE KEY (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Add this to .env
);

export async function uploadChatFile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  // 10MB limit
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Ukuran file maksimal 10MB");
  }

  const ext = file.name.split(".").pop();
  const path = `chat/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const buffer = await file.arrayBuffer();
  const { error } = await supabaseAdmin.storage
    .from("file2")
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
    attachmentType: file.type.startsWith("image/") ? "image" : "document",
  };
}
