import { validateRequest } from "@/lib/auth/validate-request";
import { abortMultipartUpload } from "@/lib/r2";
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
    await abortMultipartUpload(key, uploadId);
  } catch (error) {
    console.error("Error aborting multipart upload:", error);
    return NextResponse.json({ error: "Failed to abort multipart upload" }, { status: 500 });
  }
}