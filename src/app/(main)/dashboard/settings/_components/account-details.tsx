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

interface AccountDetailsProps {
  id: string
  fullname: string
  email: string
}

export function AccountDetails({ user, isPasswordLess }: { user: AccountDetailsProps; isPasswordLess: boolean }) {  
  const [fullname, setFullname] = useState(user?.fullname ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [state, formAction] = useFormState(updateAccount, null);

  // const userMutation = api.user.deleteAccountByUserId.useMutation();

  const isDirty = useMemo(() => {
    return fullname !== user?.fullname || email !== user?.email;
  }, [fullname, email]);

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
      toast.success("Account updated");
      router.refresh();
    }
    if (state?.error) {
      toast.error(state?.error);
    }
  }, [state]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>
            Update your profile information
          </CardDescription>
        </CardHeader>
        <Suspense fallback={<AccountDetailsSkeleton />}>
          <form>
            <CardContent>
              <div className="w-full md:w-1/2 space-y-2">
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
            <CardFooter className="border-t px-6 py-4 gap-2">
              <SubmitButton formAction={formAction} disabled={!isDirty}>Update Account</SubmitButton>
              <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="link" size="sm">
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w">
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
                <LoadingButton variant="destructive" loading={isLoading} onClick={accountDelete}>
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