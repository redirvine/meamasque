"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  Globe,
  Images,
  Upload,
  FolderOpen,
  TreePine,
  Drama,
  Info,
  UserCog,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/", label: "View Public Side", icon: Globe },
  { href: "/admin/images", label: "Images", icon: Images },
  { href: "/admin/images/new", label: "Upload", icon: Upload },
  { href: "/admin/ancestors", label: "Ancestors", icon: TreePine },
  { href: "/admin/plays", label: "Plays", icon: Drama },
  { href: "/admin/about", label: "About", icon: Info },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/users", label: "Admin Users", icon: UserCog },
];

function NavLink({
  href,
  onNavigate,
  className,
  children,
}: {
  href: string;
  onNavigate?: (href: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  if (onNavigate) {
    return (
      <button onClick={() => onNavigate(href)} className={className}>
        {children}
      </button>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: (href: string) => void;
}) {
  return (
    <>
      <div className="p-6">
        <NavLink href="/admin" onNavigate={onNavigate} className="text-xl font-bold">
          Meamasque
        </NavLink>
        <p className="text-sm text-gray-500">Admin Panel</p>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href !== "/" &&
            (pathname === item.href ||
            pathname.startsWith(item.href + "/"));
          return (
            <NavLink
              key={item.href}
              href={item.href}
              onNavigate={onNavigate}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <Separator />
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-40 md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      {/* Mobile overlay + sidebar: conditionally rendered */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close menu</span>
            </Button>
            <SidebarContent
              pathname={pathname}
              onNavigate={(href) => {
                setOpen(false);
                setTimeout(() => router.push(href), 100);
              }}
            />
          </aside>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 flex-col border-r bg-white md:flex">
        <SidebarContent pathname={pathname} />
      </aside>
    </>
  );
}
