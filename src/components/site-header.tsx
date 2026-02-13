import Link from "next/link";
import { Lock, LogIn, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { hasFamilyAccess } from "@/lib/family-access";

const navLinks = [
  { href: "/gallery", label: "Gallery" },
  { href: "/artists", label: "Artists" },
  { href: "/stories", label: "Stories" },
  { href: "/about", label: "About" },
];

export async function SiteHeader() {
  const familyAccess = await hasFamilyAccess();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Meamasque
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
          {familyAccess && (
            <Link
              href="/ancestors"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Ancestors
            </Link>
          )}
          {familyAccess && (
            <Link
              href="/plays"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Plays
            </Link>
          )}
          <Link
            href="/family"
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Lock className="h-3 w-3" />
            Family
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-gray-900"
          >
            <LogIn className="h-3 w-3" />
            Login
          </Link>
        </nav>

        {/* Mobile nav */}
        <Sheet>
          <SheetTrigger asChild className="sm:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <SheetTitle className="text-lg font-bold">Menu</SheetTitle>
            <nav className="mt-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  {link.label}
                </Link>
              ))}
              {familyAccess && (
                <Link
                  href="/ancestors"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Ancestors
                </Link>
              )}
              {familyAccess && (
                <Link
                  href="/plays"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Plays
                </Link>
              )}
              <Link
                href="/family"
                className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <Lock className="h-3 w-3" />
                Family
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-gray-900"
              >
                <LogIn className="h-3 w-3" />
                Login
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
