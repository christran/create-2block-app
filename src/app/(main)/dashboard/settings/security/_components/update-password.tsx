"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { setupNewPasswordLink, updatePassword } from "@/lib/auth/actions"
import { useFormState } from "react-dom"
import { useState, useEffect, useMemo } from "react";
import { ExclamationTriangleIcon } from "@/components/icons"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { PasswordInput } from "@/components/password-input"

export function UpdatePassword(user: { isPasswordLess: boolean }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [setupPasswordState, setupPasswordAction] = useFormState(setupNewPasswordLink, null);
  const [state, formAction] = useFormState(updatePassword, null);

  const router = useRouter();

  const isDirty = useMemo(() => {
    return currentPassword !== '' && newPassword !== '' && confirmPassword !== '';
  }, [currentPassword, newPassword, confirmPassword]);

  useEffect(() => {
    if (state?.success) {
      toast.success("Password updated");

      // router.push(Paths.Security);
      // window.location.reload()
    }
    if (state?.error) {
      toast.error(state?.error);
    }
  }, [state]);

  useEffect(() => {
    if (setupPasswordState?.success) {
      toast.success("Please check your email for a link to set a password");
      // router.refresh();
    }
    if (setupPasswordState?.error) {
      toast.error(setupPasswordState?.error);
    }
  }, [setupPasswordState, router]);

  const handleSubmit = (formData: FormData) => {
    if (newPassword === currentPassword) {
      toast.error("Your new password can not be the same as your current password", {
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", {
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
      });
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    formAction(formData);
  };

  return (
    <div>
    {user.isPasswordLess ? (
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
              <PasswordInput
                className="bg-secondary/30"
                required
                name="current_password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Label>New Password</Label>
              <PasswordInput
                className="bg-secondary/30"
                required
                name="new_password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Label>Confirm Password</Label>
              <PasswordInput
                className="bg-secondary/30"
                required
                name="confirm_password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
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
              <p className="w-full md:w-1/2 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
                {state?.formError}
              </p>
            ) : null}
          </CardContent>
          {user.isPasswordLess !== null && (
            <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={!isDirty}>Update Password</Button>

            </CardFooter>
          )}
        </Card>
      </form>
    )}
    </div>
  )
}