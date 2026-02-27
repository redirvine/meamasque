import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ancestors, ancestorMemories, images } from "@/db/schema";
import { auth } from "../../../../auth";
import { eq, sql, count } from "drizzle-orm";
import { z } from "zod";

const createAncestorSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  maidenName: z.string().optional().nullable(),
  relationship: z.string().optional().nullable(),
  birthplace: z.string().optional().nullable(),
  born: z.string().optional().nullable(),
  deathPlace: z.string().optional().nullable(),
  died: z.string().optional().nullable(),
  spouse: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  immigration: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  photoId: z.string().optional().nullable(),
});

export async function GET() {
  const memoryCountSq = db
    .select({
      ancestorId: ancestorMemories.ancestorId,
      count: count().as("memory_count"),
    })
    .from(ancestorMemories)
    .groupBy(ancestorMemories.ancestorId)
    .as("mc");

  const allAncestors = await db
    .select({
      id: ancestors.id,
      name: ancestors.name,
      slug: ancestors.slug,
      maidenName: ancestors.maidenName,
      relationship: ancestors.relationship,
      birthplace: ancestors.birthplace,
      born: ancestors.born,
      deathPlace: ancestors.deathPlace,
      died: ancestors.died,
      spouse: ancestors.spouse,
      occupation: ancestors.occupation,
      immigration: ancestors.immigration,
      bio: ancestors.bio,
      photoId: ancestors.photoId,
      photoUrl: images.blobUrl,
      createdAt: ancestors.createdAt,
      memoryCount: sql<number>`coalesce(${memoryCountSq.count}, 0)`.as("memoryCount"),
    })
    .from(ancestors)
    .leftJoin(images, eq(ancestors.photoId, images.id))
    .leftJoin(memoryCountSq, eq(ancestors.id, memoryCountSq.ancestorId))
    .orderBy(ancestors.name);

  return NextResponse.json(allAncestors);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createAncestorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [ancestor] = await db
    .insert(ancestors)
    .values({
      name: parsed.data.name,
      slug: parsed.data.slug,
      maidenName: parsed.data.maidenName ?? null,
      relationship: parsed.data.relationship ?? null,
      birthplace: parsed.data.birthplace ?? null,
      born: parsed.data.born ?? null,
      deathPlace: parsed.data.deathPlace ?? null,
      died: parsed.data.died ?? null,
      spouse: parsed.data.spouse ?? null,
      occupation: parsed.data.occupation ?? null,
      immigration: parsed.data.immigration ?? null,
      bio: parsed.data.bio ?? null,
      photoId: parsed.data.photoId ?? null,
    })
    .returning();

  return NextResponse.json(ancestor, { status: 201 });
}
