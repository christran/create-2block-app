"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/password-input";
import { FontAwesomeIcon, faGoogle, DiscordLogoIcon, GitHubLogoIcon, ExclamationTriangleIcon } from "@/components/icons";
import { APP_TITLE } from "@/lib/constants";
import { login } from "@/lib/auth/actions";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { Paths } from "@/lib/constants";
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { ArrowRightIcon } from "@radix-ui/react-icons";

export function Login() {
  const [state, formAction] = useFormState(login, null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

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

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{APP_TITLE}</CardTitle>
          {/* <CardDescription>Log in to your account to access your dashboard</CardDescription> */}
        </CardHeader>
        <CardContent>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full bg-secondary/30">
            <Link href="/login/google" prefetch={false} className="flex items-center justify-center">
              <FontAwesomeIcon icon={faGoogle} className="mr-2 h-5 w-5" />
              Log in with Google
            </Link>
          </Button>
          <Button variant="outline" className="w-full bg-secondary/30">
            <Link href="/login/discord" prefetch={false} className="flex items-center justify-center">
              <DiscordLogoIcon className="mr-2 h-5 w-5" />
              Log in with Discord
            </Link>
          </Button>
          <Button variant="outline" className="w-full bg-secondary/30">
            <Link href="/login/github" prefetch={false} className="flex items-center justify-center">
              <GitHubLogoIcon className="mr-2 h-5 w-5" />
              Log in with GitHub
            </Link>
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

          <div className="space-y-2">
            {/* <Label htmlFor="password">Password</Label> */}
            <PasswordInput
              className="bg-secondary/30"
              required
              id="password"
              name="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Password"
            />
          </div>

          <div className="mb-2 flex flex-wrap items-center justify-between text-xs">
            <div>
              Don't have an account?{" "}
              <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                <Link href={Paths.Signup}>Sign up</Link>
              </Button>
            </div>
            <Button variant="link" size="sm" className="p-0 h-auto" asChild>
              <Link href={Paths.ResetPassword}>Forgot password?</Link>
            </Button>
          </div>

          {state?.fieldError ? (
            <ul className="list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
              {Object.values(state.fieldError).map((err) => (
                <li className="ml-4" key={err}>
                  {err}
                </li>
              ))}
            </ul>
          ) : state?.formError ? (
            <p className="rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
              {state?.formError}
            </p>
          ) : null}
          <SubmitButton className="w-full" aria-label="submit-btn" disabled={!isDirty}>
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
