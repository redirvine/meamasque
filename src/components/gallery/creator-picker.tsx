"use client";

import Link from "next/link";

interface Creator {
  id: string;
  name: string;
}

export function CreatorPicker({
  creators,
  currentId,
}: {
  creators: Creator[];
  currentId: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {creators.map((creator) => (
        <Link
          key={creator.id}
          href={`/gallery?ancestor=${creator.id}`}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            creator.id === currentId
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {creator.name}
        </Link>
      ))}
    </div>
  );
}
