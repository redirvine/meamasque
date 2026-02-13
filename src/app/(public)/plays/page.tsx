export const dynamic = "force-dynamic";

import { db } from "@/db";
import { plays } from "@/db/schema";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { hasFamilyAccess } from "@/lib/family-access";

export const metadata = {
  title: "Plays - Meamasque",
  description: "Acting history and performances",
};

export default async function PlaysPage() {
  const hasAccess = await hasFamilyAccess();
  if (!hasAccess) redirect("/family");

  const allPlays = await db
    .select()
    .from(plays)
    .orderBy(desc(plays.createdAt));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Plays</h1>

      {allPlays.length === 0 ? (
        <p className="text-gray-500">No plays added yet.</p>
      ) : (
        <div className="space-y-6">
          {allPlays.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border p-6"
            >
              <h2 className="text-xl font-semibold">{p.play}</h2>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                {p.role && <span>Role: {p.role}</span>}
                {p.date && <span>{p.date}</span>}
                {p.location && <span>{p.location}</span>}
              </div>
              {p.description && (
                <p className="mt-3 whitespace-pre-wrap text-gray-700">
                  {p.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
