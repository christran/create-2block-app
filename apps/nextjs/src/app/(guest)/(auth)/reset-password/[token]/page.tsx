import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResetPassword } from "./reset-password";
import { APP_TITLE, Paths } from "@/lib/constants";
import Link from "next/link";
import { env } from "@/env";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Reset Password",
  description: "Reset Password Page",
};

export default async function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  if (env.MAGIC_LINK_AUTH) redirect(Paths.Login);

  return (
    <div className="w-full max-w-md py-8 md:py-20">
      <Card className="py-2">
        <CardHeader className="text-center">
          <CardTitle className="text-[38px] font-extrabold text-primary/90">{APP_TITLE}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <CardTitle>Password Reset</CardTitle>
          <CardDescription className="text-sm">Enter a new password below.</CardDescription>
        </CardContent>
        <CardContent className="space-y-2">
          <ResetPassword token={params.token} />
          <Button variant="outline" className="w-full" asChild>
              <Link href={Paths.Login}>Cancel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
