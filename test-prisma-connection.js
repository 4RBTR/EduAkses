const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 15));
  try {
    const userCount = await prisma.user.count();
    console.log('Success! User count:', userCount);
  } catch (e) {
    console.error('Error during prisma test:');
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
