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

interface Play {
  id: string;
  play: string;
  date: string | null;
  role: string | null;
  location: string | null;
  description: string | null;
}

export default function PlaysAdminPage() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [editPlay, setEditPlay] = useState<Play | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [play, setPlay] = useState("");
  const [date, setDate] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const loadPlays = async () => {
    const res = await fetch("/api/plays");
    setPlays(await res.json());
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
  };

  const openEdit = (p: Play) => {
    setEditPlay(p);
    setPlay(p.play);
    setDate(p.date ?? "");
    setRole(p.role ?? "");
    setLocation(p.location ?? "");
    setDescription(p.description ?? "");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        play,
        date: date || null,
        role: role || null,
        location: location || null,
        description: description || null,
      };

      if (editPlay) {
        await fetch(`/api/plays/${editPlay.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        toast.success("Play updated");
      } else {
        await fetch("/api/plays", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plays.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{p.play}</span>
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              {p.role && (
                <p className="text-sm text-gray-600">Role: {p.role}</p>
              )}
              {p.date && (
                <p className="text-sm text-gray-500">{p.date}</p>
              )}
              {p.location && (
                <p className="text-sm text-gray-500">{p.location}</p>
              )}
            </CardContent>
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
        <DialogContent>
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
            <div className="grid grid-cols-2 gap-4">
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
