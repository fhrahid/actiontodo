import prisma from "./db";

interface AntiCheatResult {
  flagged: boolean;
  reason?: string;
  xpReduction: number;
  shouldBan: boolean;
  banDuration?: string;
}

export async function checkTaskCompletion(userId: string, taskId: string): Promise<AntiCheatResult> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { flagged: false, xpReduction: 1, shouldBan: false };

  const now = new Date();
  const created = new Date(task.createdAt);
  const minutesSinceCreation = (now.getTime() - created.getTime()) / 60000;

  if (minutesSinceCreation < 5) {
    return {
      flagged: true,
      reason: `Task completed in ${Math.round(minutesSinceCreation)} minutes (min 5 required)`,
      xpReduction: 0,
      shouldBan: false,
    };
  }

  const oneHourAgo = new Date(now.getTime() - 3600000);
  const recentCompletions = await prisma.task.count({
    where: {
      userId,
      completed: true,
      completedAt: { gte: oneHourAgo },
    },
  });

  if (recentCompletions > 20) {
    return {
      flagged: true,
      reason: `${recentCompletions} tasks completed in the last hour (max 20)`,
      xpReduction: 0.5,
      shouldBan: true,
    };
  }

  const duplicateTitles = await prisma.task.count({
    where: {
      userId,
      title: task.title,
      completed: true,
      createdAt: { gte: new Date(now.getTime() - 86400000) },
    },
  });

  if (duplicateTitles > 5) {
    return {
      flagged: true,
      reason: `"${task.title}" completed ${duplicateTitles} times in 24 hours`,
      xpReduction: 0.5,
      shouldBan: false,
    };
  }

  return { flagged: false, xpReduction: 1, shouldBan: false };
}

export async function applyEscalatingBan(userId: string, reason: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const warnings = user.cheatWarnings + 1;
  let duration: string;
  let banDays: number | null = null;

  switch (warnings) {
    case 1: duration = "warning"; break;
    case 2: duration = "3d"; banDays = 3; break;
    case 3: duration = "5d"; banDays = 5; break;
    case 4: duration = "7d"; banDays = 7; break;
    case 5: duration = "30d"; banDays = 30; break;
    default: duration = "permanent"; break;
  }

  const expiresAt = banDays ? new Date(Date.now() + banDays * 86400000) : duration === "permanent" ? null : undefined;

  await prisma.user.update({
    where: { id: userId },
    data: {
      cheatWarnings: warnings,
      isCheater: warnings >= 2,
      ...(duration !== "warning" ? {
        isBanned: true,
        banExpiresAt: expiresAt,
      } : {}),
    },
  });

  await prisma.banLog.create({
    data: {
      userId,
      reason,
      duration,
      ...(expiresAt ? { expiresAt } : {}),
    },
  });
}
