"use client";

import { useState } from "react";
import { CommentItem, type Comment } from "./comment-item";
import { CommentForm } from "./comment-form";

interface CommentThreadProps {
  comment: Comment;
  replies: Comment[];
  resourceType: string;
  resourceId: string;
  currentUserId?: string;
  isAdmin: boolean;
  onRefresh: () => void;
  onDelete: (id: string) => void;
}

export function CommentThread({
  comment,
  replies,
  resourceType,
  resourceId,
  currentUserId,
  isAdmin,
  onRefresh,
  onDelete,
}: CommentThreadProps) {
  const [replying, setReplying] = useState(false);

  return (
    <div>
      <CommentItem
        comment={comment}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        onReply={() => setReplying(true)}
        onDelete={onDelete}
      />

      {replies.length > 0 && (
        <div className="ml-6 mt-2 space-y-3 border-l-2 border-gray-100 pl-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onDelete={onDelete}
              showReply={false}
            />
          ))}
        </div>
      )}

      {replying && (
        <div className="ml-6 mt-2 pl-4">
          <CommentForm
            resourceType={resourceType}
            resourceId={resourceId}
            parentId={comment.id}
            placeholder="Write a reply..."
            onSubmitted={() => {
              setReplying(false);
              onRefresh();
            }}
            onCancel={() => setReplying(false)}
          />
        </div>
      )}
    </div>
  );
}
