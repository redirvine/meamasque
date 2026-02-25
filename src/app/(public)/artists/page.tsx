export const dynamic = "force-dynamic";

import { db } from "@/db";
import { artists } from "@/db/schema";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { auth } from "../../../../auth";

export const metadata = {
  title: "Artists - Meamasque",
  description: "Meet our family of artists",
};

export default async function ArtistsPage() {
  const [allArtists, session] = await Promise.all([
    db.query.artists.findMany({
      orderBy: (artists, { asc }) => [asc(artists.name)],
    }),
    auth(),
  ]);
  const isAdmin = !!session;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Artists</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allArtists.map((artist) => (
          <div key={artist.id} className="relative">
            {isAdmin && (
              <Link
                href={`/admin/artists?edit=${artist.id}`}
                className="absolute top-2 right-2 z-10 rounded-full bg-white/80 p-1.5 text-gray-500 shadow transition-colors hover:bg-white hover:text-gray-700"
                title="Edit artist"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            )}
            <Link href={`/artists/${artist.slug}`}>
              <Card className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle>{artist.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {artist.bio && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {artist.bio}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
