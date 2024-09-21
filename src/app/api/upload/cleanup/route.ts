import { NextResponse } from "next/server";
import { listIncompleteMultipartUploads, abortMultipartUpload } from "@/lib/r2";
import { validateRequest } from "@/lib/auth/validate-request";
import { db } from "@/server/db";
import { files } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { user } = await validateRequest();

  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const incompleteUploads = await listIncompleteMultipartUploads();
    const cleanupResults = [];

    for (const upload of incompleteUploads) {
      if (upload.Key && upload.UploadId) {
        try {
          await abortMultipartUpload(upload.Key, upload.UploadId);
          
          // Remove the incomplete file from the database
          const fileId = upload.Key.split("/").pop(); // Assuming the key format is "prefix/uuid"
          if (fileId) {
            await db.delete(files).where(eq(files.id, fileId));
          }

          cleanupResults.push({ key: upload.Key, status: "cleaned" });
        } catch (error) {
          console.error(`Failed to clean up upload for key ${upload.Key}:`, error);
          cleanupResults.push({ key: upload.Key, status: "failed" });
        }
      }
    }

    return NextResponse.json({ 
      message: "Cleanup of incomplete multipart uploads completed",
      results: cleanupResults
    }, { status: 200 });

  } catch (error) {
    console.error("Error in Upload Cleanup API route:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}