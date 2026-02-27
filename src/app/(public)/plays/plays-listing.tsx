"use client";

import { Camera, BookOpen, Pencil } from "lucide-react";
import Link from "next/link";

type Play = {
  id: string;
  play: string;
  date: string | null;
  role: string | null;
  location: string | null;
  description: string | null;
  year: number | null;
  primaryImageUrl: string | null;
  imageCount: number;
  memoryCount: number;
};

export function PlaysListing({ plays, isAdmin = false }: { plays: Play[]; isAdmin?: boolean }) {
  return (
    <div className="space-y-4">
      {plays.map((p) => (
        <Link
          key={p.id}
          href={`/plays/${p.id}`}
          className="relative flex gap-5 rounded-lg border p-4 transition-shadow hover:shadow-md"
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
              src={p.primaryImageUrl}
              alt={p.play}
              className="h-32 w-32 flex-shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="h-32 w-32 flex-shrink-0 rounded-md bg-gray-100" />
          )}
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">{p.play}</h2>
            {p.role && (
              <p className="text-sm text-gray-600">{p.role}</p>
            )}
            {(p.year != null || p.date) && (
              <p className="mt-1 text-sm text-gray-500">
                {p.year ?? p.date}
              </p>
            )}
            {p.location && (
              <p className="text-sm text-gray-500">{p.location}</p>
            )}
            {p.description && (
              <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm text-gray-700">
                {p.description}
              </p>
            )}
            {(p.imageCount > 0 || p.memoryCount > 0) && (
              <div className="mt-2 flex gap-3">
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
