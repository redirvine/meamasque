export const dynamic = "force-dynamic";

import { db } from "@/db";
import { ancestors, images } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { hasFamilyAccess } from "@/lib/family-access";

export const metadata = {
  title: "Ancestors - Meamasque",
  description: "Family history and ancestors",
};

export default async function AncestorsPage() {
  const hasAccess = await hasFamilyAccess();
  if (!hasAccess) redirect("/family");

  const allAncestors = await db
    .select({
      id: ancestors.id,
      name: ancestors.name,
      slug: ancestors.slug,
      maidenName: ancestors.maidenName,
      relationship: ancestors.relationship,
      born: ancestors.born,
      died: ancestors.died,
      birthplace: ancestors.birthplace,
      photoUrl: images.blobUrl,
    })
    .from(ancestors)
    .leftJoin(images, eq(ancestors.photoId, images.id))
    .orderBy(ancestors.name);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Ancestors</h1>

      {allAncestors.length === 0 ? (
        <p className="text-gray-500">No ancestors added yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allAncestors.map((ancestor) => (
            <Link key={ancestor.id} href={`/ancestors/${ancestor.slug}`}>
              <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                {ancestor.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ancestor.photoUrl}
                    alt={ancestor.name}
                    className="h-48 w-full object-cover"
                  />
                )}
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold">
                    {ancestor.name}
                    {ancestor.maidenName && (
                      <span className="font-normal text-gray-500">
                        {" "}
                        (née {ancestor.maidenName})
                      </span>
                    )}
                  </h2>
                  {ancestor.relationship && (
                    <p className="text-sm text-gray-600">
                      {ancestor.relationship}
                    </p>
                  )}
                  {(ancestor.born || ancestor.died) && (
                    <p className="mt-1 text-sm text-gray-500">
                      {ancestor.born ?? "?"}
                      {" – "}
                      {ancestor.died ?? "?"}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
