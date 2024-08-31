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

export const metadata = {
  title: "Reset Password",
  description: "Reset Password Page",
};

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle >{APP_TITLE}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <CardTitle>Password Reset</CardTitle>
        <CardDescription className="text-sm">Enter a new password below.</CardDescription>
      </CardContent>
      <CardContent className="space-y-4">
        <ResetPassword token={params.token} />
        <Button variant="outline" className="w-full" asChild>
            <Link href={Paths.Login}>Cancel</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
