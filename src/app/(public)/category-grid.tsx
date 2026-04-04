"use client";

import Link from "next/link";
import { Drama } from "lucide-react";

export interface CategoryTile {
  label: string;
  href: string;
  imageUrl: string | null;
}

function TileImage({ tile }: { tile: CategoryTile }) {
  return tile.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={tile.imageUrl}
      alt={tile.label}
      className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
  ) : (
    <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <Drama className="h-12 w-12 text-gray-300" />
    </div>
  );
}

export function CategoryGrid({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {tiles.map((tile) => (
        <Link
          key={tile.href}
          href={tile.href}
          className="group relative block overflow-hidden transition-shadow hover:shadow-lg"
        >
          <TileImage tile={tile} />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-16">
            <span className="text-2xl font-bold text-white">
              {tile.label}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
