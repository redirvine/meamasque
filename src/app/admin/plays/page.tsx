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
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import {
  Plus,
  Pencil,
  Trash2,
  ImageIcon,
  X,
  Camera,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  imageCount: number;
  memoryCount: number;
}

interface LightboxImage {
  id: string;
  blobUrl: string;
  title: string | null;
  caption: string | null;
  sortOrder: number;
}

interface ViewerMemory {
  id: string;
  content: string;
  sortOrder: number;
}

export default function PlaysAdminPage() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [editPlay, setEditPlay] = useState<Play | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showPrimaryImagePicker, setShowPrimaryImagePicker] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<LightboxImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState("");
  const [lightboxLoading, setLightboxLoading] = useState(false);

  // Memory viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerMemories, setViewerMemories] = useState<ViewerMemory[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerLoading, setViewerLoading] = useState(false);

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
  const [memories, setMemories] = useState<string[]>([]);
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
    setMemories([]);
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
    setMemories([]);

    // Fetch associated images and memories
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
        if (data.memories) {
          setMemories(
            data.memories.map((m: { content: string }) => m.content)
          );
        }
      }
    } catch {
      // ignore — images/memories just won't be pre-populated
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
        data.memories = memories.filter((m) => m.trim() !== "");
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

  const openLightbox = async (p: Play) => {
    if (!p.primaryImageUrl) return;
    setLightboxTitle(p.play);
    setLightboxOpen(true);
    setLightboxLoading(true);
    setLightboxIndex(0);
    try {
      const res = await fetch(`/api/plays/${p.id}/images`);
      if (res.ok) {
        const imgs: LightboxImage[] = await res.json();
        setLightboxImages(
          imgs.length > 0
            ? imgs
            : [{ id: "primary", blobUrl: p.primaryImageUrl!, title: p.play, caption: null, sortOrder: 0 }]
        );
      } else {
        setLightboxImages([
          { id: "primary", blobUrl: p.primaryImageUrl!, title: p.play, caption: null, sortOrder: 0 },
        ]);
      }
    } catch {
      setLightboxImages([
        { id: "primary", blobUrl: p.primaryImageUrl!, title: p.play, caption: null, sortOrder: 0 },
      ]);
    } finally {
      setLightboxLoading(false);
    }
  };

  const openMemoryViewer = async (p: Play) => {
    setViewerTitle(p.play);
    setViewerOpen(true);
    setViewerLoading(true);
    setViewerIndex(0);
    try {
      const res = await fetch(`/api/plays/${p.id}/memories`);
      if (res.ok) {
        setViewerMemories(await res.json());
      }
    } catch {
      setViewerMemories([]);
    } finally {
      setViewerLoading(false);
    }
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
              {(p.imageCount > 0 || p.memoryCount > 0) && (
                <div className="mt-1 flex gap-3">
                  {p.imageCount > 0 && (
                    <button
                      onClick={() => openLightbox(p)}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      {p.imageCount} {p.imageCount === 1 ? "photo" : "photos"}
                    </button>
                  )}
                  {p.memoryCount > 0 && (
                    <button
                      onClick={() => openMemoryViewer(p)}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      {p.memoryCount} {p.memoryCount === 1 ? "memory" : "memories"}
                    </button>
                  )}
                </div>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Memories</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMemories((prev) => [...prev, ""])}
                >
                  Add Memory
                </Button>
              </div>
              {memories.length > 0 && (
                <div className="space-y-2">
                  {memories.map((memory, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Textarea
                        value={memory}
                        onChange={(e) => {
                          const updated = [...memories];
                          updated[index] = e.target.value;
                          setMemories(updated);
                        }}
                        rows={2}
                        className="flex-1"
                        placeholder="Write a memory..."
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          setMemories((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
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

      {/* Image Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-[90vw] max-h-[90vh] sm:max-w-[90vw] p-0 border-none bg-black/95 overflow-hidden"
          showCloseButton={false}
        >
          <VisuallyHidden.Root>
            <DialogTitle>{lightboxTitle}</DialogTitle>
          </VisuallyHidden.Root>
          <DialogClose className="absolute top-3 right-3 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
          {lightboxLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          ) : lightboxImages[lightboxIndex] ? (
            <div className="relative flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImages[lightboxIndex].blobUrl}
                alt={lightboxImages[lightboxIndex].title || lightboxTitle}
                className="max-h-[80vh] max-w-full object-contain"
              />
              {lightboxImages.length > 1 && (
                <>
                  <button
                    onClick={() => setLightboxIndex((i) => (i > 0 ? i - 1 : lightboxImages.length - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setLightboxIndex((i) => (i < lightboxImages.length - 1 ? i + 1 : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8">
                {lightboxImages.length > 1 && (
                  <p className="text-center text-sm text-white/80">
                    {lightboxIndex + 1} / {lightboxImages.length}
                  </p>
                )}
                {lightboxImages[lightboxIndex].caption && (
                  <p className="mt-1 text-center text-sm text-white/90">
                    {lightboxImages[lightboxIndex].caption}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Memory Viewer */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Memories &mdash; {viewerTitle}</DialogTitle>
          </DialogHeader>
          {viewerLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            </div>
          ) : viewerMemories.length > 0 ? (
            <div className="relative">
              <div className="min-h-[8rem] rounded-lg bg-gray-50 p-4">
                <p className="whitespace-pre-wrap text-sm text-gray-700">
                  {viewerMemories[viewerIndex]?.content}
                </p>
              </div>
              {viewerMemories.length > 1 && (
                <div className="mt-3 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setViewerIndex((i) => (i > 0 ? i - 1 : viewerMemories.length - 1))}
                    className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Previous memory"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-gray-500">
                    {viewerIndex + 1} / {viewerMemories.length}
                  </span>
                  <button
                    onClick={() => setViewerIndex((i) => (i < viewerMemories.length - 1 ? i + 1 : 0))}
                    className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Next memory"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No memories yet.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
