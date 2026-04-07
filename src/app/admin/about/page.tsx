"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { ImagePicker } from "@/components/admin/image-picker";

interface AboutData {
  id: string;
  name: string;
  bio: string | null;
  artistStatement: string | null;
  photoId: string | null;
}

export default function AboutAdminPage() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [artistStatement, setArtistStatement] = useState("");
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/about")
      .then((r) => r.json())
      .then((data: AboutData) => {
        setName(data.name);
        setBio(data.bio ?? "");
        setArtistStatement(data.artistStatement ?? "");
        setPhotoId(data.photoId);
        // Fetch photo URL if there's a photoId
        if (data.photoId) {
          fetch(`/api/images?search=`)
            .then((r) => r.json())
            .then((images: { id: string; blobUrl: string }[]) => {
              const img = images.find((i) => i.id === data.photoId);
              if (img) setPhotoUrl(img.blobUrl);
            })
            .catch(() => {});
        }
        setLoaded(true);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/about", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio: bio || null,
          artistStatement: artistStatement || null,
          photoId: photoId || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("About page updated");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">About</h1>
        <p className="text-gray-500">Edit the public About page content</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>About Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Primary Photo</Label>
            {photoId && photoUrl ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt="Selected photo"
                  className="h-32 w-32 rounded-md object-cover"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-6 w-6"
                  onClick={() => {
                    setPhotoId(null);
                    setPhotoUrl(null);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowImagePicker(true)}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Choose Photo
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={8}
            />
          </div>
          <div className="space-y-2">
            <Label>Artist Statement</Label>
            <Textarea
              value={artistStatement}
              onChange={(e) => setArtistStatement(e.target.value)}
              rows={6}
            />
          </div>
          <Button onClick={handleSave} disabled={saving || !name}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </CardContent>
      </Card>

      <ImagePicker
        open={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={(images) => {
          if (images.length > 0) {
            setPhotoId(images[0].id);
            setPhotoUrl(images[0].blobUrl);
          }
        }}
        selectedIds={photoId ? [photoId] : []}
        multiple={false}
      />
    </div>
  );
}
