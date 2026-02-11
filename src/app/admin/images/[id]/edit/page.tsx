"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Image {
  id: string;
  title: string;
  description: string | null;
  blobUrl: string;
  artistId: string | null;
  categoryId: string | null;
  dateCreated: string | null;
  visibility: "public" | "private";
}

interface Artist {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export default function EditImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [image, setImage] = useState<Image | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [artistId, setArtistId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [dateCreated, setDateCreated] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  useEffect(() => {
    Promise.all([
      fetch(`/api/images/${id}`).then((r) => r.json()),
      fetch("/api/artists").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([img, arts, cats]) => {
      setImage(img);
      setTitle(img.title);
      setDescription(img.description ?? "");
      setArtistId(img.artistId ?? "");
      setCategoryId(img.categoryId ?? "");
      setDateCreated(img.dateCreated ?? "");
      setVisibility(img.visibility);
      setArtists(arts);
      setCategories(cats);
    });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/images/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          artistId: artistId || null,
          categoryId: categoryId || null,
          dateCreated: dateCreated || null,
          visibility,
        }),
      });
      toast.success("Image updated");
      router.push("/admin/images");
    } catch {
      toast.error("Failed to update image");
    } finally {
      setSaving(false);
    }
  };

  if (!image) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/images"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Images
        </Link>
        <h1 className="text-3xl font-bold">Edit Image</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.blobUrl}
              alt={image.title}
              className="w-full rounded-lg"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Image Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Artist</Label>
              <Select value={artistId} onValueChange={setArtistId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select artist" />
                </SelectTrigger>
                <SelectContent>
                  {artists.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Created</Label>
              <Input
                value={dateCreated}
                onChange={(e) => setDateCreated(e.target.value)}
                placeholder='e.g. "circa 1975"'
              />
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select
                value={visibility}
                onValueChange={(v) =>
                  setVisibility(v as "public" | "private")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Family Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSave}
              className="w-full"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
