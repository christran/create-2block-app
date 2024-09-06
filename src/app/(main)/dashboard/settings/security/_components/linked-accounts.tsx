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

export function LinkedAccounts({ user, isPasswordLess }: { user: LinkedAccountProps; isPasswordLess: boolean }) {
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

  function handleSocial(provider: 'google' | 'discord' | 'github') {
    if (isPasswordLess && user[`${provider}Id`]) {
      toast.error(`You can't remove this account without setting a password first.`);
      return;
    }
    const url = user[`${provider}Id`] ? `/login/${provider}?disconnect=1` : `/login/${provider}`;
    router.push(url);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linked Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full md:w-1/2 space-y-2">
          <Button
            variant="outline"
            onClick={() => handleSocial('google')}
            className="w-full bg-secondary/30"
          >
            <FontAwesomeIcon icon={faGoogle} className="mr-2 h-5 w-5" />
            {user?.googleId ? "Remove Google Account" : "Connect Google Account"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSocial('discord')}
            className="w-full bg-secondary/30"
          >
            <DiscordLogoIcon className="mr-2 h-5 w-5" />
            {user?.discordId ? "Remove Discord Account" : "Connect Discord Account"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSocial('github')}
            className="w-full bg-secondary/30"
          >
            <GitHubLogoIcon className="mr-2 h-5 w-5" />
            {user?.githubId ? "Remove GitHub Account" : "Connect GitHub Account"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}