"use client";

import { useState, useEffect } from "react";
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
import { Plus, Pencil, Trash2, ImageIcon, X } from "lucide-react";
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
}

export default function AncestorsAdminPage() {
  const [ancestors, setAncestors] = useState<Ancestor[]>([]);
  const [editAncestor, setEditAncestor] = useState<Ancestor | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

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
  const [saving, setSaving] = useState(false);

  const loadAncestors = async () => {
    const res = await fetch("/api/ancestors");
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data)) setAncestors(data);
  };

  useEffect(() => {
    loadAncestors();
  }, []);

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
  };

  const openEdit = (ancestor: Ancestor) => {
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
          body: JSON.stringify(data),
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ancestors.map((ancestor) => (
          <Card key={ancestor.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{ancestor.name}</span>
                <div className="flex gap-1">
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ancestor.relationship && (
                <p className="text-sm text-gray-600">{ancestor.relationship}</p>
              )}
              {ancestor.born && (
                <p className="text-sm text-gray-500">
                  Born: {ancestor.born}
                  {ancestor.birthplace && ` in ${ancestor.birthplace}`}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-400">/{ancestor.slug}</p>
            </CardContent>
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
    </div>
  );
}
