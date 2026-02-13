export const dynamic = "force-dynamic";

import { db } from "@/db";
import { ancestors, images } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { hasFamilyAccess } from "@/lib/family-access";

export default async function AncestorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const hasAccess = await hasFamilyAccess();
  if (!hasAccess) redirect("/family");

  const { slug } = await params;

  const results = await db
    .select({
      id: ancestors.id,
      name: ancestors.name,
      slug: ancestors.slug,
      maidenName: ancestors.maidenName,
      relationship: ancestors.relationship,
      birthplace: ancestors.birthplace,
      born: ancestors.born,
      deathPlace: ancestors.deathPlace,
      died: ancestors.died,
      spouse: ancestors.spouse,
      occupation: ancestors.occupation,
      immigration: ancestors.immigration,
      bio: ancestors.bio,
      photoUrl: images.blobUrl,
    })
    .from(ancestors)
    .leftJoin(images, eq(ancestors.photoId, images.id))
    .where(eq(ancestors.slug, slug))
    .limit(1);

  const ancestor = results[0];
  if (!ancestor) notFound();

  const details = [
    { label: "Relationship", value: ancestor.relationship },
    { label: "Maiden Name", value: ancestor.maidenName },
    { label: "Born", value: ancestor.born },
    { label: "Birthplace", value: ancestor.birthplace },
    { label: "Died", value: ancestor.died },
    { label: "Death Place", value: ancestor.deathPlace },
    { label: "Spouse", value: ancestor.spouse },
    { label: "Occupation", value: ancestor.occupation },
    { label: "Immigration", value: ancestor.immigration },
  ].filter((d) => d.value);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/ancestors"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        All Ancestors
      </Link>

      <article>
        <div className="flex flex-col gap-6 sm:flex-row">
          {ancestor.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ancestor.photoUrl}
              alt={ancestor.name}
              className="h-64 w-64 flex-shrink-0 rounded-lg object-cover"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">
              {ancestor.name}
              {ancestor.maidenName && (
                <span className="font-normal text-gray-500">
                  {" "}
                  (née {ancestor.maidenName})
                </span>
              )}
            </h1>

            {details.length > 0 && (
              <dl className="mt-4 space-y-2">
                {details.map((d) => (
                  <div key={d.label} className="flex gap-2">
                    <dt className="text-sm font-medium text-gray-500 w-28 flex-shrink-0">
                      {d.label}
                    </dt>
                    <dd className="text-sm text-gray-900">{d.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        {ancestor.bio && (
          <div className="mt-8">
            <h2 className="mb-3 text-xl font-semibold">Biography</h2>
            <div className="prose prose-gray max-w-none whitespace-pre-wrap text-gray-700">
              {ancestor.bio}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
