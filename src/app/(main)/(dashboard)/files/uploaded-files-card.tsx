import Image from "next/image"
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyCard } from "@/components/empty-card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { UploadedFile } from "./upload-files"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"

interface FileObject {
  id: string;
  url?: string;
  filename?: string;
  originalFilename?: string;
}

interface UploadedFilesCardProps {
  initialUserFiles: FileObject[];
  newUploadedFiles: FileObject[];
  onDeleteFile: (fileId: string) => void;
}

export function UploadedFilesCard({ initialUserFiles, newUploadedFiles, onDeleteFile }: UploadedFilesCardProps) {
  const queryClient = useQueryClient()

  const fetchFileDetails = async (fileId: string) => {
    const response = await fetch(`/api/files/${fileId}`);
    if (!response.ok) throw new Error('Failed to fetch file details');
    return response.json();
  };

  const { data: allFiles, isLoading } = useQuery({
    queryKey: ['files', initialUserFiles, newUploadedFiles],

    queryFn: async () => {
      const combinedFiles = [...initialUserFiles, ...newUploadedFiles];
      const filesWithUrls = combinedFiles.filter(file => file.url);
      const filesToFetch = combinedFiles.filter(file => !file.url);

      const fetchedDetails = await Promise.all(
        filesToFetch.map(async (file) => {
          if (typeof file.id !== 'string') {
            console.error('Invalid file ID:', file.id);
            return null;
          }
          try {
            const data = await fetchFileDetails(file.id);
            return { ...file, ...data };
          } catch (error) {
            console.error(`Error fetching details for file ${file.id}:`, error);
            return null;
          }
        })
      );

      return [...filesWithUrls, ...fetchedDetails.filter((file): file is FileObject => file !== null)];
    },
    staleTime: 30 * 60 * 1000, // 1 hour
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete file');
      return fileId;
    },
    onSuccess: (fileId) => {
      toast.success("File deleted successfully");
      onDeleteFile(fileId);
      queryClient.setQueryData(['files', initialUserFiles, newUploadedFiles], (oldData: FileObject[] | undefined) => 
        oldData ? oldData.filter(file => file.id !== fileId) : []
      );
    },
    onError: (error) => {
      console.error('Error deleting file:', error);
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
        {[...Array(3)].map((_, index) => (
          <div key={index} className="relative aspect-square">
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        ))}
      </div>  
      ) : allFiles?.length === 0 ? (
        <EmptyCard
          title="No files uploaded"
          description="Upload some files to see them here"
          className="w-full"
        />
      ) : (
        <div className="grid grid-cols-3 gap-3.5">
          {allFiles?.map((file, index) => (
            file && file.url ? (
              <div key={file.id} className="relative aspect-square group">
                <Image
                  src={file.url}
                  alt={file.filename || file.originalFilename || ""}
                  fill
                  sizes="(max-width: 768px) 33vw, 25vw"
                  loading="lazy"
                  className="rounded-md object-cover shadow-md"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-1 left-1  md:top-2 md:left-2 opacity-0 group-hover:opacity-80 transition-opacity h-7 w-7 md:h-9 md:w-9 p-0"
                  onClick={() => handleDelete(file.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-0 left-0 right-0 text-center bg-black bg-opacity-50 text-white p-2 opacity-0 group-hover:opacity-80 transition-opacity">
                  <p className="text-xs font-medium truncate">{file.filename || file.originalFilename}</p>
                </div>
              </div>
            ) : null
          ))}
        </div>
      )}
      </CardContent>
    </Card>
  )
}