"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";
import { resendMagicLink } from "@/lib/auth/actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface MagicLinkResendProps {
  email: string;
}

export const MagicLinkResend = ({ email }: MagicLinkResendProps) => {
  const router = useRouter()
  const [resendState, resendAction] = useFormState(resendMagicLink, null);

  useEffect(() => {
    if (resendState?.success) {
      toast.success("A new magic link has been sent to your email.");
    }
    if (resendState?.error) {
      toast.error(resendState.error);
    }
  }, [resendState?.error]);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 5000)

    return () => clearInterval(interval)
  }, [router])


  // const handleSubmit = (formData: FormData) => {
  //   resendAction(formData);
  // };

  return (
    <div className="flex flex-col gap-2">
      <form action={resendAction}>
        <Input
              className="hidden"
              id="email"
              placeholder="Email"
              autoComplete="email"
              name="email"
              type="email"
              value={email}
        />
        <SubmitButton className="w-full shadow-md" variant="default">
          🪄 Resend Magic Link 🪄
        </SubmitButton>
      </form>
    </div>
  );
};
