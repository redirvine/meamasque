export const dynamic = "force-dynamic";

import { db } from "@/db";
import { siteAbout, images } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata = {
  title: "About - Mary Elizabeth Atwood",
  description: "About Mary Elizabeth Atwood",
};

export default async function AboutPage() {
  const about = await db.query.siteAbout.findFirst();

  let photoUrl: string | null = null;
  if (about?.photoId) {
    const img = await db.query.images.findFirst({
      where: eq(images.id, about.photoId),
      columns: { blobUrl: true },
    });
    photoUrl = img?.blobUrl ?? null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={about?.name ?? "Mary Elizabeth Atwood"}
          className="w-2/5 rounded-lg object-contain"
        />
      )}

      <h1 className="mt-6 text-3xl font-bold">
        {about?.name ?? "Mary Elizabeth Atwood"}
      </h1>
      {about?.bio && (
        <div className="mt-4 prose prose-gray max-w-none whitespace-pre-wrap text-gray-700">
          {about.bio}
        </div>
      )}

      {about?.artistStatement && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Artist Statement</h2>
          <div className="prose prose-gray max-w-none whitespace-pre-wrap text-gray-700">
            {about.artistStatement}
          </div>
        </div>
      )}
    </div>
  );
}
