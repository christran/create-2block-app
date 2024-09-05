"use client";

import { Label } from "@radix-ui/react-label";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@/components/icons";
import { logout, verifyEmail, resendVerificationEmail as resendEmail } from "@/lib/auth/actions";
import { SubmitButton } from "@/components/submit-button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

export const VerifyCode = () => {
  const [verifyEmailState, verifyEmailAction] = useFormState(verifyEmail, null);
  const [resendState, resendAction] = useFormState(resendEmail, null);
  const codeFormRef = useRef<HTMLFormElement>(null);
  const inputOTPRef = useRef<HTMLInputElement>(null);
  const [otpValue, setOtpValue] = useState("");

  useEffect(() => {
    if (verifyEmailState?.error) {
      toast.error(verifyEmailState.error);

      setOtpValue(""); // Reset OTP value
      inputOTPRef?.current?.focus();
    }
  }, [verifyEmailState]);

  useEffect(() => {
    if (resendState?.success) {
      toast.success("A new verification code has been sent to your email.");
    }
    if (resendState?.error) {
      toast.error(resendState.error);
    }
  }, [resendState?.error, resendState?.success]);

  useEffect(() => {
    if (inputOTPRef.current) {
      inputOTPRef.current.focus();
    }
  }, []);

  const handleSubmit = (formData: FormData) => {
    verifyEmailAction(formData);
  };

  return (
    <div className="flex flex-col gap-2">
      <form ref={codeFormRef} action={handleSubmit}>
        <div className="text-center">
          <Label className="font-semibold" htmlFor="code">Verification Code</Label>
        </div>
        {/* Remove the Input component */}
        {/* <Input className="mt-2" type="text" id="code" name="code" required /> */}
        <div className="flex justify-center mt-2">
          <InputOTP 
            ref={inputOTPRef} 
            id="code" 
            name="code" 
            maxLength={6} 
            required
            value={otpValue}
            onChange={setOtpValue}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <SubmitButton className="mt-4 w-full" aria-label="submit-btn">
          Verify
        </SubmitButton>
      </form>
      <form action={resendAction}>
        <SubmitButton className="w-full" variant="secondary">
          Resend Code
        </SubmitButton>
      </form>
      <form action={logout}>
        <SubmitButton variant="link" className="p-0 font-normal text-xs">
          Wrong account? Click here to log out
        </SubmitButton>
      </form>
    </div>
  );
};
