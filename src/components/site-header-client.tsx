"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLinks } from "./nav-links";

export function SiteHeaderClient({ role }: { role: string | null }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isGallery = pathname === "/gallery" || pathname.startsWith("/gallery/");
  const minimal = isHome || isGallery;

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
        <NavLinks role={role} isHome={minimal} />
      </div>
    </header>
  );
}
