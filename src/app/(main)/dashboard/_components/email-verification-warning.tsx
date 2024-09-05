import { ExclamationTriangleIcon } from "@/components/icons";


import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { validateRequest } from "@/lib/auth/validate-request";
import Link from "next/link";

export async function EmailVerificationWarning() {
  const { user } = await validateRequest();

  return user?.emailVerified === false ? (
    <Alert className="p-6 [&>svg]:left-6 [&>svg]:top-6 [&>svg~*]:pl-10">
      <ExclamationTriangleIcon className="h-6 w-6 !text-yellow-500" />
      <div className="flex lg:items-center">
        <div className="w-full">
          <AlertTitle>Account verification required</AlertTitle>
          <AlertDescription>
            A verification email has been sent to your email address. Please verify your account to
            access all features.
          </AlertDescription>
        </div>
        <Button size="sm" asChild>
          <Link href="/verify-email">Verify Email</Link>
        </Button>
      </div>
    </Alert>
  ) : null;
}
