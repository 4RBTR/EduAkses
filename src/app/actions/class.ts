"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

/**
 * Mendapatkan daftar kelas di mana user bersangkutan adalah TEACHER
 */
export async function getTeacherClasses() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("Unauthorized");
  }

  return await prisma.class.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
          role: "TEACHER",
        },
      },
    },
    include: {
      _count: {
        select: {
          members: true,
          assignments: true,
          quizzes: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Membuat kelas baru dan otomatis menjadikan pengirimnya sebagai pengajar
 */
export async function createClass(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return { error: "Hanya Guru yang dapat membuat kelas." };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    return { error: "Nama kelas wajib diisi." };
  }

  try {
    const newClass = await prisma.class.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: session.user.id,
            role: "TEACHER",
          },
        },
      },
    });

    revalidatePath("/dashboard/teacher");
    return { success: true, classId: newClass.id };
  } catch (error) {
    console.error("Create class error:", error);
    return { error: "Gagal membuat kelas. Silakan coba lagi." };
  }
}

/**
 * Siswa bergabung ke kelas menggunakan kode undangan
 */
export async function joinClass(inviteCode: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Silakan login terlebih dahulu." };
  }

  if (!inviteCode) {
    return { error: "Kode undangan wajib diisi." };
  }

  try {
    const targetClass = await prisma.class.findUnique({
      where: { inviteCode },
    });

    if (!targetClass) {
      return { error: "Kelas tidak ditemukan. Pastikan kode benar." };
    }

    // Cek apakah sudah bergabung
    const existingMembership = await prisma.classMember.findUnique({
      where: {
        userId_classId: {
          userId: session.user.id,
          classId: targetClass.id,
        },
      },
    });

    if (existingMembership) {
      return { error: "Anda sudah bergabung di kelas ini." };
    }

    await prisma.classMember.create({
      data: {
        userId: session.user.id,
        classId: targetClass.id,
        role: session.user.role as Role,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, className: targetClass.name };
  } catch (error) {
    console.error("Join class error:", error);
    return { error: "Gagal bergabung ke kelas." };
  }
}

/**
 * Mendapatkan daftar kelas di mana user bersangkutan adalah anggotanya
 */
export async function getStudentClasses() {
  const session = await auth();
  if (!session?.user) return [];

  return await prisma.class.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      _count: {
        select: {
          members: true,
          assignments: true,
          quizzes: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

