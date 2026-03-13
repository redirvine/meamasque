"use client";

import { useState, useEffect, useCallback } from "react";
import { CommentThread } from "./comment-thread";
import { CommentForm } from "./comment-form";
import type { Comment } from "./comment-item";

interface CommentsSectionProps {
  resourceType: string;
  resourceId: string;
  currentUserId?: string;
  isAdmin: boolean;
}

export function CommentsSection({
  resourceType,
  resourceId,
  currentUserId,
  isAdmin,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    const res = await fetch(
      `/api/comments?resourceType=${resourceType}&resourceId=${resourceId}`
    );
    if (res.ok) {
      setComments(await res.json());
    }
    setLoading(false);
  }, [resourceType, resourceId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchComments();
    }
  }

  // Group into threads: top-level + their replies
  const topLevel = comments.filter((c) => c.parentId === null);
  const repliesByParent = new Map<string, Comment[]>();
  for (const c of comments) {
    if (c.parentId) {
      const existing = repliesByParent.get(c.parentId) || [];
      existing.push(c);
      repliesByParent.set(c.parentId, existing);
    }
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900">Comments</h3>

      {loading ? (
        <p className="mt-4 text-sm text-gray-400">Loading comments...</p>
      ) : (
        <>
          {topLevel.length > 0 && (
            <div className="mt-4 space-y-6">
              {topLevel.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  replies={repliesByParent.get(comment.id) || []}
                  resourceType={resourceType}
                  resourceId={resourceId}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  onRefresh={fetchComments}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {currentUserId && (
            <div className="mt-4">
              <CommentForm
                resourceType={resourceType}
                resourceId={resourceId}
                onSubmitted={fetchComments}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
