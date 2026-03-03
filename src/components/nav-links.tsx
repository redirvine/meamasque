"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LogIn, Menu, Settings } from "lucide-react";
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

export function NavLinks({ session }: { session: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-6 sm:flex">
        {navLinks.map((link) => {
          const active = isActive(link.href, pathname, searchParams);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active
                  ? "border-b-2 border-white pb-0.5 text-sm font-medium text-white"
                  : "text-sm font-medium text-gray-300 hover:text-white"
              }
            >
              {link.label}
            </Link>
          );
        })}
        {session ? (
          <Link
            href="/admin"
            className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white"
          >
            <Settings className="h-3 w-3" />
            Admin
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-white"
          >
            <LogIn className="h-3 w-3" />
            Login
          </Link>
        )}
      </nav>

      {/* Mobile nav */}
      <Sheet>
        <SheetTrigger asChild className="sm:hidden">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64">
          <SheetTitle className="text-lg font-bold">Menu</SheetTitle>
          <nav className="mt-6 flex flex-col gap-4">
            {navLinks.map((link) => {
              const active = isActive(link.href, pathname, searchParams);
              return (
                <SheetClose key={link.href} asChild>
                  <Link
                    href={link.href}
                    className={
                      active
                        ? "border-l-2 border-white pl-2 text-sm font-medium text-white"
                        : "text-sm font-medium text-gray-300 hover:text-white"
                    }
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              );
            })}
            {session ? (
              <SheetClose asChild>
                <Link
                  href="/admin"
                  className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white"
                >
                  <Settings className="h-3 w-3" />
                  Admin
                </Link>
              </SheetClose>
            ) : (
              <SheetClose asChild>
                <Link
                  href="/login"
                  className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-white"
                >
                  <LogIn className="h-3 w-3" />
                  Login
                </Link>
              </SheetClose>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
