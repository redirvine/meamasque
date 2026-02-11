import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "../../../../auth";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/tiff",
            "image/bmp",
          ],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB
        };
      },
      onUploadCompleted: async () => {
        // Could do post-processing here
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
