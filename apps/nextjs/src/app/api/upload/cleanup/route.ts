import { NextResponse } from "next/server";
import { listIncompleteMultipartUploads, abortMultipartUpload } from "@/lib/r2";
import { validateRequest } from "@/lib/auth/validate-request";
import { db } from "@2block/db/client";
import { files } from "@2block/db/schema";
import { eq, lt, and } from "drizzle-orm";

// TODO: Make this configurable via an environment variable
// TODO: Enable when switching to Backblaze B2
// TODO: Cronjob to run this 

// Abort multipart uploads that have been in progress for more than 24 hours
const CLEANUP_THRESHOLD = 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const { user } = await validateRequest();
  const cleanupResults = [];

  if (!user || user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Find incomplete uploads in DB older than the threshold
    const incompleteUploadsInDB = await db.select()
      .from(files)
      .where(
        and(
          eq(files.uploadCompleted, false),
          lt(files.createdAt, new Date(Date.now() - CLEANUP_THRESHOLD))
        )
      );

    for (const file of incompleteUploadsInDB) {
      await db.delete(files).where(eq(files.key, file.key));

      cleanupResults.push({ key: file.key, status: "cleaned" });
    }
  
    // Get the list of incomplete uploads from S3
    const incompleteUploadsInS3 = await listIncompleteMultipartUploads();
    const now = new Date();

    console.log("Incomplete multipart uploads:", incompleteUploadsInS3);

    for (const upload of incompleteUploadsInS3) {
      if (upload.Key && upload.UploadId && upload.Initiated) {
        const uploadAge = now.getTime() - upload.Initiated.getTime();
        
        console.log("Upload age:", uploadAge);

        if (uploadAge > CLEANUP_THRESHOLD) {
          try {
            await abortMultipartUpload(upload.Key, upload.UploadId);
            
            // Remove the incomplete file from the database
            const fileId = upload.Key.split("/").pop();
            if (fileId) {
              await db.delete(files).where(eq(files.id, fileId));
            }

            cleanupResults.push({ key: upload.Key, status: "cleaned" });
          } catch (error) {
            console.error(`Failed to clean up upload for key ${upload.Key}:`, error);
            cleanupResults.push({ key: upload.Key, status: "failed" });
          }
        } else {
          cleanupResults.push({ key: upload.Key, status: "skipped" });
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