"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyCard } from "@/components/empty-card"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

interface FileObject {
  id: string;
  url?: string;
  filename?: string;
  originalFilename?: string;
}

interface ManageFilesProps {
  initialUserFiles: FileObject[];
}

export default function ManageFiles({ initialUserFiles }: ManageFilesProps) {
  const [fileDetails, setFileDetails] = useState<FileObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFileDetails = async () => {
      setIsLoading(true);
      try {
        const details = await Promise.all(
          initialUserFiles.map(async (file) => {
            if (file.url) return file; // Already has details
            const response = await fetch(`/api/files/${file.id}`);
            if (!response.ok) throw new Error('Failed to fetch file details');
            const data = await response.json();
            return { id: file.id, ...data };
          })
        );
        setFileDetails(details);
      } catch (error) {
        console.error('Error fetching file details:', error);
        toast.error("Failed to fetch file details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileDetails();
  }, [initialUserFiles]);

  const addNewFiles = (newFiles: FileObject[]) => {
    setFileDetails(prev => [...prev, ...newFiles]);
  };
  
  const handleDelete = async (fileId: string) => {
    // Instantly remove the file from the UI
    setFileDetails(prev => prev.filter(file => file.id !== fileId));

    try {
      const response = await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success("File deleted successfully");
      } else {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // If deletion fails, add the file back to the UI
      const deletedFile = fileDetails.find(f => f.id === fileId);
      if (deletedFile) {
        setFileDetails(prev => [...prev, deletedFile]);
      }
      toast.error("Failed to delete file");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Files</CardTitle>
        <CardDescription>View and manage your uploaded files</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading...</div>
        ) : fileDetails.length === 0 ? (
          <EmptyCard 
            title="No files uploaded"
            description="Upload some files to see them here"
            className="w-full"
          />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {fileDetails.map((file) => (
              <div key={file.id} className="relative aspect-square group">
                <Image
                  src={file.url || ""}
                  alt={file.originalFilename || 'Uploaded file'}
                  fill
                  sizes="(max-width: 768px) 33vw, 25vw"
                  loading="lazy"
                  className="object-cover rounded-md"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-90 transition-opacity"
                  onClick={() => handleDelete(file.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-0 left-0 right-0 text-center bg-black bg-opacity-50 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs truncate">{file.originalFilename}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}