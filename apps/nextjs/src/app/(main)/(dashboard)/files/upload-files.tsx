"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/file-uploader";
import { UploadedFilesCard } from "./uploaded-files-card";
import { toast } from "sonner";
import { useUploadFile } from "@/lib/hooks/use-upload-file";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fileUploadSchema, type FileUploadSchema } from "@/lib/types/file-upload";

interface InitialUserFilesProps {
  initialUserFiles: {
    id: string;
    originalFilename: string;
    contentType: string;
    fileSize: number;
    createdAt: Date;
  }[];
}

const ALLOWED_FILE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "video/quicktime": [".mov"],
  "video/mp4": [".mp4"],
  "application/octet-stream": [".exe"],
};

const MAX_FILE_SIZE = 1000 * 1024 * 1024; // 1GB

export function UploadFiles({ initialUserFiles }: InitialUserFilesProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFileIds, setUploadedFileIds] = useState<Set<string>>(new Set());
  const [userFiles, setUserFiles] = useState(initialUserFiles);
  const [activeUploads, setActiveUploads] = useState<Set<string>>(new Set());
  const toastIdRef = useRef<string | number>();

  const { 
    onUpload, 
    uploadedFiles, 
    uploadingFiles, 
    onCancelUpload, 
    progresses, 
    isUploading, 
    onDeleteFile,
    onPauseUpload,
    onResumeUpload,
    pausedUploads,
    isPaused,
  } = useUploadFile({
    defaultUploadedFiles: [],
    onUploadComplete: (newUploadedFiles) => {
      form.reset();
      setFiles([]);
      setUploadedFileIds(prev => new Set([...prev, ...newUploadedFiles.map(file => file.id)]));
      setUserFiles(prevFiles => {
        const newFileIds = new Set(newUploadedFiles.map(file => file.id));
        const uniquePrevFiles = prevFiles.filter(file => !newFileIds.has(file.id));
        return [...uniquePrevFiles, ...newUploadedFiles];
      });
      setActiveUploads(new Set());
    },
    prefix: "files/",
    allowedFileTypes: ALLOWED_FILE_TYPES,
    maxFileSize: MAX_FILE_SIZE,
  });

  const form = useForm<FileUploadSchema>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      files: [],
    },
  });

  useEffect(() => {
    if (files.length > 0 && !isUploading) {
      void handleUpload(files);
    }
  }, [files, isUploading]);

  const handleUpload = (filesToUpload: File[]) => {
    const uploadPromise = new Promise<void>((resolve, reject) => {
      toastIdRef.current = toast.loading(`Uploading ${filesToUpload.length > 1 ? "files" : "file"}`);
      setActiveUploads(new Set(filesToUpload.map(file => file.name)));

      onUpload(filesToUpload)
        .then((newUploadedFiles) => {
          if ("error" in newUploadedFiles) {
            form.reset();
            setFiles([]);
            toast.error(newUploadedFiles.error, { 
              id: toastIdRef.current,
              duration: 3000
            });
            reject(newUploadedFiles.error);
            return;
          }
          if (Array.isArray(newUploadedFiles) && newUploadedFiles.length > 0) {
            toast.success(`${newUploadedFiles.length > 1 ? "Files" : "File"} uploaded successfully`, { 
              id: toastIdRef.current, 
              duration: 3000
            });
          } else {
            toast.dismiss(toastIdRef.current);
          }
          resolve();
        })
        .catch((err) => {
          form.reset();
          setFiles([]);
          toast.error(err instanceof Error ? err.message : "Error uploading files", { 
            id: toastIdRef.current,
            duration: 3000
          });
          reject(err);
        });
    });

    return uploadPromise;
  };

  const handleCancelUpload = async (id: string, uploadId: string, name: string) => {
    await onCancelUpload(id, uploadId);
    setFiles(prev => prev.filter(file => file.name !== name));
    setUploadedFileIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setActiveUploads(prev => {
      const newSet = new Set(prev);
      newSet.delete(name);
      return newSet;
    });
    if (activeUploads.size === 1) {
      toast.dismiss(toastIdRef.current);
    }
  };

  const handlePauseUpload = (id: string, filename: string) => {
    onPauseUpload(id);
    setActiveUploads(prev => {
      const newSet = new Set(prev);
      newSet.delete(filename);
      return newSet;
    });
    if (activeUploads.size === 1) {
      toast.dismiss(toastIdRef.current);
    }
    toast.success("Upload paused", { duration: 3000 });
  };

  const handleResumeUpload = (id: string, filename: string) => {
    onResumeUpload(id);
    setActiveUploads(prev => new Set(prev).add(filename));
    if (activeUploads.size === 0) {
      toastIdRef.current = toast.loading(`Uploading ${activeUploads.size > 1 ? "files" : "file"}`);
    }
  };

  const handleFileDelete = useCallback(async (deletedFileId: string) => {
    try {
      await onDeleteFile(deletedFileId);

      setUserFiles(prev => prev.filter(file => file.id !== deletedFileId));
      
      setUploadedFileIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(deletedFileId);
        return newSet;
      });

      // toast.success("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }

    // console.log("files", files);
  }, [onDeleteFile]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Upload</CardTitle>
          <CardDescription>Upload your files here</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="files"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FileUploader
                        value={field.value}
                        onValueChange={(newFiles) => {
                          field.onChange(newFiles);
                          setFiles(newFiles);  // Update the files state
                        }}
                        maxFileCount={10}
                        maxSize={MAX_FILE_SIZE}
                        accept={ALLOWED_FILE_TYPES}
                        progresses={progresses}
                        disabled={isUploading || isPaused}
                        uploadingFiles={uploadingFiles}
                        onCancelUpload={handleCancelUpload}
                        onPauseUpload={(id) => {
                          const file = uploadingFiles?.find(f => f.id === id);
                          if (file) handlePauseUpload(id, file.filename);
                        }}
                        onResumeUpload={(id) => {
                          const file = uploadingFiles?.find(f => f.id === id);
                          if (file) handleResumeUpload(id, file.filename);
                        }}
                        pausedUploads={pausedUploads}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      <UploadedFilesCard 
        initialUserFiles={userFiles} 
        newUploadedFiles={uploadedFiles}
        onFileDelete={handleFileDelete}
      />
    </>
  );
}
