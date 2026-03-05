"use client";

import { Camera, BookOpen, Drama, Pencil } from "lucide-react";
import Link from "next/link";

type Play = {
  id: string;
  play: string;
  role: string | null;
  location: string | null;
  description: string | null;
  year: number | null;
  primaryImageUrl: string | null;
  primaryImageThumbnailUrl?: string | null;
  imageCount: number;
  memoryCount: number;
};

export function PlaysListing({ plays, isAdmin = false }: { plays: Play[]; isAdmin?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {plays.map((p) => (
        <Link
          key={p.id}
          href={`/plays/${p.id}`}
          className="group relative flex flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
        >
          {isAdmin && (
            <span
              onClick={(e) => e.stopPropagation()}
              className="absolute top-2 right-2 z-10"
            >
              <Link
                href={`/admin/plays?edit=${p.id}`}
                className="rounded-full bg-white/80 p-1.5 text-gray-400 shadow transition-colors hover:bg-white hover:text-gray-700"
                title="Edit play"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            </span>
          )}
          {p.primaryImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.primaryImageThumbnailUrl ?? p.primaryImageUrl}
              alt={p.play}
              className="aspect-[3/2] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[3/2] w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Drama className="h-12 w-12 text-gray-300" />
            </div>
          )}
          <div className="flex flex-1 flex-col p-4">
            <h2 className="text-lg font-semibold">{p.play}</h2>
            {p.role && (
              <p className="text-sm text-gray-600">{p.role}</p>
            )}
            <div className="mt-1 flex gap-2 text-sm text-gray-500">
              {p.year != null && <span>{p.year}</span>}
              {p.year != null && p.location && <span>&middot;</span>}
              {p.location && <span>{p.location}</span>}
            </div>
            {p.description && (
              <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm text-gray-700">
                {p.description}
              </p>
            )}
            {(p.imageCount > 0 || p.memoryCount > 0) && (
              <div className="mt-auto flex gap-3 pt-3">
                {p.imageCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-sm text-blue-600">
                    <Camera className="h-3.5 w-3.5" />
                    {p.imageCount} {p.imageCount === 1 ? "photo" : "photos"}
                  </span>
                )}
                {p.memoryCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-sm text-blue-600">
                    <BookOpen className="h-3.5 w-3.5" />
                    {p.memoryCount} {p.memoryCount === 1 ? "memory" : "memories"}
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
