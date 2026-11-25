
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@townexpress.local";
  const password = (
    globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env?.ADMIN_INITIAL_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error(
      "Set ADMIN_INITIAL_PASSWORD to a password of at least 12 characters"
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "TownExpress Administrator",
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin account ready:", admin.email);
}

main()
  .catch((error) => {
    console.error(error);
    (globalThis as typeof globalThis & {
      process: { exit(code: number): never };
    }).process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
