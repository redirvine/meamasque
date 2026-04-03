"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, Settings, LogIn, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/gallery?category=masks", label: "Masks" },
  { href: "/gallery?category=mixed-media", label: "Mixed Media" },
  { href: "/gallery?category=poems", label: "Poems" },
  { href: "/gallery?category=paintings", label: "Paintings" },
  { href: "/gallery?category=drawings", label: "Drawings" },
  { href: "/plays", label: "Plays" },
  { href: "/ancestors", label: "Ancestors" },
];

function isActive(
  linkHref: string,
  pathname: string,
  searchParams: URLSearchParams
): boolean {
  if (linkHref.startsWith("/gallery?category=")) {
    const category = linkHref.split("category=")[1];
    return pathname === "/gallery" && searchParams.get("category") === category;
  }
  if (linkHref === "/plays") {
    return pathname.startsWith("/plays");
  }
  if (linkHref === "/ancestors") {
    return pathname.startsWith("/ancestors");
  }
  return false;
}

export function NavLinks({ role, isHome = false }: { role: string | null; isHome?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // On homepage, hide all nav links (they're shown as image tiles)
  const visibleLinks = isHome ? [] : navLinks;

  const linkClass = isHome
    ? "text-sm font-medium text-gray-600 hover:text-gray-900"
    : "text-sm font-medium text-gray-300 hover:text-white";
  const activeLinkClass = isHome
    ? "text-sm font-medium text-gray-900"
    : "text-sm font-medium text-white";
  const iconBtnClass = isHome
    ? "text-gray-900 hover:bg-gray-100"
    : "text-white hover:bg-white/10";

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-6 sm:flex">
        {visibleLinks.map((link) => {
          const active = isActive(link.href, pathname, searchParams);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={active ? activeLinkClass : linkClass}
            >
              {link.label}
            </Link>
          );
        })}
        {role === "admin" && (
          <Link
            href="/admin"
            className={`flex items-center gap-1 ${linkClass}`}
          >
            <Settings className="h-3 w-3" />
            Admin
          </Link>
        )}
        {role ? (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`flex items-center gap-1 ${linkClass}`}
          >
            <LogOut className="h-3 w-3" />
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className={`flex items-center gap-1 ${linkClass}`}
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>
        )}
      </nav>

      {/* Mobile nav */}
      <Sheet>
        <SheetTrigger asChild className="sm:hidden">
          <Button variant="ghost" size="icon" className={iconBtnClass}>
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64 bg-white">
          <SheetTitle className="text-lg font-bold text-gray-900">Menu</SheetTitle>
          <nav className="mt-6 flex flex-col gap-4">
            {visibleLinks.map((link) => {
              const active = isActive(link.href, pathname, searchParams);
              return (
                <SheetClose key={link.href} asChild>
                  <Link
                    href={link.href}
                    className={
                      active
                        ? "border-l-2 border-gray-900 pl-2 text-sm font-medium text-gray-900"
                        : "text-sm font-medium text-gray-600 hover:text-gray-900"
                    }
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              );
            })}
            {role === "admin" && (
              <SheetClose asChild>
                <Link
                  href="/admin"
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  <Settings className="h-3 w-3" />
                  Admin
                </Link>
              </SheetClose>
            )}
            <SheetClose asChild>
              {role ? (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-3 w-3" />
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              )}
            </SheetClose>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
