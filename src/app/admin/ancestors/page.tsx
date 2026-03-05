"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  ImageIcon,
  X,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { ImagePicker } from "@/components/admin/image-picker";

interface Ancestor {
  id: string;
  name: string;
  slug: string;
  maidenName: string | null;
  relationship: string | null;
  birthplace: string | null;
  born: string | null;
  deathPlace: string | null;
  died: string | null;
  spouse: string | null;
  occupation: string | null;
  immigration: string | null;
  bio: string | null;
  photoId: string | null;
  photoUrl: string | null;
  memoryCount: number;
}

interface ViewerMemory {
  id: string;
  content: string;
  sortOrder: number;
}

export default function AncestorsAdminPageWrapper() {
  return (
    <Suspense>
      <AncestorsAdminPage />
    </Suspense>
  );
}

function AncestorsAdminPage() {
  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");
  const didAutoEdit = useRef(false);

  const [ancestors, setAncestors] = useState<Ancestor[]>([]);
  const [editAncestor, setEditAncestor] = useState<Ancestor | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [associatedImages, setAssociatedImages] = useState<
    { id: string; title: string; blobUrl: string }[]
  >([]);
  const [showAdditionalImagePicker, setShowAdditionalImagePicker] =
    useState(false);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [maidenName, setMaidenName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [birthplace, setBirthplace] = useState("");
  const [born, setBorn] = useState("");
  const [deathPlace, setDeathPlace] = useState("");
  const [died, setDied] = useState("");
  const [spouse, setSpouse] = useState("");
  const [occupation, setOccupation] = useState("");
  const [immigration, setImmigration] = useState("");
  const [bio, setBio] = useState("");
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [memories, setMemories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Memory viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerMemories, setViewerMemories] = useState<ViewerMemory[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerLoading, setViewerLoading] = useState(false);

  const loadAncestors = async () => {
    const res = await fetch("/api/ancestors");
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data)) setAncestors(data);
  };

  useEffect(() => {
    loadAncestors();
  }, []);

  // Auto-open edit when navigating with ?edit=<id>
  useEffect(() => {
    if (editParam && ancestors.length > 0 && !didAutoEdit.current) {
      const target = ancestors.find((a) => a.id === editParam);
      if (target) {
        didAutoEdit.current = true;
        openEdit(target);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editParam, ancestors]);

  const resetForm = () => {
    setName("");
    setSlug("");
    setMaidenName("");
    setRelationship("");
    setBirthplace("");
    setBorn("");
    setDeathPlace("");
    setDied("");
    setSpouse("");
    setOccupation("");
    setImmigration("");
    setBio("");
    setPhotoId(null);
    setPhotoUrl(null);
    setMemories([]);
    setAssociatedImages([]);
  };

  const openEdit = async (ancestor: Ancestor) => {
    setEditAncestor(ancestor);
    setName(ancestor.name);
    setSlug(ancestor.slug);
    setMaidenName(ancestor.maidenName ?? "");
    setRelationship(ancestor.relationship ?? "");
    setBirthplace(ancestor.birthplace ?? "");
    setBorn(ancestor.born ?? "");
    setDeathPlace(ancestor.deathPlace ?? "");
    setDied(ancestor.died ?? "");
    setSpouse(ancestor.spouse ?? "");
    setOccupation(ancestor.occupation ?? "");
    setImmigration(ancestor.immigration ?? "");
    setBio(ancestor.bio ?? "");
    setPhotoId(ancestor.photoId);
    setPhotoUrl(null);
    setMemories([]);
    setAssociatedImages([]);

    // Fetch full ancestor data including photo URL, memories, and photos
    try {
      const res = await fetch(`/api/ancestors/${ancestor.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.memories) {
          setMemories(
            data.memories.map((m: { content: string }) => m.content)
          );
        }
        if (data.photos) {
          setAssociatedImages(
            data.photos.map((p: { id: string; title: string; blobUrl: string }) => ({
              id: p.id,
              title: p.title,
              blobUrl: p.blobUrl,
            }))
          );
        }
      }
    } catch {
      // ignore
    }

    // Fetch photo URL if there's a photoId
    if (ancestor.photoId) {
      fetch(`/api/images?search=`)
        .then((r) => r.json())
        .then((images: { id: string; blobUrl: string }[]) => {
          const img = images.find((i) => i.id === ancestor.photoId);
          if (img) setPhotoUrl(img.blobUrl);
        })
        .catch(() => {});
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        name,
        slug,
        maidenName: maidenName || null,
        relationship: relationship || null,
        birthplace: birthplace || null,
        born: born || null,
        deathPlace: deathPlace || null,
        died: died || null,
        spouse: spouse || null,
        occupation: occupation || null,
        immigration: immigration || null,
        bio: bio || null,
        photoId: photoId || null,
      };

      if (editAncestor) {
        const res = await fetch(`/api/ancestors/${editAncestor.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            memories: memories.filter((m) => m.trim() !== ""),
            imageIds: associatedImages.map((img) => img.id),
          }),
        });
        if (!res.ok) throw new Error("Update failed");
        toast.success("Ancestor updated");
      } else {
        const res = await fetch("/api/ancestors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Create failed");
        toast.success("Ancestor created");
      }
      setEditAncestor(null);
      setShowCreate(false);
      resetForm();
      loadAncestors();
    } catch {
      toast.error("Failed to save ancestor");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/ancestors/${deleteId}`, { method: "DELETE" });
      toast.success("Ancestor deleted");
      loadAncestors();
    } catch {
      toast.error("Failed to delete ancestor");
    } finally {
      setDeleteId(null);
    }
  };

  const openMemoryViewer = async (ancestor: Ancestor) => {
    setViewerTitle(ancestor.name);
    setViewerOpen(true);
    setViewerLoading(true);
    setViewerIndex(0);
    try {
      const res = await fetch(`/api/ancestors/${ancestor.id}/memories`);
      if (res.ok) {
        setViewerMemories(await res.json());
      }
    } catch {
      setViewerMemories([]);
    } finally {
      setViewerLoading(false);
    }
  };

  const isFormOpen = showCreate || !!editAncestor;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ancestors</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowCreate(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Ancestor
        </Button>
      </div>

      <div className="space-y-3">
        {ancestors.map((ancestor) => (
          <Card key={ancestor.id}>
            <div className="flex items-center gap-4 p-4">
              {ancestor.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ancestor.photoUrl}
                  alt={ancestor.name}
                  className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/ancestors/${ancestor.slug}`} className="truncate text-sm font-semibold hover:underline">
                    {ancestor.name}
                  </Link>
                  <span className="text-xs text-gray-400">/{ancestor.slug}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-gray-500">
                  {ancestor.relationship && (
                    <span>{ancestor.relationship}</span>
                  )}
                  {ancestor.born && (
                    <span>
                      Born: {ancestor.born}
                      {ancestor.birthplace && ` in ${ancestor.birthplace}`}
                    </span>
                  )}
                  {ancestor.memoryCount > 0 && (
                    <button
                      onClick={() => openMemoryViewer(ancestor)}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      {ancestor.memoryCount} {ancestor.memoryCount === 1 ? "memory" : "memories"}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-shrink-0 gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEdit(ancestor)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDeleteId(ancestor.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={() => {
          setShowCreate(false);
          setEditAncestor(null);
          resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editAncestor ? "Edit Ancestor" : "Add Ancestor"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-friendly-name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Maiden Name</Label>
                <Input
                  value={maidenName}
                  onChange={(e) => setMaidenName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g. Great-grandmother"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Born</Label>
                <Input
                  value={born}
                  onChange={(e) => setBorn(e.target.value)}
                  placeholder="e.g. 1890"
                />
              </div>
              <div className="space-y-2">
                <Label>Birthplace</Label>
                <Input
                  value={birthplace}
                  onChange={(e) => setBirthplace(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Died</Label>
                <Input
                  value={died}
                  onChange={(e) => setDied(e.target.value)}
                  placeholder="e.g. 1965"
                />
              </div>
              <div className="space-y-2">
                <Label>Death Place</Label>
                <Input
                  value={deathPlace}
                  onChange={(e) => setDeathPlace(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Spouse</Label>
                <Input
                  value={spouse}
                  onChange={(e) => setSpouse(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Occupation</Label>
                <Input
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Immigration</Label>
              <Input
                value={immigration}
                onChange={(e) => setImmigration(e.target.value)}
                placeholder="e.g. Arrived in New York, 1910"
              />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Photo</Label>
              {photoId && photoUrl ? (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt="Selected photo"
                    className="h-24 w-24 rounded-md object-cover"
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
              <Label>Additional Photos</Label>
              {associatedImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {associatedImages.map((img) => (
                    <div key={img.id} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.blobUrl}
                        alt={img.title}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute -right-2 -top-2 h-5 w-5"
                        onClick={() =>
                          setAssociatedImages((prev) =>
                            prev.filter((i) => i.id !== img.id)
                          )
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAdditionalImagePicker(true)}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Add Photos
              </Button>
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
                setEditAncestor(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !name || !slug}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Picker */}
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

      {/* Additional Photos Picker */}
      <ImagePicker
        open={showAdditionalImagePicker}
        onClose={() => setShowAdditionalImagePicker(false)}
        onSelect={(imgs) => {
          setAssociatedImages((prev) => {
            const existingIds = new Set(prev.map((i) => i.id));
            const newImages = imgs.filter((i) => !existingIds.has(i.id));
            return [...prev, ...newImages];
          });
        }}
        selectedIds={associatedImages.map((i) => i.id)}
        multiple={true}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ancestor</DialogTitle>
            <DialogDescription>
              Are you sure? This will permanently remove this ancestor record.
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
