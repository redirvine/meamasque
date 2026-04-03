"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { NavLinks } from "./nav-links";

const categoryLabels: Record<string, string> = {
  masks: "Masks",
  "mixed-media": "Mixed Media",
  poems: "Poems",
  paintings: "Paintings",
  drawings: "Drawings",
  theatre: "Theatre",
  clay: "Clay",
};

export function SiteHeaderClient({ role }: { role: string | null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHome = pathname === "/";
  const isGallery = pathname === "/gallery" || pathname.startsWith("/gallery/");
  const minimal = isHome || isGallery;

  const categorySlug = isGallery ? searchParams.get("category") : null;
  const categoryLabel = categorySlug ? categoryLabels[categorySlug] ?? categorySlug : null;

  return (
    <header
      className={
        minimal
          ? "sticky top-0 z-50 bg-white"
          : "sticky top-0 z-50 border-b border-gray-700 bg-gray-800/95 backdrop-blur"
      }
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className={`text-base sm:text-xl font-bold tracking-tight truncate mr-2 ${
            minimal ? "text-gray-900" : "text-white"
          }`}
        >
          Mary Elizabeth Atwood
        </Link>
        {categoryLabel ? (
          <span className="text-sm font-medium text-gray-500">{categoryLabel}</span>
        ) : (
          <NavLinks role={role} isHome={minimal} />
        )}
      </div>
    </header>
  );
}
