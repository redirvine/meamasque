"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { ImagePicker } from "@/components/admin/image-picker";

interface PlayImage {
  id: string;
  title: string;
  blobUrl: string;
}

interface Play {
  id: string;
  play: string;
  date: string | null;
  role: string | null;
  location: string | null;
  description: string | null;
  year: number | null;
  primaryImageId: string | null;
  primaryImageUrl: string | null;
}

export default function PlaysAdminPage() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [editPlay, setEditPlay] = useState<Play | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showPrimaryImagePicker, setShowPrimaryImagePicker] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Form state
  const [play, setPlay] = useState("");
  const [date, setDate] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(null);
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string | null>(null);
  const [associatedImages, setAssociatedImages] = useState<PlayImage[]>([]);
  const [saving, setSaving] = useState(false);

  const loadPlays = async () => {
    const res = await fetch("/api/plays");
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data)) setPlays(data);
  };

  useEffect(() => {
    loadPlays();
  }, []);

  const resetForm = () => {
    setPlay("");
    setDate("");
    setRole("");
    setLocation("");
    setDescription("");
    setYear("");
    setPrimaryImageId(null);
    setPrimaryImageUrl(null);
    setAssociatedImages([]);
  };

  const openEdit = async (p: Play) => {
    setEditPlay(p);
    setPlay(p.play);
    setDate(p.date ?? "");
    setRole(p.role ?? "");
    setLocation(p.location ?? "");
    setDescription(p.description ?? "");
    setYear(p.year != null ? String(p.year) : "");
    setPrimaryImageId(p.primaryImageId);
    setPrimaryImageUrl(p.primaryImageUrl);
    setAssociatedImages([]);

    // Fetch associated images
    try {
      const res = await fetch(`/api/plays/${p.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.images) {
          setAssociatedImages(
            data.images.map((img: { id: string; title: string; blobUrl: string }) => ({
              id: img.id,
              title: img.title,
              blobUrl: img.blobUrl,
            }))
          );
        }
      }
    } catch {
      // ignore — images just won't be pre-populated
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data: Record<string, unknown> = {
        play,
        date: date || null,
        role: role || null,
        location: location || null,
        description: description || null,
        year: year ? parseInt(year, 10) : null,
        primaryImageId: primaryImageId || null,
      };

      if (editPlay) {
        data.imageIds = associatedImages.map((img) => img.id);
        const res = await fetch(`/api/plays/${editPlay.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Update failed");
        toast.success("Play updated");
      } else {
        const res = await fetch("/api/plays", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Create failed");
        toast.success("Play created");
      }
      setEditPlay(null);
      setShowCreate(false);
      resetForm();
      loadPlays();
    } catch {
      toast.error("Failed to save play");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/plays/${deleteId}`, { method: "DELETE" });
      toast.success("Play deleted");
      loadPlays();
    } catch {
      toast.error("Failed to delete play");
    } finally {
      setDeleteId(null);
    }
  };

  const removeImage = (id: string) => {
    setAssociatedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const isFormOpen = showCreate || !!editPlay;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Plays</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowCreate(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Play
        </Button>
      </div>

      <div className="space-y-4">
        {plays.map((p) => (
          <Card key={p.id} className="flex flex-row gap-5 p-4">
            {p.primaryImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.primaryImageUrl}
                alt={p.play}
                className="h-32 w-32 flex-shrink-0 rounded-md object-cover"
              />
            ) : (
              <div className="h-32 w-32 flex-shrink-0 rounded-md bg-gray-100" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold">{p.play}</h2>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(p)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteId(p.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {p.role && (
                <p className="text-sm text-gray-600">{p.role}</p>
              )}
              {(p.year != null || p.date) && (
                <p className="mt-1 text-sm text-gray-500">
                  {p.year ?? p.date}
                </p>
              )}
              {p.location && (
                <p className="text-sm text-gray-500">{p.location}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={() => {
          setShowCreate(false);
          setEditPlay(null);
          resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editPlay ? "Edit Play" : "Add Play"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Play *</Label>
              <Input
                value={play}
                onChange={(e) => setPlay(e.target.value)}
                placeholder="Name of the play"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 2005"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. Spring 2005"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
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
              <Label>Primary Image</Label>
              {primaryImageId && primaryImageUrl ? (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={primaryImageUrl}
                    alt="Selected photo"
                    className="h-24 w-24 rounded-md object-cover"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -right-2 -top-2 h-6 w-6"
                    onClick={() => {
                      setPrimaryImageId(null);
                      setPrimaryImageUrl(null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPrimaryImagePicker(true)}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Choose Image
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Additional Images</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImagePicker(true)}
                >
                  Add Images
                </Button>
              </div>
              {associatedImages.length > 0 && (
                <div className="space-y-2">
                  {associatedImages.map((image) => (
                    <div
                      key={image.id}
                      className="flex items-center gap-3 rounded-md border p-2"
                    >
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
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreate(false);
                setEditPlay(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !play}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Primary Image Picker */}
      <ImagePicker
        open={showPrimaryImagePicker}
        onClose={() => setShowPrimaryImagePicker(false)}
        onSelect={(images) => {
          if (images.length > 0) {
            setPrimaryImageId(images[0].id);
            setPrimaryImageUrl(images[0].blobUrl);
          }
        }}
        selectedIds={primaryImageId ? [primaryImageId] : []}
        multiple={false}
      />

      {/* Additional Images Picker */}
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

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Play</DialogTitle>
            <DialogDescription>
              Are you sure? This will permanently remove this play.
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
