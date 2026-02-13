"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface AboutData {
  id: string;
  name: string;
  bio: string | null;
}

export default function AboutAdminPage() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/about")
      .then((r) => r.json())
      .then((data: AboutData) => {
        setName(data.name);
        setBio(data.bio ?? "");
        setLoaded(true);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/about", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio: bio || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("About page updated");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">About</h1>
        <p className="text-gray-500">Edit the public About page content</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>About Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={8}
            />
          </div>
          <Button onClick={handleSave} disabled={saving || !name}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
