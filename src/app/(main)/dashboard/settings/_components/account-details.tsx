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
import { useFormState } from "react-dom"
import { useState } from "react";
import { useEffect } from "react"
import { ExclamationTriangleIcon } from "@/components/icons"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

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
      toast("Account updated");
      router.refresh();
    }
    if (state?.error) {
      toast(state?.error, {
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
      });
    }
  }, [state]);

  const handleSubmit = (formData: FormData) => {
    formAction(formData);
  };

    return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">Profile</h1>
      </div>
      <form action={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
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
      </div>
    )
}