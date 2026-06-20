import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@portfolioiq.com";
  const adminPassword = "adminpassword123";

  console.log(`Checking for existing admin user with email: ${adminEmail}...`);

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log("Admin account already exists. Updating role to admin...");
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: "admin" },
    });
    console.log("Admin role verified.");
    return;
  }

  console.log("Hashing password...");
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  console.log("Creating default admin account...");
  const adminUser = await prisma.user.create({
    data: {
      name: "System Admin",
      email: adminEmail,
      passwordHash,
      role: "admin",
    },
  });

  console.log(`Admin account created successfully!`);
  console.log(`Email: ${adminUser.email}`);
  console.log(`Password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error("Error seeding admin account:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
