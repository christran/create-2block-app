import { ExclamationTriangleIcon } from "@/components/icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { validateRequest } from "@/lib/auth/validate-request";
import Link from "next/link";
import { Paths } from "@/lib/constants";

export async function UpdateEmailWarning() {
  const { user } = await validateRequest();

  return user?.email === "No Email" ? (
    <Alert className="p-6 [&>svg]:left-6 [&>svg]:top-6 [&>svg~*]:pl-10">
      <ExclamationTriangleIcon className="h-6 w-6 !text-yellow-500" />
      <div className="flex lg:items-center">
        <div className="w-full">
          <AlertTitle>Email address required</AlertTitle>
          <AlertDescription>
            Please update your email address to access all features.
          </AlertDescription>
        </div>
        <Button size="sm" asChild>
          <Link href={Paths.Settings}>Update Email</Link>
        </Button>
      </div>
    </Alert>
  ) : null;
}
