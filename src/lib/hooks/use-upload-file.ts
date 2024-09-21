"use client";

import { useState } from "react";
import type { UploadedFile } from "../types/file-upload";

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

      const { uploadResults } = await response.json();

      // Step 2: Upload to R2 using the signed URLs
      const newUploadedFiles = await Promise.all(uploadResults.map(async (result: any, index: number) => {
        const file = files[index];
        if (!file) {
          throw new Error(`File at index ${index} is undefined`);
        }
        const { id, filename, multipart, url, uploadId, presignedUrls, chunkSize } = result;

        if (multipart) {
          // Handle multipart upload
          const chunks = Math.ceil(file.size / chunkSize);
          const parts: { PartNumber: number; ETag: string }[] = [];

          for (let i = 0; i < chunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(file.size, start + chunkSize);
            const chunk = file.slice(start, end);

            const partNumber = i + 1;
            const partUrl = presignedUrls[partNumber] as string;

            if (!partUrl) {
              throw new Error(`Presigned URL for part ${partNumber} is undefined`);
            }

            const xhr = new XMLHttpRequest();
            xhr.open("PUT", partUrl, true);
            xhr.setRequestHeader("Content-Type", file.type);

            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const totalProgress = Math.round(((i * chunkSize + event.loaded) / file.size) * 100);
                setProgresses(prev => ({ ...prev, [filename]: totalProgress }));
              }
            };

            const { etag } = await new Promise<{ etag: string | null }>((resolve, reject) => {
              xhr.onload = () => {
                if (xhr.status === 200) {
                  const etag = xhr.getResponseHeader("ETag");
                  resolve({ etag });
                } else {
                  reject(new Error(`Failed to upload part ${partNumber} for ${filename}: ${xhr.status}`));
                }
              };

              xhr.onerror = () => reject(new Error(`Network error occurred while uploading part ${partNumber} for ${filename}`));
              xhr.send(chunk);
            });

            if (etag) {
              parts.push({ PartNumber: partNumber, ETag: etag });
            } else {
              throw new Error(`Failed to get ETag for part ${partNumber} of ${filename}`);
            }
          }

          // Complete multipart upload
          const completeResponse = await fetch("/api/upload/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: `${prefix}${id}`, uploadId, parts }),
          });

          if (!completeResponse.ok) {
            throw new Error(`Failed to complete multipart upload for ${filename}`);
          }
        } else {
          // Handle single-part upload
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", url, true);
          xhr.setRequestHeader("Content-Type", file.type);

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
        }

        const getUrlResponse = await fetch(`/api/files/${id}`);

        if (!getUrlResponse.ok) {
          throw new Error(`Failed to get file URL: ${getUrlResponse.status}`);
        }
        const { url: getUrl } = await getUrlResponse.json();

        const uploadedFile = {
          id,
          url: getUrl,
          originalFilename: filename,
          contentType: file.type,
          fileSize: file.size,
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