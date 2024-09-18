"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateAccount, deleteAccount } from "@/lib/auth/actions"
import { useState, useEffect, useMemo, Suspense } from "react"
import { useFormState } from "react-dom"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { AccountDetailsSkeleton } from "./account-details-skeleton"
import { LoadingButton } from "@/components/loading-button";
import { SubmitButton } from "@/components/submit-button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileUploader } from "@/components/file-uploader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUploadFile } from "@/lib/hooks/use-upload-file";
import { api } from "@/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fileUploadSchema, FileUploadSchema } from "@/lib/types/file-upload";

interface AccountDetailsProps {
  id: string
  fullname: string
  email: string
  avatar: string
}

const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif']
};

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB

export function AccountDetails({ user, isPasswordLess }: { user: AccountDetailsProps; isPasswordLess: boolean }) {  
  const [fullname, setFullname] = useState(user?.fullname ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [files, setFiles] = useState<File[]>([])
  const [avatar, setAvatar] = useState(user?.avatar || null);

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [state, formAction] = useFormState(updateAccount, null);

  const userMutation = api.user.updateAvatar.useMutation(); 

  const isDirty = useMemo(() => {
    return fullname !== user?.fullname || email !== user?.email;
  }, [fullname, email, user?.fullname, user?.email]);

  const router = useRouter();

  const accountDelete = async () => {
    setIsLoading(true);
    try {
      await deleteAccount();
      toast.success("You account has been successfully deleted")
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setOpen(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (state?.success) {
      setFullname(fullname);
      setEmail(email);

      toast.success("Account updated");
      router.refresh();
    }
    if (state?.error) {
      toast.error(state?.error);
    }
  }, [state]);

  const getFileIdFromUrl = (url: string | null): string => {
    const parts = url?.split('/');
    return parts?.[parts.length - 1] ?? "";
  };

  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
      return fileId;
    },
    onSuccess: (fileId) => {
      toast.success("Profile picture deleted successfully");
    },
    onError: (error) => {
      console.error('Error deleting file:', error);
      toast.error("Failed to delete file");
    },
  });

  const queryClient = useQueryClient();

  const handleAvatarUpdate = (fileUrl: string | null) => {
    userMutation.mutateAsync({
      avatar: fileUrl
    }).then(async () => {
      // queryClient.invalidateQueries(['user']);

      setAvatar(fileUrl);

      router.refresh();
    });
  };

  const handleAvatarDelete = () => {
    const fileId = getFileIdFromUrl(avatar);
    handleAvatarUpdate(null);
    
    deleteMutation.mutate(fileId);

    setDialogOpen(false);
  };

  const { onUpload, uploadedFiles, progresses, isUploading } = useUploadFile({ 
    defaultUploadedFiles: [], 
    onUploadComplete: handleAvatarUpdate,
    prefix: "avatars/",
    allowedFileTypes: ALLOWED_FILE_TYPES,
    maxFileSize: MAX_FILE_SIZE
  });

  const form = useForm<FileUploadSchema>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      files: [],
    },
  })

  const handleSubmit = (data: FileUploadSchema) => {
    setIsLoading(true);

    toast.promise(onUpload(data.files), {
      loading: "Uploading profile picture...",
      success: async (files) => {
        form.reset();
        setIsLoading(false);
        setDialogOpen(false);
        setFiles([]);
        // Use the first uploaded file's URL as the new avatar
        if (files && files.length > 0) {
          if (avatar) {
            const fileId = getFileIdFromUrl(avatar);
            
            await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
          } 
          handleAvatarUpdate(files[0].url);    
        }
        return "Profile picture updated";
      },
      error: (err) => {
        setIsLoading(false);
        // Reset the form and clear the files on error
        form.reset();
        setFiles([]);
        // If there's a specific error message, display it. Otherwise, use a generic message.
        return err instanceof Error ? err.message : "Error uploading profile picture";
      },
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle>Account Details</CardTitle>
          <CardDescription>
            Update your account information
          </CardDescription>
        </CardHeader>
        <Suspense fallback={<AccountDetailsSkeleton />}>
          <form>
            <CardContent>
              <div className="w-full md:w-[380px] space-y-2 pt-4">

                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Avatar className="w-24 h-24 rounded-full drop-shadow-md cursor-pointer hover:opacity-75">
                        <AvatarImage 
                          src={avatar ?? ""} 
                          alt={fullname} 
                          className="object-cover w-full h-full"
                        />
                        <AvatarFallback delayMs={100}>
                          {user.fullname.split(' ').map(name => name.charAt(0).toUpperCase()).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </DialogTrigger>
                    <DialogContent className="max-w-md md:max-w-lg rounded-lg">
                      <DialogHeader>
                        <DialogTitle>Upload profile picture</DialogTitle>
                        <DialogDescription>
                          Drag and drop your picture here or click to browse.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(handleSubmit)}
                          className="flex w-full flex-col gap-6"
                        >
                        <FormField
                          control={form.control}
                          name="files"
                          render={({ field }) => (
                            <div className="space-y-6">
                              <FormItem className="w-full">
                                <FormControl>
                                  <FileUploader
                                    value={field.value}
                                    onValueChange={(files) => {
                                      field.onChange(files);
                                      setFiles(files);
                                    }}
                                    accept={ALLOWED_FILE_TYPES}
                                    maxFileCount={1}
                                    maxSize={MAX_FILE_SIZE}
                                    progresses={progresses}
                                    disabled={isUploading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            </div>
                          )}
                        />
    
                        </form>

                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="default" 
                            className="flex-1" 
                            disabled={isLoading || files.length === 0}
                            onClick={form.handleSubmit(handleSubmit)}
                          >
                            Upload
                          </Button>
                          <Button 
                            type="button"
                            variant="destructive" 
                            onClick={handleAvatarDelete} 
                            className="flex-1" 
                            disabled={isLoading || avatar === null}
                          >
                            Delete
                          </Button>
                        </div>

                      </Form>
                    </DialogContent>
                  </Dialog>
                  {/* <Button variant="link" size="sm" onClick={handleAvatarDelete}>
                    Delete
                  </Button> */}
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    className="bg-secondary/30"
                    required
                    placeholder="Jeon Jungkook"
                    autoComplete="name"
                    name="fullname"
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    className="bg-secondary/30"
                    // required={isPasswordLess}
                    placeholder="hello@2block.co"
                    autoComplete="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPasswordLess}
                  />
                </div>
              </div>

              {state?.fieldError ? (
                <ul className="w-full md:w-1/2 mt-4 list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
                  {Object.values(state.fieldError).map((err) => (
                    <li className="ml-4" key={err}>
                      {err}
                    </li>
                  ))}
                </ul>
              ) : state?.formError ? (
                <p className="w-full md:w-1/2 mt-4 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
                  {state?.formError}
                </p>
              ) : null}
            </CardContent>
            <CardFooter className="border-t px- py-4 gap-2">
            <SubmitButton formAction={formAction} disabled={!isDirty}>Update Account</SubmitButton>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="link" size="sm">
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90vw] md:max-w rounded-lg" showCloseButton={false}>
                <DialogHeader className="flex flex-col space-y-2 text-center sm:text-left">
                  <DialogTitle className="text-lg font-semibold">
                    Are you absolutely sure?
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <LoadingButton variant="destructive" loading={isLoading} onClick={accountDelete}>
                    Delete Account
                  </LoadingButton>
                </div>
              </DialogContent>
            </Dialog>
          </CardFooter>
          </form>
        </Suspense>
      </Card>
    </>
  )
}