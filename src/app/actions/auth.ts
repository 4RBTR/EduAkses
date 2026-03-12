"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export async function registerUser(prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const roleValue = formData.get("role") as string;

  if (!name || !email || !password || !roleValue) {
    return { error: "Semua kolom (Nama, Email, Password, Role) wajib diisi." };
  }

  // Basic validation
  if (password.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }

  const role = roleValue as Role;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email sudah terdaftar. Silakan gunakan email lain atau login." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to Database
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Terjadi kesalahan internal. Gagal mendaftar." };
  }

  // Redirect on success
  redirect("/login?registered=true");
}
