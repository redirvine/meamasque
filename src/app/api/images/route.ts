import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { images, categories } from "@/db/schema";
import { auth } from "../../../../auth";
import { eq, desc, and, like, SQL } from "drizzle-orm";
import { z } from "zod";

const createImageSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  blobUrl: z.string().min(1),
  ancestorId: z.string().optional().nullable(),
  creatorUserId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  dateCreated: z.string().optional(),
  sortDate: z.string().optional(),
  visibility: z.enum(["public", "private"]).default("public"),
  slideshowOverlayText: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createImageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const [image] = await db
    .insert(images)
    .values({
      title: data.title,
      description: data.description ?? null,
      blobUrl: data.blobUrl,
      ancestorId: data.ancestorId ?? null,
      creatorUserId: data.creatorUserId ?? null,
      categoryId: data.categoryId ?? null,
      dateCreated: data.dateCreated ?? null,
      sortDate: data.sortDate ? new Date(data.sortDate) : null,
      visibility: data.visibility,
      slideshowOverlayText: data.slideshowOverlayText ?? null,
    })
    .returning();

  return NextResponse.json(image, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ancestorId = searchParams.get("ancestorId");
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");
  const visibility = searchParams.get("visibility");

  const conditions: SQL[] = [];

  if (ancestorId) conditions.push(eq(images.ancestorId, ancestorId));
  if (categoryId) conditions.push(eq(images.categoryId, categoryId));
  if (visibility === "public" || visibility === "private") {
    conditions.push(eq(images.visibility, visibility));
  }
  if (search) conditions.push(like(images.title, `%${search}%`));

  const results = await db
    .select({
      id: images.id,
      title: images.title,
      description: images.description,
      blobUrl: images.blobUrl,
      ancestorId: images.ancestorId,
      creatorUserId: images.creatorUserId,
      categoryId: images.categoryId,
      dateCreated: images.dateCreated,
      sortDate: images.sortDate,
      visibility: images.visibility,
      featured: images.featured,
      createdAt: images.createdAt,
      categoryName: categories.name,
    })
    .from(images)
    .leftJoin(categories, eq(images.categoryId, categories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(images.createdAt));

  return NextResponse.json(results);
}
