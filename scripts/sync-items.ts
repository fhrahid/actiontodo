import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const { ITEM_CATALOG } = await import("../src/lib/itemCatalog.js");

  console.log(`📦 Syncing ${ITEM_CATALOG.length} items from catalog...`);
  let seeded = 0;
  let updated = 0;
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
          requiredLevel: (item as any).requiredLevel || 0,
          requiredTasks: (item as any).requiredTasks || 0,
        },
      });
      seeded++;
    } else {
      await prisma.itemTemplate.update({
        where: { id: item.id },
        data: {
          name: item.name,
          type: item.type,
          tier: item.tier,
          description: item.description,
          imageData: item.imageData,
          gemPrice: item.gemPrice,
          equipSlot: (item as any).equipSlot || null,
          isGachaEligible: (item as any).isGachaEligible !== undefined ? (item as any).isGachaEligible : true,
          requiredLevel: (item as any).requiredLevel || 0,
          requiredTasks: (item as any).requiredTasks || 0,
        },
      });
      updated++;
    }
  }
  console.log(`✅ Seeded ${seeded} new items, updated ${updated} existing items`);

  const admins = await prisma.user.findMany({ where: { role: "admin", hiddenFromRanking: false } });
  for (const a of admins) {
    await prisma.user.update({ where: { id: a.id }, data: { hiddenFromRanking: true } });
  }
  if (admins.length > 0) console.log(`✅ ${admins.length} admin(s) hidden from rankings`);

  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (admin) {
    const allTemplates = await prisma.itemTemplate.findMany({ select: { id: true } });
    const owned = await prisma.userItem.findMany({
      where: { userId: admin.id },
      select: { itemTemplateId: true },
    });
    const ownedIds = new Set(owned.map((o) => o.itemTemplateId));
    const missing = allTemplates.filter((t) => !ownedIds.has(t.id));
    for (const t of missing) {
      await prisma.userItem.create({
        data: { userId: admin.id, itemTemplateId: t.id, obtainedVia: "admin_grant" },
      });
    }
    console.log(`✅ Admin now owns all ${allTemplates.length} items (granted ${missing.length} new)`);
  }

  const total = await prisma.itemTemplate.count();
  console.log(`📊 Total items in DB: ${total}`);
  const byType = await prisma.itemTemplate.groupBy({ by: ["type"], _count: true });
  for (const g of byType) console.log(`   ${g.type}: ${g._count}`);

  console.log("🎉 Done!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
