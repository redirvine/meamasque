import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Meamasque
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/gallery"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Gallery
          </Link>
          <Link
            href="/artists"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Artists
          </Link>
          <Link
            href="/stories"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Stories
          </Link>
        </nav>
      </div>
    </header>
  );
}
