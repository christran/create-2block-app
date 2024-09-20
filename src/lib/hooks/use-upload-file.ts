"use client";

import { useState } from "react";
import type { UploadedFile } from "../types/file-upload";
import type { PresignedUrl } from "../r2";

interface UseUploadFileProps {
  defaultUploadedFiles?: UploadedFile[];
  onUploadComplete?: (fileUrl: string) => void;
  prefix: string;
  allowedFileTypes: Record<string, string[]>;
  maxFileSize: number;
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
      // Step 1: Get the signed URLs for upload
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
        const { error } = await response.json();
        throw new Error(`${error}`);
      }

      const { presignedUrls }: { presignedUrls: PresignedUrl[] } = await response.json();

      // Step 2: Upload to R2 using the signed URLs
      const newUploadedFiles = await Promise.all(presignedUrls.map(async ({ id, filename, url }, index) => {
        const file = files[index];
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url, true);
        xhr.setRequestHeader("Content-Type", file?.type ?? "");
        // xhr.setRequestHeader("Authorization", authorizationToken);
        // xhr.setRequestHeader("X-Bz-File-Name", file?.name ?? "");
        // xhr.setRequestHeader("X-Bz-Content-Sha1", hashHex);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setProgresses(prev => ({ ...prev, [filename]: progress }));
          }
        };

        await new Promise((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status === 200) {
              resolve(null);
            } else {
              reject(new Error(`Failed to upload file ${filename}: ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error(`Network error occurred while uploading ${filename}`));
          xhr.send(file);
        });

        const getUrlResponse = await fetch(`/api/files/${id}`);

        if (!getUrlResponse.ok) {
          throw new Error(`Failed to get file URL: ${getUrlResponse.status}`);
        }
        const { url: getUrl } = await getUrlResponse.json();

        const uploadedFile = {
          id,
          url: getUrl,
          originalFilename: filename,
          contentType: file?.type || "",
          fileSize: file?.size || 0,
          createdAt: new Date(),
        };

        // Call the onUploadComplete callback with the new file URL
        if (onUploadComplete) {
          onUploadComplete(getUrl);
        }

        return uploadedFile;
      }));

      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      return newUploadedFiles;
    } catch (err) {
      console.error("Upload error:", err);
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
}