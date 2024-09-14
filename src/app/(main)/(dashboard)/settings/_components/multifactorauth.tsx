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
import { updateTwoFactorAuth } from "@/lib/auth/actions"
import { useFormState } from "react-dom"
import { useState } from "react";
import { useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function MultiFactorAuth() {
  const [oneTimeCode, setOneTimeCode] = useState('');
  const [state, formAction] = useFormState(updateTwoFactorAuth, null);

  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast.success("Two factor authentication updated");
    }
    if (state?.error) {
      toast.error(state?.error);
    }
  }, [state, router]);

  const handleSubmit = (formData: FormData) => {
    setOneTimeCode('');

    formAction(formData);
  };

    return (
      <form action={handleSubmit} className="grid gap-4">
        <Card>
          <CardHeader className="border-b px-6 py-4">
            <CardTitle>Two Step Verification</CardTitle>
            <CardDescription>
              Secure your account with two-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full md:w-1/2 space-y-2 pt-4">
              <div className="space-y-2">
                <Label htmlFor="one-time-code">Secret</Label>
                <Input
                disabled
                className="bg-secondary/30"
                required
                name="one-time-code"
                type="text"
                value={oneTimeCode}
                onChange={(e) => setOneTimeCode(e.target.value)}
                autoComplete="one-time-code"
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
          <CardFooter className="border-t px-6 py-4">
            <Button disabled type="submit">Enable 2FA</Button>
          </CardFooter>
        </Card>
    </form>
    )
}