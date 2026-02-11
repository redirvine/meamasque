"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

interface Image {
  id: string;
  title: string;
  description: string | null;
  blobUrl: string;
  artistId: string | null;
  categoryId: string | null;
  dateCreated: string | null;
  visibility: "public" | "private";
  createdAt: string;
}

export default function ImagesPage() {
  const [images, setImages] = useState<Image[]>([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadImages = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/images?${params}`);
    const data = await res.json();
    setImages(data);
  };

  useEffect(() => {
    loadImages();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadImages();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`/api/images/${deleteId}`, { method: "DELETE" });
      setImages((prev) => prev.filter((img) => img.id !== deleteId));
      toast.success("Image deleted");
    } catch {
      toast.error("Failed to delete image");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Images</h1>
        <Link href="/admin/images/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search images..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {images.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No images found</p>
            <Link href="/admin/images/new">
              <Button variant="link">Upload your first image</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <Card key={image.id} className="group overflow-hidden">
              <div className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.blobUrl}
                  alt={image.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Link href={`/admin/images/${image.id}/edit`}>
                    <Button size="sm" variant="secondary">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteId(image.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="truncate text-sm font-medium">{image.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    variant={
                      image.visibility === "public" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {image.visibility}
                  </Badge>
                  {image.dateCreated && (
                    <span className="text-xs text-gray-500">
                      {image.dateCreated}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
