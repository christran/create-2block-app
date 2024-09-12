"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DiscordLogoIcon, faGoogle, FontAwesomeIcon, GitHubLogoIcon } from "@/components/icons";
import { APP_TITLE } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/auth/actions";
import { SubmitButton } from "@/components/submit-button";
import { Paths } from "@/lib/constants";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export function Signup() {
  const [state, formAction] = useFormState(signup, null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  const router = useRouter();

  const isDirty = useMemo(() => {
    return email.trim() !== '' && currentPassword.trim() !== '' && fullName.trim() !== '';
  }, [email, currentPassword, fullName]);

  function handleSocial(provider: 'google' | 'discord' | 'github') {    
    return router.push(`/login/${provider}`);
  }

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{APP_TITLE}</CardTitle>
          {/* <CardDescription>Sign up to start using the app</CardDescription> */}
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
          <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                className="bg-secondary/30"
                id="fullname"
                placeholder="Jeon Jungkook"
                autoComplete="name"
                name="fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                className="bg-secondary/30"
                required
                id="email"
                placeholder="hello@2block.co"
                autoComplete="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                className="bg-secondary/30"
                required
                id="password"
                name="password"
                value={currentPassword}
                autoComplete="current-password"
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
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
            <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground">
              <div>
                Already have an account?{" "}
                <Button variant="link" size="sm" className="p-0 h-auto">
                  <Link href={Paths.Login} className="text-blue-500">Log in</Link>
                </Button>
              </div>
            </div>
            <SubmitButton className="w-full" aria-label="submit-btn" disabled={!isDirty}>
              <span className="inline-flex items-center justify-center gap-1 truncate">
              Sign up
              {/* <CheckIcon className="h-5 w-5" /> */}
              </span>
            </SubmitButton>
            <Button variant="outline" className="w-full" asChild>
              {/* <Link href={Paths.Home}>Cancel</Link> */}
            </Button>
          </form>
          <div className="my-2 mt-8 mb-8 flex items-center">
            <div className="flex-grow border-t border-muted" />
            <div className="mx-2 text-sm text-muted-foreground">or continue with</div>
            <div className="flex-grow border-t border-muted" />
          </div>
        <CardContent className="space-y-2">
          <Button variant="outline" onClick={() => handleSocial("google")} className="w-full bg-secondary/30">
              <FontAwesomeIcon icon={faGoogle} className="mr-2 h-5 w-5" />
              Continue with Google
          </Button>
          <Button variant="outline" onClick={() => handleSocial("discord")} className="w-full bg-secondary/30">
              <DiscordLogoIcon className="mr-2 h-5 w-5" />
              Continue with Discord
          </Button>
          <Button variant="outline" onClick={() => handleSocial("github")} className="w-full bg-secondary/30">
              <GitHubLogoIcon className="mr-2 h-5 w-5" />
              Continue with GitHub
          </Button>
        </CardContent>
        </CardContent>
      </Card>
      <div className="text-center text-[10.6px] text-muted-foreground mt-4 px-6 pb-6">
      By signing up, you agree to our{" "}
      <Link href={Paths.TermsOfService} className="hover:underline text-blue-500" prefetch={false}>
        terms
      </Link>
      ,{" "}
      <Link href={Paths.AcceptableUsePolicy} className="hover:underline text-blue-500" prefetch={false}>
        acceptable use
      </Link>
      , and{" "}
      <Link href={Paths.PrivacyPolicy} className="hover:underline text-blue-500" prefetch={false}>
        privacy policy
      </Link>
      .
    </div>
  </>
  );
}
