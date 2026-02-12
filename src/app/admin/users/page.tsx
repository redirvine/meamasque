"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import { Plus, Pencil, Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    const res = await fetch("/api/users");
    setAdminUsers(await res.json());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () => {
    setEmail("");
    setName("");
    setPassword("");
  };

  const openEdit = (user: AdminUser) => {
    setEditUser(user);
    setEmail(user.email);
    setName(user.name || "");
    setPassword("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editUser) {
        const body: Record<string, string> = {};
        if (email !== editUser.email) body.email = email;
        if (name !== (editUser.name || "")) body.name = name;
        if (password) body.password = password;

        if (Object.keys(body).length === 0) {
          toast.error("No changes to save");
          return;
        }

        const res = await fetch(`/api/users/${editUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "Failed to update user");
          return;
        }

        toast.success("User updated");
        setEditUser(null);
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name: name || undefined }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "Failed to create user");
          return;
        }

        toast.success("User created");
        setShowCreate(false);
      }

      resetForm();
      loadUsers();
    } catch {
      toast.error("Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/users/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete user");
        return;
      }
      toast.success("User deleted");
      loadUsers();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeleteId(null);
    }
  };

  const isSelf = (userId: string) => session?.user?.id === userId;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage admin accounts that can access this panel.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {adminUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCog className="mb-4 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">No admin users yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adminUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <UserCog className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate">
                      {user.name || user.email}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteId(user.id)}
                      disabled={isSelf(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  {user.email}
                  {isSelf(user.id) && (
                    <span className="ml-2 text-xs text-blue-500">(you)</span>
                  )}
                  <br />
                  Created{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreate || !!editUser}
        onOpenChange={() => {
          setShowCreate(false);
          setEditUser(null);
          resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editUser ? "Edit User" : "Create Admin User"}
            </DialogTitle>
            <DialogDescription>
              {editUser
                ? "Update this user's details."
                : "Add a new admin who can manage the portfolio."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name (optional)</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{editUser ? "New Password" : "Password"}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  editUser
                    ? "Leave blank to keep current password"
                    : "At least 8 characters"
                }
              />
              {editUser && (
                <p className="text-xs text-gray-400">
                  Only fill this in if you want to change the password.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreate(false);
                setEditUser(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                !email ||
                (!editUser && password.length < 8) ||
                (!!editUser && password.length > 0 && password.length < 8)
              }
            >
              {saving
                ? "Saving..."
                : editUser
                  ? "Save Changes"
                  : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Admin User</DialogTitle>
            <DialogDescription>
              This user will permanently lose access to the admin panel. This
              action cannot be undone.
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
