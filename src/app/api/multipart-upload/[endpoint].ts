import { type NextRequest, NextResponse } from "next/server";
import { createMultipartUpload, prepareUploadParts, completeMultipartUpload, listParts, abortMultipartUpload, signPart } from "@/lib/r2";
import { validateRequest } from "@/lib/auth/validate-request";

export async function POST(request: NextRequest, { params }: { params: { endpoint: string } }) {
  const { user } = await validateRequest();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { endpoint } = params;

  if (!endpoint) return NextResponse.json({ error: "Endpoint is required" }, { status: 400 });

  switch (endpoint) {
    case "create":
      return createMultipartUpload(request);
    case "prepare":
      return prepareUploadParts(request);
    case "complete":
      return completeMultipartUpload(request);
    case "list":
      return listParts(request);
    case "abort":
      return abortMultipartUpload(request);
    case "sign":
      return signPart(request);
    default:
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
  }
}
