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

    const [templates, owned, user] = await Promise.all([
      prisma.itemTemplate.findMany({ where: { isActive: true } }),
      prisma.userItem.findMany({
        where: { userId: session.user.id },
        select: { itemTemplateId: true },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { level: true, totalTasksCompleted: true },
      }),
    ]);

    return NextResponse.json({
      items: templates,
      ownedIds: owned.map((i: { itemTemplateId: string }) => i.itemTemplateId),
      userLevel: user?.level ?? 0,
      userTasks: user?.totalTasksCompleted ?? 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemTemplateId } = await request.json();
    if (!itemTemplateId) {
      return NextResponse.json(
        { error: "itemTemplateId is required" },
        { status: 400 }
      );
    }

    const template = await prisma.itemTemplate.findUnique({
      where: { id: itemTemplateId },
    });

    if (!template || !template.isActive) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    if (template.gemPrice === null) {
      return NextResponse.json(
        { error: "Item is not purchasable" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (template.requiredLevel > 0 && user.level < template.requiredLevel) {
      return NextResponse.json(
        { error: `Requires level ${template.requiredLevel}` },
        { status: 400 }
      );
    }

    if (template.requiredTasks > 0 && user.totalTasksCompleted < template.requiredTasks) {
      return NextResponse.json(
        { error: `Requires ${template.requiredTasks} completed tasks` },
        { status: 400 }
      );
    }

    if (user.gems < template.gemPrice) {
      return NextResponse.json(
        { error: "Not enough gems" },
        { status: 400 }
      );
    }

    const existing = await prisma.userItem.findUnique({
      where: {
        userId_itemTemplateId: {
          userId: session.user.id,
          itemTemplateId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already own this item" },
        { status: 400 }
      );
    }

    const [userItem] = await prisma.$transaction([
      prisma.userItem.create({
        data: {
          userId: session.user.id,
          itemTemplateId,
          obtainedVia: "purchase",
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { gems: user.gems - template.gemPrice },
      }),
    ]);

    return NextResponse.json({
      message: "Purchased",
      userItem,
      gemsRemaining: user.gems - template.gemPrice,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
