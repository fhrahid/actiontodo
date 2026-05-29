import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        level: true,
        xp: true,
        streak: true,
        gems: true,
        totalTasksCompleted: true,
        isBanned: true,
        banExpiresAt: true,
        createdAt: true,
        luck: true,
        gachaPity: true,
        dropPity: true,
        cheatWarnings: true,
        isCheater: true,
        hiddenFromRanking: true,
        _count: {
          select: {
            tasks: true,
            banLogs: true,
            inventory: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, luck, gems, isBanned, reason, duration, hiddenFromRanking } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (luck !== undefined) {
      updateData.luck = luck;
    }

    if (gems !== undefined) {
      updateData.gems = { increment: gems };
    }

    if (isBanned !== undefined) {
      updateData.isBanned = isBanned;

      if (isBanned) {
        if (!reason) {
          return NextResponse.json(
            { error: "Reason is required when banning" },
            { status: 400 }
          );
        }

        const durationMs = duration
          ? parseDuration(duration)
          : 7 * 24 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + durationMs);

        updateData.banExpiresAt = expiresAt;

        await prisma.banLog.create({
          data: {
            userId,
            reason,
            duration: duration || "7d",
            expiresAt,
          },
        });
      } else {
        updateData.banExpiresAt = null;
      }
    }

    if (hiddenFromRanking !== undefined) {
      updateData.hiddenFromRanking = hiddenFromRanking;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ message: "User updated" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function parseDuration(d: string): number {
  const match = d.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "s": return value * 1000;
    case "m": return value * 60 * 1000;
    case "h": return value * 60 * 60 * 1000;
    case "d": return value * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}
