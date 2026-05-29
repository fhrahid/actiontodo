import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailSendResult =
  | { ok: true; id: string | null }
  | { ok: false; error: string };

function normalizeEmailError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown email error";
}

function hasResendKey(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function darkShonenWrapper(content: string): string {
  return `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; background: #0d0d1a; border: 2px solid #00e5ff; border-radius: 0; overflow: hidden;">
      <div style="background: linear-gradient(90deg, #00e5ff, #7c4dff, #00e5ff); height: 4px;"></div>
      <div style="padding: 32px;">
        ${content}
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #2a2a3e;">
          <p style="color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; text-align: center;">⚔️ ActionToDo — Gamified Task Warrior</p>
        </div>
      </div>
      <div style="background: linear-gradient(90deg, #00e5ff, #7c4dff, #00e5ff); height: 4px;"></div>
    </div>
  `;
}

export async function sendTaskCreated(
  email: string,
  userName: string,
  taskTitle: string,
  taskDescription: string,
  taskCategory: string,
  taskPriority: string,
  dueDate: string,
  reminderInterval: number
): Promise<EmailSendResult> {
  if (!hasResendKey()) {
    return { ok: false, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const intervalLabel = reminderInterval > 0
      ? `Every ${reminderInterval} minute${reminderInterval > 1 ? "s" : ""}`
      : "No reminders set";

    const result = await resend.emails.send({
      from: "ActionToDo <onboarding@resend.dev>",
      to: email,
      subject: `⚔️ New Mission Deployed: ${taskTitle}`,
      html: darkShonenWrapper(`
        <h1 style="color: #00e5ff; font-size: 22px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0;">⚔️ New Mission Deployed</h1>
        <p style="color: #ccc; font-size: 15px; margin: 0 0 12px 0;">Hey <strong style="color: #00e5ff;">${userName}</strong>,</p>
        <p style="color: #ccc; font-size: 15px; margin: 0 0 20px 0;">A new mission has been assigned to you:</p>
        <div style="background: #1a1a2e; border: 1px solid #2a2a3e; border-left: 3px solid #00e5ff; padding: 16px; margin: 0 0 20px 0;">
          <h2 style="color: #fff; font-size: 18px; margin: 0 0 8px 0;">${taskTitle}</h2>
          ${taskDescription ? `<p style="color: #999; font-size: 14px; margin: 0 0 12px 0;">${taskDescription}</p>` : ""}
          <p style="color: #00e5ff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Category: <span style="color: #fff;">${taskCategory}</span></p>
          <p style="color: #ff1744; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Priority: <span style="color: #fff;">${taskPriority}</span></p>
          <p style="color: #ffd600; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Due: <span style="color: #fff;">${new Date(dueDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span></p>
          <p style="color: #7c4dff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Reminders: <span style="color: #fff;">${intervalLabel}</span></p>
        </div>
        <p style="color: #999; font-size: 14px; margin: 0;">Complete this mission to earn XP and gacha rewards!</p>
      `),
    });
    if (result.error) {
      console.error("Resend task-created error:", result.error);
      return { ok: false, error: String(result.error.message || "Unknown email error") };
    }
    return { ok: true, id: result.data?.id || null };
  } catch (error) {
    console.error("Failed to send task created email:", error);
    return { ok: false, error: normalizeEmailError(error) };
  }
}

export async function sendTaskReminder(
  email: string,
  userName: string,
  taskTitle: string,
  taskDescription: string,
  taskCategory: string,
  taskPriority: string,
  dueDate: string
): Promise<EmailSendResult> {
  if (!hasResendKey()) {
    return { ok: false, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: "ActionToDo <onboarding@resend.dev>",
      to: email,
      subject: `⚔️ Reminder: ${taskTitle}`,
      html: darkShonenWrapper(`
        <h1 style="color: #ff1744; font-size: 22px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0;">⚠️ Mission Reminder</h1>
        <p style="color: #ccc; font-size: 15px; margin: 0 0 12px 0;">Hey <strong style="color: #00e5ff;">${userName}</strong>,</p>
        <p style="color: #ccc; font-size: 15px; margin: 0 0 20px 0;">Don't let this mission slip!</p>
        <div style="background: #1a1a2e; border: 1px solid #2a2a3e; border-left: 3px solid #ff1744; padding: 16px; margin: 0 0 20px 0;">
          <h2 style="color: #fff; font-size: 18px; margin: 0 0 8px 0;">${taskTitle}</h2>
          ${taskDescription ? `<p style="color: #999; font-size: 14px; margin: 0 0 12px 0;">${taskDescription}</p>` : ""}
          <p style="color: #00e5ff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Category: <span style="color: #fff;">${taskCategory}</span></p>
          <p style="color: #ff1744; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Priority: <span style="color: #fff;">${taskPriority}</span></p>
          <p style="color: #ffd600; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Due: <span style="color: #fff;">${new Date(dueDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span></p>
        </div>
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/tasks" style="display: inline-block; padding: 10px 24px; background: #00e5ff; color: #0d0d1a; text-decoration: none; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; font-size: 13px; border: none;">⚔️ View Missions</a>
      `),
    });
    if (result.error) {
      console.error("Resend reminder error:", result.error);
      return { ok: false, error: String(result.error.message || "Unknown email error") };
    }
    return { ok: true, id: result.data?.id || null };
  } catch (error) {
    console.error("Failed to send reminder email:", error);
    return { ok: false, error: normalizeEmailError(error) };
  }
}
