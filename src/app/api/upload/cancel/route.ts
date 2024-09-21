import { validateRequest } from "@/lib/auth/validate-request";
import { abortMultipartUpload } from "@/lib/r2";
import { db } from "@/server/db";
import { files } from "@/server/db/schema";
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

  console.log("Cancelling multipart upload", key, uploadId);

  try {
    await abortMultipartUpload(key, uploadId);

    // delete the file from the database
    await db.delete(files).where(eq(files.key, key));

    return NextResponse.json({ message: "Multipart uploads cancelled" }, { status: 200 });
  } catch (error) {
    console.error("Error aborting multipart uploads:", error);
    return NextResponse.json({ error: "Failed to abort multipart uploads" }, { status: 500 });
  }
}