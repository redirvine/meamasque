"use client";

import { useState, useEffect, use } from "react";
import { StoryForm } from "@/components/admin/story-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface StoryData {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  coverImageId: string | null;
  authorId: string | null;
  visibility: "public" | "private";
  images: { id: string; title: string; blobUrl: string }[];
}

export default function EditStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [story, setStory] = useState<StoryData | null>(null);

  useEffect(() => {
    fetch(`/api/stories/${id}`)
      .then((r) => r.json())
      .then(setStory);
  }, [id]);

  if (!story) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div>
      <Link
        href="/admin/stories"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Stories
      </Link>
      <h1 className="mb-6 text-3xl font-bold">Edit Story</h1>
      <StoryForm storyId={id} initialData={story} />
    </div>
  );
}
