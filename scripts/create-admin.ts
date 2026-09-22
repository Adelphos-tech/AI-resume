import "dotenv/config";

import { hashPassword } from "better-auth/crypto";

import { prisma } from "@/server/db";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "RoleRace Admin";

  if (!email || !password) {
    console.error(
      "Usage: ADMIN_EMAIL=<email> ADMIN_PASSWORD=<password> pnpm admin:create",
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`A user already exists for ${email}.`);
    process.exit(1);
  }

  const hashed = await hashPassword(password);
  const userId = crypto.randomUUID();

  await prisma.user.create({
    data: {
      id: userId,
      name,
      email,
      role: "ADMIN",
      accounts: {
        create: {
          id: crypto.randomUUID(),
          accountId: userId,
          providerId: "credential",
          password: hashed,
        },
      },
    },
  });

  console.log(`Admin user created for ${email} with role ADMIN.`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Failed to create admin user:", error);
  process.exit(1);
});
