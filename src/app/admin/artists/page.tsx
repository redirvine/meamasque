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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Artist {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  relationship: string | null;
}

export default function ArtistsAdminPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [editArtist, setEditArtist] = useState<Artist | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [relationship, setRelationship] = useState("");
  const [saving, setSaving] = useState(false);

  const loadArtists = async () => {
    const res = await fetch("/api/artists");
    setArtists(await res.json());
  };

  useEffect(() => {
    loadArtists();
  }, []);

  const resetForm = () => {
    setName("");
    setSlug("");
    setBio("");
    setRelationship("");
  };

  const openEdit = (artist: Artist) => {
    setEditArtist(artist);
    setName(artist.name);
    setSlug(artist.slug);
    setBio(artist.bio ?? "");
    setRelationship(artist.relationship ?? "");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editArtist) {
        await fetch(`/api/artists/${editArtist.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug,
            bio: bio || null,
            relationship: relationship || null,
          }),
        });
        toast.success("Artist updated");
      } else {
        await fetch("/api/artists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug,
            bio: bio || undefined,
            relationship: relationship || undefined,
          }),
        });
        toast.success("Artist created");
      }
      setEditArtist(null);
      setShowCreate(false);
      resetForm();
      loadArtists();
    } catch {
      toast.error("Failed to save artist");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/artists/${deleteId}`, { method: "DELETE" });
      toast.success("Artist deleted");
      loadArtists();
    } catch {
      toast.error("Failed to delete artist");
    } finally {
      setDeleteId(null);
    }
  };

  const isFormOpen = showCreate || !!editArtist;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Artists</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowCreate(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Artist
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {artists.map((artist) => (
          <Card key={artist.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{artist.name}</span>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(artist)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteId(artist.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {artist.relationship && (
                <p className="mb-2 text-sm text-gray-500">
                  {artist.relationship}
                </p>
              )}
              {artist.bio && (
                <p className="text-sm text-gray-600">{artist.bio}</p>
              )}
              <p className="mt-2 text-xs text-gray-400">/{artist.slug}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={() => {
          setShowCreate(false);
          setEditArtist(null);
          resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editArtist ? "Edit Artist" : "Add Artist"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-friendly-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Relationship</Label>
              <Input
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder='e.g. "Mother", "Grandmother"'
              />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreate(false);
                setEditArtist(null);
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

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Artist</DialogTitle>
            <DialogDescription>
              Are you sure? This will not delete their images but will remove the
              artist association.
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
