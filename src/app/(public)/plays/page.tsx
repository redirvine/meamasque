export const dynamic = "force-dynamic";

import { db } from "@/db";
import { plays, images } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { hasFamilyAccess } from "@/lib/family-access";

export const metadata = {
  title: "Plays - Meamasque",
  description: "Acting history and performances",
};

export default async function PlaysPage() {
  const hasAccess = await hasFamilyAccess();
  if (!hasAccess) redirect("/family");

  const allPlays = await db
    .select({
      id: plays.id,
      play: plays.play,
      date: plays.date,
      role: plays.role,
      location: plays.location,
      description: plays.description,
      year: plays.year,
      primaryImageUrl: images.blobUrl,
    })
    .from(plays)
    .leftJoin(images, eq(plays.primaryImageId, images.id))
    .orderBy(desc(plays.year), desc(plays.createdAt));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Plays</h1>

      {allPlays.length === 0 ? (
        <p className="text-gray-500">No plays added yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allPlays.map((p) => (
            <Card key={p.id} className="overflow-hidden transition-shadow hover:shadow-lg">
              {p.primaryImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.primaryImageUrl}
                  alt={p.play}
                  className="h-48 w-full object-cover"
                />
              )}
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold">{p.play}</h2>
                {p.role && (
                  <p className="text-sm text-gray-600">{p.role}</p>
                )}
                {p.year != null && (
                  <p className="mt-1 text-sm text-gray-500">{p.year}</p>
                )}
                {p.location && (
                  <p className="text-sm text-gray-500">{p.location}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
