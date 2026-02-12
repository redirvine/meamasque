export const dynamic = "force-dynamic";

import { db } from "@/db";
import { images, artists, stories, categories } from "@/db/schema";
import { count, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Images, Users, BookOpen, FolderOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const [imageCount] = await db.select({ count: count() }).from(images);
  const [artistCount] = await db.select({ count: count() }).from(artists);
  const [storyCount] = await db.select({ count: count() }).from(stories);
  const [categoryCount] = await db.select({ count: count() }).from(categories);
  const recentImages = await db.query.images.findMany({
    orderBy: desc(images.createdAt),
    limit: 5,
  });

  const stats = [
    {
      label: "Images",
      value: imageCount.count,
      icon: Images,
      href: "/admin/images",
    },
    {
      label: "Artists",
      value: artistCount.count,
      icon: Users,
      href: "/admin/artists",
    },
    {
      label: "Stories",
      value: storyCount.count,
      icon: BookOpen,
      href: "/admin/stories",
    },
    {
      label: "Categories",
      value: categoryCount.count,
      icon: FolderOpen,
      href: "/admin/categories",
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Welcome to Meamasque admin</p>
        </div>
        <Link href="/admin/images/new">
          <Button>Upload Images</Button>
        </Link>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Images</CardTitle>
        </CardHeader>
        <CardContent>
          {recentImages.length === 0 ? (
            <p className="text-sm text-gray-500">
              No images yet.{" "}
              <Link
                href="/admin/images/new"
                className="text-blue-600 hover:underline"
              >
                Upload your first image
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {recentImages.map((image) => (
                <div
                  key={image.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.blobUrl}
                      alt={image.title}
                      className="h-10 w-10 rounded object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium">{image.title}</p>
                      <p className="text-xs text-gray-500">
                        {image.dateCreated ?? "No date"}
                      </p>
                    </div>
                  </div>
                  <Link href={`/admin/images/${image.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
