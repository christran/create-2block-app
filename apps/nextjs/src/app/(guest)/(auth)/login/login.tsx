"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/password-input";
import { FontAwesomeIcon, faGoogle, DiscordLogoIcon, GitHubLogoIcon } from "@/components/icons";
import { APP_TITLE } from "@2block/shared/shared-constants";
import { login } from "@/lib/auth/actions";
import { SubmitButton } from "@/components/submit-button";
import { Paths } from "@2block/shared/shared-constants";
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

export function Login() {
  const [state, formAction] = useFormState(login, null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

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

  const isDirty = useMemo(() => {
    return email.trim() !== '' && currentPassword.trim() !== '';
  }, [email, currentPassword]);

  useEffect(() => {
    if (authError) {
      toast.error(authError);
    }
  }, [authError]);

  function handleSocial(provider: 'google' | 'discord' | 'github') {    
    return router.push(`/login/${provider}`);
  }

  return (
    <div className="w-full max-w-md py-8 md:py-20">
      <Card className="py-2">
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
        <form action={formAction} className="grid gap-4">
          <div className="space-y-2">
            <Input
              required
              className="bg-secondary/30"
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
          </div>

          <div className="space-y-2">
            <PasswordInput
              required
              className="bg-secondary/30"
              id="password"
              name="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Password"
            />
            {state?.fieldError?.password && (
              <p className="text-xs text-destructive mt-1">{state.fieldError.password}</p>
            )}
          </div>

          <div className="mb-2 flex flex-wrap items-center justify-between text-xs text-muted-foreground">
            <div>
              Don't have an account?{" "}
              <Link href={Paths.Signup} className="text-blue-500">
                <Button variant="linkHover2" className="p-0 h-0 after:-bottom-2 after:h-[0.8px] text-[12px] font-medium">
                  Sign up
                </Button>
              </Link>
            </div>
              <Link href={Paths.ResetPassword} className="text-blue-500">
                <Button variant="linkHover2" className="p-0 h-0 after:-bottom-2 after:h-[0.8px] text-[12px] font-medium">
                  Forgot password?
                </Button>
              </Link>
          </div>

          {state?.formError && (
            <p className="rounded-lg bg-destructive/5 p-2 text-[0.8rem] font-medium text-destructive">
              {state.formError}
            </p>
          )}

          <SubmitButton className="w-full shadow-md" aria-label="submit-btn" disabled={!isDirty}>
            <span className="inline-flex items-center justify-center gap-1 truncate">
              Continue
              <ArrowRightIcon className="h-5 w-5" />
            </span>
          </SubmitButton>
          <Button variant="outline" className="w-full" asChild>
            {/* <Link href={Paths.Home}>Cancel</Link> */}
          </Button>
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
