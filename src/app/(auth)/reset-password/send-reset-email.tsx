"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { sendPasswordResetLink } from "@/lib/auth/actions";
import { ExclamationTriangleIcon } from "@/components/icons";
import { Paths } from "@/lib/constants";


// Rate limit this
export function SendResetEmail() {
  const [state, formAction] = useFormState(sendPasswordResetLink, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success("A link to reset your password has been sent to your email.");
      // formRef.current?.reset();
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
          required
          placeholder="hello@2bock.co"
          autoComplete="email"
          name="email"
          type="email"
        />
      </div>

      <div className="flex flex-wrap justify-between text-xs">
            <div>
              Don't want to reset?{" "}
              <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                <Link href={Paths.Login}>Log in</Link>
              </Button>
            </div>
      </div>

      <SubmitButton className="mt-4 w-full">Reset Password</SubmitButton>
      {/* <Button variant="outline" className="w-full" asChild>
        <Link href={Paths.Login}>Cancel</Link>
      </Button> */}
    </form>
  );
}
