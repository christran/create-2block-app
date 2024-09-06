"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updatePassword } from "@/lib/auth/actions"
import { useFormState } from "react-dom"
import { useState } from "react";
import { useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DiscordLogoIcon, faGoogle, FontAwesomeIcon, GitHubLogoIcon } from "@/components/icons"
interface LinkedAccountProps {
  googleId: string | null
  discordId: string | null
  githubId: string | null
}

export function LinkedAccounts({ user }: { user: LinkedAccountProps }) {
  const [googleId, setGoogleId] = useState(user?.googleId ?? "");
  const [discordId, setdiscordId] = useState(user?.discordId ?? "");
  const [githubId, setgithubId] = useState(user?.githubId ?? "");
  const [state, formAction] = useFormState(updatePassword, null);
  const [authError, setAuthError] = useState<string | null>(null);
  // const formRef = useRef<HTMLFormElement>(null);

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
    if (state?.success) {
      toast.success("Account linked");
      router.refresh();
    }
    if (state?.error) {
      toast.error(state?.error);
    }
  }, [state]);

  const handleSubmit = (formData: FormData) => {
    formAction(formData);
  };

  return (
    <form action={handleSubmit} className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Linked Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full md:w-1/2 space-y-2">
            <Button disabled variant="outline" className="w-full bg-secondary/30">
              <Link href={googleId ? "/unlink/google" : "/link/google"} prefetch={false} className="flex items-center justify-center">
                <FontAwesomeIcon icon={faGoogle} className="mr-2 h-5 w-5" />
                {googleId ? "Remove Google Account" : "Connect Google Account"}
              </Link>
            </Button>
              <Button variant="outline" className="w-full bg-secondary/30">
                <Link href={discordId ? "/unlink/discord" : "/login/discord?linking=true"} prefetch={false} className="flex items-center justify-center">
                  <DiscordLogoIcon className="mr-2 h-5 w-5" />
                  {discordId ? "Remove Discord Account" : "Connect Discord Account"}
                </Link>
              </Button>
            <Button disabled variant="outline" className="w-full bg-secondary/30">
              <Link href={githubId ? "/unlink/github" : "/link/github"} prefetch={false} className="flex items-center justify-center">
                <GitHubLogoIcon className="mr-2 h-5 w-5" />
                {githubId ? "Remove GitHub Account" : "Connect GitHub Account"}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}