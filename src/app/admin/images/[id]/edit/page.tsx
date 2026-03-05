"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Crop } from "lucide-react";
import Link from "next/link";
import { CropDialog } from "@/components/admin/crop-dialog";

interface Image {
  id: string;
  title: string;
  description: string | null;
  blobUrl: string;
  ancestorId: string | null;
  creatorUserId: string | null;
  categoryId: string | null;
  dateCreated: string | null;
  visibility: "public" | "private";
  slideshowOverlayText: string | null;
}

interface Creator {
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
  return (
    <Suspense>
      <EditImagePageContent params={params} />
    </Suspense>
  );
}

function EditImagePageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [image, setImage] = useState<Image | null>(null);
  const [userCreators, setUserCreators] = useState<Creator[]>([]);
  const [ancestorCreators, setAncestorCreators] = useState<Creator[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creatorValue, setCreatorValue] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [dateCreated, setDateCreated] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [slideshowOverlayText, setSlideshowOverlayText] = useState("");
  const [cropOpen, setCropOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/images/${id}`).then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/ancestors").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([img, usrs, ancs, cats]) => {
      setImage(img);
      setTitle(img.title);
      setDescription(img.description ?? "");
      // Initialize creator value from image data
      if (img.creatorUserId) {
        setCreatorValue(`user:${img.creatorUserId}`);
      } else if (img.ancestorId) {
        setCreatorValue(`ancestor:${img.ancestorId}`);
      }
      setCategoryId(img.categoryId ?? "");
      setDateCreated(img.dateCreated ?? "");
      setVisibility(img.visibility);
      setSlideshowOverlayText(img.slideshowOverlayText ?? "");
      setUserCreators(usrs);
      setAncestorCreators(ancs);
      setCategories(cats);
    });
  }, [id]);

  const handleSave = async () => {
    // Parse creator prefix
    let ancestorId: string | null = null;
    let creatorUserId: string | null = null;
    if (creatorValue.startsWith("user:")) {
      creatorUserId = creatorValue.slice(5);
    } else if (creatorValue.startsWith("ancestor:")) {
      ancestorId = creatorValue.slice(9);
    }

    setSaving(true);
    try {
      await fetch(`/api/images/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          ancestorId,
          creatorUserId,
          categoryId: categoryId || null,
          dateCreated: dateCreated || null,
          visibility,
          slideshowOverlayText: slideshowOverlayText || null,
        }),
      });
      toast.success("Image updated");
      router.push(redirect || "/admin/images");
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
          href={redirect || "/admin/images"}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {redirect ? "Back" : "Back to Images"}
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
            <Button
              variant="outline"
              className="mt-3 w-full"
              onClick={() => setCropOpen(true)}
            >
              <Crop className="mr-2 h-4 w-4" />
              Crop Image
            </Button>
            <CropDialog
              imageUrl={image.blobUrl}
              imageId={image.id}
              open={cropOpen}
              onOpenChange={setCropOpen}
              onCropped={(newUrl) => {
                const preload = new window.Image();
                preload.onload = () => setImage({ ...image, blobUrl: newUrl });
                preload.src = newUrl;
              }}
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
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label>Slideshow Overlay Text</Label>
              <Textarea
                value={slideshowOverlayText}
                onChange={(e) => setSlideshowOverlayText(e.target.value)}
                rows={3}
                placeholder="Text displayed over image on home page"
              />
            </div>

            <div className="space-y-2">
              <Label>Creator</Label>
              <Select value={creatorValue} onValueChange={setCreatorValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select creator" />
                </SelectTrigger>
                <SelectContent>
                  {userCreators.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Users</SelectLabel>
                      {userCreators.map((u) => (
                        <SelectItem key={u.id} value={`user:${u.id}`}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {ancestorCreators.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Ancestors</SelectLabel>
                      {ancestorCreators.map((a) => (
                        <SelectItem key={a.id} value={`ancestor:${a.id}`}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
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
