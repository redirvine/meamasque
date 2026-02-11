"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Story {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  visibility: "public" | "private";
  createdAt: string;
  coverImageUrl: string | null;
  authorName: string | null;
}

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadStories = async () => {
    const res = await fetch("/api/stories");
    setStories(await res.json());
  };

  useEffect(() => {
    loadStories();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/stories/${deleteId}`, { method: "DELETE" });
      toast.success("Story deleted");
      loadStories();
    } catch {
      toast.error("Failed to delete story");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stories</h1>
        <Link href="/admin/stories/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Story
          </Button>
        </Link>
      </div>

      {stories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No stories yet</p>
            <Link href="/admin/stories/new">
              <Button variant="link">Create your first story</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => (
            <Card key={story.id}>
              <CardContent className="flex items-center gap-4 p-4">
                {story.coverImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={story.coverImageUrl}
                    alt=""
                    className="h-16 w-16 rounded object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium">{story.title}</h3>
                  {story.excerpt && (
                    <p className="mt-1 truncate text-sm text-gray-500">
                      {story.excerpt}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant={
                        story.visibility === "public" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {story.visibility}
                    </Badge>
                    {story.authorName && (
                      <span className="text-xs text-gray-400">
                        by {story.authorName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Link href={`/admin/stories/${story.id}/edit`}>
                    <Button size="icon" variant="ghost">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteId(story.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Story</DialogTitle>
            <DialogDescription>
              Are you sure? This will permanently delete this story.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
