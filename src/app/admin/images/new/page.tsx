"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadZone } from "@/components/admin/upload-zone";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface Artist {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface UploadedFile {
  name: string;
  blobUrl: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [saving, setSaving] = useState(false);

  // Shared metadata for all uploads
  const [artistId, setArtistId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [dateCreated, setDateCreated] = useState("");

  useEffect(() => {
    fetch("/api/artists")
      .then((r) => r.json())
      .then(setArtists)
      .catch(() => {});
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const handleUploadComplete = (files: UploadedFile[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
    toast.success(`${files.length} image(s) uploaded`);
  };

  const handleSaveAll = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("No images to save");
      return;
    }

    setSaving(true);

    try {
      for (const file of uploadedFiles) {
        const title = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
        await fetch("/api/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            blobUrl: file.blobUrl,
            artistId: artistId || null,
            categoryId: categoryId || null,
            visibility,
            dateCreated: dateCreated || undefined,
          }),
        });
      }

      toast.success("All images saved!");
      router.push("/admin/images");
    } catch {
      toast.error("Failed to save images");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Upload Images</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Images</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadZone onUploadComplete={handleUploadComplete} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  placeholder='e.g. "circa 1975"'
                  value={dateCreated}
                  onChange={(e) => setDateCreated(e.target.value)}
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

              <Textarea
                placeholder="Description (optional, applied to all)"
                className="mt-2"
              />

              <Button
                onClick={handleSaveAll}
                className="w-full"
                disabled={uploadedFiles.length === 0 || saving}
              >
                {saving
                  ? "Saving..."
                  : `Save ${uploadedFiles.length} Image(s)`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
