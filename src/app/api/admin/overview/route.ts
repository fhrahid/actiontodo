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

    const [
      totalUsers,
      totalTasks,
      gemsResult,
      avgLevelResult,
      activeBans,
      recentBans,
      recentTasks,
      recentRegistrations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.task.count(),
      prisma.user.aggregate({ _sum: { gems: true } }),
      prisma.user.aggregate({ _avg: { level: true } }),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.banLog.findMany({
        take: 5,
        orderBy: { bannedAt: "desc" },
        include: { user: { select: { name: true } } },
      }),
      prisma.task.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { completed: true },
        include: { user: { select: { name: true } } },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { name: true, createdAt: true },
      }),
    ]);

    const recentActivity = [
      ...recentBans.map((b) => ({
        _id: b.id,
        user: b.user.name,
        action: "BANNED",
        details: b.reason,
        timestamp: b.bannedAt.toISOString(),
      })),
      ...recentTasks.map((t) => ({
        _id: t.id,
        user: t.user.name,
        action: "COMPLETED TASK",
        details: t.title,
        timestamp: t.createdAt.toISOString(),
      })),
      ...recentRegistrations.map((u) => ({
        _id: u.name,
        user: u.name,
        action: "REGISTERED",
        details: "New user",
        timestamp: u.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTasks,
        totalGems: gemsResult._sum.gems || 0,
        avgLevel: Math.round(avgLevelResult._avg.level || 0),
        activeBans,
      },
      recentActivity,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
