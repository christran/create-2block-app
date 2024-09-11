"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/password-input";
import { FontAwesomeIcon, faGoogle, DiscordLogoIcon, GitHubLogoIcon, ExclamationTriangleIcon } from "@/components/icons";
import { APP_TITLE } from "@/lib/constants";
import { login, sendMagicLink } from "@/lib/auth/actions";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { Paths } from "@/lib/constants";
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

export function MagicLink() {
  const [state, formAction] = useFormState(sendMagicLink, null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const router = useRouter();

  useEffect(() => {
    const cookies = document.cookie.split(';');
    const authErrorCookie = cookies.find(cookie => cookie.trim().startsWith('auth_error='));
    if (authErrorCookie) {
      const errorMessage = decodeURIComponent(authErrorCookie.split('=')[1]!);
      setAuthError(errorMessage);
      document.cookie = 'auth_error=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  }, []);

  useEffect(() => {
    if (authError) {
      toast.error(authError);
    }
  }, [authError]);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.error]);

  const isDirty = useMemo(() => {
    return email.trim() !== '';
  }, [email]);

  function handleSocial(provider: 'google' | 'discord' | 'github') {    
    return router.push(`/login/${provider}`);
  }

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{APP_TITLE}</CardTitle>
          {/* <CardDescription>Log in to your account to access your dashboard</CardDescription> */}
        </CardHeader>
        <CardContent>
        <CardContent className="space-y-2">
          <Button variant="outline" onClick={() => handleSocial("google")} className="w-full bg-secondary/30">
              <FontAwesomeIcon icon={faGoogle} className="mr-2 h-5 w-5" />
              Log in with Google
          </Button>
          <Button variant="outline" onClick={() => handleSocial("discord")} className="w-full bg-secondary/30">
              <DiscordLogoIcon className="mr-2 h-5 w-5" />
              Log in with Discord
          </Button>
          <Button variant="outline" onClick={() => handleSocial("github")} className="w-full bg-secondary/30">
              <GitHubLogoIcon className="mr-2 h-5 w-5" />
              Log in with GitHub
          </Button>
        </CardContent>
        <div className="my-2 mt-2 mb-8 flex items-center">
          <div className="flex-grow border-t border-muted" />
          <div className="mx-2 text-sm text-muted-foreground">or continue with</div>
          <div className="flex-grow border-t border-muted" />
        </div>
        <form action={formAction} className="grid gap-4">
          <div className="space-y-2">
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
          </div>

          {/* <SubmitButton className="w-full" aria-label="submit-btn" disabled={!isDirty}> */}
          <SubmitButton className="w-full" aria-label="submit-btn">
            <span className="inline-flex items-center justify-center gap-1 truncate">
              Continue
              <ArrowRightIcon className="h-5 w-5" />
            </span>
          </SubmitButton>
          <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground">
            <div>
              A magic link will be sent to your email
            </div>
          </div>
        </form>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-muted-foreground mt-4 px-6 pb-6">
        By signing in, you agree to our{" "}
        <Link href={Paths.TermsOfService} className="hover:underline dark:text-blue-500" prefetch={false}>
          terms of service
        </Link>
        {" "}
        and
        {" "}
        <Link href={Paths.PrivacyPolicy} className="hover:underline dark:text-blue-500" prefetch={false}>
          privacy policy
        </Link>
        .
      </div>
    </>
  );
}
