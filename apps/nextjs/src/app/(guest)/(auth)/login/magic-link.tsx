"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon, faGoogle, DiscordLogoIcon, GitHubLogoIcon } from "@/components/icons";
import { APP_TITLE } from "@2block/shared/shared-constants";
import { sendMagicLink } from "@/lib/auth/actions";
import { SubmitButton } from "@/components/submit-button";
import { Paths } from "@2block/shared/shared-constants";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

export function MagicLink() {
  const [state, formAction] = useFormState(sendMagicLink, null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const router = useRouter();

  useEffect(() => {
    const cookies = document.cookie.split(";");
    const authErrorCookie = cookies.find(cookie => cookie.trim().startsWith("auth_error="));
    if (authErrorCookie) {
      const errorMessage = decodeURIComponent(authErrorCookie.split("=")[1]!);
      setAuthError(errorMessage);
      document.cookie = "auth_error=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }, []);

  useEffect(() => {
    if (authError || state?.error) {
      toast.error(authError || state?.error);
    }
  }, [authError, state?.error]);

  // const isDirty = useMemo(() => {
  //   return email.trim() !== '';
  // }, [email]);

  function handleSocial(provider: "google" | "discord" | "github") {    
    return router.push(`/login/${provider}`);
  }

  return (
    <div className="w-full max-w-md py-8 md:py-20">
      <Card className="py-2">
      {/* <div className="flex flex-col items-center py-4 text-center">
        <h2 className="text-2xl font-semibold mb-2">{APP_TITLE}</h2>
        <p className="text-sm text-muted-foreground">Log in to your account to access your dashboard</p>
      </div> */}
        <CardHeader className="text-center">
          <CardTitle className="text-[38px] font-extrabold text-primary/90">{APP_TITLE}</CardTitle>
          {/* <CardDescription>Log in to your account to access your dashboard</CardDescription> */}
        </CardHeader>
        <CardContent>
        <div className="space-y-2 md:px-6">
          <Button variant="outline" onClick={() => handleSocial("google")} className="w-full bg-secondary/30 shadow">
              <FontAwesomeIcon icon={faGoogle} className="mr-2 h-5 w-5" />
              Continue with Google
          </Button>
          <Button variant="outline" onClick={() => handleSocial("discord")} className="w-full bg-secondary/30 shadow">
              <DiscordLogoIcon className="mr-2 h-5 w-5" />
              Continue with Discord
          </Button>
          <Button variant="outline" onClick={() => handleSocial("github")} className="w-full bg-secondary/30 shadow">
              <GitHubLogoIcon className="mr-2 h-5 w-5" />
              Continue with GitHub
          </Button>
        </div>
        <div className="py-6 flex items-center">
          <div className="flex-grow border-t border-muted" />
          <div className="mx-2 text-sm text-muted-foreground">or continue with</div>
          <div className="flex-grow border-t border-muted" />
        </div>
        <form action={formAction}>
          <div className="mb-4">
            {/* <Label htmlFor="email">Email</Label> */}
            <Input
              className="bg-secondary/30"
              required
              id="email"
              placeholder="Email"
              autoComplete="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {state?.fieldError?.email && (
              <p className="text-xs text-destructive mt-1">{state.fieldError.email}</p>
            )}
            <div className="flex flex-wrap items-center justify-between pt-2 text-xs text-muted-foreground">
              A magic link will be sent to your email
            </div>
          </div>

          {/* <SubmitButton className="w-full" aria-label="submit-btn" disabled={!isDirty}> */}
          <SubmitButton className="w-full shadow-md" aria-label="submit-btn">
            <span className="inline-flex items-center justify-center gap-1 truncate">
              Continue
              <ArrowRightIcon className="h-5 w-5" />
            </span>
          </SubmitButton>
        </form>
        </CardContent>
      </Card>
      <div className="text-center text-[10.6px] text-muted-foreground pt-2">
        By signing in, you agree to our{" "}
        <Link href={Paths.TermsOfService} className="hover:underline text-blue-500" prefetch={false}>
          <Button variant="linkHover2" className="p-0 h-7 text-[10.6px] font-normal">
            terms of service
          </Button>
        </Link>
        {" "}
        and
        {" "}
        <Link href={Paths.PrivacyPolicy} className="hover:underline text-blue-500" prefetch={false}>
          <Button variant="linkHover2" className="p-0 h-7 text-[10.6px] font-normal">
          privacy policy
          </Button>
        </Link>
        .
      </div>
    </div>
  );
}
