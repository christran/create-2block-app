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
import { updateAccount } from "@/lib/auth/actions"
import { useState, useEffect, useMemo, Suspense } from "react"
import { useFormState } from "react-dom"
import { ExclamationTriangleIcon } from "@/components/icons"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { AccountDetailsSkeleton } from "./account-details-skeleton"

interface AccountDetailsProps {
  fullname: string
  email: string
  accountPasswordless: boolean
}

export function AccountDetails({ user }: { user: AccountDetailsProps }) {  
  const [fullname, setFullname] = useState(user?.fullname ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const [state, formAction] = useFormState(updateAccount, null);
  // const formRef = useRef<HTMLFormElement>(null);

  const isDirty = useMemo(() => {
    return fullname !== user?.fullname || email !== user?.email;
  }, [fullname, email]);

  const router = useRouter();

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
      <form action={formAction}>
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <Suspense fallback={<AccountDetailsSkeleton />}>
              <CardContent>
                <div className="w-full md:w-1/2 space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    required
                    placeholder="Jeon Jungkook"
                    autoComplete="name"
                    name="fullname"
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    />
                  <Label>Email</Label>
                  <Input

                    required={user?.accountPasswordless}
                    // readOnly={true}
                    placeholder="hello@2bock.co"
                    autoComplete="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    // disabled={user?.accountPasswordless === null}
                    />
                </div>
              </CardContent>
            </Suspense>
          <CardContent>
            {state?.fieldError ? (
              <ul className="w-full md:w-1/2 list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
                {Object.values(state.fieldError).map((err) => (
                  <li className="ml-4" key={err}>
                    {err}
                  </li>
                ))}
              </ul>
            ) : state?.formError ? (
              <p className="rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
                {state?.formError}
              </p>
            ) : null}
          </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button disabled={!isDirty}>Update Account</Button>
            </CardFooter>
          </Card>
        </form>
    )
}