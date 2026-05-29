import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { uploadToR2, deleteFromR2, getR2Key } from "@/lib/r2";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPG, PNG, GIF, WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size: 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let imageUrl: string;

    try {
      const key = getR2Key(session.user.id, file.name);
      imageUrl = await uploadToR2(key, buffer, file.type);
    } catch (uploadErr) {
      console.error("R2 upload failed:", uploadErr);
      const base64 = buffer.toString("base64");
      imageUrl = `data:${file.type};base64,${base64}`;
    }

    const prevImage = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    if (prevImage?.image && prevImage.image.startsWith("avatars/")) {
      try {
        await deleteFromR2(prevImage.image);
      } catch {}
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({ image: imageUrl });
  } catch (err) {
    console.error("Avatar upload error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    if (user?.image && user.image.startsWith("avatars/")) {
      try {
        await deleteFromR2(user.image);
      } catch {}
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Avatar delete error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
