"use client";

import Link from "next/link";
import { Drama } from "lucide-react";

export interface CategoryTile {
  label: string;
  href: string;
  imageUrl: string | null;
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
          {tile.imageUrl ? (
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
          )}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-3 pt-8">
            <span
              className="text-lg font-semibold text-white"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}
            >
              {tile.label}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
