import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { auth } from "../../../../auth";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
});

export async function GET() {
  const allCategories = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });
  return NextResponse.json(allCategories);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [category] = await db
    .insert(categories)
    .values({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
    })
    .returning();

  return NextResponse.json(category, { status: 201 });
}
