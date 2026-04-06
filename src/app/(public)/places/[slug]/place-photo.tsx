"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";

export function PlacePhoto({ src, name }: { src: string; name: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        onClick={() => setOpen(true)}
        className="h-64 w-64 flex-shrink-0 cursor-pointer rounded-lg object-cover"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-fit border-0 bg-transparent p-0 shadow-none">
          <VisuallyHidden.Root>
            <DialogTitle>{name}</DialogTitle>
          </VisuallyHidden.Root>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={name}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
