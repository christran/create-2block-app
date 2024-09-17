import { useState } from "react";

export interface UploadedFile {
  id: string;
  originalFilename: string;
  url: string;
}

interface UseUploadFileProps {
  defaultUploadedFiles?: UploadedFile[];
  onUploadComplete?: (fileUrl: string) => void;
}

export function useUploadFile({ defaultUploadedFiles = [], onUploadComplete }: UseUploadFileProps = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progresses, setProgresses] = useState<Record<string, number>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(defaultUploadedFiles);

  const onUpload = async (files: File[]) => {
    setIsUploading(true);

    try {
      // Step 1: Get the signed URLs for upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          files: files.map(f => ({ filename: f.name, contentType: f.type }))
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get upload URLs: ${response.status}`);
      }

      const { presignedUrls } = await response.json();

      // Step 2: Upload to R2 using the signed URLs
      const newUploadedFiles = await Promise.all(presignedUrls.map(async ({ id, filename, url, metadata }, index) => {
        const file = files[index];
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url, true);
        xhr.setRequestHeader('Content-Type', file.type);

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
          originalFilename: filename,
          url: getUrl,
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
      console.error('Upload error:', err);
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