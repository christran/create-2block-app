import { validateRequest } from "@2block/auth";
import { abortMultipartUpload } from "@/lib/r2";
import { db } from "@2block/db/client";
import { files } from "@2block/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

interface RequestBody {
  key: string;
  uploadId: string;
}

export async function POST(request: Request) {
  const { key, uploadId } = await request.json() as RequestBody;
  const { user } = await validateRequest();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {

    if (uploadId) {
      await abortMultipartUpload(key, uploadId);
    }

    // delete the file from the database
    await db.delete(files).where(eq(files.key, key));

    return NextResponse.json({ message: "Upload cancelled" }, { status: 200 });
  } catch (error) {
    console.error("Error aborting upload:", error);
    return NextResponse.json({ error: "Failed to abort upload" }, { status: 500 });
  }
}