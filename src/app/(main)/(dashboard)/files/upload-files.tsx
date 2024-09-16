'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploader } from '@/components/file-uploader';
import { UploadedFilesCard } from './uploaded-files-card';
import ManageFiles from './manage-files';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export interface UploadedFile {
  id: string;
  originalFilename: string;
  url: string;
}

interface UploadFilesProps {
  initialUserFiles: { id: string }[];
}

interface PresignedUrlInfo {
  id: string;
  filename: string;
  url: string;
}

export function UploadFiles({ initialUserFiles }: UploadFilesProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progresses, setProgresses] = useState<Record<string, number>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

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
      const uploadedFiles = await Promise.all(presignedUrls.map(async ({ id, filename, url, metadata }, index) => {
        const file = files[index];
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url, true);
        xhr.setRequestHeader('Content-Type', file.type);

        // Add custom metadata headers
        // if (metadata) {
        //   Object.entries(metadata).forEach(([key, value]) => {
        //     xhr.setRequestHeader(`x-amz-meta-${key.toLowerCase()}`, value);
        //     console.log(key, value)
        //   });
        // }

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

        return {
          id,
          originalFilename: filename,
          url: getUrl,
        };
      }));

      setUploadedFiles(prev => [...prev, ...uploadedFiles]);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      setProgresses({});
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Upload</CardTitle>
          <CardDescription>Upload your files here</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploader
            maxFileCount={10}
            maxSize={MAX_FILE_SIZE}
            accept={{
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/png': ['.png'],
              'image/gif': ['.gif']
            }}
            progresses={progresses}
            onUpload={onUpload}
            disabled={isUploading}
          />
        </CardContent>
      </Card>

      <UploadedFilesCard 
        initialUserFiles={initialUserFiles}
        newUploadedFiles={uploadedFiles}
        onDeleteFile={handleDeleteFile}
      />
    </>
  );
}