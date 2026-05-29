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

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const users = await prisma.user.findMany({
      where: { role: { not: "admin" }, hiddenFromRanking: false },
      select: {
        id: true,
        name: true,
        tasks: {
          where: {
            completed: true,
            completedAt: { gte: weekStart },
          },
        },
      },
    });

    const topUsers = users
      .map((u) => ({
        id: "",
        userId: u.id,
        userName: u.name,
        tasksCompleted: u.tasks.length,
        weekEnd: now.toISOString(),
        gemsAwarded: 0,
      }))
      .filter((u) => u.tasksCompleted > 0)
      .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
      .slice(0, 10);

    return NextResponse.json({ topUsers });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
