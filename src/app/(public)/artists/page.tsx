import { db } from "@/db";
import { artists } from "@/db/schema";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Artists - Meamasque",
  description: "Meet our family of artists",
};

export default async function ArtistsPage() {
  const allArtists = await db.query.artists.findMany({
    orderBy: (artists, { asc }) => [asc(artists.name)],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Artists</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allArtists.map((artist) => (
          <Link key={artist.id} href={`/artists/${artist.slug}`}>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle>{artist.name}</CardTitle>
                {artist.relationship && (
                  <p className="text-sm text-gray-500">
                    {artist.relationship}
                  </p>
                )}
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
        ))}
      </div>
    </div>
  );
}
