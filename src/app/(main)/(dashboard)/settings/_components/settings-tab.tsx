"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User } from "@/server/db/schema";
import { AccountDetails } from "./account-details";
import { UpdatePassword } from "./update-password";
import { MultiFactorAuth } from "./multifactorauth";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LinkedAccounts } from "./linked-accounts";
import { Button } from "@/components/ui/button";

interface UserSettingsProps {
  id: string | '',
  fullname: string | '',
  email: string | '',
  googleId: string | null,
  discordId: string | null,
  githubId: string | null,
}

export function SettingsTab({ user, isPasswordLess, magicLinkAuth }: { user: UserSettingsProps, isPasswordLess: boolean, magicLinkAuth: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabs = [
    { value: "account", label: "Account", content: 
      <div className="flex flex-col gap-6">
        <AccountDetails user={user} isPasswordLess={isPasswordLess} />
      </div>
    },
    { value: "security", label: "Security", content: 
      <>
      {!magicLinkAuth ? (
        <div className="flex flex-col gap-6">
          <UpdatePassword isPasswordLess={isPasswordLess} />
          <MultiFactorAuth />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            No password needed
          </h3>
          <p className="text-sm text-muted-foreground">
            We use 🪄 Magic Links 🪄 to login
          </p>
          {/* <Button className="mt-4">Add Product</Button> */}
        </div>
      )}
      </> 
    },
    { value: "linked-accounts", label: "Linked Accounts", content: 
      <div className="flex flex-col gap-6">
        <LinkedAccounts user={user} isPasswordLess={isPasswordLess} magicLinkAuth={magicLinkAuth} /> 
      </div>
    },
    { value: "usage", label: "Usage", content: 
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-2xl font-bold tracking-tight">
          Usage
        </h3>
        <p className="text-sm text-muted-foreground">
          Watch your spending
        </p>
        {/* <Button className="mt-4">Add Product</Button> */}
      </div>
    },
  ];

  const activeTab = searchParams.get("tab") || "account";

  useEffect(() => {
    const tabValues = tabs.map(tab => tab.value);
    if (!tabValues.includes(activeTab)) {
      router.replace(`?tab=account`);
    }

    // Prefetch other tabs
    tabValues.forEach((tabValue) => {
      if (tabValue !== activeTab) {
        router.prefetch(`?tab=${tabValue}`);
      }
    });
  }, [activeTab, router, tabs]);
  
  const handleTabChange = (value: string) => {
    router.push(`?tab=${value}`);
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-8 dark:bg-secondary/70">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
    </Tabs>
    </>
  )
}