import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SendResetEmail } from "./send-reset-email";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { env } from "@/env";

export const metadata = {
  title: "Reset Password",
  description: "Reset Password Page",
};

export default async function ForgotPasswordPage() {
  const { user } = await validateRequest();

  if (user) redirect(Paths.Dashboard);
  if (env.MAGIC_LINK_AUTH) redirect(Paths.Login);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          A link to reset your password will be sent to your email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SendResetEmail />
      </CardContent>
    </Card>
  );
}
