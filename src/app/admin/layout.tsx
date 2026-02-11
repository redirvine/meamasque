import { AdminSidebar } from "@/components/admin/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">{children}</main>
      <Toaster />
    </div>
  );
}
