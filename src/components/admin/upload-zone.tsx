"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Upload failed");
  }

  const data = await res.json();
  return data.url;
}

function DebugFileInput({ onFiles }: { onFiles: (files: File[]) => void }) {
  const debugRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = debugRef.current;
    if (!input) return;

    const handleChange = () => {
      alert(`Native change: ${input.files?.length ?? 0} file(s)`);
      if (input.files && input.files.length > 0) {
        onFiles(Array.from(input.files));
      }
    };
    const handleInput = () => {
      alert(`Native input event: ${input.files?.length ?? 0} file(s)`);
    };
    const handleClick = () => {
      alert("Input clicked");
    };

    input.addEventListener("change", handleChange);
    input.addEventListener("input", handleInput);
    input.addEventListener("click", handleClick);
    return () => {
      input.removeEventListener("change", handleChange);
      input.removeEventListener("input", handleInput);
      input.removeEventListener("click", handleClick);
    };
  }, [onFiles]);

  return (
    <div className="rounded border bg-yellow-50 p-4">
      <p className="mb-2 text-sm font-bold">
        Page rendered: {new Date().toLocaleTimeString()}
      </p>
      <input ref={debugRef} type="file" accept="image/*" />
    </div>
  );
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (rawFiles: File[]) => {
      const newFiles: UploadedFile[] = rawFiles.map((file) => ({
        file,
        status: "pending" as const,
        preview: URL.createObjectURL(file),
      }));

      if (newFiles.length === 0) return;

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

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        const fileList = e.target.files;
        const count = fileList?.length ?? 0;
        if (!fileList || count === 0) {
          alert(`onChange fired but no files (fileList: ${fileList}, length: ${count})`);
          return;
        }
        alert(`onChange: ${count} file(s) selected. First: ${fileList[0].name} (${fileList[0].type || "no type"}, ${fileList[0].size} bytes)`);
        const rawFiles = Array.from(fileList);
        processFiles(rawFiles);
      } catch (err) {
        alert(`onChange error: ${(err as Error).message}`);
      }
    },
    [processFiles]
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
      <DebugFileInput onFiles={processFiles} />
      <label
        className={cn(
          "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
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
          processFiles(Array.from(e.dataTransfer.files));
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={onInputChange}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <Upload className="mb-4 h-8 w-8 text-gray-400" />
        <p className="text-sm font-medium text-gray-600">
          Drop images here or click to browse
        </p>
        <p className="mt-1 text-xs text-gray-400">
          JPEG, PNG, GIF, WebP, TIFF, HEIC up to 50MB
        </p>
      </label>

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
