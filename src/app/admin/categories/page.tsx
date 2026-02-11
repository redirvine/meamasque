"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
  };

  const openEdit = (cat: Category) => {
    setEditCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description ?? "");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editCategory) {
        await fetch(`/api/categories/${editCategory.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug,
            description: description || null,
          }),
        });
        toast.success("Category updated");
      } else {
        await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug,
            description: description || undefined,
          }),
        });
        toast.success("Category created");
      }
      setEditCategory(null);
      setShowCreate(false);
      resetForm();
      loadCategories();
    } catch {
      toast.error("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/categories/${deleteId}`, { method: "DELETE" });
      toast.success("Category deleted");
      loadCategories();
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeleteId(null);
    }
  };

  const isFormOpen = showCreate || !!editCategory;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowCreate(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{cat.name}</span>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(cat)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteId(cat.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cat.description && (
                <p className="text-sm text-gray-600">{cat.description}</p>
              )}
              <p className="mt-2 text-xs text-gray-400">/{cat.slug}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={isFormOpen}
        onOpenChange={() => {
          setShowCreate(false);
          setEditCategory(null);
          resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editCategory ? "Edit Category" : "Add Category"}
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
                setEditCategory(null);
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

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure? Images in this category will lose their category
              association.
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
