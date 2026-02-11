"use client";

import { useState, useCallback } from "react";
import { upload } from "@vercel/blob/client";
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
  file: File;
  blobUrl?: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  preview: string;
}

interface UploadZoneProps {
  onUploadComplete: (files: { name: string; blobUrl: string }[]) => void;
}

async function uploadFile(file: File): Promise<string> {
  // Try local upload first (FormData POST)
  // If BLOB_READ_WRITE_TOKEN is not set, the server handles it locally
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (res.ok) {
    const data = await res.json();
    if (data.url) return data.url;
  }

  // Fall back to Vercel Blob client upload
  const blob = await upload(file.name, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
  });
  return blob.url;
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      const newFiles: UploadedFile[] = Array.from(fileList)
        .filter((f) => f.type.startsWith("image/"))
        .map((file) => ({
          file,
          status: "pending" as const,
          preview: URL.createObjectURL(file),
        }));

      setFiles((prev) => [...prev, ...newFiles]);

      const completed: { name: string; blobUrl: string }[] = [];

      for (let i = 0; i < newFiles.length; i++) {
        const entry = newFiles[i];
        setFiles((prev) =>
          prev.map((f) =>
            f.file === entry.file ? { ...f, status: "uploading" } : f
          )
        );

        try {
          const url = await uploadFile(entry.file);

          setFiles((prev) =>
            prev.map((f) =>
              f.file === entry.file
                ? { ...f, status: "done", blobUrl: url }
                : f
            )
          );

          completed.push({ name: entry.file.name, blobUrl: url });
        } catch (err) {
          setFiles((prev) =>
            prev.map((f) =>
              f.file === entry.file
                ? {
                    ...f,
                    status: "error",
                    error: (err as Error).message,
                  }
                : f
            )
          );
        }
      }

      if (completed.length > 0) {
        onUploadComplete(completed);
      }
    },
    [onUploadComplete]
  );

  const removeFile = (file: File) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.file === file);
      if (entry) URL.revokeObjectURL(entry.preview);
      return prev.filter((f) => f.file !== file);
    });
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.multiple = true;
          input.accept = "image/*";
          input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files) handleFiles(files);
          };
          input.click();
        }}
      >
        <Upload className="mb-4 h-8 w-8 text-gray-400" />
        <p className="text-sm font-medium text-gray-600">
          Drop images here or click to browse
        </p>
        <p className="mt-1 text-xs text-gray-400">
          JPEG, PNG, GIF, WebP, TIFF up to 50MB
        </p>
      </div>

      {files.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((entry, i) => (
            <div
              key={i}
              className="relative flex items-center gap-3 rounded-md border p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.preview}
                alt={entry.file.name}
                className="h-14 w-14 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {entry.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(entry.file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <div className="flex-shrink-0">
                {entry.status === "uploading" && (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                )}
                {entry.status === "done" && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {entry.status === "error" && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                {entry.status !== "uploading" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(entry.file);
                    }}
                    className="ml-1 rounded p-1 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
