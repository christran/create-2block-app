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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateAccount } from "@/lib/auth/actions"
import { useFormState } from "react-dom"
import { useState } from "react";
import { type DatabaseUserAttributes } from "@/lib/auth"
import { useEffect } from "react"
import { ExclamationTriangleIcon } from "@/components/icons"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { UpdatePassword } from "../security/_components/update-password"

export function AccountDetails({ user }: { user: DatabaseUserAttributes | null } ) {
  const [fullname, setFullname] = useState(user?.fullname ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const [state, formAction] = useFormState(updateAccount, null);
  // const formRef = useRef<HTMLFormElement>(null);

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

                  required={user?.hashedPassword !== null}
                  // readOnly={true}
                  placeholder="hello@2bock.co"
                  autoComplete="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  // disabled={user?.hashedPassword === null}
                  />
              </div>

            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>Update Account</Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    )
}