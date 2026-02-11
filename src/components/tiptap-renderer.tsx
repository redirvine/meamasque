"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

interface TiptapRendererProps {
  content: string;
}

export function TiptapRenderer({ content }: TiptapRendererProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full",
        },
      }),
      Link.configure({
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
    ],
    content: JSON.parse(content),
    editable: false,
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none",
      },
    },
  });

  if (!editor) return null;

  return <EditorContent editor={editor} />;
}
