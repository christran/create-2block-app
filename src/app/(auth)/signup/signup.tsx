"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DiscordLogoIcon, faGoogle, FontAwesomeIcon, GitHubLogoIcon } from "@/components/icons";
import { APP_TITLE } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/auth/actions";
import { SubmitButton } from "@/components/submit-button";
import { Paths } from "@/lib/constants";

export function Signup() {
  const [state, formAction] = useFormState(signup, null);

  return (
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
              id="fullname"
              required
              placeholder="Jeon Jungkook"
              autoComplete="name"
              name="fullname"
              type="text"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              required
              placeholder="email@example.com"
              autoComplete="email"
              name="email"
              type="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="********"
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
          <div className="flex flex-wrap items-center justify-between text-xs">
            <div>
              Already have an account?{" "}
              <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                <Link href={Paths.Login}>Log in</Link>
              </Button>
            </div>
          </div>
          <SubmitButton className="w-full" aria-label="submit-btn">
            Sign up
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
      <Button variant="outline" className="w-full" asChild>
          <Link href="/login/google" prefetch={false}>
            <FontAwesomeIcon icon={faGoogle} className="mr-2 h-5 w-5" />
            Continue with Google
          </Link>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/login/discord" prefetch={false}>
            <DiscordLogoIcon className="mr-2 h-5 w-5" />
            Continue with Discord
          </Link>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/login/github" prefetch={false}>
            <GitHubLogoIcon className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Link>
        </Button>
      </CardContent>
      </CardContent>
    </Card>
  );
}
