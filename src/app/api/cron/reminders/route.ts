import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminderRes = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/reminders`, {
      method: "POST",
    });
    const data = await reminderRes.json();

    return NextResponse.json({ status: "ok", ...data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
