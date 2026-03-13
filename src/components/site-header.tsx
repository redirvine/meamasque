import Link from "next/link";
import { auth } from "../../auth";
import { NavLinks } from "./nav-links";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-700 bg-gray-800/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          Mary Elizabeth Atwood
        </Link>
        <NavLinks role={session?.user?.role ?? null} />
      </div>
    </header>
  );
}
