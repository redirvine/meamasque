import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { images } from "@/db/schema";
import { auth } from "../../../../../auth";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const updateImageSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  ancestorId: z.string().optional().nullable(),
  creatorUserId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  dateCreated: z.string().optional().nullable(),
  sortDate: z.string().optional().nullable(),
  visibility: z.enum(["public", "private"]).optional(),
  featured: z.boolean().optional(),
  slideshowOverlayText: z.string().optional().nullable(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const image = await db.query.images.findFirst({
    where: eq(images.id, id),
  });

  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(image);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateImageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.ancestorId !== undefined) updateData.ancestorId = data.ancestorId;
  if (data.creatorUserId !== undefined) updateData.creatorUserId = data.creatorUserId;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.dateCreated !== undefined) updateData.dateCreated = data.dateCreated;
  if (data.sortDate !== undefined)
    updateData.sortDate = data.sortDate ? new Date(data.sortDate) : null;
  if (data.visibility !== undefined) updateData.visibility = data.visibility;
  if (data.featured !== undefined) updateData.featured = data.featured;
  if (data.slideshowOverlayText !== undefined) updateData.slideshowOverlayText = data.slideshowOverlayText;

  const [updated] = await db
    .update(images)
    .set(updateData)
    .where(eq(images.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  logAudit({ userId: session.user?.id, userEmail: session.user?.email ?? "", action: "update", resource: "image", resourceId: id, detail: `Updated image '${updated.title}'` });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const image = await db.query.images.findFirst({
    where: eq(images.id, id),
  });

  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete from Vercel Blob
  try {
    await del(image.blobUrl);
  } catch {
    // Blob may not exist (dev mode), continue with DB deletion
  }

  // Delete thumbnail if present
  if (image.thumbnailUrl) {
    try {
      await del(image.thumbnailUrl);
    } catch {
      // Thumbnail may not exist, continue
    }
  }

  await db.delete(images).where(eq(images.id, id));

  logAudit({ userId: session.user?.id, userEmail: session.user?.email ?? "", action: "delete", resource: "image", resourceId: id, detail: `Deleted image '${image.title}'` });

  return NextResponse.json({ success: true });
}
