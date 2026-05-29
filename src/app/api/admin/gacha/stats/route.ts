import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const items = await prisma.itemTemplate.findMany({
      where: { isGachaEligible: true, isActive: true },
      select: { tier: true },
    });

    const stats: Record<string, number> = {};
    for (const item of items) {
      stats[item.tier] = (stats[item.tier] || 0) + 1;
    }

    const ownedByTier = await prisma.userItem.groupBy({
      by: ["itemTemplateId"],
      _count: true,
    });

    const ownedItems = await prisma.itemTemplate.findMany({
      where: { id: { in: ownedByTier.map((o) => o.itemTemplateId) } },
      select: { id: true, tier: true },
    });

    const ownedStats: Record<string, number> = {};
    for (const ob of ownedByTier) {
      const item = ownedItems.find((i) => i.id === ob.itemTemplateId);
      if (item) {
        ownedStats[item.tier] = (ownedStats[item.tier] || 0) + ob._count;
      }
    }

    return NextResponse.json({
      stats: { ...stats, ...Object.fromEntries(Object.entries(ownedStats).map(([k, v]) => [`${k}_owned`, v])) },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
