import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "../../../../auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { createId } from "@paralleldrive/cuid2";
import sharp from "sharp";

const useLocalStorage = !process.env.BLOB_READ_WRITE_TOKEN;

const HEIC_TYPES = ["image/heic", "image/heif"];

async function convertToJpeg(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer).jpeg({ quality: 90 }).toBuffer();
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  let buffer = Buffer.from(await file.arrayBuffer()) as Buffer;
  let ext = path.extname(file.name) || ".jpg";
  let contentType = file.type;

  // Convert HEIC/HEIF to JPEG
  if (HEIC_TYPES.includes(file.type) || /\.hei[cf]$/i.test(file.name)) {
    buffer = await convertToJpeg(buffer);
    ext = ".jpg";
    contentType = "image/jpeg";
  }

  const filename = `${createId()}${ext}`;

  if (useLocalStorage) {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}` });
  }

  // Vercel Blob server-side upload
  const blob = await put(filename, buffer, {
    access: "public",
    contentType,
  });

  return NextResponse.json({ url: blob.url });
}
