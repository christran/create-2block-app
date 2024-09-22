/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyCard } from "@/components/empty-card";
import { Button } from "@/components/ui/button";
import { FileIcon, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import prettyBytes from "pretty-bytes";
import { useInView } from "react-intersection-observer";

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
  onFileDelete: (fileId: string) => void;
}

const ITEMS_PER_PAGE = 9; // Adjust this value as needed

export function UploadedFilesCard({ initialUserFiles, newUploadedFiles, onFileDelete }: UploadedFilesCardProps) {
  const queryClient = useQueryClient();
  const [localFiles, setLocalFiles] = useState<FileObject[]>([]);
  const { ref, inView } = useInView();
  const newUploadedFileIdsRef = useRef(new Set<string>());

  const fetchFileDetails = async (fileId: string): Promise<Partial<FileObject>> => {
    const response = await fetch(`/api/files/${fileId}`);
    if (!response.ok) throw new Error("Failed to fetch file details");
    const data: unknown = await response.json();
    if (typeof data === "object" && data !== null) {
      return data as Partial<FileObject>;
    }
    throw new Error("Invalid data received from server");
  };

  const fetchFiles = async ({ pageParam = 0 }): Promise<{ files: FileObject[], nextCursor: number | null }> => {
    const start = pageParam * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    
    const combinedFiles = [...initialUserFiles, ...newUploadedFiles];
    const uniqueFiles = Array.from(new Map(combinedFiles.map(file => [file.id, file])).values());
    
    // Filter out files that were added via newUploadedFiles
    const filesToFetch = uniqueFiles.filter(file => !newUploadedFileIdsRef.current.has(file.id));
    
    const paginatedFiles = filesToFetch.slice(start, end);
    
    const filesWithDetails = await Promise.all(
      paginatedFiles.map(async (file) => {
        if (!file.url) {
          try {
            const data = await fetchFileDetails(file.id);
            return { ...file, ...data } as FileObject;
          } catch (error) {
            console.error(`Error fetching details for file ${file.id}:`, error);
            return null;
          }
        }
        return file;
      })
    );

    const validFiles = filesWithDetails.filter((file): file is FileObject => file !== null);
    const nextCursor = end < filesToFetch.length ? pageParam + 1 : null;

    return { 
      files: validFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      nextCursor 
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["files"],
    queryFn: fetchFiles,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage().catch(console.error);
    }
  }, [inView, fetchNextPage, hasNextPage]);

  useEffect(() => {
    if (data) {
      const queriedFiles = data.pages.flatMap(page => page.files);
      setLocalFiles(prevFiles => {
        const newFiles = [...newUploadedFiles, ...queriedFiles];
        return Array.from(new Map(newFiles.map(file => [file.id, file])).values())
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });
    }
  }, [data, newUploadedFiles]);

  useEffect(() => {
    if (newUploadedFiles.length > 0) {
      newUploadedFiles.forEach(file => newUploadedFileIdsRef.current.add(file.id));
      queryClient.setQueryData(["files"], (oldData: any) => {
        if (!oldData) return { pages: [{ files: newUploadedFiles, nextCursor: null }] };

        const updatedFirstPage = {
          ...oldData.pages[0],
          files: [...newUploadedFiles, ...oldData.pages[0].files]
        };

        return {
          ...oldData,
          pages: [updatedFirstPage, ...oldData.pages.slice(1)]
        };
      });
    }
  }, [newUploadedFiles, queryClient]);

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => onFileDelete(fileId),
    onSuccess: (_, fileId: string) => {
      toast.success("File deleted successfully");
      // Update local state
      setLocalFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      // Update query cache
      queryClient.setQueryData(["files"], (oldData: { pages: { files: FileObject[] }[] } | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: { files: FileObject[] }) => ({
            ...page,
            files: page.files.filter((file: FileObject) => file.id !== fileId),
          })),
        };
      });
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
        {status === "loading" ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="relative aspect-square">
                <Skeleton className="h-full w-full rounded-md" />
              </div>
            ))}
          </div>
        ) : status === "error" ? (
          <EmptyCard
            title="Error loading files"
            description="There was an error loading your files. Please try again."
            className="w-full"
          />
        ) : localFiles.length === 0 ? (
          <EmptyCard
            title="No files uploaded"
            description="Upload some files to see them here"
            className="w-full"
          />
        ) : (
          <>
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
            {hasNextPage && (
              <div ref={ref} className="flex justify-center mt-4">
                {isFetchingNextPage ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
                    Load More
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
