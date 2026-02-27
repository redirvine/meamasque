import Link from "next/link";
import { LogIn, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { auth } from "../../auth";

const navLinks = [
  { href: "/gallery", label: "Art" },
  { href: "/plays", label: "Plays" },
  { href: "/ancestors", label: "Ancestors" },
  { href: "/about", label: "About" },
];

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-700 bg-gray-800/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          Meamasque
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-300 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
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
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-300 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
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
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
