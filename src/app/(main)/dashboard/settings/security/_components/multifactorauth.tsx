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
import { updatePassword, updateUser } from "@/lib/auth/actions"
import { useFormState } from "react-dom"
import { useState } from "react";
import { type DatabaseUserAttributes } from "@/lib/auth"
import { useEffect } from "react"
import { ExclamationTriangleIcon } from "@/components/icons"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function MultiFactorAuth() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, formAction] = useFormState(updatePassword, null);
  // const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast("Two factor updated");
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
      <form action={handleSubmit} className="grid gap-4">
        <Card x-chunk="dashboard-04-chunk-1">
          <CardHeader>
            <CardTitle>Two Step Verification</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-2">
              <Label>Secret</Label>
                  <Input
                  required
                  name="current_password"
                  type="password"
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  />
              </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Enable 2FA</Button>
          </CardFooter>
        </Card>
    </form>
    )
}