
import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma.js";

async function main() {
  const adminEmail = "admin@townexpress.com";
  const adminPassword = "Admin12345!";

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (existingAdmin) {
    console.log("Admin account already exists.");
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // Create admin account
  const admin = await prisma.user.create({
    data: {
      name: "TownExpress Administrator",
      email: adminEmail,
      passwordHash: hashedPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("Admin account created successfully!");
  console.log("Admin ID:", admin.id);
  console.log("Email:", admin.email);
}

main()
  .catch((error) => {
    console.error("ADMIN SEED ERROR:", error);
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
