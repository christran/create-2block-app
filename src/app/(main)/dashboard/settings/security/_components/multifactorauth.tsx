"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
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
          <CardHeader>
            <CardTitle>Two Step Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full md:w-1/2 space-y-2">
              <Label htmlFor="one-time-code">Secret</Label>
                  <Input
                  className="bg-secondary/30"
                  required
                  name="one-time-code"
                  type="text"
                  value={oneTimeCode}
                  onChange={(e) => setOneTimeCode(e.target.value)}
                  autoComplete="one-time-code"
                  />
              </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit">Enable 2FA</Button>
          </CardFooter>
        </Card>
    </form>
    )
}