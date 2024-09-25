import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import { validateRequest } from "@2block/auth";
import { Paths } from "@2block/shared/shared-constants";
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
    <div className="w-full max-w-md py-8 md:py-20">
      <Card className="py-2">
        <CardHeader>
          <Link
            href={Paths.Login}
            className="pb-4 flex items-center text-sm text-muted-foreground hover:underline"
            >
            <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
          </Link>
          <CardTitle>Magic Link</CardTitle>
          <CardDescription className="pt-2">
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
