"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, KeyRound } from "lucide-react";
import { toast } from "sonner";

interface FamilyCode {
  id: string;
  label: string | null;
  createdAt: string;
}

export default function FamilyAccessPage() {
  const [codes, setCodes] = useState<FamilyCode[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editEntry, setEditEntry] = useState<FamilyCode | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCodes = async () => {
    const res = await fetch("/api/family-codes");
    setCodes(await res.json());
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const resetForm = () => {
    setCode("");
    setLabel("");
  };

  const openEdit = (entry: FamilyCode) => {
    setEditEntry(entry);
    setLabel(entry.label || "");
    setCode("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editEntry) {
        const res = await fetch(`/api/family-codes/${editEntry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: label || undefined,
            code: code || undefined,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "Failed to update code");
          return;
        }

        toast.success("Access code updated");
        setEditEntry(null);
      } else {
        const res = await fetch("/api/family-codes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, label: label || undefined }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "Failed to create code");
          return;
        }

        toast.success("Access code created");
        setShowCreate(false);
      }

      resetForm();
      loadCodes();
    } catch {
      toast.error("Failed to save code");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/family-codes/${deleteId}`, { method: "DELETE" });
      toast.success("Access code deleted");
      loadCodes();
    } catch {
      toast.error("Failed to delete code");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Family Access</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage access codes that unlock family-only content.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Code
        </Button>
      </div>

      {codes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <KeyRound className="mb-4 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">No access codes yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {codes.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-gray-400" />
                    <span>{entry.label || "Unnamed code"}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(entry)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteId(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Created{" "}
                  {new Date(entry.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreate || !!editEntry}
        onOpenChange={() => {
          setShowCreate(false);
          setEditEntry(null);
          resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editEntry ? "Edit Access Code" : "Create Access Code"}
            </DialogTitle>
            <DialogDescription>
              {editEntry
                ? "Update the label or set a new code."
                : "Share this code with family members so they can view private content."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Label (optional)</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder='e.g. "Shared at reunion"'
              />
            </div>
            <div className="space-y-2">
              <Label>{editEntry ? "New Access Code" : "Access Code"}</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={editEntry ? "Leave blank to keep current code" : "e.g. family2024"}
              />
              <p className="text-xs text-gray-400">
                {editEntry
                  ? "Only fill this in if you want to change the code."
                  : "At least 4 characters. This is what family members will enter."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreate(false);
                setEditEntry(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || (!editEntry && code.length < 4) || (!!editEntry && code.length > 0 && code.length < 4)}
            >
              {saving ? "Saving..." : editEntry ? "Save Changes" : "Create Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Access Code</DialogTitle>
            <DialogDescription>
              Anyone using this code will lose access to family-only content
              when their cookie expires.
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
