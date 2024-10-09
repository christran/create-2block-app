import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SendResetEmail } from "./send-reset-email";
import { getSession } from "@/lib/auth/get-session";
import { APP_TITLE, Paths } from "@2block/shared/shared-constants";
import { env } from "@/env";

export const metadata = {
  title: "Reset Password",
  description: "Reset Password Page",
};

export default async function ForgotPasswordPage() {
  const { user } = await getSession();

  if (user) redirect(Paths.Dashboard);
  if (env.MAGIC_LINK_AUTH) redirect(Paths.Login);

  return (
    <div className="w-full max-w-md py-8 md:py-20">
      <Card className="py-2">
        <CardHeader>
          <CardTitle className="text-[38px] font-extrabold text-primary/90 text-center">{APP_TITLE}</CardTitle>
        </CardHeader>
        <div className="text-center pb-4">
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>A link to reset your password will be sent to your email.</CardDescription>
        </div>
        <CardContent>
          <SendResetEmail />
        </CardContent>
      </Card>
    </div>
  );
}
