import { type NextRequest, NextResponse } from "next/server";
import { generatePresignedGetUrl, deleteFile } from "@/lib/r2";
import { db } from "@2block/db/client";
import { files } from "@2block/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/get-session";
import { validate as uuidValidate } from "uuid";
import { env } from "@/env";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // const { user } = await getSession();

  // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  // TODO: remove this when Backblaze is the only provider and bucket is public
  const publicBucket = env.S3_PROVIDER === "cloudflare" ? true : false;

  try {
    if (!params.id) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    // Validate UUID
    if (!uuidValidate(params.id)) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    const fileRecord = await db.query.files.findFirst({
      where: eq(files.id, params.id),
    });

    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (publicBucket) {
      // https://media.2block.co/
      return NextResponse.json({
        url: `https://media.2block.co/${fileRecord.key}`,
        filename: fileRecord.originalFilename,
      });
    }

    const presignedUrl = await generatePresignedGetUrl(fileRecord.key);

    return NextResponse.json({ url: presignedUrl, filename: fileRecord.originalFilename }, { status: 200 });
  } catch (error) {
    console.error("Error in GET file route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { user } = await getSession();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const fileRecord = await db.query.files.findFirst({
      where: eq(files.id, params.id),
    });

    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check if the user is the owner of the file
    if (fileRecord.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await deleteFile(fileRecord.key);

    await db.delete(files).where(eq(files.id, params.id));

    return NextResponse.json({ message: "File deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE file route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
