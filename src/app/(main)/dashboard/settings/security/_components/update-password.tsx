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

export function UpdatePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, formAction] = useFormState(updatePassword, null);
  // const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast("Password updated");
      router.refresh();
    }
    if (state?.error) {
      toast(state?.error, {
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
      });
    }
  }, [state]);

  const handleSubmit = (formData: FormData) => {
    if (newPassword === currentPassword) {
      toast("Your new password can not be the same as your current password", {
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast("Passwords do not match", {
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
      });
      return;
    }

    formAction(formData);
  };

    return (
      <form action={handleSubmit} className="grid gap-4">
        <Card x-chunk="dashboard-04-chunk-1">
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-2">
              <Label>Current Password</Label>
                  <Input
                  required
                  name="current_password"
                  type="password"
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  />
              <Label>New Password</Label>
                  <Input
                  required
                  name="new_password"
                  type="password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  />
              <Label>Confirm Password</Label>
                  <Input
                  required
                  name="confirm_password"
                  type="password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  />
              </div>

          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Update Password</Button>
          </CardFooter>
        </Card>
    </form>
    )
}