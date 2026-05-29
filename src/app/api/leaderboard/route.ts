import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { getSignedAvatarUrl } from "@/lib/r2";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const rankings = await prisma.user.findMany({
      where: {
        hiddenFromRanking: false,
        role: { not: "admin" },
      },
      orderBy: { xp: "desc" },
      select: {
        id: true,
        name: true,
        level: true,
        xp: true,
        streak: true,
        totalTasksCompleted: true,
        gems: true,
        isCheater: true,
        isBanned: true,
        banExpiresAt: true,
        activeAvatarId: true,
        createdAt: true,
        image: true,
      },
    });

    const rankingsWithImages = await Promise.all(
      rankings.map(async (user) => {
        const signedImageUrl = user.image
          ? user.image.startsWith("avatars/")
            ? await getSignedAvatarUrl(user.image)
            : user.image
          : null;
        return { ...user, image: signedImageUrl };
      })
    );

    const weeklyWinner = await prisma.weeklyAward.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      rankings: rankingsWithImages,
      weeklyWinner,
      currentUserId: session?.user?.id ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
