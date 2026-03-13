"use client";

import { timeAgo } from "@/lib/time";

export interface Comment {
  id: string;
  resourceType: string;
  resourceId: string;
  parentId: string | null;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userName: string | null;
}

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  isAdmin: boolean;
  onReply?: () => void;
  onDelete: (id: string) => void;
  showReply?: boolean;
}

export function CommentItem({
  comment,
  currentUserId,
  isAdmin,
  onReply,
  onDelete,
  showReply = true,
}: CommentItemProps) {
  const canDelete = isAdmin || comment.userId === currentUserId;

  return (
    <div className="group">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium text-gray-900">
          {comment.userName || "Unknown"}
        </span>
        <span className="text-xs text-gray-400">
          {timeAgo(comment.createdAt)}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
        {comment.content}
      </p>
      <div className="mt-1 flex gap-3">
        {showReply && onReply && (
          <button
            onClick={onReply}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Reply
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => onDelete(comment.id)}
            className="text-xs text-gray-400 hover:text-red-500"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
