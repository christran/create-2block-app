import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import { validateRequest } from "@2block/auth";
import { VerifyCode } from "./verify-code";
import { APP_TITLE, Paths } from "@2block/shared/shared-constants";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import { env } from "@/env";

export const metadata = {
  title: "Email Verification",
  description: "Email Verification",
};

export default async function VerifyEmailPage() {
  const { user } = await validateRequest();

  if (!user) redirect(Paths.Login);
  if (env.MAGIC_LINK_AUTH) redirect(Paths.Login);
  if (user.emailVerified) redirect(Paths.Dashboard);

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col gap-6 mx-auto max-w-5xl px-4 md:px-2">
        <div className="w-full max-w-md py-8 md:py-20">
        <Card className="py-2">
          <CardHeader>
              {/* <Link
                href={Paths.Dashboard}
                className="pb-2 flex items-center text-sm text-muted-foreground hover:underline"
                >
                <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
              </Link> */}
              {/* <CardTitle className="text-[38px] font-extrabold text-primary/90 text-center">{APP_TITLE}</CardTitle> */}
              
              <CardTitle>Verify Email</CardTitle>

              <CardDescription>
                A verification code was sent to <strong>{user.email}</strong><br />
                Check your spam folder if you can't find the email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerifyCode />
            </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
