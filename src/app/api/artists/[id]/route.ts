import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { artists } from "@/db/schema";
import { auth } from "../../../../../auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateArtistSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  bio: z.string().optional().nullable(),
  relationship: z.string().optional().nullable(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const artist = await db.query.artists.findFirst({
    where: eq(artists.id, id),
  });

  if (!artist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(artist);
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
  const parsed = updateArtistSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(artists)
    .set(parsed.data)
    .where(eq(artists.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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
  await db.delete(artists).where(eq(artists.id, id));

  return NextResponse.json({ success: true });
}
