"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { sendPasswordResetLink } from "@/lib/auth/actions";
import { Paths } from "@2block/shared/shared-constants";

// Rate limit this
export function SendResetEmail() {
  const [state, formAction] = useFormState(sendPasswordResetLink, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");

  const isDirty = useMemo(() => {
    return email.trim() !== "";
  }, [email]);

  useEffect(() => {
    if (state?.success) {
      toast.success("A link to reset your password has been sent to your email.");
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const handleSubmit = (formData: FormData) => {
    formAction(formData);
  };

  return (
    <form ref={formRef} className="flex flex-col gap-2" action={handleSubmit}>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          className="bg-secondary/30"
          required
          placeholder="hello@2block.co"
          autoComplete="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap justify-between text-xs">
          <div>
            Don't want to reset?{" "}
              <Link href={Paths.Login} className="text-blue-500">
                <Button variant="linkHover2" className="p-0 h-0 after:-bottom-2 after:h-[0.8px] text-[12px] font-medium">
                  Log in
                </Button>
              </Link>
          </div>
      </div>

      <SubmitButton className="mt-4 w-full shadow-md" disabled={!isDirty}>
        Reset Password
      </SubmitButton>
      {/* <Button variant="outline" className="w-full" asChild>
        <Link href={Paths.Login}>Cancel</Link>
      </Button> */}
    </form>
  );
}
