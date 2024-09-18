import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from '@/env';
import { formatBytes } from './utils';

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID!,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = env.R2_BUCKET_NAME!;

export async function generatePresignedUrl(
  key: string, 
  contentType: string, 
  contentLength: number,
  allowedFileTypes: string[],
  maxFileSize: number
) {
  if (!allowedFileTypes.includes(contentType)) {
    console.error(`Invalid file type: ${contentType}`);
    throw new Error(`Invalid file type: ${contentType}`);
  }

  if (contentLength > maxFileSize) {
    console.error(`File size ${formatBytes(contentLength)} exceeds maximum allowed: ${formatBytes(maxFileSize)}`);
    throw new Error(`File size ${formatBytes(contentLength)} exceeds maximum allowed: ${formatBytes(maxFileSize)}`);
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  });

  try {
    const url = await getSignedUrl(
      S3, 
      command, 
      { 
        expiresIn: 600 // URL expires in 10 minutes
      });

    return { url };
  } catch (error) {
    console.error('Error generating presigned POST URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}

export async function generatePresignedGetUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(
    S3, 
    command, 
    { 
      expiresIn: 3600 // URL expires in 1 hour
    });
}

export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await S3.send(command);
}