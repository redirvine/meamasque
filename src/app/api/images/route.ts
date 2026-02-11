import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { images } from "@/db/schema";
import { auth } from "../../../../auth";
import { eq, desc, and, like, SQL } from "drizzle-orm";
import { z } from "zod";

const createImageSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  blobUrl: z.string().min(1),
  artistId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  dateCreated: z.string().optional(),
  sortDate: z.string().optional(),
  visibility: z.enum(["public", "private"]).default("public"),
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
      artistId: data.artistId ?? null,
      categoryId: data.categoryId ?? null,
      dateCreated: data.dateCreated ?? null,
      sortDate: data.sortDate ? new Date(data.sortDate) : null,
      visibility: data.visibility,
    })
    .returning();

  return NextResponse.json(image, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get("artistId");
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");
  const visibility = searchParams.get("visibility");

  const conditions: SQL[] = [];

  if (artistId) conditions.push(eq(images.artistId, artistId));
  if (categoryId) conditions.push(eq(images.categoryId, categoryId));
  if (visibility === "public" || visibility === "private") {
    conditions.push(eq(images.visibility, visibility));
  }
  if (search) conditions.push(like(images.title, `%${search}%`));

  const results = await db
    .select()
    .from(images)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(images.createdAt));

  return NextResponse.json(results);
}
