export const dynamic = "force-dynamic";

import { db } from "@/db";
import { plays, images } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Play</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allPlays.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.primaryImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.primaryImageUrl}
                      alt={p.play}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-gray-100" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{p.play}</TableCell>
                <TableCell>{p.role}</TableCell>
                <TableCell>{p.year ?? p.date}</TableCell>
                <TableCell>{p.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
