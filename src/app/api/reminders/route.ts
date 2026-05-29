import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendTaskReminder } from "@/lib/email";

export async function POST() {
  try {
    const now = new Date();

    const tasks = await prisma.task.findMany({
      where: {
        reminderEnabled: true,
        reminderInterval: { gt: 0 },
        completed: false,
        dueDate: { gte: now },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, notificationEmail: true },
        },
      },
    });

    let sent = 0;
    let failed = 0;
    const failures: Array<{ taskId: string; userId: string; error: string }> = [];

    for (const task of tasks) {
      const intervalMs = task.reminderInterval * 60 * 1000;
      const lastSent = task.lastReminderSent;

      const targetEmail = task.user.notificationEmail ?? task.user.email;

      if (!targetEmail) {
        failed++;
        failures.push({
          taskId: task.id,
          userId: task.user.id,
          error: "User has no destination email address",
        });
        console.error("Task reminder skipped: user has no destination email", {
          taskId: task.id,
          userId: task.user.id,
        });
        continue;
      }

      if (!lastSent || (now.getTime() - lastSent.getTime()) >= intervalMs) {
        const emailResult = await sendTaskReminder(
          targetEmail,
          task.user.name,
          task.title,
          task.description || "",
          task.category,
          task.priority,
          task.dueDate.toISOString()
        );

        if (emailResult.ok) {
          await prisma.task.update({
            where: { id: task.id },
            data: { lastReminderSent: now },
          });

          sent++;
        } else {
          failed++;
          failures.push({
            taskId: task.id,
            userId: task.user.id,
            error: emailResult.error,
          });
          console.error("Task reminder email failed", {
            taskId: task.id,
            userId: task.user.id,
            error: emailResult.error,
          });
        }
      }
    }

    return NextResponse.json({ sent, failed, checked: tasks.length, failures });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
