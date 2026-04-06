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

function Overlay({ label }: { label: string }) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-16">
      <span className="text-2xl font-bold text-white">{label}</span>
    </div>
  );
}

export function CategoryGrid({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <div className="space-y-12">
      {/* Option 1: object-contain in 4:3 box */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-700">
          Option 1 — Contain in 4:3 box (no crop, may letterbox)
        </h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {tiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group relative block overflow-hidden bg-gray-900 transition-shadow hover:shadow-lg"
            >
              {tile.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tile.imageUrl}
                  alt={tile.label}
                  className="aspect-[4/3] w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Drama className="h-12 w-12 text-gray-300" />
                </div>
              )}
              <Overlay label={tile.label} />
            </Link>
          ))}
        </div>
      </section>

      {/* Option 2: No fixed aspect ratio, natural height */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-700">
          Option 2 — Natural image size (no crop, uneven heights)
        </h2>
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
                  className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Drama className="h-12 w-12 text-gray-300" />
                </div>
              )}
              <Overlay label={tile.label} />
            </Link>
          ))}
        </div>
      </section>

      {/* Option 3: Square aspect ratio */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-700">
          Option 3 — Square tiles (less crop for portrait images)
        </h2>
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
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Drama className="h-12 w-12 text-gray-300" />
                </div>
              )}
              <Overlay label={tile.label} />
            </Link>
          ))}
        </div>
      </section>

      {/* Option 4: Current style (4:3 object-cover) for comparison */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-700">
          Option 4 — Current style (4:3, object-cover, crops to fit)
        </h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {tiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group relative block overflow-hidden transition-shadow hover:shadow-lg"
            >
              <TileImage tile={tile} />
              <Overlay label={tile.label} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
