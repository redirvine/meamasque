export const dynamic = "force-dynamic";

import { db } from "@/db";
import { siteAbout, images } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { auth } from "../../../../auth";

export const metadata = {
  title: "About - Mary Elizabeth Atwood",
  description: "About Mary Elizabeth Atwood",
};

export default async function AboutPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
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

      {isAdmin && (
        <div className="clear-both mt-8 flex justify-center">
          <Link
            href="/admin/about?redirect=/about"
            className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </div>
      )}
    </div>
  );
}
