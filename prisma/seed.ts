import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const ITEM_CATALOG = [
  { id: "avatar_student", name: "Student", type: "avatar", tier: "common", gemPrice: 5, imageData: "😊", description: "A cheerful student ready to learn" },
  { id: "avatar_worker", name: "Office Worker", type: "avatar", tier: "common", gemPrice: 5, imageData: "💼", description: "Professional and focused" },
  { id: "avatar_casual", name: "Casual", type: "avatar", tier: "common", gemPrice: 5, imageData: "😎", description: "Laid-back and cool" },
  { id: "avatar_sporty", name: "Sporty", type: "avatar", tier: "common", gemPrice: 5, imageData: "🏃", description: "Always on the move" },
  { id: "avatar_mage", name: "Mage", type: "avatar", tier: "uncommon", gemPrice: 15, imageData: "🧙", description: "Wielder of arcane magic" },
  { id: "avatar_knight", name: "Knight", type: "avatar", tier: "uncommon", gemPrice: 15, imageData: "⚔️", description: "Brave and honorable" },
  { id: "avatar_ninja", name: "Ninja", type: "avatar", tier: "uncommon", gemPrice: 15, imageData: "🥷", description: "Silent and deadly" },
  { id: "avatar_celestial", name: "Celestial Guardian", type: "avatar", tier: "rare", gemPrice: 30, imageData: "✨", description: "Blessed by the stars" },
  { id: "avatar_forest", name: "Forest Spirit", type: "avatar", tier: "rare", gemPrice: 30, imageData: "🍃", description: "One with nature" },
  { id: "avatar_crystal", name: "Crystal Mage", type: "avatar", tier: "epic", gemPrice: 60, imageData: "💎", description: "Power crystallized into form" },
  { id: "avatar_shadow", name: "Shadow Warrior", type: "avatar", tier: "epic", gemPrice: 60, imageData: "🌑", description: "Born from darkness" },
  { id: "avatar_dragon", name: "Dragon Tamer", type: "avatar", tier: "legendary", gemPrice: 120, imageData: "🐉", description: "Commands the ancient dragons" },
  { id: "avatar_emperor", name: "Celestial Emperor", type: "avatar", tier: "mythic", gemPrice: null, imageData: "👑", description: "Ruler of all realms", isGachaEligible: false },
  { id: "card_basic", name: "Basic", type: "card", tier: "common", gemPrice: 5, imageData: "border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100", description: "Clean and simple" },
  { id: "card_minimal", name: "Minimal", type: "card", tier: "common", gemPrice: 5, imageData: "border-gray-200 bg-white", description: "Less is more" },
  { id: "card_classic", name: "Classic", type: "card", tier: "common", gemPrice: 5, imageData: "border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50", description: "Timeless elegance" },
  { id: "card_retro", name: "Retro", type: "card", tier: "common", gemPrice: 5, imageData: "border-orange-300 bg-gradient-to-br from-orange-50 to-red-50", description: "Old school vibes" },
  { id: "card_sakura", name: "Sakura", type: "card", tier: "uncommon", gemPrice: 15, imageData: "border-pink-300 bg-gradient-to-br from-pink-50 to-rose-100", description: "Cherry blossom dreams" },
  { id: "card_ocean", name: "Ocean Wave", type: "card", tier: "uncommon", gemPrice: 15, imageData: "border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-100", description: "Calm ocean waves" },
  { id: "card_starry", name: "Starry Night", type: "card", tier: "uncommon", gemPrice: 15, imageData: "border-indigo-300 bg-gradient-to-br from-indigo-50 to-violet-100", description: "Under the stars" },
  { id: "card_golden", name: "Golden Frame", type: "card", tier: "rare", gemPrice: 30, imageData: "border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-100", description: "Touched by gold" },
  { id: "card_crystal_glow", name: "Crystal Glow", type: "card", tier: "rare", gemPrice: 30, imageData: "border-cyan-400 bg-gradient-to-br from-cyan-50 to-teal-100", description: "Crystalline beauty" },
  { id: "card_aurora", name: "Aurora", type: "card", tier: "epic", gemPrice: 60, imageData: "border-emerald-400 bg-gradient-to-br from-green-50 via-cyan-50 to-purple-100", description: "Northern lights" },
  { id: "card_nebula", name: "Nebula", type: "card", tier: "epic", gemPrice: 60, imageData: "border-purple-400 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100", description: "Cosmic wonder" },
  { id: "card_temple", name: "Cherry Blossom Temple", type: "card", tier: "legendary", gemPrice: 120, imageData: "border-rose-400 bg-gradient-to-br from-rose-50 via-pink-50 to-red-100", description: "Sacred garden temple" },
  { id: "card_cosmic", name: "Cosmic Throne", type: "card", tier: "mythic", gemPrice: null, imageData: "border-violet-500 bg-gradient-to-br from-violet-100 via-purple-100 to-indigo-200", description: "Seat of the cosmos", isGachaEligible: false },
  { id: "equip_straw_hat", name: "Straw Hat", type: "equipment", tier: "common", gemPrice: 5, equipSlot: "head", imageData: "👒", description: "A simple straw hat" },
  { id: "equip_bandana", name: "Bandana", type: "equipment", tier: "common", gemPrice: 5, equipSlot: "head", imageData: "🎗️", description: "Cool headwear" },
  { id: "equip_glasses", name: "Glasses", type: "equipment", tier: "common", gemPrice: 5, equipSlot: "face", imageData: "👓", description: "Smart and stylish" },
  { id: "equip_sunglasses", name: "Sunglasses", type: "equipment", tier: "common", gemPrice: 5, equipSlot: "face", imageData: "🕶️", description: "Too cool for school" },
  { id: "equip_simple_cape", name: "Simple Cape", type: "equipment", tier: "common", gemPrice: 5, equipSlot: "body", imageData: "🧥", description: "A basic cape" },
  { id: "equip_soft_glow", name: "Soft Glow", type: "equipment", tier: "common", gemPrice: 5, equipSlot: "aura", imageData: "💫", description: "A gentle aura" },
  { id: "equip_crown", name: "Crown", type: "equipment", tier: "uncommon", gemPrice: 15, equipSlot: "head", imageData: "👑", description: "Fit for royalty" },
  { id: "equip_mask", name: "Mystery Mask", type: "equipment", tier: "uncommon", gemPrice: 15, equipSlot: "face", imageData: "🎭", description: "Hide your identity" },
  { id: "equip_flower_crown", name: "Flower Crown", type: "equipment", tier: "uncommon", gemPrice: 15, equipSlot: "head", imageData: "💐", description: "Nature's crown" },
  { id: "equip_crystal_armor", name: "Crystal Armor", type: "equipment", tier: "rare", gemPrice: 30, equipSlot: "body", imageData: "🛡️", description: "Forged from crystals" },
  { id: "equip_fire_aura", name: "Fire Aura", type: "equipment", tier: "rare", gemPrice: 30, equipSlot: "aura", imageData: "🔥", description: "Burning with determination" },
  { id: "equip_dragon_horns", name: "Dragon Horns", type: "equipment", tier: "epic", gemPrice: 60, equipSlot: "head", imageData: "🦌", description: "Ancient dragon power" },
  { id: "equip_crystal_eye", name: "Crystal Eye", type: "equipment", tier: "epic", gemPrice: 60, equipSlot: "face", imageData: "👁️", description: "Sees all, knows all" },
  { id: "equip_cosmic_aura", name: "Cosmic Aura", type: "equipment", tier: "legendary", gemPrice: 120, equipSlot: "aura", imageData: "🌌", description: "The universe within" },
  { id: "equip_worldender", name: "Worldender Robe", type: "equipment", tier: "mythic", gemPrice: null, equipSlot: "body", imageData: "⚡", description: "Power beyond mortal comprehension", isGachaEligible: false },
];

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  const adminEmail = "admin@bloomdo.com";
  const adminPassword = "Admin@12345";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        level: 10,
        xp: 1000,
        gems: 9999,
      },
    });
    console.log("✅ Admin account created:");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
  } else {
    console.log("⚠️  Admin account already exists, skipping...");
  }

  const demoUser = await prisma.user.findUnique({ where: { email: "demo@bloomdo.com" } });
  if (!demoUser) {
    const hashedDemoPassword = await bcrypt.hash("Demo@12345", 12);
    await prisma.user.create({
      data: {
        name: "Demo User",
        email: "demo@bloomdo.com",
        password: hashedDemoPassword,
        role: "user",
        level: 3,
        xp: 250,
        gems: 30,
        completedDates: [new Date().toISOString()],
      },
    });
    console.log("✅ Demo user created:");
    console.log(`   Email: demo@bloomdo.com`);
    console.log(`   Password: Demo@12345`);
  }

  console.log("📦 Seeding item templates...");
  let seeded = 0;
  for (const item of ITEM_CATALOG) {
    const existing = await prisma.itemTemplate.findFirst({ where: { id: item.id } });
    if (!existing) {
      await prisma.itemTemplate.create({
        data: {
          id: item.id,
          name: item.name,
          type: item.type,
          tier: item.tier,
          description: item.description,
          imageData: item.imageData,
          gemPrice: item.gemPrice,
          equipSlot: (item as any).equipSlot || null,
          isGachaEligible: (item as any).isGachaEligible !== undefined ? (item as any).isGachaEligible : true,
        },
      });
      seeded++;
    }
  }
  console.log(`✅ Seeded ${seeded} new item templates (${ITEM_CATALOG.length} total)`);

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
