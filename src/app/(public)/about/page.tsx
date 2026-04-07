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
          alt="Mary Elizabeth Atwood"
          className="float-left mr-6 mb-4 w-2/5 rounded-lg object-contain"
        />
      )}

      {about?.bio ? (
        <div className="prose prose-gray max-w-none whitespace-pre-wrap text-gray-700">
          {about.bio}
        </div>
      ) : (
        <p className="text-gray-500">No information yet.</p>
      )}
    </div>
  );
}
