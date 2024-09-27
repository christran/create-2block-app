import { NextResponse } from "next/server";
import { completeMultipartUpload } from "@/lib/r2";
import { validateRequest } from "@/lib/auth/validate-request";
import { db } from "@2block/db/client";
import { files } from "@2block/db/schema";
import { eq } from "drizzle-orm";

interface RequestBody {
  key: string;
  uploadId: string;
  parts: Array<{ PartNumber: number; ETag: string }>;
}

export async function POST(request: Request) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { key, uploadId, parts }: RequestBody = await request.json() as RequestBody;

    if (!key) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // Complete the multipart upload
    if (uploadId && parts && Array.isArray(parts)) {
      const result = await completeMultipartUpload(key, uploadId, parts);

      if (!result.Key) {
        throw new Error("Failed to complete multipart upload: Key is undefined");
      }
    }

    await db.update(files)
      .set({ uploadCompleted: true })
      .where(eq(files.key, key));

    return NextResponse.json({ 
      message: "Upload completed successfully",
      // key: result.Key,
      // location: result.Location
    }, { status: 200 });

  } catch (error) {
    console.error("Error in Upload Complete API route:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}