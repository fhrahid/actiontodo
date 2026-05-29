import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { checkTaskCompletion, applyEscalatingBan } from "@/lib/antiCheat";
import { calculateLevel } from "@/lib/gamification";
import { rollBonusDrop, isRareOrBetter as isRareOrBetterGacha } from "@/lib/gacha";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(task);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, category, priority, dueDate, completed } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);

    let xpGained = 0;
    let bonusDrop: Record<string, unknown> | null = null;

    if (completed === true && !task.completed) {
      const antiCheatResult = await checkTaskCompletion(session.user.id, id);

      if (antiCheatResult.flagged) {
        updateData.isFlagged = true;

        const baseXP = task.xpAwarded / (task.gachaRarity === "common" ? 1 : 1);
        xpGained = Math.round(baseXP * antiCheatResult.xpReduction);

        if (antiCheatResult.shouldBan) {
          await applyEscalatingBan(session.user.id, antiCheatResult.reason || "Suspicious activity");
        }
      } else {
        xpGained = task.xpAwarded;
      }

      updateData.completed = true;
      updateData.completedAt = new Date();

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const previousLevel = calculateLevel(user.xp);
      const newXp = user.xp + xpGained;
      const newLevel = calculateLevel(newXp);
      const levelGain = newLevel - previousLevel;

      const today = new Date().toISOString().split("T")[0];
      const completedDates = [...user.completedDates, today];

      const dropResult = rollBonusDrop(user.luck, user.dropPity);

      let gemsToAdd = levelGain > 0 ? levelGain * 10 : 0;
      let newDropPity = user.dropPity;

      if (dropResult.type === "gems" && dropResult.gemAmount) {
        gemsToAdd += dropResult.gemAmount;
        newDropPity = 0;
      } else if (dropResult.type === "item") {
        newDropPity = 0;

        const eligibleTemplates = await prisma.itemTemplate.findMany({
          where: {
            type: dropResult.itemType,
            tier: dropResult.tier,
            isGachaEligible: true,
            isActive: true,
          },
        });

        if (eligibleTemplates.length > 0) {
          const randomTemplate =
            eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)];

          const existingItem = await prisma.userItem.findUnique({
            where: {
              userId_itemTemplateId: {
                userId: session.user.id,
                itemTemplateId: randomTemplate.id,
              },
            },
          });

          if (!existingItem) {
            await prisma.userItem.create({
              data: {
                userId: session.user.id,
                itemTemplateId: randomTemplate.id,
                obtainedVia: "drop",
              },
            });
          }
        }
      } else {
        newDropPity = isRareOrBetterGacha(dropResult.tier || "common")
          ? 0
          : user.dropPity + 1;
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: newXp,
          level: newLevel,
          gems: user.gems + gemsToAdd,
          totalTasksCompleted: user.totalTasksCompleted + 1,
          completedDates,
          dropPity: newDropPity,
        },
      });

      bonusDrop = { ...dropResult };
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      task: updatedTask,
      xpGained,
      bonusDrop,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ message: "Task deleted" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
