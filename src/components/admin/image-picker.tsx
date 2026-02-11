"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageItem {
  id: string;
  title: string;
  blobUrl: string;
  dateCreated: string | null;
}

interface ImagePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (images: ImageItem[]) => void;
  selectedIds?: string[];
  multiple?: boolean;
}

export function ImagePicker({
  open,
  onClose,
  onSelect,
  selectedIds = [],
  multiple = true,
}: ImagePickerProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(selectedIds)
  );

  useEffect(() => {
    if (open) {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      fetch(`/api/images?${params}`)
        .then((r) => r.json())
        .then(setImages)
        .catch(() => {});
    }
  }, [open, search]);

  useEffect(() => {
    setSelected(new Set(selectedIds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds?.join(",")]);

  const toggleImage = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    const selectedImages = images.filter((img) => selected.has(img.id));
    onSelect(selectedImages);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {multiple ? "Select Images" : "Select Image"}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search images..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {images.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No images found
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image) => {
                const isSelected = selected.has(image.id);
                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => toggleImage(image.id)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-md border-2 transition-all",
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-transparent hover:border-gray-300"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.blobUrl}
                      alt={image.title}
                      className="h-full w-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute right-1 top-1 rounded-full bg-blue-500 p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 p-1.5">
                      <p className="truncate text-xs text-white">
                        {image.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selected.size === 0}>
            {multiple
              ? `Select ${selected.size} Image${selected.size !== 1 ? "s" : ""}`
              : "Select Image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
