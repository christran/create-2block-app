import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { validateRequest } from "@/lib/auth/validate-request";
import { MailWarning } from "lucide-react";
import Link from "next/link";

export async function EmailVerificationWarning() {
  const { user } = await validateRequest();

  return user?.emailVerified === false ? (
    <Alert className="p-4 sm:p-6 [&>svg]:left-4 [&>svg]:top-4 sm:[&>svg]:left-6 sm:[&>svg]:top-6 [&>svg~*]:pl-8 sm:[&>svg~*]:pl-10">
      <MailWarning className="h-5 w-5 sm:h-6 sm:w-6" />
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-grow">
          <AlertTitle className="text-sm sm:text-base">Verification Required</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm mt-1">
            A verification email has been sent to your email address. Please verify your account to
            access all features.
          </AlertDescription>
        </div>
        <Button size="default" className="shadow w-full sm:w-auto" asChild>
          <Link href="/verify-email">Verify Email</Link>
        </Button>
      </div>
    </Alert>
  ) : null;
}
