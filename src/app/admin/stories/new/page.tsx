import { StoryForm } from "@/components/admin/story-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewStoryPage() {
  return (
    <div>
      <Link
        href="/admin/stories"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Stories
      </Link>
      <h1 className="mb-6 text-3xl font-bold">New Story</h1>
      <StoryForm />
    </div>
  );
}
