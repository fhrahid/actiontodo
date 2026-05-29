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

    const templates = await prisma.itemTemplate.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { userItems: true },
        },
      },
    });

    return NextResponse.json({ templates });
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
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, type, tier, description, imageData, gemPrice, equipSlot, isGachaEligible } = body;

    if (!name || !type || !tier || !imageData) {
      return NextResponse.json(
        { error: "Name, type, tier, and imageData are required" },
        { status: 400 }
      );
    }

    const template = await prisma.itemTemplate.create({
      data: {
        name,
        type,
        tier,
        description: description || null,
        imageData,
        gemPrice: gemPrice ?? null,
        equipSlot: equipSlot ?? null,
        isGachaEligible: isGachaEligible ?? true,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, isGachaEligible, isActive, gemPrice } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Item template ID is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (isGachaEligible !== undefined) updateData.isGachaEligible = isGachaEligible;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (gemPrice !== undefined) updateData.gemPrice = gemPrice;

    const template = await prisma.itemTemplate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ template });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
