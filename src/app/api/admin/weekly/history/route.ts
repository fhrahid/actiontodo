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

    const awards = await prisma.weeklyAward.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: { select: { name: true } },
      },
    });

    const history = awards.map((a) => ({
      id: a.id,
      userId: a.userId,
      userName: a.user.name,
      tasksCompleted: 0,
      weekEnd: a.weekEnd.toISOString(),
      gemsAwarded: a.gemsAwarded,
    }));

    return NextResponse.json({ history });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
