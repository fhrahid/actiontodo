import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { rollGacha, isRareOrBetter } from "@/lib/gacha";
import { PRIORITY_CONFIG } from "@/lib/plants";
import { sendTaskCreated } from "@/lib/email";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const where: Record<string, unknown> = { userId: session.user.id };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status === "completed") {
      where.completed = true;
    } else if (status === "active") {
      where.completed = false;
    }

    if (priority) {
      where.priority = priority;
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
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

    const body = await request.json();
    const { title, category, priority, dueDate, description, reminder, reminderInterval } = body;

    const parsedInterval = Number.parseInt(String(reminderInterval ?? "0"), 10);
    const safeReminderInterval =
      reminder && Number.isFinite(parsedInterval) && parsedInterval > 0
        ? parsedInterval
        : 0;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    if (!priority) {
      return NextResponse.json(
        { error: "Priority is required" },
        { status: 400 }
      );
    }

    if (!dueDate) {
      return NextResponse.json(
        { error: "Due date is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = rollGacha(user.luck, user.gachaPity);

    const baseXP = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG]?.baseXP ?? 10;
    const xpAwarded = Math.round(baseXP * result.multiplier);

    const newGachaPity = isRareOrBetter(result.tier)
      ? 0
      : user.gachaPity + 1;

    await prisma.user.update({
      where: { id: user.id },
      data: { gachaPity: newGachaPity },
    });

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        category,
        priority,
        dueDate: new Date(dueDate),
        userId: session.user.id,
        gachaRarity: result.tier,
        xpAwarded,
        reminderEnabled: !!reminder,
        reminderInterval: safeReminderInterval,
      },
    });

    let emailStatus: { ok: boolean; id?: string | null; error?: string } | null = null;
    const targetEmail = user.notificationEmail ?? user.email;

    if (targetEmail) {
      const emailResult = await sendTaskCreated(
        targetEmail,
        user.name,
        title,
        description || "",
        category,
        priority,
        new Date(dueDate).toISOString(),
        safeReminderInterval
      );

      if (emailResult.ok) {
        emailStatus = { ok: true, id: emailResult.id };
      } else {
        emailStatus = { ok: false, error: emailResult.error };
        console.error("Task created but task-created email failed", {
          taskId: task.id,
          userId: user.id,
          error: emailResult.error,
        });
      }
    } else {
      emailStatus = { ok: false, error: "User has no destination email address" };
    }

    return NextResponse.json(
      {
        task,
        gachaResult: {
          tier: result.tier,
          multiplier: result.multiplier,
          xpAwarded,
        },
        emailStatus,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Task creation failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
