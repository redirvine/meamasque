"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Images,
  Upload,
  Users,
  FolderOpen,
  BookOpen,
  KeyRound,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/images", label: "Images", icon: Images },
  { href: "/admin/images/new", label: "Upload", icon: Upload },
  { href: "/admin/artists", label: "Artists", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/stories", label: "Stories", icon: BookOpen },
  { href: "/admin/family", label: "Family Access", icon: KeyRound },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="p-6">
        <Link href="/admin" className="text-xl font-bold">
          Meamasque
        </Link>
        <p className="text-sm text-gray-500">Admin Panel</p>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Separator />
      <div className="p-4">
        <Link
          href="/"
          className="mb-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          View Site
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
