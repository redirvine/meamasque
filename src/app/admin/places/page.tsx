"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  ImageIcon,
  X,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { ImagePicker } from "@/components/admin/image-picker";

interface Place {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  visitedOrLived: "visited" | "lived" | null;
  fromDate: string | null;
  toDate: string | null;
  photoId: string | null;
  photoUrl: string | null;
  memoryCount: number;
}

interface ViewerMemory {
  id: string;
  content: string;
  sortOrder: number;
}

export default function PlacesAdminPageWrapper() {
  return (
    <Suspense>
      <PlacesAdminPage />
    </Suspense>
  );
}

function PlacesAdminPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editParam = searchParams.get("edit");
  const newParam = searchParams.get("new");
  const redirectParam = searchParams.get("redirect");
  const didAutoEdit = useRef(false);
  const didAutoNew = useRef(false);

  const [placesList, setPlacesList] = useState<Place[]>([]);
  const [editPlace, setEditPlace] = useState<Place | null>(null);
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
  const [description, setDescription] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [visitedOrLived, setVisitedOrLived] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
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

  const loadPlaces = async () => {
    const res = await fetch("/api/places");
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data)) setPlacesList(data);
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  // Auto-open edit when navigating with ?edit=<id>
  useEffect(() => {
    if (editParam && placesList.length > 0 && !didAutoEdit.current) {
      const target = placesList.find((p) => p.id === editParam);
      if (target) {
        didAutoEdit.current = true;
        openEdit(target);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editParam, placesList]);

  // Auto-open create when navigating with ?new=true
  useEffect(() => {
    if (newParam === "true" && !didAutoNew.current) {
      didAutoNew.current = true;
      resetForm();
      setShowCreate(true);
    }
  }, [newParam]);

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setStreetAddress("");
    setCity("");
    setState("");
    setCountry("");
    setVisitedOrLived("");
    setFromDate("");
    setToDate("");
    setPhotoId(null);
    setPhotoUrl(null);
    setMemories([]);
    setAssociatedImages([]);
  };

  const openEdit = async (place: Place) => {
    setEditPlace(place);
    setName(place.name);
    setSlug(place.slug);
    setDescription(place.description ?? "");
    setStreetAddress(place.streetAddress ?? "");
    setCity(place.city ?? "");
    setState(place.state ?? "");
    setCountry(place.country ?? "");
    setVisitedOrLived(place.visitedOrLived ?? "");
    setFromDate(place.fromDate ?? "");
    setToDate(place.toDate ?? "");
    setPhotoId(place.photoId);
    setPhotoUrl(null);
    setMemories([]);
    setAssociatedImages([]);

    // Fetch full place data including memories and photos
    try {
      const res = await fetch(`/api/places/${place.id}`);
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
    if (place.photoId) {
      fetch(`/api/images?search=`)
        .then((r) => r.json())
        .then((images: { id: string; blobUrl: string }[]) => {
          const img = images.find((i) => i.id === place.photoId);
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
        description: description || null,
        streetAddress: streetAddress || null,
        city: city || null,
        state: state || null,
        country: country || null,
        visitedOrLived: visitedOrLived || null,
        fromDate: fromDate || null,
        toDate: toDate || null,
        photoId: photoId || null,
      };

      if (editPlace) {
        const res = await fetch(`/api/places/${editPlace.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            memories: memories.filter((m) => m.trim() !== ""),
            imageIds: associatedImages.map((img) => img.id),
          }),
        });
        if (!res.ok) throw new Error("Update failed");
        toast.success("Place updated");
      } else {
        const res = await fetch("/api/places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Create failed");
        toast.success("Place created");
      }
      setEditPlace(null);
      setShowCreate(false);
      resetForm();
      if (redirectParam) {
        router.push(redirectParam);
      } else {
        loadPlaces();
      }
    } catch {
      toast.error("Failed to save place");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/places/${deleteId}`, { method: "DELETE" });
      toast.success("Place deleted");
      loadPlaces();
    } catch {
      toast.error("Failed to delete place");
    } finally {
      setDeleteId(null);
    }
  };

  const openMemoryViewer = async (place: Place) => {
    setViewerTitle(place.name);
    setViewerOpen(true);
    setViewerLoading(true);
    setViewerIndex(0);
    try {
      const res = await fetch(`/api/places/${place.id}/memories`);
      if (res.ok) {
        setViewerMemories(await res.json());
      }
    } catch {
      setViewerMemories([]);
    } finally {
      setViewerLoading(false);
    }
  };

  function locationString(place: Place) {
    return [place.city, place.state, place.country].filter(Boolean).join(", ");
  }

  const isFormOpen = showCreate || !!editPlace;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Places</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowCreate(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Place
        </Button>
      </div>

      <div className="space-y-3">
        {placesList.map((place) => (
          <Card key={place.id}>
            <div className="flex items-center gap-4 p-4">
              {place.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={place.photoUrl}
                  alt={place.name}
                  className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/places/${place.slug}`} className="truncate text-sm font-semibold hover:underline">
                    {place.name}
                  </Link>
                  <span className="text-xs text-gray-400">/{place.slug}</span>
                  {place.visitedOrLived && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      place.visitedOrLived === "lived"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {place.visitedOrLived}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-gray-500">
                  {locationString(place) && (
                    <span>{locationString(place)}</span>
                  )}
                  {place.memoryCount > 0 && (
                    <button
                      onClick={() => openMemoryViewer(place)}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      {place.memoryCount} {place.memoryCount === 1 ? "memory" : "memories"}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-shrink-0 gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEdit(place)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDeleteId(place.id)}
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
          setEditPlace(null);
          resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editPlace ? "Edit Place" : "Add Place"}
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
            <div className="space-y-2">
              <Label>Street Address</Label>
              <Input
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="e.g. 123 Main St"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Visited / Lived</Label>
                <Select
                  value={visitedOrLived}
                  onValueChange={setVisitedOrLived}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visited">Visited</SelectItem>
                    <SelectItem value="lived">Lived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  placeholder="e.g. 1950"
                />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  placeholder="e.g. 1965"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                setEditPlace(null);
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
            <DialogTitle>Delete Place</DialogTitle>
            <DialogDescription>
              Are you sure? This will permanently remove this place record.
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
