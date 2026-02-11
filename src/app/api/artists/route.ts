import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { artists } from "@/db/schema";
import { auth } from "../../../../auth";
import { z } from "zod";

const createArtistSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  bio: z.string().optional(),
  relationship: z.string().optional(),
});

export async function GET() {
  const allArtists = await db.query.artists.findMany({
    orderBy: (artists, { asc }) => [asc(artists.name)],
  });
  return NextResponse.json(allArtists);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createArtistSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [artist] = await db
    .insert(artists)
    .values({
      name: parsed.data.name,
      slug: parsed.data.slug,
      bio: parsed.data.bio ?? null,
      relationship: parsed.data.relationship ?? null,
    })
    .returning();

  return NextResponse.json(artist, { status: 201 });
}
