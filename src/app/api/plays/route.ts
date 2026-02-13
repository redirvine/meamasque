import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { plays } from "@/db/schema";
import { auth } from "../../../../auth";
import { z } from "zod";

const createPlaySchema = z.object({
  play: z.string().min(1),
  date: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allPlays = await db.query.plays.findMany({
    orderBy: (plays, { desc }) => [desc(plays.createdAt)],
  });
  return NextResponse.json(allPlays);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createPlaySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [play] = await db
    .insert(plays)
    .values({
      play: parsed.data.play,
      date: parsed.data.date ?? null,
      role: parsed.data.role ?? null,
      location: parsed.data.location ?? null,
      description: parsed.data.description ?? null,
    })
    .returning();

  return NextResponse.json(play, { status: 201 });
}
