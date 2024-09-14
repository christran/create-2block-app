"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";
import { SubmitButton } from "@/components/submit-button";
import { PasswordInput } from "@/components/password-input";
import { resetPassword } from "@/lib/auth/actions";

export function ResetPassword({ token }: { token: string }) {
  const [state, formAction] = useFormState(resetPassword, null);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.error]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-2">
        {/* <Label>Password</Label> */}
        <PasswordInput
          required
          id="password"
          name="password"
          value={password}
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
      </div>
      <SubmitButton className="w-full shadow-md">Reset Password</SubmitButton>
    </form>
  );
}
