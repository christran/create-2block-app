"use client";

import * as React from "react";
import Image from "next/image";
import { Cross2Icon, FileTextIcon, PauseIcon, PlayIcon, UploadIcon } from "@radix-ui/react-icons";
import Dropzone, { type DropzoneProps, type FileRejection } from "react-dropzone";
import { toast } from "sonner";
import { motion, useSpring, useTransform } from "framer-motion";

import { cn } from "@2block/shared/utils";;
import { useControllableState } from "@/hooks/use-controllable-state";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import prettyBytes from "pretty-bytes";

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Value of the uploader.
   * @type File[]
   * @default undefined
   * @example value={files}
   */
  value?: File[];

  /**
   * Function to be called when the value changes.
   * @type (files: File[]) => void
   * @default undefined
   * @example onValueChange={(files) => setFiles(files)}
   */
  onValueChange?: (files: File[]) => void;

  /**
   * Function to be called when files are uploaded.
   * @type (files: File[]) => Promise<void>
   * @default undefined
   * @example onUpload={(files) => uploadFiles(files)}
   */
  onUpload?: (files: File[]) => Promise<void>;

  /**
   * Progress of the uploaded files.
   * @type Record<string, number> | undefined
   * @default undefined
   * @example progresses={{ "file1.png": 50 }}
   */
  progresses?: Record<string, number>;

  /**
   * Accepted file types for the uploader.
   * @type { [key: string]: string[]}
   * @default
   * ```ts
   * { "image/*": [] }
   * ```
   * @example accept={["image/png", "image/jpeg"]}
   */
  accept?: DropzoneProps["accept"];

  /**
   * Maximum file size for the uploader.
   * @type number | undefined
   * @default 1024 * 1024 * 2 // 2MB
   * @example maxSize={1024 * 1024 * 2} // 2MB
   */
  maxSize?: DropzoneProps["maxSize"];

  /**
   * Maximum number of files for the uploader.
   * @type number | undefined
   * @default 1
   * @example maxFileCount={4}
   */
  maxFileCount?: DropzoneProps["maxFiles"];

  /**
   * Whether the uploader should accept multiple files.
   * @type boolean
   * @default false
   * @example multiple
   */
  multiple?: boolean;

  /**
   * Whether the uploader is disabled.
   * @type boolean
   * @default false
   * @example disabled
   */
  disabled?: boolean;

  uploadingFiles?: {
    id: string;
    filename: string;
    multipart: boolean;
    url: string;
    uploadId: string;
    presignedUrls: string[];
    chunkSize: number;
  }[];

  onCancelUpload?: (id: string, uploadId: string, name: string) => Promise<void>;

  onPauseUpload?: (id: string) => void;
  onResumeUpload?: (id: string) => void;
  pausedUploads?: Set<string>;
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    uploadingFiles,
    onCancelUpload,
    progresses,
    accept = {
      "image/*": [],
    },
    maxSize = 1024 * 1024 * 2,
    maxFileCount = 1,
    multiple = false,
    disabled = false,
    className,
    onPauseUpload,
    onResumeUpload,
    pausedUploads,
    ...dropzoneProps
  } = props;

  const [files, setFiles] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
  });

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && maxFileCount === 1 && acceptedFiles.length > 1) {
        toast.error("Cannot upload more than 1 file at a time");
        return;
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFileCount) {
        toast.error(`Cannot upload more than ${maxFileCount} files`);
        return;
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      );

      const updatedFiles = files ? [...files, ...newFiles] : newFiles;

      setFiles(updatedFiles);

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          if (errors.some((error) => error.code === "file-too-large")) {
            toast.error(`${file.name} is too large. Maximum file size is ${prettyBytes(maxSize, { maximumFractionDigits: 1 })}`);
          } else {
            toast.error(`${file.name} is not allowed`);
          }
        });
      }

      if (onUpload && updatedFiles.length > 0 && updatedFiles.length <= maxFileCount) {
        toast.promise(
          onUpload(updatedFiles).catch((error) => {
            // Remove the files if there's an error
            setFiles((prevFiles) => prevFiles?.filter((f) => !updatedFiles.includes(f)));
            throw error; // Re-throw the error for the toast to catch
          }),
          {
            loading: `Uploading ${updatedFiles.length > 1 ? `${updatedFiles.length} files` : "1 file"}...`,
            success: () =>
              `${updatedFiles.length} ${updatedFiles.length > 1 ? "files" : "file"} uploaded successfully`,
            error: (error) => `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        );
      }
    },
    [files, maxFileCount, multiple, onUpload, setFiles, maxSize],
  );

  function onRemove(index: number, file: File) {
    if (!files) return;
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onValueChange?.(newFiles);

    // console.log(onCancelUpload);

    if (uploadingFiles && onCancelUpload) {
      const fileToCancel = uploadingFiles.find((f) => f.filename === file.name);

      console.log(fileToCancel);
      if (fileToCancel) { 
        toast.promise(onCancelUpload(fileToCancel.id, fileToCancel.uploadId, fileToCancel.filename), {
          // loading: "Attempting to cancel upload",
          success: "Upload cancelled",
          error: "Failed to cancel upload",
        });
      }
    }
  }

  // Revoke preview url when component unmounts
  React.useEffect(() => {
    return () => {
      if (!files) return;
      files.forEach((file) => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  const isDisabled = disabled || (files?.length ?? 0) >= maxFileCount;

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden">
      <Dropzone
        onDrop={onDrop}
        accept={accept}
        maxSize={maxSize}
        maxFiles={maxFileCount}
        multiple={maxFileCount > 1 || multiple}
        disabled={isDisabled}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              "group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/60 dark:hover:bg-muted/30",
              "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isDragActive && "border-muted-foreground/50",
              isDisabled && "pointer-events-none opacity-60",
              className,
            )}
            {...dropzoneProps}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <UploadIcon className="size-7 text-muted-foreground" aria-hidden="true" />
                </div>
                <p className="font-medium text-muted-foreground">Drop the files here</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <UploadIcon className="size-7 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-px">
                  <p className="font-medium text-muted-foreground">
                    Drag and drop files here or click to select files
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    You can upload
                    {maxFileCount > 1
                      ? ` ${maxFileCount === Infinity ? "multiple" : maxFileCount}
                      files (up to ${prettyBytes(maxSize, { maximumFractionDigits: 1 })} each)`
                      : ` a file with ${prettyBytes(maxSize, { maximumFractionDigits: 1 })}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Dropzone>
      {files?.length ? (
        <ScrollArea className="h-fit w-full px-3">
          <div className="flex max-h-60 flex-col gap-4">
            {files?.map((file, index) => {
              const uploadingFile = uploadingFiles?.find(f => f.filename === file.name);
              return (
                <FileCard
                  key={index}
                  file={file}
                  onRemove={() => onRemove(index, file)}
                  progress={progresses?.[file.name]}
                  onPause={() => uploadingFile && onPauseUpload?.(uploadingFile.id)}
                  onResume={() => uploadingFile && onResumeUpload?.(uploadingFile.id)}
                  isPaused={uploadingFile ? pausedUploads?.has(uploadingFile.id) ?? false : false}
                  isMultipart={uploadingFile?.multipart ?? false}
                />
              );
            })}
          </div>
        </ScrollArea>
      ) : null}
    </div>
  );
}

interface FileCardProps {
  file: File;
  onRemove: () => void;
  progress?: number;
  onPause: () => void;
  onResume: () => void;
  isPaused: boolean;
  isMultipart: boolean;
}

function FileCard({ file, progress, onRemove, onPause, onResume, isPaused, isMultipart }: FileCardProps) {
  const progressSpring = useSpring(0, { damping: 30, stiffness: 100 });
  const roundedProgress = useTransform(progressSpring, (latest) => Math.round(latest));

  React.useEffect(() => {
    if (progress !== undefined) {
      progressSpring.set(progress);
    }
  }, [progress, progressSpring]);

  return (
    <div className="relative flex items-center gap-2.5">
      <div className="flex flex-1 items-center gap-2.5">
        {isFileWithPreview(file) ? <FilePreview file={file} /> : <FileTextIcon className="size-10 text-muted-foreground" aria-hidden="true" />}
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="line-clamp-1 text-sm font-medium text-foreground/80">{file.name}</p>
              <p className="text-xs text-muted-foreground">{prettyBytes(file.size, { maximumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {progress !== undefined ? (
              <>
                <div className="h-2 flex-grow overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className="h-full bg-blue-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", damping: 20, stiffness: 80 }}
                  />
                </div>
                <motion.span className="text-xs font-medium text-muted-foreground w-8">
                  <motion.span>{roundedProgress}</motion.span>%
                </motion.span>
              </>
            ) : (
              <div className="h-2 flex-grow overflow-hidden rounded-full bg-secondary"/>
            )}
            {isMultipart && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-7 flex-shrink-0"
                onClick={isPaused ? onResume : onPause}
              >
                {isPaused ? (
                  <PlayIcon className="size-4" aria-hidden="true" />
                ) : (
                  <PauseIcon className="size-4" aria-hidden="true" />
                )}
                <span className="sr-only">{isPaused ? "Resume upload" : "Pause upload"}</span>
              </Button>
            )}
            <Button type="button" variant="outline" size="icon" className="size-7 flex-shrink-0" onClick={onRemove}>
              <Cross2Icon className="size-4" aria-hidden="true" />
              <span className="sr-only">Cancel upload</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function isFileWithPreview(file: File): file is File & { preview: string } {
  return "preview" in file && typeof file.preview === "string";
}

interface FilePreviewProps {
  file: File & { preview: string };
}

function FilePreview({ file }: FilePreviewProps) {
  if (file.type.startsWith("image/")) {
    return (
      <Image
        src={file.preview}
        alt={file.name}
        width={48}
        height={48}
        loading="lazy"
        className="aspect-square shrink-0 rounded-md object-cover"
      />
    );
  }

  return <FileTextIcon className="size-12 text-muted-foreground" aria-hidden="true" />;
}
