import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { calculateAndAwardWeeklyBonus } from "@/lib/weeklyAward";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await calculateAndAwardWeeklyBonus();

    if (!result) {
      return NextResponse.json(
        { message: "No award given this week (already awarded or no eligible tasks)" },
        { status: 200 }
      );
    }

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
