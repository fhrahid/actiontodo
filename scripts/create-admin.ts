import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const args = process.argv.slice(2);
  const emailArg = args.find((a) => a.startsWith("--email="));
  const passwordArg = args.find((a) => a.startsWith("--password="));
  const nameArg = args.find((a) => a.startsWith("--name="));

  if (!emailArg || !passwordArg || !nameArg) {
    console.log("Usage: npm run create-admin -- --email=admin@example.com --password=secret --name=Admin");
    process.exit(1);
  }

  const email = emailArg.split("=")[1];
  const password = passwordArg.split("=")[1];
  const name = nameArg.split("=")[1];

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("❌ User with this email already exists");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: "admin", level: 10, xp: 1000, gems: 9999 },
  });

  console.log(`✅ Admin created: ${user.name} (${user.email})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
