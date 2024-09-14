import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import { MagicLinkResend } from "./magic-link-resend";
import { env } from "@/env";

export const metadata = {
  title: "Magic Link",
  description: "Magic Link",
};

export default async function MagicLinkPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { user } = await validateRequest();
  const email = searchParams.email as string | undefined;

  if (user) redirect(Paths.Dashboard);
  if (!env.MAGIC_LINK_AUTH) redirect(Paths.Login);
  if (!email) redirect(Paths.Login);

  return (
    <div className="w-full max-w-md mt-20">
      <Card>
        <CardHeader>
          <Link
            href={Paths.Login}
            className="mb-3 flex items-center text-sm text-muted-foreground hover:underline"
            >
            <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
          </Link>
          <CardTitle>Magic Link</CardTitle>
          <CardDescription>
            A magic link was sent to <strong>{email}</strong><br />
            Check your spam folder if you can't find the email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MagicLinkResend email={email} />
        </CardContent>
      </Card>
    </div>
  );
}
