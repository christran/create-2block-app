"use client"

import {
  Card,
  CardContent,
  CardDescription,
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
import { SubmitButton } from "@/components/submit-button"
import { Paths } from "@2block/shared/shared-constants"

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
      toast.success("Your password has been updated, please sign in again");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      router.push(Paths.Login);
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
      toast.error("Your new password can not be the same as your current password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

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
            <SubmitButton variant="default" type="submit">Set Password</SubmitButton>
          </form>
          </div>
        </div>
      </CardContent>
      </Card>
    ) : (
      <form action={handleSubmit} className="grid gap-4">
        <Card>
          <CardHeader className="border-b px-6 py-4">
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Update your password here to keep your account safe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full md:w-[380px] space-y-2 pt-4">
              <div className="space-y-2">
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
              </div>
              {state?.fieldError?.current_password && (
                <p className="text-xs text-destructive mt-1">{state.fieldError.current_password}</p>
              )}
              <div className="space-y-2">
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
              </div>
              {state?.fieldError?.new_password && (
                <p className="text-xs text-destructive mt-1">{state.fieldError.new_password}</p>
              )}
              <div className="space-y-2">
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
              {state?.fieldError?.confirm_password && (
                <p className="text-xs text-destructive mt-1">{state.fieldError.confirm_password}</p>
              )}
            </div>

            <p className="pt-2 text-xs text-muted-foreground">
              Updating your password will sign you out of your account everywhere
            </p>

            {state?.formError && (
              <p className="rounded-lg bg-destructive/5 p-2 text-[0.8rem] font-medium text-destructive">
                {state.formError}
              </p>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex flex-col items-start gap-2 w-full">
              <SubmitButton type="submit" disabled={!isDirty}>Update Password</SubmitButton>
            </div>
          </CardFooter>
        </Card>
      </form>
    )}
    </div>
  )
}