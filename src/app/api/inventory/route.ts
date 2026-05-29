import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";

const SLOT_MAP: Record<string, string> = {
  avatar: "activeAvatarId",
  card: "activeCardDesignId",
  head: "activeHeadId",
  face: "activeFaceId",
  body: "activeBodyId",
  aura: "activeAuraId",
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [items, user] = await Promise.all([
      prisma.userItem.findMany({
        where: { userId: session.user.id },
        include: { itemTemplate: true },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          activeAvatarId: true,
          activeCardDesignId: true,
          activeHeadId: true,
          activeFaceId: true,
          activeBodyId: true,
          activeAuraId: true,
        },
      }),
    ]);

    const mapped = items.map((ui) => {
      const t = ui.itemTemplate;
      const slotKey = SLOT_MAP[t.type === "equipment" && t.equipSlot ? t.equipSlot : t.type];
      const equippedId = slotKey ? (user as Record<string, unknown>)[slotKey] : null;
      return {
        id: ui.id,
        name: t.name,
        description: t.description || "",
        category: t.type,
        slot: t.equipSlot || null,
        tier: t.tier,
        imageData: t.imageData,
        equipped: equippedId === ui.id,
        templateId: t.id,
      };
    });

    return NextResponse.json({
      items: mapped,
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

    const { userItemId, action } = await request.json();

    if (!userItemId || !action) {
      return NextResponse.json(
        { error: "userItemId and action are required" },
        { status: 400 }
      );
    }

    if (action !== "equip" && action !== "unequip") {
      return NextResponse.json(
        { error: "Action must be 'equip' or 'unequip'" },
        { status: 400 }
      );
    }

    const userItem = await prisma.userItem.findUnique({
      where: { id: userItemId },
    });

    if (!userItem || userItem.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Item not found or not owned" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "equip") {
      const template = await prisma.itemTemplate.findUnique({
        where: { id: userItem.itemTemplateId },
      });

      if (!template) {
        return NextResponse.json(
          { error: "Item template not found" },
          { status: 404 }
        );
      }

      let slotField: string;

      if (template.type === "avatar") {
        slotField = "activeAvatarId";
      } else if (template.type === "card") {
        slotField = "activeCardDesignId";
      } else if (template.type === "equipment") {
        if (!template.equipSlot || !(template.equipSlot in SLOT_MAP)) {
          return NextResponse.json(
            { error: "Invalid equip slot" },
            { status: 400 }
          );
        }
        slotField = SLOT_MAP[template.equipSlot];
      } else {
        return NextResponse.json(
          { error: "Unknown item type" },
          { status: 400 }
        );
      }

      const prevEquippedId = (user as Record<string, unknown>)[slotField] as string | null;

      await prisma.$transaction([
        prisma.userItem.updateMany({
          where: {
            userId: session.user.id,
            equipped: true,
            itemTemplate: {
              OR: [
                { type: template.type },
                ...(template.type === "equipment" && template.equipSlot
                  ? [{ type: "equipment", equipSlot: template.equipSlot }]
                  : []),
              ],
            },
          },
          data: { equipped: false },
        }),
        prisma.userItem.update({
          where: { id: userItemId },
          data: { equipped: true },
        }),
        prisma.user.update({
          where: { id: session.user.id },
          data: { [slotField]: userItemId },
        }),
      ]);
    } else {
      const userItemWithTemplate = await prisma.userItem.findUnique({
        where: { id: userItemId },
        include: { itemTemplate: true },
      });

      if (userItemWithTemplate) {
        const template = userItemWithTemplate.itemTemplate;
        let slotField: string | null = null;

        if (template.type === "avatar") {
          slotField = "activeAvatarId";
        } else if (template.type === "card") {
          slotField = "activeCardDesignId";
        } else if (template.type === "equipment" && template.equipSlot && template.equipSlot in SLOT_MAP) {
          slotField = SLOT_MAP[template.equipSlot];
        }

        const updateData: Record<string, unknown> = {};
        if (slotField && (user as Record<string, unknown>)[slotField] === userItemId) {
          updateData[slotField] = null;
        }

        await prisma.$transaction([
          prisma.userItem.update({
            where: { id: userItemId },
            data: { equipped: false },
          }),
          ...(Object.keys(updateData).length > 0
            ? [
                prisma.user.update({
                  where: { id: session.user.id },
                  data: updateData,
                }),
              ]
            : []),
        ]);
      }
    }

    const [updatedItems] = await Promise.all([
      prisma.userItem.findMany({
        where: { userId: session.user.id },
        include: { itemTemplate: true },
      }),
    ]);
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        activeAvatarId: true,
        activeCardDesignId: true,
        activeHeadId: true,
        activeFaceId: true,
        activeBodyId: true,
        activeAuraId: true,
      },
    });
    const mapped = updatedItems.map((ui) => {
      const t = ui.itemTemplate;
      const slotKey = SLOT_MAP[t.type === "equipment" && t.equipSlot ? t.equipSlot : t.type];
      const equippedId = slotKey ? (updatedUser as Record<string, unknown>)[slotKey] : null;
      return {
        id: ui.id,
        name: t.name,
        description: t.description || "",
        category: t.type,
        slot: t.equipSlot || null,
        tier: t.tier,
        imageData: t.imageData,
        equipped: equippedId === ui.id,
        templateId: t.id,
      };
    });

    return NextResponse.json({ items: mapped });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
