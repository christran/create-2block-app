import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyCard } from "@/components/empty-card";
import { Button } from "@/components/ui/button";
import { FileIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import prettyBytes from "pretty-bytes";

interface FileObject {
  id: string;
  url?: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  createdAt: Date;
}

interface UploadedFilesCardProps {
  initialUserFiles: FileObject[];
  newUploadedFiles: FileObject[];
  onFileDelete: (fileId: string) => void;  // Add this line
}

export function UploadedFilesCard({ initialUserFiles, newUploadedFiles, onFileDelete }: UploadedFilesCardProps) {
  const queryClient = useQueryClient();
  const [localFiles, setLocalFiles] = useState<FileObject[]>([]);

  const fetchFileDetails = async (fileId: string): Promise<Partial<FileObject>> => {
    const response = await fetch(`/api/files/${fileId}`);
    if (!response.ok) throw new Error("Failed to fetch file details");
    const data: unknown = await response.json();
    if (typeof data === "object" && data !== null) {
      return data as Partial<FileObject>;
    }
    throw new Error("Invalid data received from server");
  };

  const { data: allFiles, isLoading } = useQuery({
    queryKey: ["files"],
    queryFn: async () => {
      const combinedFiles = [...initialUserFiles, ...newUploadedFiles];
      const uniqueFiles = Array.from(new Map(combinedFiles.map(file => [file.id, file])).values());
      const filesWithUrls = uniqueFiles.filter((file) => file.url);
      const filesToFetch = uniqueFiles.filter((file) => !file.url);

      const fetchedDetails = await Promise.all(
        filesToFetch.map(async (file) => {
          if (typeof file.id !== "string") {
            console.error("Invalid file ID:", file.id);
            return null;
          }
          try {
            const data = await fetchFileDetails(file.id);
            return { ...file, ...data } as FileObject;
          } catch (error) {
            console.error(`Error fetching details for file ${file.id}:`, error);
            return null;
          }
        }),
      );

      const allFilesWithDetails = [
        ...filesWithUrls,
        ...fetchedDetails.filter((file): file is FileObject => file !== null),
      ];

      // Ensure uniqueness by id
      const uniqueAllFilesWithDetails = Array.from(
        new Map(allFilesWithDetails.map(file => [file.id, file])).values()
      );

      // Sort files by createdAt in descending order
      return uniqueAllFilesWithDetails.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  useEffect(() => {
    if (allFiles) {
      setLocalFiles(allFiles);
    }
  }, [allFiles]);

  useEffect(() => {
    // Update the query data when new files are uploaded
    if (newUploadedFiles.length > 0) {
      queryClient.setQueryData(["files"], (oldData: FileObject[] | undefined) => {
        if (!oldData) return newUploadedFiles;
        const combinedFiles = [...oldData, ...newUploadedFiles];
        return Array.from(new Map(combinedFiles.map(file => [file.id, file])).values())
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });
    }
  }, [newUploadedFiles, queryClient]);

  const deleteMutation: UseMutationResult<void, Error, string> = useMutation({
    mutationFn: onFileDelete,
    onSuccess: (_, fileId) => {
      toast.success("File deleted successfully");
      // Update local state
      setLocalFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      // Update query cache
      queryClient.setQueryData(
        ["files"],
        (oldData: FileObject[] | undefined) => oldData ? oldData.filter(file => file.id !== fileId) : []
      );
    },
    onError: (error: Error) => {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    },
  });

  const handleDelete = (fileId: string) => {
    deleteMutation.mutate(fileId);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Files</CardTitle>
        <CardDescription>View and manage your files</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="relative aspect-square">
                <Skeleton className="h-full w-full rounded-md" />
              </div>
            ))}
          </div>
        ) : localFiles.length === 0 ? (
          <EmptyCard
            title="No files uploaded"
            description="Upload some files to see them here"
            className="w-full"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {localFiles.map((file) =>
              file?.url ? (
                <div
                  key={file.id}
                  className="group aspect-square overflow-hidden rounded-md bg-slate-100 shadow-md relative"
                >
                  {file.contentType.startsWith("image/") ? (
                    <Image
                      unoptimized={file.contentType === "image/gif"} // TODO: remove if using cloudflare images
                      quality={100}
                      src={file.url || ""}
                      alt={file.originalFilename}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FileIcon className="h-16 w-16 text-slate-400" />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute left-1 top-1 h-7 w-7 p-0 opacity-0 transition-opacity group-hover:opacity-80 md:right-2 md:top-2 md:h-9 md:w-9"
                    onClick={() => handleDelete(file.id)}
                    disabled={deleteMutation.isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="max-w-[30%] truncate">
                        {prettyBytes(file.fileSize, { maximumFractionDigits: 2 })}
                        <br />
                        {file.contentType}
                      </span>
                      <span className="max-w-[40%] truncate text-center">
                        {file.originalFilename}
                      </span>
                      <span className="max-w-[30%] truncate text-right">
                        {new Date(file.createdAt).toLocaleDateString()}
                        <br />
                        {new Date(file.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null,
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
