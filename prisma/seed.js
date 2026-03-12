const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = await bcrypt.hash("masuk123", 10);

  // Create or Update Teacher
  const teacher = await prisma.user.upsert({
    where: { email: "guru@eduakses.com" },
    update: { password: defaultPassword },
    create: {
      email: "guru@eduakses.com",
      name: "Bapak Guru Budi",
      password: defaultPassword,
      role: "TEACHER",
    },
  });

  // Create or Update Student
  const student = await prisma.user.upsert({
    where: { email: "murid@eduakses.com" },
    update: { password: defaultPassword },
    create: {
      email: "murid@eduakses.com",
      name: "Andi Siswa",
      password: defaultPassword,
      role: "STUDENT",
    },
  });

  // Create or Update Class Leader
  const leader = await prisma.user.upsert({
    where: { email: "ketua@eduakses.com" },
    update: { password: defaultPassword },
    create: {
      email: "ketua@eduakses.com",
      name: "Bambang Ketua",
      password: defaultPassword,
      role: "CLASS_LEADER",
    },
  });

  // Create a Demo Class if none exists
  const existingClass = await prisma.class.findFirst();
  let demoClass;
  if (!existingClass) {
    demoClass = await prisma.class.create({
      data: {
        name: "XII IPA 1 (Kelas Demo)",
        members: {
          create: [
            { userId: teacher.id, role: "TEACHER" },
            { userId: leader.id, role: "CLASS_LEADER" },
            { userId: student.id, role: "STUDENT" }
          ]
        }
      }
    });
    console.log("Created Demo Class:", demoClass.name);
  }

  console.log("Seeding Database Selesai!");
  console.log("------------------------------------------");
  console.log("Guru  | Email: guru@eduakses.com  | Pass: masuk123");
  console.log("Murid | Email: murid@eduakses.com | Pass: masuk123");
  console.log("Ketua | Email: ketua@eduakses.com | Pass: masuk123");
  console.log("------------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
