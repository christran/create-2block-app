"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/password-input";
import { FontAwesomeIcon, faGoogle, DiscordLogoIcon, GitHubLogoIcon } from "@/components/icons";
import { APP_TITLE } from "@/lib/constants";
import { login } from "@/lib/auth/actions";
import { SubmitButton } from "@/components/submit-button";
import { Paths } from "@/lib/constants";
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
              Log in with Google
          </Button>
          <Button variant="outline" onClick={() => handleSocial("discord")} className="w-full bg-secondary/30 shadow">
              <DiscordLogoIcon className="mr-2 h-5 w-5" />
              Log in with Discord
          </Button>
          <Button variant="outline" onClick={() => handleSocial("github")} className="w-full bg-secondary/30 shadow">
              <GitHubLogoIcon className="mr-2 h-5 w-5" />
              Log in with GitHub
          </Button>
        </div>
        <div className="py-6 flex items-center">
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

          <div className="mb-2 flex flex-wrap items-center justify-between text-xs text-muted-foreground">
            <div>
              Don't have an account?{" "}
              <Button variant="link" size="sm" className="p-0 h-auto">
                <Link href={Paths.Signup} className="text-blue-500">Sign up</Link>
              </Button>
            </div>
            <Button variant="link" size="sm" className="p-0 h-auto">
              <Link href={Paths.ResetPassword} className="text-blue-500">Forgot password?</Link>
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
      <div className="text-center text-[10.6px] text-muted-foreground pt-4">
        By signing in, you agree to our{" "}
        <Link href={Paths.TermsOfService} className="hover:underline text-blue-500" prefetch={false}>
          terms of service
        </Link>
        {" "}
        and
        {" "}
        <Link href={Paths.PrivacyPolicy} className="hover:underline text-blue-500" prefetch={false}>
          privacy policy
        </Link>
        .
      </div>
    </div>
  );
}
