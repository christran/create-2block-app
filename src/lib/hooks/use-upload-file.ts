"use client";

import { useState } from "react";
import axios from "axios";
import type { UploadedFile } from "../types/file-upload";

interface UseUploadFileProps {
  defaultUploadedFiles?: UploadedFile[];
  onUploadComplete?: (fileUrl: string) => void;
  prefix: string;
  allowedFileTypes: Record<string, string[]>;
  maxFileSize: number;
}

interface UploadResult {
  id: string;
  filename: string;
  multipart: boolean;
  url: string;
  uploadId: string;
  presignedUrls: string[];
  chunkSize: number;
}

export function useUploadFile({
  defaultUploadedFiles = [],
  onUploadComplete,
  prefix,
  allowedFileTypes,
  maxFileSize
}: UseUploadFileProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progresses, setProgresses] = useState<Record<string, number>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(defaultUploadedFiles);

  const onUpload = async (files: File[]) => {
    setIsUploading(true);

    try {
      const uploadResults = await getSignedUrls(files, prefix, allowedFileTypes, maxFileSize);

      const newUploadedFiles = await uploadFiles(files, uploadResults, onUploadComplete);
      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      return newUploadedFiles;
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Upload cancelled:", err.message);
      } else {
        console.error("Upload error:", err);
      }
      throw err;
    } finally {
      setIsUploading(false);
      setProgresses({});
    }
  };

  return {
    onUpload,
    uploadedFiles,
    progresses,
    isUploading,
  }

  async function getSignedUrls(files: File[], prefix: string, allowedFileTypes: Record<string, string[]>, maxFileSize: number): Promise<UploadResult[]> {
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        files: files.map(f => ({ prefix, filename: f.name, contentType: f.type, fileSize: f.size })),
        allowedFileTypes,
        maxFileSize
      }),
    });

    if (!response.ok) {
      const { error } = await response.json() as { error: string };
      throw new Error(`${error}`);
    }

    const { uploadResults } = await response.json() as { uploadResults: UploadResult[] };
    return uploadResults;
  }

  async function uploadFiles(files: File[], uploadResults: UploadResult[], onUploadComplete?: (fileUrl: string) => void): Promise<UploadedFile[]> {
    return Promise.all(uploadResults.map(async (result, index) => {
      const file = files[index];
      if (!file) throw new Error(`File at index ${index} is undefined`);

      const { id, filename, multipart, url, uploadId, presignedUrls, chunkSize } = result;

      if (multipart) {
        await handleMultipartUpload(file, filename, chunkSize, presignedUrls, uploadId, prefix, id);
      } else {
        await handleSinglePartUpload(file, url, filename);
      }

      const getUrl = await getFileUrl(id);

      const uploadedFile = {
        id,
        url: getUrl,
        originalFilename: filename,
        contentType: file.type,
        fileSize: file.size,
        createdAt: new Date(),
      };

      if (onUploadComplete) onUploadComplete(getUrl);

      return uploadedFile;
    }));
  }

  async function handleMultipartUpload(file: File, filename: string, chunkSize: number, presignedUrls: string[], uploadId: string, prefix: string, id: string) {
    const chunks = Math.ceil(file.size / chunkSize);
    const parts: { PartNumber: number; ETag: string }[] = [];

    for (let i = 0; i < chunks; i++) {
      const partNumber = i + 1;
      const partUrl = presignedUrls[partNumber];
      if (!partUrl) throw new Error(`Presigned URL for part ${partNumber} is undefined`);

      const { headers } = await uploadChunk(file, i, chunkSize, partUrl, filename);
      const etag = headers.etag as string;
      if (etag) {
        parts.push({ PartNumber: partNumber, ETag: etag });
      } else {
        throw new Error(`Failed to get ETag for part ${partNumber} of ${filename}`);
      }
    }

    await completeMultipartUpload(prefix, id, uploadId, parts);
  }

  async function uploadChunk(file: File, chunkIndex: number, chunkSize: number, partUrl: string, filename: string) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(file.size, start + chunkSize);
    const chunk = file.slice(start, end);

    return axios.put(partUrl, chunk, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const totalProgress = Math.round(((chunkIndex * chunkSize + progressEvent.loaded) / file.size) * 100);
          setProgresses(prev => ({ ...prev, [filename]: totalProgress }));
        }
      },
    });
  }

  async function completeMultipartUpload(prefix: string, id: string, uploadId: string, parts: { PartNumber: number; ETag: string }[]) {
    const completeResponse = await fetch("/api/upload/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: `${prefix}${id}`, uploadId, parts }),
    });

    if (!completeResponse.ok) {
      throw new Error("Failed to complete multipart upload");
    }
  }

  async function handleSinglePartUpload(file: File, url: string, filename: string) {
    await axios.put(url, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setProgresses(prev => ({ ...prev, [filename]: progress }));
        }
      },
    });
  }

  async function getFileUrl(id: string): Promise<string> {
    const getUrlResponse = await fetch(`/api/files/${id}`);
    if (!getUrlResponse.ok) {
      throw new Error(`Failed to get file URL: ${getUrlResponse.status}`);
    }
    const { url } = await getUrlResponse.json() as { url: string };
    return url;
  }
}