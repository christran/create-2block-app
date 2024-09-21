"use client";

import { useState } from "react";
import axios from "axios";
import type { UploadedFile } from "../types/file-upload";

interface UseUploadFileProps {
  defaultUploadedFiles?: UploadedFile[];
  onUploadComplete?: (files: UploadedFile[]) => void;
  onCancelUpload?: (id: string, uploadId: string) => void;
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
  const [uploadingFiles, setUploadingFiles] = useState<UploadResult[]>([]);
  const [progresses, setProgresses] = useState<Record<string, number>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(defaultUploadedFiles);
  const [cancelTokens, setCancelTokens] = useState<Record<string, AbortController>>({});
  const [canceledFiles, setCanceledFiles] = useState<Set<string>>(new Set());

  const onUpload = async (files: File[]) => {
    setIsUploading(true);

    try {
      const uploadResults = await getSignedUrls(files, prefix, allowedFileTypes, maxFileSize);

      const newUploadedFiles = await uploadFiles(files, uploadResults);
      const filteredUploadedFiles = newUploadedFiles.filter(file => !canceledFiles.has(file.id));
      setUploadedFiles(prev => [...prev, ...filteredUploadedFiles]);
      
      if (onUploadComplete) {
        onUploadComplete(filteredUploadedFiles);
      }
      
      return filteredUploadedFiles;
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Upload canceled by user");
      } else {
        console.error("Upload error:", err);
      }
      throw err; // Re-throw the error to be caught by the toast.promise
    } finally {
      setIsUploading(false);
      setProgresses({});
      setCanceledFiles(new Set());
    }
  };

  const onCancelUpload = async (id: string, uploadId: string) => {
    const cancelToken = cancelTokens[id];

    if (cancelToken) {
      cancelToken.abort();
      setCancelTokens(prev => {
        const newTokens = { ...prev };
        delete newTokens[id];
        return newTokens;
      });
    }

    try {
      await fetch("/api/upload/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          key: `${prefix}${id}`,
          uploadId,
        }),
      });
    } catch (error) {
      console.error("Failed to cancel upload on server:", error);
    }

    setUploadingFiles(prev => prev.filter(f => f.id !== id));
    setUploadedFiles(prev => prev.filter(f => f.id !== id));

    setProgresses(prev => {
      const newProgresses = { ...prev };
      delete newProgresses[id];
      return newProgresses;
    });

    setCanceledFiles(prev => new Set(prev).add(id));
  };

  // Add this new function to handle file deletion
  const onDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete file");

      // Update local state
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      setProgresses(prev => {
        const newProgresses = { ...prev };
        delete newProgresses[fileId];
        return newProgresses;
      });

      // If there's an onUploadComplete callback, call it with the updated files
      if (onUploadComplete) {
        onUploadComplete(uploadedFiles.filter(file => file.id !== fileId));
      }

    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  };

  return {
    onUpload,
    uploadedFiles,
    uploadingFiles,
    progresses,
    isUploading,
    onCancelUpload,
    onDeleteFile, // Add this to the returned object
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

  async function uploadFiles(files: File[], uploadResults: UploadResult[]): Promise<UploadedFile[]> {
    const uploadedFiles = await Promise.all(uploadResults.map(async (result, index) => {
      const file = files[index];
      if (!file) throw new Error(`File at index ${index} is undefined`);

      const { id, filename, multipart, url, uploadId, presignedUrls, chunkSize } = result;

      setUploadingFiles(prev => [...prev, { id, filename, multipart, url, uploadId, presignedUrls, chunkSize }]);

      // Create a new AbortController for this upload
      const abortController = new AbortController();
      setCancelTokens(prev => ({ ...prev, [id]: abortController }));

      if (canceledFiles.has(id)) {
        return null;
      }

      try {
        if (multipart) {
          await handleMultipartUpload(file, filename, chunkSize, presignedUrls, uploadId, prefix, id, abortController.signal);
        } else {
          await handleSinglePartUpload(file, url, filename, abortController.signal);
        }

        const getUrl = await getFileUrl(id);

        const uploadedFile: UploadedFile = {
          id,
          url: getUrl,
          originalFilename: filename,
          contentType: file.type,
          fileSize: file.size,
          createdAt: new Date(),
        };

        return uploadedFile;
      } catch (error) {
        console.error(`Error uploading file ${filename}:`, error);
        return null;
      } finally {
        // Remove the file from uploadingFiles and cancelTokens when it's finished
        setUploadingFiles(prev => prev.filter(f => f.id !== id));
        setCancelTokens(prev => {
          const newTokens = { ...prev };
          delete newTokens[id];
          return newTokens;
        });
      }
    }));

    return uploadedFiles.filter((file): file is UploadedFile => file !== null);
  }

  async function handleMultipartUpload(file: File, filename: string, chunkSize: number, presignedUrls: string[], uploadId: string, prefix: string, id: string, signal: AbortSignal) {
    const chunks = Math.ceil(file.size / chunkSize);
    const parts: { PartNumber: number; ETag: string }[] = [];

    for (let i = 0; i < chunks; i++) {
      const partNumber = i + 1;
      const partUrl = presignedUrls[partNumber];
      if (!partUrl) throw new Error(`Presigned URL for part ${partNumber} is undefined`);

      const { headers } = await uploadChunk(file, i, chunkSize, partUrl, filename, signal);
      const etag = headers.etag as string;
      if (etag) {
        parts.push({ PartNumber: partNumber, ETag: etag });
      } else {
        throw new Error(`Failed to get ETag for part ${partNumber} of ${filename}`);
      }
    }

    await completeMultipartUpload(prefix, id, uploadId, parts);
  }

  async function uploadChunk(file: File, chunkIndex: number, chunkSize: number, partUrl: string, filename: string, signal: AbortSignal) {
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
      signal, // Add this line to pass the AbortSignal
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

  async function handleSinglePartUpload(file: File, url: string, filename: string, signal: AbortSignal) {
    await axios.put(url, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setProgresses(prev => ({ ...prev, [filename]: progress }));
        }
      },
      signal, // Add this line to pass the AbortSignal
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