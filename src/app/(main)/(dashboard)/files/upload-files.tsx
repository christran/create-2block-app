"use client";

import { useState, useEffect } from "react";
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

const MAX_FILE_SIZE = 1000 * 1024 * 1024; // 5 MB

export function UploadFiles({ initialUserFiles }: InitialUserFilesProps) {
  const [files, setFiles] = useState<File[]>([]);

  const { onUpload, uploadedFiles, progresses, isUploading } = useUploadFile({
    defaultUploadedFiles: [],
    onUploadComplete: () => {
      toast.success("Files uploaded successfully");
      form.reset();
      setFiles([]);
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
    if (files.length > 0) {
      handleUpload(files);
    }
  }, [files]);

  const handleUpload = (filesToUpload: File[]) => {
    toast.promise(onUpload(filesToUpload), {
      loading: "Uploading files",
      error: (err) => {
        form.reset();
        setFiles([]);
        return err instanceof Error ? err.message : "Error uploading files";
      },
    });
  };

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
                          setFiles(newFiles);
                        }}
                        maxFileCount={10}
                        maxSize={MAX_FILE_SIZE}
                        accept={ALLOWED_FILE_TYPES}
                        progresses={progresses}
                        disabled={isUploading}
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

      <UploadedFilesCard initialUserFiles={initialUserFiles} newUploadedFiles={uploadedFiles} />
    </>
  );
}
