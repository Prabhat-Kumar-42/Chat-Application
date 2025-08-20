import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("secret123", 10);

  await prisma.user.deleteMany({
    where: { email: { in: ["alice@example.com", "bob@example.com"] } },
  });

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    create: { name: "Alice", email: "alice@example.com", passwordHash: hash },
    update: {},
  });
  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    create: { name: "Bob", email: "bob@example.com", passwordHash: hash },
    update: {},
  });

  console.log("✅ Seeded:", { alice: alice.email, bob: bob.email });
}

main().finally(() => prisma.$disconnect());
