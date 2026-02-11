import Link from "next/link";

interface GalleryImage {
  id: string;
  title: string;
  blobUrl: string;
  dateCreated: string | null;
  artistName?: string | null;
}

export function ImageGrid({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
        <p>No artwork to display yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {images.map((image) => (
        <Link
          key={image.id}
          href={`/gallery/${image.id}`}
          className="group overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-lg"
        >
          <div className="aspect-square overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.blobUrl}
              alt={image.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-3">
            <p className="truncate text-sm font-medium">{image.title}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              {image.artistName && <span>{image.artistName}</span>}
              {image.artistName && image.dateCreated && <span>&middot;</span>}
              {image.dateCreated && <span>{image.dateCreated}</span>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
