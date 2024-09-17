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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileUploader } from "@/components/file-uploader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { UploadedFilesCard } from "../../files/uploaded-files-card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUploadFile } from "@/lib/hooks/use-upload-file";
import { Paths } from "@/lib/constants";
import { api } from "@/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AccountDetailsProps {
  id: string
  fullname: string
  email: string
  avatar: string
}

export interface UploadedFile {
  id: string;
  originalFilename: string;
  url: string;
}

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
      // await userMutation.mutateAsync({ id: user.id })
      await deleteAccount();
      // await logout();
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

    const schema = z.object({
      images: z.array(z.instanceof(File)),
    })
    
    type Schema = z.infer<typeof schema>
  
    const queryClient = useQueryClient();

    const handleAvatarUpdate = (fileUrl: string | null) => {
      setAvatar(fileUrl);
    
      userMutation.mutateAsync({
        avatar: fileUrl
      }).then(() => {
        // queryClient.invalidateQueries(['user']);
        router.refresh();
      });
    };
    
    const deleteMutation = useMutation({
      mutationFn: async (fileId: string) => {
        const response = await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete file');
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


    const getFileIdFromUrl = (url: string | null): string => {
      const parts = url?.split('/');
      return parts?.[parts.length - 1] ?? "";
    };
  
    const handleAvatarDelete = () => {
      const fileId = getFileIdFromUrl(avatar);
      handleAvatarUpdate(null);
      
      deleteMutation.mutate(fileId);
  
      setDialogOpen(false);
    };

    const { onUpload, uploadedFiles, progresses, isUploading } = useUploadFile({ 
      defaultUploadedFiles: [], 
      onUploadComplete: handleAvatarUpdate 
    });

    const form = useForm<Schema>({
      resolver: zodResolver(schema),
      defaultValues: {
        images: [],
      },
    })

    const handleSubmit = (data: Schema) => {
      setIsLoading(true)

      toast.promise(onUpload(data.images), {
        loading: "Uploading profile picture...",
        success: () => {
          form.reset()
          setIsLoading(false)
          setDialogOpen(false) // Close the dialog
          setFiles([])
          return "Profile picture updated"
        },
        error: (err) => {
          setIsLoading(false)
          return "Error uploading profile picture"
        },
      })
    }

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
                      {/* <Button variant="outline" size="sm">
                        Upload
                      </Button> */}
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
                          name="images"
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
                                    accept={{
                                      'image/jpeg': ['.jpg', '.jpeg'],
                                      'image/png': ['.png'],
                                      'image/gif': ['.gif']
                                    }}
                                    maxFileCount={1}
                                    maxSize={3 * 1024 * 1024}
                                    progresses={progresses}
                                    // pass the onUpload function here for direct upload
                                    // onUpload={uploadFiles}
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
                            disabled={isLoading || avatar === ""}
                          >
                            Delete
                          </Button>
                        </div>

                      </Form>
                    </DialogContent>
                  </Dialog>
                  {/* <Button variant="link" size="sm" onClick={handleDeletePicture}>
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
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="link" size="sm">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[90vw] md:max-w rounded-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <LoadingButton variant="destructive" className="mb-2 md:mb-0" loading={isLoading} onClick={accountDelete}>
                    Delete Account
                  </LoadingButton>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
          </form>
        </Suspense>
      </Card>
    </>
  )
}