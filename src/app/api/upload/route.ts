import { NextResponse } from "next/server";
import { generatePresignedUrl, createMultipartUpload, prepareUploadParts } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { files } from "@/server/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";
import { formatBytes } from "@/lib/utils";
import { env } from "@/env";

// todo: move to .env
const MAX_TOTAL_FILES = 25;
const MAX_TOTAL_SIZE = 1000 * 1024 * 1024;

const MULTIPART_THRESHOLD = 50 * 1024 * 1024; // 100MB threshold for multipart upload
const CHUNK_SIZE = 5 * 1024 * 1024; // 25MB chunk size for multipart upload
const MAX_PARTS = 6; // Maximum number of parts for multipart upload

interface FileRequest {
  prefix: string;
  filename: string;
  contentType: string;
  fileSize: number;
}

interface RequestBody {
  files: FileRequest[];
  allowedFileTypes: Record<string, string>;
  maxFileSize: number;
}

export async function POST(request: Request) {
  const { user } = await validateRequest();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { files: fileRequests, allowedFileTypes, maxFileSize }: RequestBody = await request.json() as RequestBody;

    if (!fileRequests || !Array.isArray(fileRequests) || !allowedFileTypes || !maxFileSize) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    if (fileRequests.length > MAX_TOTAL_FILES) {
      return NextResponse.json(
        { error: `Maximum number of files exceeded ${MAX_TOTAL_FILES} files per upload` },
        { status: 400 },
      );
    }

    const uploadResults = await Promise.all(
      fileRequests.map(async ({ prefix, filename, contentType, fileSize }: FileRequest) => {
        if (!prefix || !filename || !contentType || !fileSize) {
          throw new Error("Missing prefix or filename or contentType or fileSize");
        }

        // Additional server-side validation
        if (!Object.keys(allowedFileTypes).includes(contentType)) {
          throw new Error(`Invalid file type: ${contentType}`);
        }

        if (fileSize > MAX_TOTAL_SIZE) {
          throw new Error(`File size exceeds the limit of ${formatBytes(MAX_TOTAL_SIZE)}`);
        }

        if (fileSize > maxFileSize) {
          throw new Error(
            `File size exceeds the maximum allowed size of ${formatBytes(maxFileSize)}`,
          );
        }

        const uuid = uuidv4();
        const key = `${prefix}${uuid}`;

        let uploadData;
        if (fileSize > MULTIPART_THRESHOLD) {
          // Use multipart upload for large files
          const { uploadId } = await createMultipartUpload(key, contentType);
          const totalParts = Math.min(Math.ceil(fileSize / CHUNK_SIZE), MAX_PARTS);
          const parts = Array.from({ length: totalParts }, (_, i) => ({
            key,
            partNumber: i + 1,
            uploadId,
          }));
          const { presignedUrls } = await prepareUploadParts({ parts });
          uploadData = { 
            multipart: true, 
            uploadId, 
            presignedUrls, 
            chunkSize: Math.ceil(fileSize / totalParts) 
          };

          console.log("Multipart upload started");
          console.log("presignedUrls: ", Object.keys(presignedUrls).length);
        } else {
          // Use single-part upload for smaller files
          const { url } = await generatePresignedUrl(
            key,
            contentType,
            fileSize,
            Object.keys(allowedFileTypes),
            maxFileSize,
          );
          uploadData = { multipart: false, url };
        }

        // Store file info in the database
        await db.insert(files).values({
          id: uuid,
          key,
          userId: user.id,
          originalFilename: filename,
          contentType,
          fileSize,
          s3Provider: env.S3_PROVIDER as "cloudflare" | "backblaze", // TODO: remove when backblaze is the only provider
          uploadCompleted: fileSize > MULTIPART_THRESHOLD ? false : true,
        });

        return {
          id: uuid,
          filename,
          ...uploadData,
        };
      }),
    );

    return NextResponse.json({ uploadResults }, { status: 200 });
  } catch (error) {
    console.error("Error in Upload API route:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
