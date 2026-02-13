import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ancestors } from "@/db/schema";
import { auth } from "../../../../auth";
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
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allAncestors = await db.query.ancestors.findMany({
    orderBy: (ancestors, { asc }) => [asc(ancestors.name)],
  });
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
