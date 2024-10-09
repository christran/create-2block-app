"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAccount, deleteAccount } from "@/lib/auth/actions";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/loading-button";
import { SubmitButton } from "@/components/submit-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileUploader } from "@/components/file-uploader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/next-avatar";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUploadFile } from "@/lib/hooks/use-upload-file";
import { api } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { fileUploadSchema, type FileUploadSchema } from "@/lib/types/file-upload";
import { type UserWithoutPassword } from "@2block/db/schema";

const ALLOWED_FILE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
};

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB

export function AccountDetails({
  user,
  isPasswordLess,
}: {
  user: UserWithoutPassword | null;
  isPasswordLess: boolean;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [avatar, setAvatar] = useState(user?.image ?? null);

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [state, formAction] = useFormState(updateAccount, null);

  const userMutation = api.user.updateAvatar.useMutation();

  const isDirty = useMemo(() => {
    return name !== user?.name || email !== user?.email;
  }, [name, email, user?.name, user?.email]);

  const router = useRouter();

  const accountDelete = async () => {
    setIsLoading(true);
    try {
      await deleteAccount();
      toast.success("You account has been successfully deleted");
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
      setName(name);
      setEmail(email);

      toast.success("Account updated");
      router.refresh();
    }
    if (state?.error) {
      toast.error(state?.error);
    }
  }, [state]);

  const getFileIdFromUrl = (url: string | null): string => {
    const parts = url?.split("/");
    return parts?.[parts.length - 1] ?? "";
  };

  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await fetch(`/api/files/${fileId}`, { method: "DELETE" });
      return fileId;
    },
    onSuccess: () => {
      toast.success("Profile picture deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    },
  });

  // const queryClient = useQueryClient();

  const handleAvatarUpdate = async (fileUrl: string | null) => {
    await userMutation
      .mutateAsync({
        avatar: fileUrl,
      })
      .then(async () => {
        // queryClient.invalidateQueries(['user']);

        setAvatar(fileUrl);

        router.refresh();
      });
  };

  const handleAvatarDelete = async () => {
    const fileId = getFileIdFromUrl(avatar);
    await handleAvatarUpdate(null);

    deleteMutation.mutate(fileId);

    setDialogOpen(false);
  };

  const { onUpload, progresses, isUploading } = useUploadFile({
    defaultUploadedFiles: [],
    onUploadComplete: (files: UploadedFile[]) => {
      const fileUrl = files[0]?.url ?? null;
      void handleAvatarUpdate(fileUrl);
    },
    prefix: "avatars/",
    allowedFileTypes: ALLOWED_FILE_TYPES,
    maxFileSize: MAX_FILE_SIZE,
  });

  const form = useForm<FileUploadSchema>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      files: [],
    },
  });

  interface UploadedFile {
    url: string;
  }

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
        if (files && Array.isArray(files) && files.length > 0) {
          if (avatar) {
            const fileId = getFileIdFromUrl(avatar);

            await fetch(`/api/files/${fileId}`, { method: "DELETE" });
          }

          const uploadedFile = files[0] as UploadedFile;
          await handleAvatarUpdate(uploadedFile.url);
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

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      form.reset();
      setIsLoading(false);
      setFiles([]);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Update your account information</CardDescription>
        </CardHeader>
        <form>
          <CardContent>
            <div className="w-full space-y-2 pt-4 md:w-[380px]">
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                  <DialogTrigger asChild>
                    <Avatar className="h-24 w-24 cursor-pointer rounded-full drop-shadow-md hover:opacity-75 relative">
                      <AvatarImage 
                      unoptimized={false}
                      src={avatar ?? ""}
                      width={256}
                      height={256}
                      alt={name}
                      className="object-cover"
                      />
                      <AvatarFallback delayMs={100}>
                        {user?.name
                          .split(" ")
                          .map((name) => name.charAt(0).toUpperCase())
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </DialogTrigger>
                  <DialogContent className="max-w-md rounded-lg md:max-w-lg">
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
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {state?.fieldError?.name && (
                <p className="text-xs text-destructive-foreground mt-1">{state.fieldError.name}</p>
              )}

              {/* If full name set to an email address ask the user to update*/}
              {email.includes("@") && (
                <p className="text-xs text-muted-foreground">
                  Update your name to personalize your account
                </p>
              )}

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
                  // disabled={isPasswordLess}
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Please contact support if you need to change your email address
                </p>
              </div>
              {/* {state?.fieldError?.email && (
                <p className="text-xs text-destructive mt-1">{state.fieldError.email}</p>
              )}   */}
            </div>

            {state?.formError && (
              <p className="rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
                {state.formError}
              </p>
            )}
          </CardContent>
          <CardFooter className="px-6 gap-2 border-t py-4">
            <SubmitButton formAction={formAction} disabled={!isDirty}>
              Update Account
            </SubmitButton>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="linkHover2" className="ml-3 p-0 h-8 text-[12px]">
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="md:max-w w-[90vw] rounded-lg" showCloseButton={false}>
                <DialogHeader className="flex flex-col space-y-2 text-center sm:text-left">
                  <DialogTitle className="text-lg font-semibold">
                    Are you absolutely sure?
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    This action cannot be undone. This will permanently delete your account and
                    remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <LoadingButton
                    variant="destructive"
                    loading={isLoading}
                    onClick={accountDelete}
                  >
                    Delete Account
                  </LoadingButton>
                </div>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
