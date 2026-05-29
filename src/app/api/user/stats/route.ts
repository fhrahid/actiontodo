import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { getSignedAvatarUrl } from "@/lib/r2";
import { xpForNextLevel, getTitle } from "@/lib/gamification";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id") || searchParams.get("userId") || session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        notificationEmail: true,
        role: true,
        xp: true,
        level: true,
        streak: true,
        gems: true,
        theme: true,
        totalTasksCompleted: true,
        completedDates: true,
        isCheater: true,
        activeAvatarId: true,
        activeCardDesignId: true,
        activeHeadId: true,
        activeFaceId: true,
        activeBodyId: true,
        activeAuraId: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const activeIds = [
      user.activeAvatarId,
      user.activeCardDesignId,
      user.activeHeadId,
      user.activeFaceId,
      user.activeBodyId,
      user.activeAuraId,
    ].filter(Boolean) as string[];

    const [equippedItems, totalItems, allItems] = await Promise.all([
      activeIds.length > 0
        ? prisma.userItem.findMany({
            where: { id: { in: activeIds } },
            include: { itemTemplate: true },
          })
        : [],
      prisma.userItem.count({ where: { userId } }),
      prisma.userItem.findMany({
        where: { userId },
        include: { itemTemplate: true },
        orderBy: { obtainedAt: "desc" },
        take: 5,
      }),
    ]);

    const tierBreakdown: Record<string, number> = {};
    const allOwned = await prisma.userItem.findMany({
      where: { userId },
      include: { itemTemplate: { select: { tier: true } } },
    });
    for (const oi of allOwned) {
      const t = oi.itemTemplate.tier;
      tierBreakdown[t] = (tierBreakdown[t] || 0) + 1;
    }

    const equippedMap: Record<string, string | null> = {
      avatar: null,
      head: null,
      face: null,
      body: null,
      aura: null,
      cardDesign: null,
      cardDesignClasses: null,
    };
    for (const ei of equippedItems) {
      const t = ei.itemTemplate;
      if (t.type === "avatar") equippedMap.avatar = t.imageData;
      else if (t.type === "card") {
        equippedMap.cardDesign = t.name;
        equippedMap.cardDesignClasses = t.imageData;
      } else if (t.type === "equipment" && t.equipSlot) {
        (equippedMap as Record<string, string | null>)[t.equipSlot] = t.imageData;
      }
    }

    const xpInfo = xpForNextLevel(user.xp);
    const title = getTitle(user.level);

    const signedImageUrl = user.image
      ? user.image.startsWith("avatars/")
        ? await getSignedAvatarUrl(user.image)
        : user.image
      : null;

    const profileData = {
      id: user.id,
      name: user.name,
      level: user.level,
      xp: xpInfo.current,
      xpToNext: xpInfo.needed,
      totalTasks: user.totalTasksCompleted,
      streak: user.streak,
      gems: user.gems,
      title,
      avatar: equippedMap.avatar,
      cardDesign: equippedMap.cardDesign,
      cardDesignClasses: equippedMap.cardDesignClasses,
      equippedHead: equippedMap.head,
      equippedFace: equippedMap.face,
      equippedBody: equippedMap.body,
      equippedAura: equippedMap.aura,
      image: signedImageUrl,
      totalItems,
      tierBreakdown,
      recentPulls: allItems.map((oi) => ({
        name: oi.itemTemplate.name,
        tier: oi.itemTemplate.tier,
        imageData: oi.itemTemplate.type === "card" ? "🃏" : oi.itemTemplate.imageData,
      })),
      notificationEmail: userId === session.user.id ? user.notificationEmail : null,
    };

    return NextResponse.json({
      user: { id: user.id, name: user.name, gems: user.gems, level: user.level },
      ...profileData,
      equippedItems,
      totalItems,
    });
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

    const body = await request.json();
    const incomingName =
      typeof body.name === "string" ? body.name.trim() : undefined;
    const incomingNotificationEmail =
      typeof body.notificationEmail === "string"
        ? body.notificationEmail.trim().toLowerCase()
        : undefined;

    const updateData: { name?: string; notificationEmail?: string | null } = {};

    if (incomingName !== undefined) {
      if (!incomingName) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 }
        );
      }
      updateData.name = incomingName;
    }

    if (incomingNotificationEmail !== undefined) {
      if (incomingNotificationEmail === "") {
        updateData.notificationEmail = null;
      } else if (!emailRegex.test(incomingNotificationEmail)) {
        return NextResponse.json(
          { error: "Invalid notification email format" },
          { status: 400 }
        );
      } else {
        updateData.notificationEmail = incomingNotificationEmail;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        notificationEmail: true,
      },
    });

    return NextResponse.json({
      message: "Profile updated",
      user: updatedUser,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
