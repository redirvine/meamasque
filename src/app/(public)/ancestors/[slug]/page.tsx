export const dynamic = "force-dynamic";

import { db } from "@/db";
import { ancestors, images, ancestorMemories, categories } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { auth } from "../../../../../auth";
import { CollapsibleSections } from "./collapsible-sections";
import { AncestorPhoto } from "./ancestor-photo";
import { CollapseToggle } from "./collapse-toggle";

export default async function AncestorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const isAdmin = !!session;

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

  const [memoryCountResult] = await db
    .select({ count: count() })
    .from(ancestorMemories)
    .where(eq(ancestorMemories.ancestorId, ancestor.id));
  const memoryCount = memoryCountResult?.count ?? 0;

  const works = await db
    .select({
      id: images.id,
      title: images.title,
      blobUrl: images.blobUrl,
      dateCreated: images.dateCreated,
      description: images.description,
      categoryName: categories.name,
    })
    .from(images)
    .leftJoin(categories, eq(images.categoryId, categories.id))
    .where(eq(images.ancestorId, ancestor.id))
    .orderBy(desc(images.createdAt));

  const grouped = new Map<string, typeof works>();
  for (const work of works) {
    const key = work.categoryName ?? "Other";
    const arr = grouped.get(key);
    if (arr) arr.push(work);
    else grouped.set(key, [work]);
  }

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
            <AncestorPhoto src={ancestor.photoUrl} name={ancestor.name} />
          )}
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <div className="flex items-start gap-2">
                <h1 className="text-3xl font-bold">
                  {ancestor.name}
                  {ancestor.maidenName && (
                    <span className="font-normal text-gray-500">
                      {" "}
                      (née {ancestor.maidenName})
                    </span>
                  )}
                </h1>
                {isAdmin && (
                  <Link
                    href={`/admin/ancestors?edit=${ancestor.id}`}
                    className="mt-1 flex-shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    title="Edit ancestor"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                )}
              </div>

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
            <div className="flex justify-end">
              <CollapseToggle />
            </div>
          </div>
        </div>

        <CollapsibleSections
          bio={ancestor.bio}
          memoryCount={memoryCount}
          ancestorId={ancestor.id}
          ancestorName={ancestor.name}
          photoGroups={Array.from(grouped.entries()).map(
            ([categoryName, imgs]) => ({
              categoryName,
              images: imgs.map((img) => ({
                id: img.id,
                title: img.title ?? "",
                blobUrl: img.blobUrl ?? "",
                dateCreated: img.dateCreated,
                description: img.description,
              })),
            })
          )}
          isAdmin={isAdmin}
          redirectPath={`/ancestors/${slug}`}
        />
      </article>
    </div>
  );
}
