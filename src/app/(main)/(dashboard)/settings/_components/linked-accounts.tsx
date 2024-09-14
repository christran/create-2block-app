"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useState } from "react";
import { useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DiscordLogoIcon, faGoogle, FontAwesomeIcon, GitHubLogoIcon } from "@/components/icons"
import { APP_TITLE } from "@/lib/constants";

interface LinkedAccountProps {
  googleId: string | null
  discordId: string | null
  githubId: string | null
}

export function LinkedAccounts({ user, isPasswordLess, magicLinkAuth }: { user: LinkedAccountProps; isPasswordLess: boolean, magicLinkAuth: boolean }) {
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
    const connectedAccountsCount = ['googleId', 'discordId', 'githubId'].filter(id => user[id as keyof LinkedAccountProps]).length;
    
    if(!magicLinkAuth) {
      if (isPasswordLess && user[`${provider}Id`] && connectedAccountsCount <= 1) {
        return toast.error(`You can't remove this account without setting a password or connecting another account.`);
      }
    }

    const url = user[`${provider}Id`] ? `/login/${provider}?disconnect=1` : `/login/${provider}`;
    router.push(url);
  }

  return (
    <Card className="flex flex-col gap-1"> 
      <CardHeader className="border-b px-6 py-4">
        <CardTitle>Linked Accounts</CardTitle>
        <CardDescription>
          Connect additional accounts to speed up your login process
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 items-center text-center">
        <div className="w-full md:w-1/2 space-y-2 pt-5">
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