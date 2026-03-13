export const dynamic = "force-dynamic";

import { db } from "@/db";
import { siteAbout } from "@/db/schema";

export const metadata = {
  title: "About - Mary Elizabeth Atwood",
  description: "About Mary Elizabeth Atwood",
};

export default async function AboutPage() {
  const about = await db.query.siteAbout.findFirst();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{about?.name ?? "Mary Elizabeth Atwood"}</h1>
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
