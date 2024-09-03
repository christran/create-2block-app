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
import { setupNewPasswordLink, updatePassword } from "@/lib/auth/actions"
import { useFormState } from "react-dom"
import { useState } from "react";
import { type DatabaseUserAttributes } from "@/lib/auth"
import { useEffect } from "react"
import { ExclamationTriangleIcon } from "@/components/icons"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface UpdatePasswordProps {
  accountPasswordless: boolean
}

export function UpdatePassword({ user }: { user: UpdatePasswordProps }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [setupPasswordState, setupPasswordAction] = useFormState(setupNewPasswordLink, null);
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

  useEffect(() => {
    if (setupPasswordState?.success) {
      toast("Please check your email for a link to set a password");
      router.refresh();
    }
    if (setupPasswordState?.error) {
      toast(setupPasswordState?.error, {
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
      });
    }
  }, [setupPasswordState, router]);

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
    <div>
    {user?.accountPasswordless ? (
      <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-center">
          <p className="mb-4">You haven't set a password yet.</p>
          <form action={setupPasswordAction}>
            <Button variant="default" type="submit">Set Password</Button>
          </form>
          </div>
        </div>
      </CardContent>
      </Card>
    ) : (
      <form action={handleSubmit} className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full md:w-1/2 space-y-2">
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
          {user?.accountPasswordless !== null && (
            <CardFooter className="border-t px-6 py-4">
                <Button type="submit">Update Password</Button>

            </CardFooter>
          )}
        </Card>
      </form>
    )}
    </div>
  )
}