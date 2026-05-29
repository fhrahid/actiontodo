import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, itemTemplateId } = body;

    if (!userId || !itemTemplateId) {
      return NextResponse.json(
        { error: "User ID and item template ID are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.userItem.findUnique({
      where: {
        userId_itemTemplateId: { userId, itemTemplateId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already owns this item" },
        { status: 409 }
      );
    }

    await prisma.userItem.create({
      data: {
        userId,
        itemTemplateId,
        obtainedVia: "admin_gift",
      },
    });

    return NextResponse.json({ message: "Gifted" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
