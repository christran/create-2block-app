import { type NextRequest, NextResponse } from "next/server";
import { generatePresignedUrl, createMultipartUpload, prepareUploadParts } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { files } from "@/server/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";
import { env } from "@/env";
import prettyBytes from "pretty-bytes";
import { Ratelimit, rateLimitMiddleware } from "@/lib/rate-limiter";

// todo: move to .env
const MAX_TOTAL_FILES = 25;
const MAX_TOTAL_SIZE = 1000 * 1024 * 1024;

const MULTIPART_THRESHOLD = 50 * 1024 * 1024; // 50MB threshold for multipart upload
const MIN_CHUNK_SIZE = 25 * 1024 * 1024; // 25MB minimum chunk size
const MAX_CHUNK_SIZE = 5000 * 1024 * 1024; // 5GB maximum chunk size
const MAX_PARTS = 10000; // Maximum number of parts allowed by S3-compatible services

// Create a rate limiter
const apiLimiter = new Ratelimit({
  limiter: Ratelimit.slidingWindow(5, "10s"),
  prefix: "@ratelimit/api_ratelimit_upload",
  analytics: true,
});

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

export async function POST(req: NextRequest) {
  const { user } = await validateRequest();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const identifier = req.headers.get("X-Real-IP") ?? req.headers.get("X-Forwarded-For") ?? req.ip ?? "127.0.0.1" ?? user.id;
  const rateLimitResult = await rateLimitMiddleware(apiLimiter, identifier);

  if (rateLimitResult) {
    return NextResponse.json({ error: "You're uploading too fast. Please try again later." }, { status: 429 });
  }

  try {
    const { files: fileRequests, allowedFileTypes, maxFileSize }: RequestBody = await req.json() as RequestBody;

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
          throw new Error(`File size exceeds the limit of ${prettyBytes(MAX_TOTAL_SIZE, { maximumFractionDigits: 1 })}`);
        }

        if (fileSize > maxFileSize) {
          throw new Error(
            `File size exceeds the maximum allowed size of ${prettyBytes(maxFileSize, { maximumFractionDigits: 1 })}`,
          );
        }

        const uuid = uuidv4();
        const key = `${prefix}${uuid}`;

        let uploadData;
        if (fileSize > MULTIPART_THRESHOLD) {
          // Use multipart upload for large files
          const { uploadId } = await createMultipartUpload(key, contentType);
          
          // Calculate dynamic chunk size based on file size
          let chunkSize = Math.max(MIN_CHUNK_SIZE, Math.min(MAX_CHUNK_SIZE, Math.ceil(fileSize / 6)));
          let totalParts = Math.ceil(fileSize / chunkSize);

          // Adjust chunk size if total parts exceed MAX_PARTS
          if (totalParts > MAX_PARTS) {
            chunkSize = Math.ceil(fileSize / MAX_PARTS);
            totalParts = MAX_PARTS;
          }
          
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
            chunkSize
          };

          console.log("Multipart upload started");
          console.log("Total parts:", totalParts);
          console.log("Chunk size:", prettyBytes(chunkSize, { maximumFractionDigits: 1 }));
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
          uploadCompleted: false,
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
