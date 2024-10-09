"use client";

import { createContext, type ReactNode } from "react";
import { use } from "react";
import { type User } from "@2block/db/schema";

// type User = {
//   id: string;
//   name: string;
//   email: string;
//   emailVerified: boolean;
//   role: string;
//   contactId: string | null;
//   ipAddress: string | null;
//   googleId: string | null;
//   discordId: string | null;
//   githubId: string | null;
//   avatar: string | null;
//   stripeSubscriptionId: string | null;
//   stripePriceId: string | null;
//   stripeCustomerId: string | null;
//   stripeCurrentPeriodEnd: string | null;
//   createdAt: string;
//   updatedAt: string;
// };

type UserPromise = Promise<Omit<User, "hashedPassword"> | null>;

const UserContext = createContext<UserPromise | null>(null);

export function useUser() {
  const userPromise = use(UserContext);

  if (!userPromise) {
    throw new Error("useUser must be used within a UserProvider");
  }
  
  const user = use(userPromise);
  return user;
}

export function UserProvider({
  children,
  userPromise,
}: {
  children: ReactNode;
  userPromise: UserPromise;
}) {
  return (
    <UserContext.Provider value={userPromise}>
      {children}
    </UserContext.Provider>
  );
}