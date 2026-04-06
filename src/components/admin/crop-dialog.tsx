"use client";

import { useState, useRef } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CropDialogProps {
  imageUrl: string;
  imageId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropped: (newBlobUrl: string) => void;
}

export function CropDialog({
  imageUrl,
  imageId,
  open,
  onOpenChange,
  onCropped,
}: CropDialogProps) {
  const [crop, setCrop] = useState<Crop>();
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleSave = async () => {
    if (!crop || !imgRef.current) return;

    const img = imgRef.current;

    // Convert pixel crop to percentage of natural image dimensions
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const x = ((crop.x * scaleX) / img.naturalWidth) * 100;
    const y = ((crop.y * scaleY) / img.naturalHeight) * 100;
    const width = ((crop.width * scaleX) / img.naturalWidth) * 100;
    const height = ((crop.height * scaleY) / img.naturalHeight) * 100;

    setSaving(true);
    try {
      const res = await fetch(`/api/images/${imageId}/crop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x, y, width, height }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Crop failed");
      }

      toast.success("Image cropped");
      onCropped(data.blobUrl);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to crop image");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-auto">
          <ReactCrop crop={crop} onChange={setCrop}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Crop preview"
              className="max-w-full"
            />
          </ReactCrop>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !crop}>
            {saving ? "Saving..." : "Save Crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
