"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface CommentFormProps {
  resourceType: string;
  resourceId: string;
  parentId?: string;
  placeholder?: string;
  onSubmitted: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export function CommentForm({
  resourceType,
  resourceId,
  parentId,
  placeholder = "Write a comment...",
  onSubmitted,
  onCancel,
  autoFocus,
}: CommentFormProps) {
  const [open, setOpen] = useState(!!parentId);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const trimmed = content.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceType,
          resourceId,
          content: trimmed,
          parentId: parentId || undefined,
        }),
      });
      if (res.ok) {
        setContent("");
        setOpen(false);
        onSubmitted();
      }
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <Plus className="h-4 w-4" />
        Add a comment
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        autoFocus={autoFocus !== false}
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !content.trim()}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Post"}
        </button>
        <button
          onClick={() => {
            setContent("");
            setOpen(false);
            onCancel?.();
          }}
          disabled={saving}
          className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
