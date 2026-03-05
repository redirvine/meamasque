import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { logAudit } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  path: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  logAudit({
    userId: session.user?.id,
    userEmail: session.user?.email ?? "",
    action: "page_view",
    detail: `Viewed ${parsed.data.path}`,
  });

  return NextResponse.json({ ok: true });
}
