import {
  S3Client,
  UploadPartCommand,
  ListPartsCommand,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListMultipartUploadsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/env";
import { formatBytes } from "./utils";

export interface PresignedUrl {
  id: string;
  filename: string;
  url: string;
}

const S3 = new S3Client({
  region: "auto",
  endpoint: env.S3_PROVIDER === "cloudflare" ? env.R2_ENDPOINT : env.B2_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_PROVIDER === "cloudflare" ? env.R2_ACCESS_KEY_ID : env.B2_ACCESS_KEY_ID,
    secretAccessKey: env.S3_PROVIDER === "cloudflare" ? env.R2_SECRET_ACCESS_KEY : env.B2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = env.BUCKET_NAME;

export async function generatePresignedUrl(
  key: string,
  contentType: string,
  contentLength: number,
  allowedFileTypes: string[],
  maxFileSize: number,
) {
  if (!allowedFileTypes.includes(contentType)) {
    console.error(`Invalid file type: ${contentType}`);
    throw new Error(`Invalid file type: ${contentType}`);
  }

  if (contentLength > maxFileSize) {
    console.error(
      `File size ${formatBytes(contentLength)} exceeds maximum allowed: ${formatBytes(maxFileSize)}`,
    );
    throw new Error(
      `File size ${formatBytes(contentLength)} exceeds maximum allowed: ${formatBytes(maxFileSize)}`,
    );
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    // ContentLength: contentLength,
  });

  try {
    const url = await getSignedUrl(S3, command, {
      expiresIn: 600, // URL expires in 10 minutes
    });

    return { url };
  } catch (error) {
    console.error("Error generating presigned POST URL:", error);
    throw new Error("Failed to generate upload URL");
  }
}

export async function generatePresignedGetUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(S3, command, {
    expiresIn: 3600, // URL expires in 1 hour
  });
}

export async function createMultipartUpload(key: string, contentType: string) {
  const command = new CreateMultipartUploadCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const response = await S3.send(command);

  if (!response.UploadId) {
    throw new Error("Failed to create multipart upload: UploadId is undefined");
  }

  return {
    key: response.Key,
    uploadId: response.UploadId
  };
}

export async function prepareUploadParts(partData: { parts: Array<{ key: string, partNumber: number, uploadId: string }> }) {
  const { parts } = partData;

  const response: { presignedUrls: Record<number, string> } = {
    presignedUrls: {},
  };

  for (const part of parts) {
    try {
      const params = {
        Bucket: BUCKET_NAME,
        Key: part.key,
        PartNumber: part.partNumber,
        UploadId: part.uploadId
      };

      const command = new UploadPartCommand(params);
      const url = await getSignedUrl(S3, command, {
        expiresIn: 600, // URL expires in 10 minutes
      });

      response.presignedUrls[part.partNumber] = url;
    } catch (error) {
      console.error("Error preparing upload part:", error);
      throw new Error("Failed to prepare upload part");
    }
  }

  return response;
}

export async function listParts(key: string, uploadId: string) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      UploadId: uploadId
    };

    const command = new ListPartsCommand({...params});
    const response = await S3.send(command);
    
    return response.Parts;
  } catch (error) {
    console.error("Error listing parts: ", error);
    throw new Error("Failed to list parts");
  }
}

export async function completeMultipartUpload(key: string, uploadId: string, parts: { PartNumber: number }[]) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts
      }
    };

    const command = new CompleteMultipartUploadCommand({...params});
    const response = await S3.send(command);

    return response;
  } catch (error) {
    console.error("Error completing multipart upload:", error);
    throw new Error("Failed to complete multipart upload");
  }
}

export async function abortMultipartUpload(key: string, uploadId: string) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      UploadId: uploadId
    };

    const command = new AbortMultipartUploadCommand(params);
    await S3.send(command);
  } catch (error) {
    console.error("Error aborting multipart upload:", error);
    throw new Error("Failed to abort multipart upload");
  }
}

export async function signPart(key: string, partNumber: number, uploadId: string) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    PartNumber: partNumber,
    UploadId: uploadId
  };

  const command = new UploadPartCommand({...params});
  const url = await getSignedUrl(S3, command, {
    expiresIn: 600, // URL expires in 10 minutes
  });

  return { url };
}

export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await S3.send(command);
}

export async function listIncompleteMultipartUploads() {
  try {
    const command = new ListMultipartUploadsCommand({
      Bucket: BUCKET_NAME,
    });

    const response = await S3.send(command);
    return response.Uploads ?? [];
  } catch (error) {
    console.error("Error listing incomplete multipart uploads:", error);
    throw new Error("Failed to list incomplete multipart uploads");
  }
}
