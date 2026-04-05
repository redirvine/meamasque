"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  resourceType: "image" | "play" | "ancestor";
  resourceId: string;
  currentUserId?: string;
  compact?: boolean;
}

export function LikeButton({
  resourceType,
  resourceId,
  currentUserId,
  compact = false,
}: LikeButtonProps) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeId, setLikeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchState = useCallback(async () => {
    const res = await fetch(
      `/api/likes?resourceType=${resourceType}&resourceId=${resourceId}`
    );
    if (res.ok) {
      const data = await res.json();
      setCount(data.count);
      setLiked(data.likedByCurrentUser);
      setLikeId(data.userLikeId);
    }
  }, [resourceType, resourceId]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  async function toggle() {
    if (!currentUserId || loading) return;
    setLoading(true);

    if (liked && likeId) {
      // Optimistic update
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
      const res = await fetch(`/api/likes/${likeId}`, { method: "DELETE" });
      if (res.ok) {
        setLikeId(null);
      } else {
        // Revert
        setLiked(true);
        setCount((c) => c + 1);
      }
    } else {
      // Optimistic update
      setLiked(true);
      setCount((c) => c + 1);
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceType, resourceId }),
      });
      if (res.ok) {
        const data = await res.json();
        setLikeId(data.id);
      } else {
        // Revert
        setLiked(false);
        setCount((c) => Math.max(0, c - 1));
      }
    }

    setLoading(false);
  }

  if (compact) {
    return (
      <span className="inline-flex items-center gap-0.5">
        <Heart
          className={`h-3 w-3 ${liked ? "fill-red-500 text-red-500" : ""}`}
        />
        {count > 0 && count}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!currentUserId || loading}
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-red-500 focus:outline-none disabled:opacity-50 disabled:cursor-default"
    >
      <Heart
        className={`h-4 w-4 transition-colors ${liked ? "fill-red-500 text-red-500" : ""}`}
      />
      <span>{count}</span>
    </button>
  );
}
