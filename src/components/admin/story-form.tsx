"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { ImagePicker } from "@/components/admin/image-picker";
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
import { X, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface Artist {
  id: string;
  name: string;
}

interface StoryImage {
  id: string;
  title: string;
  blobUrl: string;
}

interface StoryFormProps {
  storyId?: string;
  initialData?: {
    title: string;
    slug: string;
    content: string | null;
    excerpt: string | null;
    coverImageId: string | null;
    authorId: string | null;
    visibility: "public" | "private";
    images: StoryImage[];
  };
}

export function StoryForm({ storyId, initialData }: StoryFormProps) {
  const router = useRouter();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [authorId, setAuthorId] = useState(initialData?.authorId ?? "");
  const [visibility, setVisibility] = useState<"public" | "private">(
    initialData?.visibility ?? "public"
  );
  const [coverImageId, setCoverImageId] = useState(
    initialData?.coverImageId ?? ""
  );
  const [associatedImages, setAssociatedImages] = useState<StoryImage[]>(
    initialData?.images ?? []
  );

  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  useEffect(() => {
    fetch("/api/artists")
      .then((r) => r.json())
      .then(setArtists)
      .catch(() => {});
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (!storyId && title) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  }, [title, storyId]);

  const handleSave = async () => {
    if (!title || !slug) {
      toast.error("Title and slug are required");
      return;
    }

    setSaving(true);
    try {
      const body = {
        title,
        slug,
        content: content || null,
        excerpt: excerpt || null,
        coverImageId: coverImageId || null,
        authorId: authorId || null,
        visibility,
        imageIds: associatedImages.map((img) => img.id),
      };

      if (storyId) {
        await fetch(`/api/stories/${storyId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast.success("Story updated");
      } else {
        await fetch("/api/stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast.success("Story created");
      }
      router.push("/admin/stories");
    } catch {
      toast.error("Failed to save story");
    } finally {
      setSaving(false);
    }
  };

  const removeImage = (id: string) => {
    setAssociatedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const coverImage = associatedImages.find((img) => img.id === coverImageId);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Story title"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-friendly-slug"
                />
              </div>
              <div className="space-y-2">
                <Label>Story Content</Label>
                <TiptapEditor content={content || undefined} onChange={setContent} />
              </div>
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A short summary shown in listings..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Associated Images</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImagePicker(true)}
                >
                  Add Images
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {associatedImages.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500">
                  No images associated with this story
                </p>
              ) : (
                <div className="space-y-2">
                  {associatedImages.map((image) => (
                    <div
                      key={image.id}
                      className="flex items-center gap-3 rounded-md border p-2"
                    >
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.blobUrl}
                        alt={image.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <span className="flex-1 truncate text-sm">
                        {image.title}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeImage(image.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Author</Label>
                <Select value={authorId} onValueChange={setAuthorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select author" />
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

              <div className="space-y-2">
                <Label>Cover Image</Label>
                {coverImage ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage.blobUrl}
                      alt={coverImage.title}
                      className="w-full rounded-md"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute right-1 top-1 h-6 w-6"
                      onClick={() => setCoverImageId("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowCoverPicker(true)}
                  >
                    Select Cover Image
                  </Button>
                )}
              </div>

              <Button
                onClick={handleSave}
                className="w-full"
                disabled={saving || !title || !slug}
              >
                {saving
                  ? "Saving..."
                  : storyId
                    ? "Update Story"
                    : "Create Story"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ImagePicker
        open={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        selectedIds={associatedImages.map((img) => img.id)}
        onSelect={(imgs) => {
          const existing = new Set(associatedImages.map((i) => i.id));
          const newImages = imgs.filter((img) => !existing.has(img.id));
          setAssociatedImages((prev) => [...prev, ...newImages]);
        }}
      />

      <ImagePicker
        open={showCoverPicker}
        onClose={() => setShowCoverPicker(false)}
        multiple={false}
        onSelect={(imgs) => {
          if (imgs[0]) {
            setCoverImageId(imgs[0].id);
            // Also add to associated images if not there
            setAssociatedImages((prev) => {
              if (prev.some((i) => i.id === imgs[0].id)) return prev;
              return [...prev, imgs[0]];
            });
          }
        }}
      />
    </>
  );
}
