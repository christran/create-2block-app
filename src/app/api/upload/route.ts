import { NextResponse } from "next/server";
import { generatePresignedUrl } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { files } from "@/server/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";
import { formatBytes } from "@/lib/utils";
import { api } from "@/trpc/server";
import { env } from "@/env";

// todo: move to .env
const MAX_TOTAL_FILES = 25;
const MAX_TOTAL_SIZE = 25 * 1024 * 1024;

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

    const presignedUrls = await Promise.all(
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

        const presignedData = await generatePresignedUrl(
          key,
          contentType,
          fileSize,
          Object.keys(allowedFileTypes),
          maxFileSize,
        );

        // Store file info in the database
        await db.insert(files).values({
          id: uuid,
          key,
          userId: user.id,
          originalFilename: filename,
          contentType,
          fileSize,
          s3Provider: env.S3_PROVIDER as "cloudflare" | "backblaze", // TODO: remove when backblaze is the only provider
        });

        return {
          id: uuid,
          filename,
          ...presignedData,
        };
      }),
    );

    return NextResponse.json({ presignedUrls });
  } catch (error) {
    console.error("Error in Upload API route:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
