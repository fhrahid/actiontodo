import prisma from "./db";

export async function calculateAndAwardWeeklyBonus(): Promise<{
  winnerId: string;
  tasksCompleted: number;
  gemsAwarded: number;
} | null> {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const existingAward = await prisma.weeklyAward.findFirst({
    where: { weekStart: { lte: now }, weekEnd: { gte: now } },
  });
  if (existingAward) return null;

  const result = await prisma.task.groupBy({
    by: ["userId"],
    where: {
      completed: true,
      completedAt: { gte: weekStart, lt: weekEnd },
      isFlagged: false,
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 1,
  });

  if (result.length === 0) return null;

  const winner = result[0];
  const gemsAwarded = 50;

  await prisma.weeklyAward.create({
    data: {
      userId: winner.userId,
      weekStart,
      weekEnd,
      gemsAwarded,
    },
  });

  await prisma.user.update({
    where: { id: winner.userId },
    data: { gems: { increment: gemsAwarded } },
  });

  return {
    winnerId: winner.userId,
    tasksCompleted: winner._count.id,
    gemsAwarded,
  };
}
