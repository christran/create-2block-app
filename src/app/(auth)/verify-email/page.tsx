import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import { VerifyCode } from "./verify-code";
import { Paths } from "@/lib/constants";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

export const metadata = {
  title: "Email Verification",
  description: "Email Verification",
};

export default async function VerifyEmailPage() {
  const { user } = await validateRequest();

  if (!user) redirect(Paths.Login);
  if (user.emailVerified) redirect(Paths.Dashboard);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <Link
          href={Paths.Dashboard}
          className="mb-3 flex items-center text-sm text-muted-foreground hover:underline"
          >
          <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
        </Link>
        {/* <Breadcrumb className="mb-3">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={Paths.Dashboard}>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Verify Email</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb> */}
        <CardTitle>Verify Email</CardTitle>
        <CardDescription>
          A verification code was sent to <strong>{user.email}</strong>. <br />
          Check your spam folder if you can't find the email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VerifyCode />
      </CardContent>
    </Card>
  );
}
